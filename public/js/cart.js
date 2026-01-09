/**
 * Flo Faction Shopping Cart System
 * Handles cart operations for digital products and services
 */

class FloFactionCart {
  constructor() {
    this.cartKey = 'floFactionCart';
    this.cart = this.loadCart();
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    try {
      const cartData = localStorage.getItem(this.cartKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
      this.updateCartBadge();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  /**
   * Add item to cart
   */
  addItem(productId, productName, price, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: productId,
        name: productName,
        price: parseFloat(price),
        quantity: quantity
      });
    }

    this.saveCart();
    return true;
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = parseInt(quantity);
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.saveCart();
      }
    }
  }

  /**
   * Get cart items
   */
  getItems() {
    return this.cart;
  }

  /**
   * Get cart total
   */
  getTotal() {
    return this.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Get item count
   */
  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Clear cart
   */
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  /**
   * Update cart badge in navigation
   */
  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const count = this.getItemCount();

    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  /**
   * Show cart notification
   */
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Global cart instance
window.floFactionCart = new FloFactionCart();

// Global helper function for easy access
function addToCart(productId, productName, price, redirectToCheckout = true) {
  const cart = window.floFactionCart;

  if (cart.addItem(productId, productName, price)) {
    cart.showNotification(`Added "${productName}" to cart for $${parseFloat(price).toFixed(2)}`);

    if (redirectToCheckout) {
      // Small delay to show notification before redirect
      setTimeout(() => {
        window.location.href = '/checkout.html';
      }, 800);
    }
  } else {
    cart.showNotification('Error adding item to cart', 'error');
  }
}

// Update cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
  window.floFactionCart.updateCartBadge();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
