document.addEventListener('DOMContentLoaded', () => {
  // enhance Product page: add 'Add to cart' buttons to each product card and wire them
  const anchors = Array.from(document.querySelectorAll('a.product-link'));

  anchors.forEach(a => {
    // ensure anchor only wraps image/title: if anchor wraps full .product-card, we'll still add button outside
    const href = a.getAttribute('href') || '';
    const m = href.match(/[?&]id=([^&]+)/);
    if (!m) return;
    const id = decodeURIComponent(m[1]);

    // find the product-card container
    const card = a.closest('.product-card') || a.parentElement;
    if (!card) return;

    // avoid adding duplicate buttons
    if (card.querySelector('.pc-add-to-cart')) return;

    // get price text if available
    const priceEl = card.querySelector('.price') || card.querySelector('.fc-price');
    const priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g,'') : '0';

    const btn = document.createElement('button');
    btn.className = 'pc-add-to-cart';
    btn.dataset.id = id;
    btn.dataset.price = priceText;
    btn.textContent = 'Add to cart';

    // simple styling hook (can be styled in CSS)
    btn.style.marginTop = '8px';
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.background = '#000';
    btn.style.color = '#fff';
    btn.style.fontWeight = '700';

    card.appendChild(btn);

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // try to load product details from store
        let product = null;
        if (typeof getProductById === 'function') product = await getProductById(id);
        if (!product && typeof getProductBySlug === 'function') product = await getProductBySlug(id);

        const name = product?.name || card.querySelector('h3')?.innerText || id;
        const image = product?.images?.[0] || card.querySelector('img')?.src || 'Assets/images/image.jpeg';
        const price = Number(product?.price ?? parseFloat(priceText) || 0);

        const cartItem = {
          productId: product?.id || id,
          slug: product?.slug || id,
          name: name,
          price: price,
          currency: product?.currency || 'ZAR',
          selectedColour: (product?.colours && product.colours[0]) || '',
          measurement: (product?.measurements && product.measurements[0]) || '',
          quantity: 1,
          image: image
        };

        const success = (typeof addToCart === 'function') ? addToCart(cartItem) : false;
        if (success) {
          // notify other parts of app
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          if (typeof showToast === 'function') showToast(`${cartItem.name} added to cart`, 'success');
        } else {
          if (typeof showToast === 'function') showToast('Failed to add to cart', 'error');
        }
      } catch (err) {
        console.error('Add to cart error', err);
        if (typeof showToast === 'function') showToast('Error adding to cart', 'error');
      }
    });
  });

  // Ensure product clicks navigate: nothing to do if anchors already present
});
