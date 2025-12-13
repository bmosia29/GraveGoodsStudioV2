/**
 * product.js - Product Page JavaScript
 * Handles product display, variant selection, and add to cart
 */

let currentProduct = null;
let selectedColour = '';
let selectedMeasurement = '';
let selectedQuantity = 1;

// DOM Elements
const mainImage = document.getElementById('mainImage');
const thumbnailGallery = document.getElementById('thumbnailGallery');
const productName = document.getElementById('productName');
const productSku = document.getElementById('productSku');
const productPrice = document.getElementById('productPrice');
const productDescription = document.getElementById('productDescription');
const breadcrumbProduct = document.getElementById('breadcrumbProduct');
const colourOptions = document.getElementById('colourOptions');
const measurementSelect = document.getElementById('measurementSelect');
const qtyInput = document.getElementById('qtyInput');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const stockInfo = document.getElementById('stockInfo');
const stockText = document.getElementById('stockText');
const errorMessage = document.getElementById('errorMessage');
const addToCartBtn = document.getElementById('addToCartBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

/**
 * Get product slug from URL
 */
function getProductSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Load and display product
 */
async function loadProduct() {
    const slug = getProductSlug();
    
    if (!slug) {
        showError('Product not found');
        return;
    }
    
    try {
        loadingOverlay.style.display = 'flex';
        currentProduct = await getProductBySlug(slug);
        
        if (!currentProduct) {
            showError('Product not found');
            return;
        }
        
        renderProduct();
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product. Please try again.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Load product on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  const slug = new URLSearchParams(window.location.search).get('id');
  if (!slug) {
    console.error('No product ID in URL');
    return;
  }

  // Load product using store.js helper
  currentProduct = await getProductBySlug(slug);
  
  if (!currentProduct) {
    console.error('Product not found:', slug);
    return;
  }

  renderProduct();
});

/**
 * Render product details
 */
function renderProduct() {
    // Update page title and breadcrumb
    document.title = `${currentProduct.name} | Graveyard Studios`;
    productName.textContent = currentProduct.name;
    breadcrumbProduct.textContent = currentProduct.name;
    
    // Update SKU and price
    productSku.textContent = currentProduct.sku;
    productPrice.textContent = formatPrice(currentProduct.price, currentProduct.currency);
    
    // Update description
    productDescription.innerHTML = `<p>${currentProduct.description}</p>`;
    
    // Render images
    renderImages();
    
    // Render variant options
    renderColourOptions();
    renderMeasurementOptions();
    
    // Set initial quantity
    qtyInput.value = 1;
    selectedQuantity = 1;
}

/**
 * Render product images
 */
function renderImages() {
    if (currentProduct.images && currentProduct.images.length > 0) {
        mainImage.src = currentProduct.images[0];
        mainImage.alt = currentProduct.name;
        
        // Render thumbnails
        thumbnailGallery.innerHTML = currentProduct.images.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${img}" alt="${currentProduct.name}">
            </div>
        `).join('');
        
        // Add thumbnail click handlers
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = parseInt(thumb.dataset.index);
                updateMainImage(index);
            });
        });
    }
}

/**
 * Update main image
 */
function updateMainImage(index) {
    mainImage.src = currentProduct.images[index];
    
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

/**
 * Render colour options
 */
function renderColourOptions() {
    if (!currentProduct.colours || currentProduct.colours.length === 0) return;
    
    colourOptions.innerHTML = currentProduct.colours.map(colour => `
        <button class="colour-option" data-colour="${colour}" aria-label="Select ${colour}">
            ${colour}
        </button>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.colour-option').forEach(btn => {
        btn.addEventListener('click', () => {
            selectColour(btn.dataset.colour);
        });
    });
    
    // Auto-select if only one colour
    if (currentProduct.colours.length === 1) {
        selectColour(currentProduct.colours[0]);
    }
}

/**
 * Select colour
 */
function selectColour(colour) {
    selectedColour = colour;
    
    // Update UI
    document.querySelectorAll('.colour-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.colour === colour);
    });
    
    updateStockInfo();
    clearError();
}

/**
 * Render measurement options
 */
