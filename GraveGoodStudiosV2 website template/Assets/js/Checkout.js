// ========================================
// CHECKOUT PAGE FUNCTIONALITY
// Graveyard Studios
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    const deliveryFee = 50.00;
    const vatRate = 0.15; // 15% VAT

    // ========================================
    // CALCULATE TOTALS
    // ========================================
    function calculateTotals() {
        let subtotal = 0;
        
        // Get all cart items
        const cartItems = document.querySelectorAll('.cart-item');
        
        cartItems.forEach(item => {
            const price = parseFloat(item.getAttribute('data-price'));
            const qtyInput = item.querySelector('.qty-input');
            const quantity = parseInt(qtyInput.value);
            const itemTotal = price * quantity;
            
            // Update individual item total
            const itemTotalEl = item.querySelector('.item-total');
            itemTotalEl.textContent = itemTotal.toFixed(2);
            
            // Add to subtotal
            subtotal += itemTotal;
        });
        
        // Calculate VAT and total
        const vat = subtotal * vatRate;
        const total = subtotal + deliveryFee + vat;
        
        // Update summary display
        document.getElementById('subtotalValue').textContent = subtotal.toFixed(2);
        document.getElementById('vatValue').textContent = vat.toFixed(2);
        document.getElementById('totalValue').textContent = total.toFixed(2);
    }

    // ========================================
    // QUANTITY CONTROLS
    // ========================================
    
    // Plus buttons
    const plusButtons = document.querySelectorAll('.qty-btn.plus');
    plusButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const input = document.querySelector(`.qty-input[data-id="${id}"]`);
            let value = parseInt(input.value);
            const max = parseInt(input.getAttribute('max'));
            
            if (value < max) {
                input.value = value + 1;
                calculateTotals();
                animateButton(this);
            }
        });
    });

    // Minus buttons
    const minusButtons = document.querySelectorAll('.qty-btn.minus');
    minusButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const input = document.querySelector(`.qty-input[data-id="${id}"]`);
            let value = parseInt(input.value);
            const min = parseInt(input.getAttribute('min'));
            
            if (value > min) {
                input.value = value - 1;
                calculateTotals();
                animateButton(this);
            }
        });
    });

    // Manual input change
    const qtyInputs = document.querySelectorAll('.qty-input');
    qtyInputs.forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            const min = parseInt(this.getAttribute('min'));
            const max = parseInt(this.getAttribute('max'));
            
            // Validate input
            if (isNaN(value) || value < min) {
                this.value = min;
            } else if (value > max) {
                this.value = max;
            }
            
            calculateTotals();
        });

        // Prevent non-numeric input
        input.addEventListener('keypress', function(e) {
            if (e.key < '0' || e.key > '9') {
                e.preventDefault();
            }
        });
    });

    // ========================================
    // REMOVE ITEM
    // ========================================
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = document.querySelector(`.cart-item[data-id="${id}"]`);
            
            // Animate removal
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.remove();
                calculateTotals();
                
                // Check if cart is empty
                const remainingItems = document.querySelectorAll('.cart-item');
                if (remainingItems.length === 0) {
                    showEmptyCart();
                }
            }, 300);
        });
    });

    // ========================================
    // EMPTY CART HANDLER
    // ========================================
    function showEmptyCart() {
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Your cart is empty</h3>
                <p style="color: #666; margin-bottom: 25px;">Add some items to get started!</p>
                <a href="Home.html" style="display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 50px; font-weight: 700; transition: all 0.3s ease;">
                    Continue Shopping
                </a>
            </div>
        `;
    }

    // ========================================
    // PAYMENT BUTTON HANDLERS
    // ========================================
    const checkoutBtn = document.getElementById('checkoutBtn');
    const applePayBtn = document.querySelector('.apple-pay');
    const googlePayBtn = document.querySelector('.google-pay');

    checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validate form
        const form = document.getElementById('customerForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            notes: document.getElementById('notes').value
        };
        
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        this.disabled = true;
        
        // Simulate payment processing
        setTimeout(() => {
            alert('Order placed successfully! 🎉\n\nThank you for your purchase.\n\nOrder details have been sent to ' + formData.email);
            
            // Log order data (for development)
            console.log('Order Data:', {
                customer: formData,
                items: getCartData(),
                totals: {
                    subtotal: document.getElementById('subtotalValue').textContent,
                    delivery: document.getElementById('deliveryFee').textContent,
                    vat: document.getElementById('vatValue').textContent,
                    total: document.getElementById('totalValue').textContent
                }
            });
            
            // Reset button
            this.innerHTML = originalText;
            this.disabled = false;
            
            // In a real app, redirect to confirmation page
            // window.location.href = 'order-confirmation.html';
        }, 2000);
    });

    applePayBtn.addEventListener('click', function() {
        alert('Apple Pay integration coming soon! 🍎\n\nPlease use the standard checkout for now.');
    });

    googlePayBtn.addEventListener('click', function() {
        alert('Google Pay integration coming soon! 📱\n\nPlease use the standard checkout for now.');
    });

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    function animateButton(btn) {
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 100);
    }

    function getCartData() {
        const cartItems = document.querySelectorAll('.cart-item');
        const items = [];
        
        cartItems.forEach(item => {
            items.push({
                id: item.getAttribute('data-id'),
                name: item.querySelector('.item-name').textContent,
                variation: item.querySelector('.item-variation').textContent,
                price: parseFloat(item.getAttribute('data-price')),
                quantity: parseInt(item.querySelector('.qty-input').value),
                total: parseFloat(item.querySelector('.item-total').textContent)
            });
        });
        
        return items;
    }

    // ========================================
    // FORM ENHANCEMENTS
    // ========================================
    
    // Auto-format phone number
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        
        // Format as +27 XX XXX XXXX
        if (value.startsWith('27')) {
            value = value.substring(2);
        } else if (value.startsWith('0')) {
            value = value.substring(1);
        }
        
        if (value.length > 0) {
            let formatted = '+27 ';
            if (value.length > 0) formatted += value.substring(0, 2);
            if (value.length > 2) formatted += ' ' + value.substring(2, 5);
            if (value.length > 5) formatted += ' ' + value.substring(5, 9);
            this.value = formatted.trim();
        }
    });

    // Form input animations
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('.cart-section, .customer-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });

    // ========================================
    // INITIALIZE
    // ========================================
    
    // Calculate initial totals
    calculateTotals();
    
    console.log('Checkout page loaded successfully!');
    console.log('Cart items:', getCartData().length);
});

// ========================================
// PREVENT ACCIDENTAL PAGE REFRESH
// ========================================
window.addEventListener('beforeunload', function(e) {
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});

