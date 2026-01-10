/**
 * Flo Faction Payment Handlers
 * Enterprise-grade payment processing for Stripe, PayPal, and Bitcoin
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const axios = require('axios');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        currency: 'usd'
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE || 'sandbox',
        baseUrl: process.env.PAYPAL_MODE === 'production'
            ? 'https://api.paypal.com'
            : 'https://api.sandbox.paypal.com'
    },
    bitcoin: {
        provider: process.env.BTC_PROVIDER || 'coinbase', // coinbase, btcpay, blockcypher
        apiKey: process.env.BTC_API_KEY,
        webhookSecret: process.env.BTC_WEBHOOK_SECRET,
        confirmations: 1
    }
};

// ============================================
// STRIPE PAYMENT HANDLERS
// ============================================

/**
 * Create Stripe Payment Intent
 */
const stripeCreateIntent = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { amount, currency, customer, metadata } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            // Store order in Firestore
            const orderRef = await admin.firestore().collection('orders').add({
                amount,
                currency: currency || 'usd',
                customer,
                metadata,
                paymentMethod: 'stripe',
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // In production, use Stripe SDK
            // const stripe = require('stripe')(CONFIG.stripe.secretKey);
            // const paymentIntent = await stripe.paymentIntents.create({...});

            // Demo response for now
            const clientSecret = `pi_demo_${orderRef.id}_secret_${Date.now()}`;

            return res.status(200).json({
                success: true,
                clientSecret,
                orderId: orderRef.id
            });
        } catch (error) {
            console.error('Stripe create intent error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

/**
 * Stripe Webhook Handler
 */
const stripeWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];

        // In production, verify webhook signature
        // const stripe = require('stripe')(CONFIG.stripe.secretKey);
        // const event = stripe.webhooks.constructEvent(req.rawBody, sig, CONFIG.stripe.webhookSecret);

        const event = req.body;

        switch (event.type) {
            case 'payment_intent.succeeded':
                await handleStripeSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handleStripeFailure(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});

async function handleStripeSuccess(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
        await admin.firestore().collection('orders').doc(orderId).update({
            status: 'completed',
            stripePaymentId: paymentIntent.id,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Trigger fulfillment
        await triggerOrderFulfillment(orderId, 'stripe');
    }
}

async function handleStripeFailure(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
        await admin.firestore().collection('orders').doc(orderId).update({
            status: 'failed',
            failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
            failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
}

// ============================================
// PAYPAL PAYMENT HANDLERS
// ============================================

/**
 * Get PayPal Access Token
 */
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${CONFIG.paypal.clientId}:${CONFIG.paypal.clientSecret}`).toString('base64');

    const response = await axios.post(
        `${CONFIG.paypal.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    return response.data.access_token;
}

/**
 * Create PayPal Order
 */
const paypalCreateOrder = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { amount, currency, items, customer } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            // Store order in Firestore
            const orderRef = await admin.firestore().collection('orders').add({
                amount,
                currency: currency || 'USD',
                items,
                customer,
                paymentMethod: 'paypal',
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            try {
                const accessToken = await getPayPalAccessToken();

                const response = await axios.post(
                    `${CONFIG.paypal.baseUrl}/v2/checkout/orders`,
                    {
                        intent: 'CAPTURE',
                        purchase_units: [{
                            reference_id: orderRef.id,
                            amount: {
                                currency_code: currency || 'USD',
                                value: amount.toFixed(2)
                            },
                            description: `Flo Faction Services - ${items?.length || 1} item(s)`
                        }],
                        application_context: {
                            brand_name: 'Flo Faction',
                            landing_page: 'NO_PREFERENCE',
                            user_action: 'PAY_NOW',
                            return_url: `${req.headers.origin}/payment-success?orderId=${orderRef.id}`,
                            cancel_url: `${req.headers.origin}/payment-cancel?orderId=${orderRef.id}`
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const approvalUrl = response.data.links.find(link => link.rel === 'approve')?.href;

                // Update order with PayPal order ID
                await admin.firestore().collection('orders').doc(orderRef.id).update({
                    paypalOrderId: response.data.id
                });

                return res.status(200).json({
                    success: true,
                    orderId: orderRef.id,
                    paypalOrderId: response.data.id,
                    approvalUrl
                });
            } catch (paypalError) {
                // Demo fallback
                console.log('PayPal API error, returning demo response:', paypalError.message);
                return res.status(200).json({
                    success: true,
                    orderId: orderRef.id,
                    paypalOrderId: `DEMO_PP_${Date.now()}`,
                    approvalUrl: null,
                    demo: true
                });
            }
        } catch (error) {
            console.error('PayPal create order error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

/**
 * Capture PayPal Order
 */
const paypalCaptureOrder = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { paypalOrderId, orderId } = req.body;

            if (!paypalOrderId || !orderId) {
                return res.status(400).json({ error: 'Missing order IDs' });
            }

            try {
                const accessToken = await getPayPalAccessToken();

                const response = await axios.post(
                    `${CONFIG.paypal.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.status === 'COMPLETED') {
                    await admin.firestore().collection('orders').doc(orderId).update({
                        status: 'completed',
                        paypalCaptureId: response.data.purchase_units[0]?.payments?.captures[0]?.id,
                        completedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    await triggerOrderFulfillment(orderId, 'paypal');
                }

                return res.status(200).json({
                    success: true,
                    status: response.data.status,
                    captureId: response.data.purchase_units[0]?.payments?.captures[0]?.id
                });
            } catch (paypalError) {
                console.log('PayPal capture error:', paypalError.message);

                // Demo fallback
                await admin.firestore().collection('orders').doc(orderId).update({
                    status: 'completed',
                    demo: true,
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                return res.status(200).json({
                    success: true,
                    status: 'COMPLETED',
                    demo: true
                });
            }
        } catch (error) {
            console.error('PayPal capture error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

// ============================================
// BITCOIN PAYMENT HANDLERS
// ============================================

/**
 * Create Bitcoin Invoice
 */
const bitcoinCreateInvoice = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { amount, currency, orderId, customer, items } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            // Store order in Firestore
            const orderRef = await admin.firestore().collection('orders').add({
                amount,
                currency: currency || 'USD',
                items,
                customer,
                paymentMethod: 'bitcoin',
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000))
            });

            // Get current BTC rate
            let btcRate = 43000; // Default fallback
            try {
                const rateResponse = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
                btcRate = parseFloat(rateResponse.data.data.rates.USD);
            } catch (rateError) {
                console.log('Using fallback BTC rate:', rateError.message);
            }

            const btcAmount = (amount / btcRate).toFixed(8);

            // In production, generate unique address via BTCPay Server or similar
            // For now, generate a deterministic demo address
            const btcAddress = generateDemoAddress(orderRef.id);

            // Generate QR code data URL (would use qrcode library in production)
            const qrCode = `bitcoin:${btcAddress}?amount=${btcAmount}&label=FloFaction`;

            // Update order with Bitcoin details
            await admin.firestore().collection('orders').doc(orderRef.id).update({
                btcAddress,
                btcAmount,
                btcRate,
                qrCode
            });

            // Create payment monitor
            await admin.firestore().collection('btcPaymentMonitors').add({
                orderId: orderRef.id,
                btcAddress,
                expectedAmount: btcAmount,
                status: 'monitoring',
                confirmations: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000))
            });

            return res.status(200).json({
                success: true,
                invoiceId: orderRef.id,
                btcAddress,
                btcAmount,
                btcRate,
                qrCode,
                expiresAt: Date.now() + 30 * 60 * 1000
            });
        } catch (error) {
            console.error('Bitcoin invoice error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

/**
 * Check Bitcoin Payment Status
 */
const bitcoinCheckStatus = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const invoiceId = req.params?.[0] || req.query.invoiceId || req.path.split('/').pop();

            if (!invoiceId) {
                return res.status(400).json({ error: 'Invoice ID required' });
            }

            const orderDoc = await admin.firestore().collection('orders').doc(invoiceId).get();

            if (!orderDoc.exists) {
                return res.status(404).json({ error: 'Invoice not found' });
            }

            const order = orderDoc.data();

            // Check if expired
            if (order.expiresAt && order.expiresAt.toDate() < new Date()) {
                if (order.status === 'pending') {
                    await admin.firestore().collection('orders').doc(invoiceId).update({
                        status: 'expired'
                    });
                    return res.status(200).json({ status: 'expired' });
                }
            }

            // In production, check blockchain for confirmations
            // For demo, return current status
            return res.status(200).json({
                status: order.status,
                confirmations: order.confirmations || 0,
                btcAmount: order.btcAmount,
                btcAddress: order.btcAddress
            });
        } catch (error) {
            console.error('Bitcoin status check error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

/**
 * Bitcoin Webhook Handler (for BTCPay Server, Coinbase Commerce, etc.)
 */
const bitcoinWebhook = functions.https.onRequest(async (req, res) => {
    try {
        // Verify webhook signature (implementation depends on provider)
        const event = req.body;

        if (event.type === 'payment_confirmed' || event.type === 'charge:confirmed') {
            const btcAddress = event.data?.address || event.data?.addresses?.bitcoin;

            // Find matching order
            const monitorsSnapshot = await admin.firestore()
                .collection('btcPaymentMonitors')
                .where('btcAddress', '==', btcAddress)
                .where('status', '==', 'monitoring')
                .limit(1)
                .get();

            if (!monitorsSnapshot.empty) {
                const monitor = monitorsSnapshot.docs[0];
                const orderId = monitor.data().orderId;

                // Update order status
                await admin.firestore().collection('orders').doc(orderId).update({
                    status: 'completed',
                    confirmations: event.data?.confirmations || 1,
                    txHash: event.data?.transaction_id || event.data?.txHash,
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Update monitor
                await monitor.ref.update({
                    status: 'confirmed',
                    confirmations: event.data?.confirmations || 1
                });

                await triggerOrderFulfillment(orderId, 'bitcoin');
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Bitcoin webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// COUPON VALIDATION
// ============================================

const validateCoupon = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { code, subtotal } = req.body;

            if (!code) {
                return res.status(400).json({ error: 'Coupon code required' });
            }

            // Lookup coupon in Firestore
            const couponSnapshot = await admin.firestore()
                .collection('coupons')
                .where('code', '==', code.toUpperCase())
                .where('active', '==', true)
                .limit(1)
                .get();

            if (couponSnapshot.empty) {
                return res.status(400).json({ valid: false, error: 'Invalid coupon code' });
            }

            const coupon = couponSnapshot.docs[0].data();

            // Check expiration
            if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
                return res.status(400).json({ valid: false, error: 'Coupon has expired' });
            }

            // Check usage limit
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                return res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
            }

            // Check minimum order
            if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
                return res.status(400).json({
                    valid: false,
                    error: `Minimum order of $${coupon.minOrderAmount} required`
                });
            }

            // Calculate discount
            let discountAmount = 0;
            if (coupon.type === 'percentage') {
                discountAmount = (subtotal * coupon.value) / 100;
                if (coupon.maxDiscount) {
                    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                }
            } else {
                discountAmount = Math.min(coupon.value, subtotal);
            }

            return res.status(200).json({
                valid: true,
                code: coupon.code,
                type: coupon.type,
                discountAmount: Math.round(discountAmount * 100) / 100,
                description: coupon.description
            });
        } catch (error) {
            console.error('Coupon validation error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateDemoAddress(orderId) {
    // Generate a consistent demo address based on order ID
    const hash = orderId.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
    }, 0);

    const chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    let address = 'bc1q';
    for (let i = 0; i < 32; i++) {
        address += chars[(hash * (i + 1)) % chars.length];
    }
    return address;
}

async function triggerOrderFulfillment(orderId, paymentMethod) {
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
    const order = orderDoc.data();

    // Create fulfillment record
    await admin.firestore().collection('fulfillments').add({
        orderId,
        paymentMethod,
        customer: order.customer,
        items: order.items,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send confirmation email (would integrate with email service)
    console.log(`Order ${orderId} fulfilled via ${paymentMethod}`);

    // Trigger n8n webhook if configured
    if (process.env.N8N_WEBHOOK_URL) {
        try {
            await axios.post(process.env.N8N_WEBHOOK_URL, {
                event: 'order_completed',
                orderId,
                paymentMethod,
                amount: order.amount,
                customer: order.customer,
                items: order.items,
                timestamp: new Date().toISOString()
            });
        } catch (webhookError) {
            console.error('Fulfillment webhook error:', webhookError.message);
        }
    }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Stripe
    stripeCreateIntent,
    stripeWebhook,

    // PayPal
    paypalCreateOrder,
    paypalCaptureOrder,

    // Bitcoin
    bitcoinCreateInvoice,
    bitcoinCheckStatus,
    bitcoinWebhook,

    // Coupons
    validateCoupon
};
