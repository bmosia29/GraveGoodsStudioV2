// js/product-detail.js
// Integrated with your existing store.js helpers:
// - getProductBySlug(slug)
// - addToCart(item)
// - getCart(), getCartCount(), getCartSubtotal()
// - formatPrice(price), showToast(msg, type)
// - dispatchCartEvent() and it dispatches 'cartUpdated'

let product = null;
let selectedColour = '';
let selectedSize = '';
let qty = 1;

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.addEventListener('DOMContentLoaded', async () => {
  const slug = new URLSearchParams(window.location.search).get('id');
  if (!slug) { window.location = 'index.html'; return; }

  // Try to load product using your helper
  try {
    product = (typeof getProductBySlug === 'function') ? await getProductBySlug(slug) : null;
  } catch (err) {
    console.error('Error fetching product by slug', err);
    product = null;
  }

  // If not found, try loadProducts fallback (if available)
  if (!product && typeof loadProducts === 'function') {
    try {
      const all = await loadProducts();
      product = (all || []).find(p => p.slug === slug || p.id === slug) || null;
    } catch (e) {
      console.error('loadProducts fallback failed', e);
    }
  }

  if (!product) { window.location = 'index.html'; return; }

  renderProduct();
  initCart();
  initMobileMenu();
});

function renderProduct() {
  // Basic fields (safe)
  document.getElementById('productName').textContent = product.name || product.title || 'Product';
  document.getElementById('breadcrumbName').textContent = product.name || product.title || 'Product';
  document.getElementById('productSku').textContent = product.sku || product.id || '';
  document.getElementById('productPrice').textContent = (typeof formatPrice === 'function') ? formatPrice(product.price) : `R${Number(product.price||0).toFixed(2)}`;
  document.getElementById('productDesc').textContent = product.description || '';

  // Images: ensure array
  product.images = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : ['']);
  document.getElementById('mainImg').src = product.images[0] || '';

  // Thumbnails
  const thumbsEl = document.getElementById('thumbs');
  if (thumbsEl) {
    thumbsEl.innerHTML = product.images.map((img, i) => `
      <div class="thumbnail ${i === 0 ? 'active' : ''}" data-idx="${i}">
        <img src="${escapeHtml(img)}" alt="">
      </div>
    `).join('');
    // attach handlers
    thumbsEl.querySelectorAll('.thumbnail').forEach((t) => {
      t.addEventListener('click', () => {
        const idx = Number(t.dataset.idx || 0);
        changeImage(idx);
      });
    });
  }

  // Colours: if present
  const colourOptsEl = document.getElementById('colourOpts');
  if (colourOptsEl) {
    if (Array.isArray(product.colours) && product.colours.length) {
      colourOptsEl.innerHTML = product.colours.map(c => `<button type="button" class="colour-btn">${escapeHtml(c)}</button>`).join('');
      // first auto-select if none selected
      selectedColour = product.colours[0];
      colourOptsEl.querySelectorAll('.colour-btn').forEach(btn => {
        btn.addEventListener('click', () => selectColour(btn.textContent.trim()));
        btn.classList.toggle('selected', btn.textContent.trim() === selectedColour);
      });
      colourOptsEl.parentElement.style.display = '';
    } else {
      // hide colour area if no colours
      if (colourOptsEl.parentElement) colourOptsEl.parentElement.style.display = 'none';
      selectedColour = '';
    }
  }

  // Sizes / measurements
  const sizeSelectEl = document.getElementById('sizeSelect');
  if (sizeSelectEl) {
    if (Array.isArray(product.measurements) && product.measurements.length) {
      sizeSelectEl.innerHTML = '<option value="">Select size</option>' + product.measurements.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
      // default none selected
      selectedSize = '';
      sizeSelectEl.onchange = (e) => selectSize(e.target.value);
      sizeSelectEl.parentElement.style.display = '';
    } else {
      // hide size area if no sizes
      if (sizeSelectEl.parentElement) sizeSelectEl.parentElement.style.display = 'none';
      selectedSize = '';
    }
  }

  // Quantity controls
  const qtyInput = document.getElementById('qtyInput');
  if (qtyInput) qtyInput.value = qty;
  const plus = document.getElementById('qtyPlus');
  const minus = document.getElementById('qtyMinus');
  if (plus) plus.onclick = () => changeQty(1);
  if (minus) minus.onclick = () => changeQty(-1);
  if (qtyInput) qtyInput.onchange = (e) => {
    qty = Math.max(1, parseInt(e.target.value, 10) || 1);
    // enforce max if set
    if (qtyInput.max) {
      const max = parseInt(qtyInput.max, 10);
      if (!isNaN(max)) qty = Math.min(qty, max);
      qtyInput.value = qty;
    }
    updateStock();
  };

  // Add to cart
  const addBtn = document.getElementById('addToCartBtn');
  if (addBtn) addBtn.onclick = () => addToCartHandler();

  // initial stock update (in case default selections exist)
  updateStock();
}