function renderMeasurementOptions() {
    if (!currentProduct.measurements || currentProduct.measurements.length === 0) return;
    
    measurementSelect.innerHTML = '<option value="">Select size</option>' +
        currentProduct.measurements.map(size => `
            <option value="${size}">${size}</option>
        `).join('');
    
    // Add change handler
    measurementSelect.addEventListener('change', (e) => {
        selectMeasurement(e.target.value);
    });
    
    // Auto-select if only one measurement
    if (currentProduct.measurements.length === 1) {
        measurementSelect.value = currentProduct.measurements[0];
        selectMeasurement(currentProduct.measurements[0]);
    }
}

/**
 * Select measurement
 */
function selectMeasurement(measurement) {
    selectedMeasurement = measurement;
    updateStockInfo();
    clearError();
}

/**
 * Get stock for current variant
 */
function getCurrentStock() {
    if (!selectedColour || !selectedMeasurement) return null;
    
    const variantKey = `${selectedColour}-${selectedMeasurement}`;
    return currentProduct.stockByVariant[variantKey] || 0;
}

/**
 * Update stock information display
 */
function updateStockInfo() {
    const stock = getCurrentStock();
    
    if (stock === null) {
        stockInfo.style.display = 'none';
        return;
    }
    
    stockInfo.style.display = 'flex';
    
    if (stock === 0) {
        stockInfo.className = 'stock-info out-of-stock';
        stockText.innerHTML = '<i class="fas fa-times-circle"></i> Out of stock';
        qtyInput.disabled = true;
        qtyMinus.disabled = true;
        qtyPlus.disabled = true;
        addToCartBtn.disabled = true;
    } else if (stock < 5) {
        stockInfo.className = 'stock-info low-stock';
        stockText.innerHTML = `<i class="fas fa-exclamation-circle"></i> Only ${stock} left`;
        qtyInput.disabled = false;
        qtyMinus.disabled = false;
        qtyPlus.disabled = false;
        qtyInput.max = stock;
        addToCartBtn.disabled = false;
        
        // Reset quantity if it exceeds stock
        if (selectedQuantity > stock) {
            qtyInput.value = stock;
            selectedQuantity = stock;
        }
    } else {
        stockInfo.className = 'stock-info in-stock';
        stockText.innerHTML = '<i class="fas fa-check-circle"></i> In stock';
        qtyInput.disabled = false;
        qtyMinus.disabled = false;
        qtyPlus.disabled = false;
        qtyInput.max = Math.min(stock, 10);
        addToCartBtn.disabled = false;
    }
}

/**
 * Initialize quantity controls
 */
function initQuantityControls() {
    qtyMinus.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        if (currentValue > 1) {
            qtyInput.value = currentValue - 1;
            selectedQuantity = currentValue - 1;
        }
    });
    
    qtyPlus.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        const maxQty = parseInt(qtyInput.max);
        if (currentValue < maxQty) {
            qtyInput.value = currentValue + 1;
            selectedQuantity = currentValue + 1;
        }
    });
    
    qtyInput.addEventListener('change', () => {
        let value = parseInt(qtyInput.value);
        const min = parseInt(qtyInput.min);
        const max = parseInt(qtyInput.max);
        
        if (isNaN(value) || value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }
        
        qtyInput.value = value;
        selectedQuantity = value;
    });
}

/**
 * Add to cart handler
 */
function handleAddToCart() {
    clearError();
    
    // Validate selections
    if (!selectedColour) {
        showError('Please select a colour');
        return;
    }
    
    if (!selectedMeasurement) {
        showError('Please select a size');
        return;
    }
    
    // Check stock
    const stock = getCurrentStock();
    if (stock === 0) {
        showError('This item is out of stock');
        return;
    }
    
    if (selectedQuantity > stock) {
        showError(`Only ${stock} items available in stock`);
        return;
    }
    
    // Create cart item
    const cartItem = {
        productId: currentProduct.id,
        slug: currentProduct.slug,
        name: currentProduct.name,
        price: currentProduct.price,
        currency: currentProduct.currency,
        selectedColour: selectedColour,
        measurement: selectedMeasurement,
        quantity: selectedQuantity,
        image: currentProduct.images[0]
    };
    
    // Validate item
    const validation = validateCartItem(cartItem);
    if (!validation.valid) {
        showError(validation.error);
        return;
    }
    
    // Add to cart
    const success = addToCart(cartItem);
    
    if (success) {
        showToast(`${currentProduct.name} added to cart!`, 'success');
        
        // Optional: Animate add to cart
        animateAddToCart();
    } else {
        showError('Failed to add item to cart');
    }
}

