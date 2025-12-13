/**
 * main.js - Homepage JavaScript
 * Handles featured products display and cart preview
 */

// DOM Elements
const featuredGrid = document.getElementById('featuredProducts');
const loadingSpinner = document.getElementById('loadingSpinner');
const cartIcon = document.getElementById('cartIcon');
const cartPreview = document.getElementById('cartPreview');
const closePreview = document.getElementById('closePreview');
const cartPreviewItems = document.getElementById('cartPreviewItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.querySelector('.nav-menu');

/**
 * Load and display featured products
 */
async function loadFeaturedProducts() {
    try {
        loadingSpinner.style.display = 'block';
        const products = await loadProducts();
        
        // Filter featured products
        const featuredProducts = products.filter(p => p.featured);
        
        if (featuredProducts.length === 0) {
            featuredGrid.innerHTML = '<p class="no-products">No products available</p>';
            return;
        }
        
        // Render product cards
        featuredGrid.innerHTML = featuredProducts.map(product => `
            <div class="fc-item" data-product-id="${product.id}">
                <a href="product.html?id=${product.slug}" class="product-link">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    <h3 class="fc-name">${product.name}</h3>
                    <p class="fc-price">From ${formatPrice(product.price, product.currency)}</p>
                </a>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        featuredGrid.innerHTML = '<p class="error-message">Failed to load products. Please refresh the page.</p>';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

/**
 * Update cart badge count
 */
function updateCartBadge() {
    const cartCount = document.getElementById('cartCount');
    const count = getCartCount();
    
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * Update cart preview dropdown
 */
function updateCartPreview() {
    const cart = getCart();
    
    if (cart.length === 0) {
        cartPreviewItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartSubtotal.textContent = 'R0.00';
        return;
    }
    
    // Render cart items
    cartPreviewItems.innerHTML = cart.map((item, index) => `
        <div class="cart-preview-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.selectedColour} • ${item.measurement}</p>
                <p class="item-price">R${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <button class="remove-item" data-index="${index}" aria-label="Remove item">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Update subtotal
    const subtotal = getCartSubtotal();
    cartSubtotal.textContent = formatPrice(subtotal);
    
    // Add remove listeners
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            removeFromCart(index);
        });
    });
}

/**
 * Toggle cart preview
 */
function toggleCartPreview() {
    cartPreview.classList.toggle('show');
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

/**
 * Navbar scroll effect
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Close cart preview when clicking outside
 */
function initCartPreviewClose() {
    document.addEventListener('click', (e) => {
        if (!cartPreview.contains(e.target) && !cartIcon.contains(e.target)) {
            cartPreview.classList.remove('show');
        }
    });
    
    if (closePreview) {
        closePreview.addEventListener('click', () => {
            cartPreview.classList.remove('show');
        });
    }
}

/**
 * Cart icon click handler
 */
function initCartIcon() {
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCartPreview();
        });
    }
}

/**
 * Listen for cart updates
 */
function initCartListeners() {
    window.addEventListener('cartUpdated', () => {
        updateCartBadge();
        updateCartPreview();
    });
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    updateCartBadge();
    updateCartPreview();
    initMobileMenu();
    initNavbarScroll();
    initCartPreviewClose();
    initCartIcon();
    initCartListeners();
});