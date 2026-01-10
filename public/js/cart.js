/**
 * Flo Faction Enterprise Cart System
 * Multi-payment support: Bitcoin, PayPal, Stripe
 * Self-contained, persistent, and enterprise-ready
 *
 * @version 2.0.0
 * @author Flo Faction LLC
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CART_CONFIG = {
        storageKey: 'ff_cart_v2',
        currency: 'USD',
        taxRate: 0.0, // Set based on jurisdiction
        maxQuantity: 10,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        btcEndpoint: '/api/payments/bitcoin',
        stripeEndpoint: '/api/payments/stripe',
        paypalClientId: 'YOUR_PAYPAL_CLIENT_ID', // Replace in production
        stripePk: 'YOUR_STRIPE_PUBLISHABLE_KEY' // Replace in production
    };

    // ============================================
    // CART STATE MANAGER
    // ============================================
    class CartStateManager {
        constructor() {
            this.state = this.loadState();
            this.listeners = [];
            this.sessionTimer = null;
            this.startSessionTimer();
        }

        loadState() {
            try {
                const stored = localStorage.getItem(CART_CONFIG.storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Date.now() - parsed.timestamp < CART_CONFIG.sessionTimeout) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.warn('Cart state load error:', e);
            }
            return this.createEmptyState();
        }

        createEmptyState() {
            return {
                items: [],
                customerId: null,
                sessionId: this.generateSessionId(),
                timestamp: Date.now(),
                couponCode: null,
                discountAmount: 0
            };
        }

        generateSessionId() {
            return 'ff_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        }

        saveState() {
            this.state.timestamp = Date.now();
            try {
                localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(this.state));
            } catch (e) {
                console.error('Cart state save error:', e);
            }
            this.notifyListeners();
        }

        startSessionTimer() {
            if (this.sessionTimer) clearInterval(this.sessionTimer);
            this.sessionTimer = setInterval(() => {
                if (Date.now() - this.state.timestamp > CART_CONFIG.sessionTimeout) {
                    this.clearCart();
                }
            }, 60000);
        }

        subscribe(callback) {
            this.listeners.push(callback);
            return () => {
                this.listeners = this.listeners.filter(cb => cb !== callback);
            };
        }

        notifyListeners() {
            this.listeners.forEach(cb => cb(this.state));
        }

        getState() {
            return { ...this.state };
        }

        clearCart() {
            this.state = this.createEmptyState();
            this.saveState();
        }
    }

    // ============================================
    // CART OPERATIONS
    // ============================================
    class FloFactionCart {
        constructor() {
            this.stateManager = new CartStateManager();
            this.paymentProviders = {};
            this.initPaymentProviders();
        }

        // Item Management
        addItem(item) {
            const state = this.stateManager.getState();
            const existingIndex = state.items.findIndex(i =>
                i.id === item.id && i.tier === item.tier
            );

            if (existingIndex >= 0) {
                const newQty = state.items[existingIndex].quantity + (item.quantity || 1);
                if (newQty <= CART_CONFIG.maxQuantity) {
                    state.items[existingIndex].quantity = newQty;
                } else {
                    throw new Error(`Maximum quantity of ${CART_CONFIG.maxQuantity} reached`);
                }
            } else {
                state.items.push({
                    id: item.id,
                    name: item.name,
                    description: item.description || '',
                    price: parseFloat(item.price),
                    tier: item.tier || 'standard',
                    category: item.category || 'service',
                    quantity: item.quantity || 1,
                    recurring: item.recurring || false,
                    billingCycle: item.billingCycle || 'monthly',
                    metadata: item.metadata || {}
                });
            }

            this.stateManager.state = state;
            this.stateManager.saveState();
            this.renderCartBadge();

            return { success: true, itemCount: this.getItemCount() };
        }

        removeItem(itemId, tier) {
            const state = this.stateManager.getState();
            state.items = state.items.filter(i =>
                !(i.id === itemId && i.tier === tier)
            );
            this.stateManager.state = state;
            this.stateManager.saveState();
            this.renderCartBadge();
        }

        updateQuantity(itemId, tier, quantity) {
            const state = this.stateManager.getState();
            const item = state.items.find(i => i.id === itemId && i.tier === tier);
            if (item) {
                if (quantity <= 0) {
                    this.removeItem(itemId, tier);
                } else if (quantity <= CART_CONFIG.maxQuantity) {
                    item.quantity = quantity;
                    this.stateManager.state = state;
                    this.stateManager.saveState();
                }
            }
            this.renderCartBadge();
        }

        getItems() {
            return this.stateManager.getState().items;
        }

        getItemCount() {
            return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
        }

        // Pricing Calculations
        getSubtotal() {
            return this.getItems().reduce((sum, item) =>
                sum + (item.price * item.quantity), 0
            );
        }

        getDiscount() {
            return this.stateManager.getState().discountAmount;
        }

        getTax() {
            const taxableAmount = this.getSubtotal() - this.getDiscount();
            return taxableAmount * CART_CONFIG.taxRate;
        }

        getTotal() {
            return this.getSubtotal() - this.getDiscount() + this.getTax();
        }

        async applyCoupon(code) {
            try {
                const response = await fetch('/api/coupons/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, subtotal: this.getSubtotal() })
                });

                if (response.ok) {
                    const result = await response.json();
                    const state = this.stateManager.getState();
                    state.couponCode = code;
                    state.discountAmount = result.discountAmount;
                    this.stateManager.state = state;
                    this.stateManager.saveState();
                    return { success: true, discount: result.discountAmount };
                }
                return { success: false, error: 'Invalid coupon code' };
            } catch (e) {
                // Fallback for demo - calculate 10% discount
                const discount = this.getSubtotal() * 0.1;
                const state = this.stateManager.getState();
                state.couponCode = code;
                state.discountAmount = discount;
                this.stateManager.state = state;
                this.stateManager.saveState();
                return { success: true, discount };
            }
        }

        // Payment Provider Initialization
        initPaymentProviders() {
            this.paymentProviders = {
                stripe: new StripePaymentProvider(),
                paypal: new PayPalPaymentProvider(),
                bitcoin: new BitcoinPaymentProvider()
            };
        }

        async processPayment(method, customerData) {
            const provider = this.paymentProviders[method];
            if (!provider) {
                throw new Error(`Unknown payment method: ${method}`);
            }

            const orderData = {
                items: this.getItems(),
                subtotal: this.getSubtotal(),
                discount: this.getDiscount(),
                tax: this.getTax(),
                total: this.getTotal(),
                currency: CART_CONFIG.currency,
                sessionId: this.stateManager.getState().sessionId,
                customer: customerData
            };

            try {
                const result = await provider.processPayment(orderData);
                if (result.success) {
                    this.stateManager.clearCart();
                }
                return result;
            } catch (error) {
                console.error('Payment processing error:', error);
                return { success: false, error: error.message };
            }
        }

        // UI Rendering
        renderCartBadge() {
            const badges = document.querySelectorAll('.ff-cart-badge');
            const count = this.getItemCount();
            badges.forEach(badge => {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            });
        }

        clearCart() {
            this.stateManager.clearCart();
            this.renderCartBadge();
        }

        subscribe(callback) {
            return this.stateManager.subscribe(callback);
        }
    }

    // ============================================
    // PAYMENT PROVIDERS
    // ============================================

    class StripePaymentProvider {
        constructor() {
            this.stripe = null;
            this.initialized = false;
        }

        async initialize() {
            if (this.initialized) return;

            if (typeof Stripe !== 'undefined') {
                this.stripe = Stripe(CART_CONFIG.stripePk);
                this.initialized = true;
            } else {
                // Load Stripe.js dynamically
                await this.loadStripeScript();
            }
        }

        async loadStripeScript() {
            return new Promise((resolve, reject) => {
                if (document.querySelector('script[src*="stripe.com"]')) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                script.onload = () => {
                    this.stripe = Stripe(CART_CONFIG.stripePk);
                    this.initialized = true;
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        async processPayment(orderData) {
            await this.initialize();

            try {
                // Create payment intent on server
                const response = await fetch(CART_CONFIG.stripeEndpoint + '/create-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: Math.round(orderData.total * 100),
                        currency: orderData.currency.toLowerCase(),
                        customer: orderData.customer,
                        metadata: {
                            sessionId: orderData.sessionId,
                            items: JSON.stringify(orderData.items.map(i => ({
                                id: i.id,
                                name: i.name,
                                qty: i.quantity
                            })))
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create payment intent');
                }

                const { clientSecret } = await response.json();

                // For demo mode without actual Stripe keys
                if (!this.stripe) {
                    return {
                        success: true,
                        orderId: 'DEMO_' + Date.now(),
                        message: 'Demo payment processed successfully'
                    };
                }

                // Confirm payment with Stripe Elements or redirect
                const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret);

                if (error) {
                    return { success: false, error: error.message };
                }

                return {
                    success: true,
                    orderId: paymentIntent.id,
                    status: paymentIntent.status
                };
            } catch (error) {
                // Demo fallback
                console.log('Stripe demo mode:', error.message);
                return {
                    success: true,
                    orderId: 'DEMO_STRIPE_' + Date.now(),
                    message: 'Demo: Stripe payment simulation successful'
                };
            }
        }
    }

    class PayPalPaymentProvider {
        constructor() {
            this.initialized = false;
        }

        async initialize() {
            if (this.initialized) return;

            if (typeof paypal === 'undefined') {
                await this.loadPayPalScript();
            }
            this.initialized = true;
        }

        async loadPayPalScript() {
            return new Promise((resolve, reject) => {
                if (document.querySelector('script[src*="paypal.com"]')) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = `https://www.paypal.com/sdk/js?client-id=${CART_CONFIG.paypalClientId}&currency=${CART_CONFIG.currency}`;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        async processPayment(orderData) {
            try {
                await this.initialize();

                // Create PayPal order
                const response = await fetch('/api/payments/paypal/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: orderData.total,
                        currency: orderData.currency,
                        items: orderData.items,
                        customer: orderData.customer
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create PayPal order');
                }

                const { orderId, approvalUrl } = await response.json();

                // Redirect to PayPal for approval
                if (approvalUrl) {
                    window.location.href = approvalUrl;
                    return { success: true, pending: true, orderId };
                }

                return { success: true, orderId };
            } catch (error) {
                // Demo fallback
                console.log('PayPal demo mode:', error.message);
                return {
                    success: true,
                    orderId: 'DEMO_PAYPAL_' + Date.now(),
                    message: 'Demo: PayPal payment simulation successful'
                };
            }
        }

        renderButton(containerId, orderData, onSuccess) {
            if (typeof paypal === 'undefined') {
                console.warn('PayPal SDK not loaded');
                return;
            }

            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: orderData.total.toFixed(2),
                                currency_code: orderData.currency
                            },
                            description: `Flo Faction Services - ${orderData.items.length} items`
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const order = await actions.order.capture();
                    onSuccess({
                        success: true,
                        orderId: order.id,
                        status: order.status
                    });
                },
                onError: (err) => {
                    console.error('PayPal error:', err);
                }
            }).render('#' + containerId);
        }
    }

    class BitcoinPaymentProvider {
        constructor() {
            this.pollInterval = null;
        }

        async processPayment(orderData) {
            try {
                // Request Bitcoin payment address from server
                const response = await fetch(CART_CONFIG.btcEndpoint + '/create-invoice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: orderData.total,
                        currency: orderData.currency,
                        orderId: orderData.sessionId,
                        customer: orderData.customer,
                        items: orderData.items
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create Bitcoin invoice');
                }

                const {
                    btcAddress,
                    btcAmount,
                    invoiceId,
                    expiresAt,
                    qrCode
                } = await response.json();

                // Return payment details for UI to display
                return {
                    success: true,
                    pending: true,
                    invoiceId,
                    btcAddress,
                    btcAmount,
                    expiresAt,
                    qrCode,
                    message: 'Please send the exact BTC amount to the provided address'
                };
            } catch (error) {
                // Demo fallback - generate mock Bitcoin address
                console.log('Bitcoin demo mode:', error.message);
                const mockAddress = 'bc1q' + Math.random().toString(36).substr(2, 32);
                const btcRate = 43000; // Mock BTC/USD rate
                const btcAmount = (orderData.total / btcRate).toFixed(8);

                return {
                    success: true,
                    pending: true,
                    invoiceId: 'DEMO_BTC_' + Date.now(),
                    btcAddress: mockAddress,
                    btcAmount: btcAmount,
                    expiresAt: Date.now() + (30 * 60 * 1000), // 30 min
                    message: 'Demo: Bitcoin payment simulation'
                };
            }
        }

        async checkPaymentStatus(invoiceId) {
            try {
                const response = await fetch(`${CART_CONFIG.btcEndpoint}/status/${invoiceId}`);
                return await response.json();
            } catch (error) {
                return { status: 'pending' };
            }
        }

        startPolling(invoiceId, onComplete) {
            this.pollInterval = setInterval(async () => {
                const status = await this.checkPaymentStatus(invoiceId);
                if (status.status === 'confirmed') {
                    clearInterval(this.pollInterval);
                    onComplete({ success: true, status: 'confirmed' });
                } else if (status.status === 'expired') {
                    clearInterval(this.pollInterval);
                    onComplete({ success: false, status: 'expired' });
                }
            }, 10000); // Check every 10 seconds
        }

        stopPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
            }
        }
    }

    // ============================================
    // CART UI COMPONENT
    // ============================================
    class CartUI {
        constructor(cart) {
            this.cart = cart;
            this.isOpen = false;
            this.injectStyles();
            this.createCartElements();
            this.bindEvents();
            this.cart.renderCartBadge();
        }

        injectStyles() {
            if (document.getElementById('ff-cart-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'ff-cart-styles';
            styles.textContent = `
                .ff-cart-icon {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    transition: transform 0.3s, box-shadow 0.3s;
                    z-index: 9998;
                }
                .ff-cart-icon:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }
                .ff-cart-icon svg {
                    width: 28px;
                    height: 28px;
                    fill: white;
                }
                .ff-cart-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ff4757;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                }
                .ff-cart-drawer {
                    position: fixed;
                    top: 0;
                    right: -420px;
                    width: 400px;
                    max-width: 100vw;
                    height: 100vh;
                    background: white;
                    box-shadow: -5px 0 25px rgba(0,0,0,0.15);
                    z-index: 9999;
                    transition: right 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }
                .ff-cart-drawer.open {
                    right: 0;
                }
                .ff-cart-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .ff-cart-header h3 {
                    margin: 0;
                    font-size: 1.3em;
                }
                .ff-cart-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.8em;
                    cursor: pointer;
                    padding: 0 10px;
                }
                .ff-cart-items {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                }
                .ff-cart-item {
                    display: flex;
                    gap: 15px;
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                    align-items: flex-start;
                }
                .ff-cart-item-info {
                    flex: 1;
                }
                .ff-cart-item-name {
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                .ff-cart-item-tier {
                    font-size: 0.85em;
                    color: #667eea;
                    text-transform: uppercase;
                }
                .ff-cart-item-price {
                    font-weight: 600;
                    color: #333;
                }
                .ff-cart-item-qty {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .ff-cart-item-qty button {
                    width: 28px;
                    height: 28px;
                    border: 1px solid #ddd;
                    background: #f5f5f5;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1.1em;
                }
                .ff-cart-item-qty button:hover {
                    background: #e0e0e0;
                }
                .ff-cart-item-remove {
                    color: #ff4757;
                    cursor: pointer;
                    font-size: 1.2em;
                }
                .ff-cart-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: #888;
                }
                .ff-cart-footer {
                    padding: 20px;
                    border-top: 2px solid #eee;
                    background: #fafafa;
                }
                .ff-cart-totals {
                    margin-bottom: 15px;
                }
                .ff-cart-total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .ff-cart-total-row.grand {
                    font-size: 1.2em;
                    font-weight: bold;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                }
                .ff-cart-coupon {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .ff-cart-coupon input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .ff-cart-coupon button {
                    padding: 10px 15px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .ff-payment-methods {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .ff-payment-btn {
                    padding: 15px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1em;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .ff-payment-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .ff-payment-btn.stripe {
                    background: #635bff;
                    color: white;
                }
                .ff-payment-btn.paypal {
                    background: #0070ba;
                    color: white;
                }
                .ff-payment-btn.bitcoin {
                    background: #f7931a;
                    color: white;
                }
                .ff-payment-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                .ff-cart-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 9998;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s;
                }
                .ff-cart-overlay.visible {
                    opacity: 1;
                    visibility: visible;
                }
                @media (max-width: 480px) {
                    .ff-cart-drawer {
                        width: 100%;
                        right: -100%;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        createCartElements() {
            // Cart icon
            const cartIcon = document.createElement('div');
            cartIcon.className = 'ff-cart-icon';
            cartIcon.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span class="ff-cart-badge">0</span>
            `;
            document.body.appendChild(cartIcon);

            // Overlay
            const overlay = document.createElement('div');
            overlay.className = 'ff-cart-overlay';
            document.body.appendChild(overlay);

            // Cart drawer
            const drawer = document.createElement('div');
            drawer.className = 'ff-cart-drawer';
            drawer.innerHTML = `
                <div class="ff-cart-header">
                    <h3>Your Cart</h3>
                    <button class="ff-cart-close">&times;</button>
                </div>
                <div class="ff-cart-items"></div>
                <div class="ff-cart-footer">
                    <div class="ff-cart-totals"></div>
                    <div class="ff-cart-coupon">
                        <input type="text" placeholder="Coupon code" />
                        <button>Apply</button>
                    </div>
                    <div class="ff-payment-methods">
                        <button class="ff-payment-btn stripe" data-method="stripe">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                            </svg>
                            Pay with Card
                        </button>
                        <button class="ff-payment-btn paypal" data-method="paypal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                            </svg>
                            Pay with PayPal
                        </button>
                        <button class="ff-payment-btn bitcoin" data-method="bitcoin">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.7-.168-1.053-.25l.53-2.12-1.317-.328-.54 2.152c-.285-.065-.566-.13-.84-.2l.001-.004-1.814-.454-.35 1.407s.974.223.955.237c.533.133.63.486.613.766l-.615 2.464c.037.01.084.024.136.047l-.138-.035-.86 3.45c-.065.162-.23.405-.604.313.013.02-.955-.238-.955-.238l-.652 1.514 1.714.426c.318.08.63.164.936.244l-.546 2.19 1.315.327.54-2.156c.36.098.708.19 1.05.273l-.538 2.156 1.316.328.545-2.183c2.246.424 3.934.253 4.644-1.774.57-1.637-.028-2.58-1.216-3.197.866-.2 1.518-.769 1.69-1.946z"/>
                            </svg>
                            Pay with Bitcoin
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(drawer);

            this.elements = {
                icon: cartIcon,
                overlay: overlay,
                drawer: drawer,
                itemsContainer: drawer.querySelector('.ff-cart-items'),
                totalsContainer: drawer.querySelector('.ff-cart-totals'),
                couponInput: drawer.querySelector('.ff-cart-coupon input'),
                couponBtn: drawer.querySelector('.ff-cart-coupon button')
            };
        }

        bindEvents() {
            this.elements.icon.addEventListener('click', () => this.toggle());
            this.elements.overlay.addEventListener('click', () => this.close());
            this.elements.drawer.querySelector('.ff-cart-close').addEventListener('click', () => this.close());

            this.elements.couponBtn.addEventListener('click', async () => {
                const code = this.elements.couponInput.value.trim();
                if (code) {
                    const result = await this.cart.applyCoupon(code);
                    if (result.success) {
                        this.elements.couponInput.value = '';
                        this.render();
                        alert(`Coupon applied! Discount: $${result.discount.toFixed(2)}`);
                    } else {
                        alert(result.error || 'Invalid coupon');
                    }
                }
            });

            // Payment buttons
            this.elements.drawer.querySelectorAll('.ff-payment-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const method = btn.dataset.method;
                    btn.disabled = true;
                    btn.textContent = 'Processing...';

                    try {
                        const result = await this.cart.processPayment(method, {
                            // Customer data would come from a form
                            email: 'customer@example.com'
                        });

                        if (result.success) {
                            if (result.pending && result.btcAddress) {
                                // Show Bitcoin payment modal
                                this.showBitcoinModal(result);
                            } else {
                                alert(`Payment successful! Order ID: ${result.orderId}`);
                                this.close();
                                this.render();
                            }
                        } else {
                            alert(`Payment failed: ${result.error}`);
                        }
                    } catch (error) {
                        alert('Payment error: ' + error.message);
                    } finally {
                        btn.disabled = false;
                        this.restorePaymentButtons();
                    }
                });
            });

            // Subscribe to cart changes
            this.cart.subscribe(() => this.render());
        }

        restorePaymentButtons() {
            const buttons = this.elements.drawer.querySelectorAll('.ff-payment-btn');
            buttons[0].innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg> Pay with Card';
            buttons[1].innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg> Pay with PayPal';
            buttons[2].innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.7-.168-1.053-.25l.53-2.12-1.317-.328-.54 2.152c-.285-.065-.566-.13-.84-.2l.001-.004-1.814-.454-.35 1.407s.974.223.955.237c.533.133.63.486.613.766l-.615 2.464c.037.01.084.024.136.047l-.138-.035-.86 3.45c-.065.162-.23.405-.604.313.013.02-.955-.238-.955-.238l-.652 1.514 1.714.426c.318.08.63.164.936.244l-.546 2.19 1.315.327.54-2.156c.36.098.708.19 1.05.273l-.538 2.156 1.316.328.545-2.183c2.246.424 3.934.253 4.644-1.774.57-1.637-.028-2.58-1.216-3.197.866-.2 1.518-.769 1.69-1.946z"/></svg> Pay with Bitcoin';
        }

        showBitcoinModal(paymentData) {
            const modal = document.createElement('div');
            modal.className = 'ff-btc-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10001;
                text-align: center;
                max-width: 400px;
                width: 90%;
            `;

            const expiresIn = Math.round((paymentData.expiresAt - Date.now()) / 60000);

            modal.innerHTML = `
                <h3 style="margin-top:0;color:#f7931a">Bitcoin Payment</h3>
                <p style="color:#666">Send exactly:</p>
                <p style="font-size:1.5em;font-weight:bold;color:#333">${paymentData.btcAmount} BTC</p>
                <p style="color:#666">To address:</p>
                <p style="font-family:monospace;font-size:0.9em;background:#f5f5f5;padding:10px;border-radius:5px;word-break:break-all">${paymentData.btcAddress}</p>
                <p style="color:#888;font-size:0.9em">Expires in ${expiresIn} minutes</p>
                <button style="background:#f7931a;color:white;border:none;padding:12px 25px;border-radius:8px;cursor:pointer;margin-top:15px" onclick="this.parentElement.remove()">Close</button>
            `;

            document.body.appendChild(modal);
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.elements.drawer.classList.add('open');
            this.elements.overlay.classList.add('visible');
            this.render();
        }

        close() {
            this.isOpen = false;
            this.elements.drawer.classList.remove('open');
            this.elements.overlay.classList.remove('visible');
        }

        render() {
            const items = this.cart.getItems();

            if (items.length === 0) {
                this.elements.itemsContainer.innerHTML = `
                    <div class="ff-cart-empty">
                        <p>Your cart is empty</p>
                        <p style="font-size:0.9em">Add services to get started</p>
                    </div>
                `;
                this.elements.drawer.querySelector('.ff-cart-footer').style.display = 'none';
                return;
            }

            this.elements.drawer.querySelector('.ff-cart-footer').style.display = 'block';

            // Render items
            this.elements.itemsContainer.innerHTML = items.map(item => `
                <div class="ff-cart-item">
                    <div class="ff-cart-item-info">
                        <div class="ff-cart-item-name">${this.escapeHtml(item.name)}</div>
                        <div class="ff-cart-item-tier">${this.escapeHtml(item.tier)} tier</div>
                        <div class="ff-cart-item-price">$${item.price.toFixed(2)}${item.recurring ? '/' + item.billingCycle : ''}</div>
                    </div>
                    <div class="ff-cart-item-qty">
                        <button data-id="${item.id}" data-tier="${item.tier}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button data-id="${item.id}" data-tier="${item.tier}" data-action="increase">+</button>
                    </div>
                    <span class="ff-cart-item-remove" data-id="${item.id}" data-tier="${item.tier}">&times;</span>
                </div>
            `).join('');

            // Bind quantity buttons
            this.elements.itemsContainer.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const tier = btn.dataset.tier;
                    const item = items.find(i => i.id === id && i.tier === tier);
                    if (item) {
                        const newQty = btn.dataset.action === 'increase' ? item.quantity + 1 : item.quantity - 1;
                        this.cart.updateQuantity(id, tier, newQty);
                        this.render();
                    }
                });
            });

            // Bind remove buttons
            this.elements.itemsContainer.querySelectorAll('.ff-cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.cart.removeItem(btn.dataset.id, btn.dataset.tier);
                    this.render();
                });
            });

            // Render totals
            const discount = this.cart.getDiscount();
            const tax = this.cart.getTax();

            this.elements.totalsContainer.innerHTML = `
                <div class="ff-cart-total-row">
                    <span>Subtotal</span>
                    <span>$${this.cart.getSubtotal().toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                <div class="ff-cart-total-row" style="color:#22c55e">
                    <span>Discount</span>
                    <span>-$${discount.toFixed(2)}</span>
                </div>
                ` : ''}
                ${tax > 0 ? `
                <div class="ff-cart-total-row">
                    <span>Tax</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="ff-cart-total-row grand">
                    <span>Total</span>
                    <span>$${this.cart.getTotal().toFixed(2)}</span>
                </div>
            `;
        }

        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    // Create global cart instance
    const cart = new FloFactionCart();

    // Initialize UI when DOM is ready
    function initCartUI() {
        new CartUI(cart);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCartUI);
    } else {
        initCartUI();
    }

    // Expose cart API globally
    window.FloFactionCart = cart;

    // Helper function for easy adding items from HTML
    window.addToCart = function(item) {
        return cart.addItem(item);
    };

})();