function changeImage(i) {
  const img = product.images[i] || '';
  document.getElementById('mainImg').src = img;
  document.querySelectorAll('.thumbnail').forEach((t, idx) => t.classList.toggle('active', idx === i));
}

function selectColour(c) {
  selectedColour = c;
  document.querySelectorAll('.colour-btn').forEach(b => b.classList.toggle('selected', b.textContent.trim() === c));
  updateStock();
}

function selectSize(s) {
  selectedSize = s;
  const sizeSelectEl = document.getElementById('sizeSelect');
  if (sizeSelectEl) sizeSelectEl.value = s;
  updateStock();
}

function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  const qtyInput = document.getElementById('qtyInput');
  if (qtyInput) {
    // respect max attribute if present
    const max = parseInt(qtyInput.max || '0', 10);
    if (!isNaN(max) && max > 0) qty = Math.min(qty, max);
    qtyInput.value = qty;
  }
  updateStock();
}

function updateStock() {
  const status = document.getElementById('stockStatus');
  const addBtn = document.getElementById('addToCartBtn');
  if (!status) return;

  // If product has stockByVariant object and selections made
  if (product.stockByVariant && selectedColour && selectedSize) {
    const key = `${selectedColour}-${selectedSize}`;
    const stock = Number(product.stockByVariant[key] || 0);

    if (stock === 0) {
      status.textContent = 'Out of stock';
      status.className = 'stock-status out';
      if (addBtn) addBtn.disabled = true;
    } else if (stock < 5) {
      status.textContent = `Only ${stock} left`;
      status.className = 'stock-status low';
      if (addBtn) addBtn.disabled = false;
      const qtyInput = document.getElementById('qtyInput');
      if (qtyInput) qtyInput.max = stock;
    } else {
      status.textContent = 'In stock';
      status.className = 'stock-status';
      if (addBtn) addBtn.disabled = false;
      const qtyInput = document.getElementById('qtyInput');
      if (qtyInput) qtyInput.max = Math.min(stock, 10);
    }
  } else {
    // No variant-based stock info — show generic in-stock (or explicit product.stock)
    if (typeof product.stock === 'number') {
      if (product.stock === 0) {
        status.textContent = 'Out of stock';
        status.className = 'stock-status out';
        if (addBtn) addBtn.disabled = true;
      } else if (product.stock < 5) {
        status.textContent = `Only ${product.stock} left`;
        status.className = 'stock-status low';
        if (addBtn) addBtn.disabled = false;
      } else {
        status.textContent = 'In stock';
        status.className = 'stock-status';
        if (addBtn) addBtn.disabled = false;
      }
    } else {
      status.textContent = '';
      status.className = 'stock-status';
      if (addBtn) addBtn.disabled = false;
    }
  }
}