/**
 * Animate add to cart (optional fly-to-cart effect)
 */
function animateAddToCart() {
    addToCartBtn.classList.add('added');
    setTimeout(() => {
        addToCartBtn.classList.remove('added');
    }, 1000);
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

/**
 * Initialize cart badge and preview
 */
function initCartUI() {
    const cartIcon = document.getElementById('cartIcon');
    const cartPreview = document.getElementById('cartPreview');
    const closePreview = document.getElementById('closePreview');
    
    function updateCartBadge() {
        const cartCount = document.getElementById('cartCount');
        const count = getCartCount();
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    function updateCartPreview() {
        const cart = getCart();
        const cartPreviewItems = document.getElementById('cartPreviewItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        
        if (cart.length === 0) {
            cartPreviewItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>';
            cartSubtotal.textContent = 'R0.00';
            return;
        }
        
        cartPreviewItems.innerHTML = cart.map((item, index) => `
            <div class="cart-preview-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.selectedColour} • ${item.measurement}</p>
                    <p class="item-price">R${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <button class="remove-item" data-index="${index}"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
        
        cartSubtotal.textContent = formatPrice(getCartSubtotal());
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromCart(parseInt(btn.dataset.index));
            });
        });
    }
    
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            cartPreview.classList.toggle('show');
        });
    }
    
    if (closePreview) {
        closePreview.addEventListener('click', () => {
            cartPreview.classList.remove('show');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!cartPreview.contains(e.target) && !cartIcon.contains(e.target)) {
            cartPreview.classList.remove('show');
        }
    });
    
    window.addEventListener('cartUpdated', () => {
        updateCartBadge();
        updateCartPreview();
    });
    
    updateCartBadge();
    updateCartPreview();
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

/**
 * Determine product category from product data
 */
function getProductCategory(product) {
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  
  if (name.includes('dermal') || desc.includes('dermal')) return 'dermal';
  if (name.includes('nose') || desc.includes('nose')) return 'nose';
  if (name.includes('belly') || desc.includes('belly')) return 'belly';
  if (name.includes('industrial') || desc.includes('industrial')) return 'industrial';
  if (name.includes('nipple') || desc.includes('nipple')) return 'nipple';
  
  return 'general';
}

/**
 * Build image paths for product
 * Adjust paths based on your actual folder structure
 */
function buildImagePaths(category, productName) {
  const paths = [];
  
  // Map categories to folder names
  const categoryMap = {
    'dermal': 'GC - DERMAL JEWELLERY',
    'nose': 'GC - NOSE JEWELLERY',
    'belly': 'GC JEWELLERY - BELLY',
    'industrial': 'GC - INDUSTRIAL JEWELERY',
    'nipple': 'GC - NIPPLE JEWELLERY'
  };
  
  const folderName = categoryMap[category] || category;
  const basePath = `Assets/images/${folderName}`;
  
  // Try multiple image naming conventions
  const imageNames = [
    `${productName}.jpg`,
    `${productName}.png`,
    `${productName.replace(/\s+/g, '-')}.jpg`,
    `${productName.replace(/\s+/g, '-')}.png`,
    `${productName.replace(/\s+/g, '_')}.jpg`,
    `${productName.replace(/\s+/g, '_')}.png`
  ];
  
  // Add numbered variants (product-1.jpg, product-2.jpg, etc)
  for (let i = 1; i <= 5; i++) {
    imageNames.push(`${productName.replace(/\s+/g, '-')}-${i}.jpg`);
    imageNames.push(`${productName.replace(/\s+/g, '-')}-${i}.png`);
  }
  
  // Return all possible paths (browser will load the ones that exist)
  return imageNames.map(name => `${basePath}/${name}`);
}

/**
 * Change main image on thumbnail click
 */
function changeImage(index) {
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach(t => t.classList.remove('active'));
  
  if (thumbnails[index]) {
    thumbnails[index].classList.add('active');
    if (mainImage) mainImage.src = thumbnails[index].src;
  }
}

// Initialize cart event on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        dispatchCartEvent();
    });
}

/**
 * store.js - Cart and Product Data Management
 * Graveyard Studios E-commerce Store
 * 
 * This module handles:
 * - Loading product data from products.json
 * - Cart management (add, remove, update, persist)
 * - localStorage interaction
 * - Custom events for cart updates
 */

const CART_KEY = 'pierce_cart_v1';
const PRODUCTS_URL = 'assets/products.json';

/**
 * Load products from JSON file
 * @returns {Promise<Array>} Array of product objects
 */
async function loadProducts() {
    try {
        const response = await fetch(PRODUCTS_URL);
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

/**
 * Get product by slug
 * @param {string} slug - Product slug from URL
 * @returns {Promise<Object|null>} Product object or null
 */
async function getProductBySlug(slug) {
    const products = await loadProducts();
    return products.find(p => p.slug === slug) || null;
}

/**
 * Get cart from localStorage
 * Returns empty array if cart is invalid or doesn't exist
 * @returns {Array} Cart items array
 */
function getCart() {
    try {
        const cartData = localStorage.getItem(CART_KEY);
        if (!cartData) return [];
        
        const cart = JSON.parse(cartData);
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error('Error reading cart:', error);
        return [];
    }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Array of cart items
 */
function setCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        dispatchCartEvent();
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

/**
 * Add item to cart
 * If same variant exists, increase quantity (merge)
 * Otherwise, add new line item
 * 
 * @param {Object} item - Cart item object
 * @param {number} item.productId - Product ID
 * @param {string} item.slug - Product slug
 * @param {string} item.name - Product name
 * @param {number} item.price - Product price
 * @param {string} item.currency - Currency code (ZAR)
 * @param {string} item.selectedColour - Selected colour
 * @param {string} item.measurement - Selected measurement
 * @param {number} item.quantity - Quantity to add
 * @param {string} item.image - Product image URL
 * @returns {boolean} Success status
 */
function addToCart(item) {
    const cart = getCart();
    
    // Create variant key for matching
    const variantKey = `${item.productId}-${item.selectedColour}-${item.measurement}`;
    
    // Check if item with same variant already exists
    const existingIndex = cart.findIndex(cartItem => {
        const existingKey = `${cartItem.productId}-${cartItem.selectedColour}-${cartItem.measurement}`;
        return existingKey === variantKey;
    });
    
    if (existingIndex > -1) {
        // Merge: increase quantity of existing item
        cart[existingIndex].quantity += item.quantity;
    } else {
        // Add new item
        cart.push({
            ...item,
            addedAt: new Date().toISOString()
        });
    }
    
    setCart(cart);
    return true;
}

/**
 * Remove item from cart by index
 * @param {number} index - Cart item index
 */
function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        setCart(cart);
    }
}

/**
 * Update quantity of cart item
 * @param {number} index - Cart item index
 * @param {number} quantity - New quantity
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
 * Get total count of items in cart (sum of quantities)
 * @returns {number} Total item count
 */
function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calculate cart subtotal
 * @returns {number} Subtotal amount
 */
function getCartSubtotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Clear entire cart
 */
function clearCart() {
    setCart([]);
}

/**
 * Dispatch custom event when cart changes
 * All pages can listen to this event to update UI
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
 * Format price with currency
 * @param {number} price - Price amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted price string
 */
function formatPrice(price, currency = 'ZAR') {
    const prefix = currency === 'ZAR' ? 'R' : currency + ' ';
    return prefix + price.toFixed(2);
}

/**
 * Validate cart item before adding
 * @param {Object} item - Cart item to validate
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateCartItem(item) {
    if (!item.productId) {
        return { valid: false, error: 'Invalid product' };
    }
    if (!item.selectedColour) {
        return { valid: false, error: 'Please select a colour' };
    }
    if (!item.measurement) {
        return { valid: false, error: 'Please select a size' };
    }
    if (!item.quantity || item.quantity < 1) {
        return { valid: false, error: 'Invalid quantity' };
    }
    return { valid: true, error: '' };
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error)
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize cart event on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        dispatchCartEvent();
    });
}