/**
 * store.js - Professional E-Commerce Store Management
 * Graveyard Studios - Piercing Jewelry Store
 */

const CART_KEY = 'graveyard_cart_v1';
const PRODUCTS_URL = 'Assets/products.json';

// Cache for products to avoid repeated fetches
let productsCache = null;

/**
 * Load products from JSON with caching
 */
async function loadProducts() {
    if (productsCache) return productsCache;
    
    try {
        const response = await fetch(PRODUCTS_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        productsCache = data.products || [];
        return productsCache;
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showToast('Failed to load products. Please refresh the page.', 'error');
        return [];
    }
}

/**
 * Get product by slug
 */
async function getProductBySlug(slug) {
    const products = await loadProducts();
    if (!products) return null;
    return products.find(p => 
        (p.slug === slug) || 
        (p.id === slug) || 
        ((p.name || '').toLowerCase().replace(/\s+/g, '-') === slug)
    );
}

/**
 * Get product by ID
 */
async function getProductById(id) {
    const products = await loadProducts();
    return products.find(p => p.id === id) || null;
}

/**
 * Get cart from localStorage (safe)
 */
function getCart() {
    try {
        const cartData = localStorage.getItem(CART_KEY);
        if (!cartData) return [];
        const cart = JSON.parse(cartData);
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error('❌ Error reading cart:', error);
        localStorage.removeItem(CART_KEY);
        return [];
    }
}

/**
 * Save cart to localStorage
 */
function setCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        dispatchCartEvent();
    } catch (error) {
        console.error('❌ Error saving cart:', error);
        showToast('Failed to update cart', 'error');
    }
}

/**
 * Add item to cart (with variant merging)
 */
function addToCart(item) {
    const cart = getCart();
    const variantKey = `${item.productId}-${item.selectedColour}-${item.measurement}`;
    
    const existingIndex = cart.findIndex(cartItem => {
        const key = `${cartItem.productId}-${cartItem.selectedColour}-${cartItem.measurement}`;
        return key === variantKey;
    });
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += item.quantity;
    } else {
        cart.push({
            ...item,
            addedAt: new Date().toISOString()
        });
    }
    
    setCart(cart);
    return true;
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        setCart(cart);
    }
}

/**
 * Update quantity
 */
function updateQuantity(index, quantity) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        if (quantity <= 0) {
            removeFromCart(index);
        } else {
            cart[index].quantity = quantity;
            setCart(cart);
        }
    }
}

/**
 * Get cart count
 */
function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Get cart subtotal
 */
function getCartSubtotal() {
    return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Clear cart
 */
function clearCart() {
    setCart([]);
}

/**
 * Dispatch cart update event
 */
function dispatchCartEvent() {
    window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: {
            cart: getCart(),
            count: getCartCount(),
            subtotal: getCartSubtotal()
        }
    }));
}

/**
 * Format price
 */
function formatPrice(price, currency = 'ZAR') {
    const prefix = currency === 'ZAR' ? 'R' : currency + ' ';
    return prefix + parseFloat(price).toFixed(2);
}

/**
 * Validate cart item
 */
function validateCartItem(item) {
    if (!item.productId) return { valid: false, error: 'Invalid product' };
    if (!item.selectedColour) return { valid: false, error: 'Please select a colour' };
    if (!item.measurement) return { valid: false, error: 'Please select a size' };
    if (!item.quantity || item.quantity < 1) return { valid: false, error: 'Invalid quantity' };
    return { valid: true, error: '' };
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Create toast if doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add toast styles if not present
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .toast {
            position: fixed;
            bottom: -100px;
            left: 50%;
            transform: translateX(-50%);
            background: #000;
            color: #fff;
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            transition: bottom 0.3s ease;
            font-weight: 600;
            font-size: 0.95rem;
        }
        .toast.show {
            bottom: 30px;
        }
        .toast.error {
            background: #dc3545;
        }
        .toast.success {
            background: #28a745;
        }
    `;
    document.head.appendChild(style);
}

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        dispatchCartEvent();
        console.log('✅ Store initialized');
    });
}