function addToCartHandler() {
  const err = document.getElementById('errorMsg');

  // If colour UI exists and is visible, require selection
  const colourWrap = document.getElementById('colourOpts');
  if (colourWrap && colourWrap.parentElement && colourWrap.parentElement.style.display !== 'none') {
    if (!selectedColour) {
      if (err) { err.textContent = 'Please select a colour'; err.classList.add('show'); }
      if (typeof showToast === 'function') showToast('Please select a colour', 'error');
      return;
    }
  }

  // If size UI exists and is visible, require selection
  const sizeWrap = document.getElementById('sizeSelect');
  if (sizeWrap && sizeWrap.parentElement && sizeWrap.parentElement.style.display !== 'none') {
    if (!selectedSize) {
      if (err) { err.textContent = 'Please select a size'; err.classList.add('show'); }
      if (typeof showToast === 'function') showToast('Please select a size', 'error');
      return;
    }
  }

  // check stock if available
  if (product.stockByVariant && selectedColour && selectedSize) {
    const key = `${selectedColour}-${selectedSize}`;
    const stock = Number(product.stockByVariant[key] || 0);
    if (qty > stock) {
      if (err) { err.textContent = `Only ${stock} available`; err.classList.add('show'); }
      if (typeof showToast === 'function') showToast(`Only ${stock} available`, 'error');
      return;
    }
  } else if (typeof product.stock === 'number' && qty > product.stock) {
    if (err) { err.textContent = `Only ${product.stock} available`; err.classList.add('show'); }
    if (typeof showToast === 'function') showToast(`Only ${product.stock} available`, 'error');
    return;
  }

  // passed validation
  if (err) { err.classList.remove('show'); err.textContent = ''; }

  // build item shape expected by your store.js
  const item = {
    productId: product.id || product.slug || product.sku,
    slug: product.slug || product.id,
    name: product.name || product.title || '',
    price: Number(product.price || 0),
    currency: product.currency || 'ZAR',
    selectedColour: selectedColour || '',
    measurement: selectedSize || '',
    quantity: qty,
    image: product.images && product.images.length ? product.images[0] : ''
  };

  // Optional: call validateCartItem if available
  if (typeof validateCartItem === 'function') {
    const { valid, error } = validateCartItem(item);
    if (!valid) {
      if (typeof showToast === 'function') showToast(error || 'Invalid item', 'error');
      return;
    }
  }

  // Add to cart using store.js addToCart (sync)
  try {
    if (typeof addToCart === 'function') {
      addToCart(item);
    } else if (typeof window.addToCart === 'function') {
      // older global alias
      window.addToCart(item);
    } else {
      // fallback: store directly to localStorage with your CART_KEY
      const key = 'graveyard_cart_v1';
      let c = [];
      try { c = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { c = []; }
      c.push(item);
      localStorage.setItem(key, JSON.stringify(c));
      if (typeof dispatchCartEvent === 'function') dispatchCartEvent();
    }

    // success feedback
    if (typeof showToast === 'function') showToast(`${product.name} added to cart!`, 'success');
    const btn = document.getElementById('addToCartBtn');
    if (btn) {
      btn.innerHTML = 'Added ✓';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart'; }, 1100);
    }

  } catch (e) {
    console.error('addToCart error', e);
    if (typeof showToast === 'function') showToast('Unable to add to cart', 'error');
  }
}

function showToastFallback(msg) {
  // fallback only if showToast not provided by store.js
  alert(msg);
}

function initCart() {
  const cartIcon = document.querySelector('.cart-icon');
  const cartPreview = document.getElementById('cartPreview');
  const closePreview = document.getElementById('closePreview');

  updateCartBadge();
  updateCartPreview();

  if (cartIcon) {
    cartIcon.onclick = (e) => {
      e.stopPropagation();
      if (cartPreview) cartPreview.classList.toggle('show');
    };
  }

  if (closePreview && cartPreview) {
    closePreview.onclick = () => cartPreview.classList.remove('show');
  }

  document.onclick = (e) => {
    if (cartPreview && !cartPreview.contains(e.target) && cartIcon && !cartIcon.contains(e.target)) {
      cartPreview.classList.remove('show');
    }
  };

  // Listen to cartUpdated events dispatched by store.js
  window.addEventListener('cartUpdated', () => {
    updateCartBadge();
    updateCartPreview();
  });
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  const count = (typeof getCartCount === 'function') ? getCartCount() : (getCart().reduce((s, it) => s + (it.quantity || it.qty || 0), 0));
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function updateCartPreview() {
  const itemsEl = document.getElementById('cartPreviewItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const cart = (typeof getCart === 'function') ? getCart() : JSON.parse(localStorage.getItem('graveyard_cart_v1') || '[]');

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i><p>Empty</p></div>';
    if (subtotalEl) subtotalEl.textContent = 'R0.00';
    return;
  }

  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-preview-item">
      <img src="${escapeHtml(item.image||'')}" alt="${escapeHtml(item.name||'')}">
      <div class="item-details">
        <h4>${escapeHtml(item.name||'')}</h4>
        <p>${escapeHtml(item.selectedColour||'')} ${item.measurement ? ' • ' + escapeHtml(item.measurement) : ''}</p>
        <p class="item-price">R${Number(item.price||0).toFixed(2)} × ${item.quantity || 1}</p>
      </div>
      <button class="remove-item" data-idx="${i}">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  // attach remove handlers (calls removeFromCart if available)
  itemsEl.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const idx = Number(ev.currentTarget.dataset.idx);
      if (typeof removeFromCart === 'function') removeFromCart(idx);
      else {
        // fallback
        const key = 'graveyard_cart_v1';
        let c = [];
        try { c = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { c = []; }
        c.splice(idx, 1);
        localStorage.setItem(key, JSON.stringify(c));
        if (typeof dispatchCartEvent === 'function') dispatchCartEvent();
        updateCartPreview();
      }
    });
  });

  if (subtotalEl) subtotalEl.textContent = (typeof getCartSubtotal === 'function') ? formatPrice(getCartSubtotal()) : `R${cart.reduce((s, it) => s + ((it.price||0)*(it.quantity||1)), 0).toFixed(2)}`;
}

function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.onclick = () => {
      menu.classList.toggle('active');
      toggle.classList.toggle('active');
    };
  }
}
