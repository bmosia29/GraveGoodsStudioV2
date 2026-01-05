// ========================================
// MOBILE MENU FUNCTIONALITY
// ========================================
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ========================================
// HERO SLIDESHOW
// ========================================
const slides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Change slide every 5 seconds
setInterval(nextSlide, 5000);

// ========================================
// SMOOTH SCROLL FOR NAVIGATION
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
// ========================================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Add stagger effect for grid items
            if (entry.target.classList.contains('fc-item') || 
                entry.target.classList.contains('service-card')) {
                const index = Array.from(entry.target.parentElement.children).indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.1}s`;
            }
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fc-item, .service-card').forEach(el => {
    observer.observe(el);
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.animation = 'fadeInUp 0.6s ease forwards';
});

// ========================================
// ABOUT SECTION - CARD SLIDER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Card Navigation System
    const cards = {
        mainCard: document.getElementById('mainCard'),
        infoCard1: document.getElementById('infoCard1'),
        infoCard2: document.getElementById('infoCard2'),
        infoCard3: document.getElementById('infoCard3')
    };

    let currentCard = 'mainCard';
    let isAnimating = false;

    // Info Button - Opens first info card
    const infoButton = document.getElementById('infoButton');
    if (infoButton) {
        infoButton.addEventListener('click', () => {
            navigateToCard('infoCard1', 'right');
        });
    }

    // Navigation buttons
    const navButtons = document.querySelectorAll('.card-nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetCard = this.getAttribute('data-target');
            const direction = this.classList.contains('prev-btn') ? 'left' : 'right';
            navigateToCard(targetCard, direction);
        });
    });

    function navigateToCard(targetId, direction) {
        if (isAnimating || currentCard === targetId) return;
        
        isAnimating = true;
        const currentCardEl = cards[currentCard];
        const targetCardEl = cards[targetId];

        // Slide out current card
        currentCardEl.classList.remove('active-card');
        currentCardEl.classList.add(direction === 'left' ? 'slide-out-right' : 'slide-out-left');

        // Slide in target card
        setTimeout(() => {
            targetCardEl.classList.add('active-card');
            
            setTimeout(() => {
                currentCardEl.classList.remove('slide-out-left', 'slide-out-right');
                currentCard = targetId;
                isAnimating = false;
            }, 500);
        }, 100);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;

        if (e.key === 'ArrowLeft' && currentCard !== 'mainCard') {
            const prevCards = { infoCard1: 'mainCard', infoCard2: 'infoCard1', infoCard3: 'infoCard2' };
            if (prevCards[currentCard]) {
                navigateToCard(prevCards[currentCard], 'left');
            }
        } else if (e.key === 'ArrowRight' && currentCard !== 'infoCard3') {
            const nextCards = { mainCard: 'infoCard1', infoCard1: 'infoCard2', infoCard2: 'infoCard3' };
            if (nextCards[currentCard]) {
                navigateToCard(nextCards[currentCard], 'right');
            }
        } else if (e.key === 'Escape' && currentCard !== 'mainCard') {
            navigateToCard('mainCard', 'left');
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    const cardColumn = document.querySelector('.card-column');
    if (cardColumn) {
        cardColumn.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        cardColumn.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (isAnimating) return;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentCard !== 'infoCard3') {
                // Swipe left - next card
                const nextCards = { mainCard: 'infoCard1', infoCard1: 'infoCard2', infoCard2: 'infoCard3' };
                if (nextCards[currentCard]) {
                    navigateToCard(nextCards[currentCard], 'right');
                }
            } else if (diff < 0 && currentCard !== 'mainCard') {
                // Swipe right - previous card
                const prevCards = { infoCard1: 'mainCard', infoCard2: 'infoCard1', infoCard3: 'infoCard2' };
                if (prevCards[currentCard]) {
                    navigateToCard(prevCards[currentCard], 'left');
                }
            }
        }
    }
    
    // Heading hover effects
    const headingLines = document.querySelectorAll('.heading-line');
    
    headingLines.forEach((line) => {
        line.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px)';
        });
        
        line.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Floating card parallax effect (only on main card)
    const cardColumnEl = document.querySelector('.card-column');
    
    if (cardColumnEl) {
        cardColumnEl.addEventListener('mousemove', function(e) {
            if (currentCard !== 'mainCard' || window.innerWidth <= 900) return;

            const mainCard = cards.mainCard;
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            const rotateX = deltaY * 5;
            const rotateY = deltaX * 5;
            
            if (mainCard.classList.contains('active-card')) {
                mainCard.style.transform = `rotate(3deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });
        
        cardColumnEl.addEventListener('mouseleave', function() {
            if (currentCard === 'mainCard' && window.innerWidth > 900) {
                const mainCard = cards.mainCard;
                if (mainCard.classList.contains('active-card')) {
                    mainCard.style.transform = 'rotate(3deg) rotateX(0) rotateY(0)';
                }
            }
        });
    }

    // Circle button interactions
    const circleButton = document.querySelector('.circle-button');
    
    if (circleButton) {
        // Ripple effect
        circleButton.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.width = '100%';
            ripple.style.height = '100%';
            ripple.style.top = '0';
            ripple.style.left = '0';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // Keyboard accessibility
        circleButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }

    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            from {
                transform: scale(0);
                opacity: 1;
            }
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// ========================================
// FEATURED COLLECTION - ENHANCED INTERACTIONS
// ========================================
document.querySelectorAll('.fc-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

// ========================================
// SERVICE CARDS - TILT EFFECT
// ========================================
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        if (window.innerWidth > 768) {
            this.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });
    
    card.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            this.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
        }
    });
});

// ========================================
// WINDOW RESIZE HANDLER
// ========================================
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        const floatingCard = document.querySelector('.floating-card');
        
        if (window.innerWidth <= 900 && floatingCard) {
            floatingCard.style.transform = 'rotate(0deg)';
        } else if (floatingCard) {
            floatingCard.style.transform = 'rotate(3deg)';
        }
    }, 250);
});

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (reducedMotion.matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}

// ========================================
// SCROLL PROGRESS INDICATOR (OPTIONAL)
// ========================================
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    // You can use this value to show a progress bar if desired
    // document.getElementById('progressBar').style.width = scrolled + '%';
});

// ========================================
// LAZY LOADING FOR IMAGES
// ========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// CART FUNCTIONALITY (BASIC)
// ========================================
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

function updateCart(increment = true) {
    cartCount = increment ? cartCount + 1 : Math.max(0, cartCount - 1);
    cartCountElement.textContent = cartCount;
    
    if (cartCount > 0) {
        cartCountElement.style.display = 'flex';
    } else {
        cartCountElement.style.display = 'none';
    }
}

// Add to cart buttons (when implemented)
document.querySelectorAll('.fc-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (!e.target.closest('.fc-btn')) {
            // Handle product click - could open modal or navigate to product page
            console.log('Product clicked:', this.querySelector('.fc-name').textContent);
        }
    });
});

// ========================================
// CONSOLE BRANDING (OPTIONAL)
// ========================================
console.log('%cGraveyard Studios', 'font-size: 24px; font-weight: bold; color: #000;');
console.log('%cPiercing & Accessories Studio', 'font-size: 14px; color: #666;');

// ========================================
// CONTACT FORM HANDLING
// ========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.contact-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Success message
            alert('Thank you for contacting us! We\'ll get back to you soon.');
            
            // Reset form
            contactForm.reset();
            
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Log form data (for development)
            console.log('Form submitted:', formData);
        }, 1500);
    });
    
    // Form field animations
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}

// Make featured products clickable
function makeProductsClickable() {
    const productCards = document.querySelectorAll('.fc-item');
    
    productCards.forEach((card, index) => {
        // Add click handler
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            // Map to product slugs
            const slugs = [
                'circular-horseshoe-barbell',
                'curved-banana-barbell',
                'nose-straight-stud',
                'segment-ring'
            ];
            window.location.href = `product-detail.html?id=${slugs[index]}`;
        });
    });
}

// Mobile menu
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

// Navbar scroll
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
 * home.js - Homepage functionality
 * Integrates with existing Graveyard Studios homepage
 */

document.addEventListener('DOMContentLoaded', () => {
    initCart();
    initSearch();
    initMobileMenu();
    initNavbarScroll();
    makeProductsClickable();
});

// Initialize search functionality
function initSearch() {
    const searchIcon = document.querySelector('.search-icon');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            searchModal.classList.add('active');
            searchInput.focus();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }
            
            try {
                const products = await loadProducts();
                const filtered = products.filter(p => 
                    (p.name && p.name.toLowerCase().includes(query)) ||
                    (p.description && p.description.toLowerCase().includes(query)) ||
                    (p.category && p.category.toLowerCase().includes(query))
                );
                
                searchResults.innerHTML = filtered.map(product => `
                    <div class="search-result-item" onclick="window.location.href='product-detail.html?id=${product.slug || product.id}'">
                        <strong>${product.name}</strong>
                        <div style="font-size: 0.9rem; color: #666;">R${product.price.toFixed(2)} - ${product.category}</div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Search error:', error);
            }
        });
    }
}

function closeSearch() {
    const searchModal = document.getElementById('searchModal');
    searchModal.classList.remove('active');
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

// Close search when clicking outside modal
document.addEventListener('click', (e) => {
    const searchModal = document.getElementById('searchModal');
    if (searchModal && !searchModal.contains(e.target) && !e.target.closest('.search-icon')) {
        closeSearch();
    }
});

// Initialize cart UI
function initCart() {
    updateCartBadge();
    updateCartPreview();
    
    // Cart icon click
    const cartIcon = document.querySelector('.cart-icon');
    const cartPreview = document.getElementById('cartPreview');
    const closePreview = document.getElementById('closePreview');
    
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            // Navigate to checkout page
            window.location.href = 'Checkout.html';
        });
    }
    
    if (closePreview) {
        closePreview.addEventListener('click', () => {
            cartPreview.classList.remove('show');
        });
    }
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (cartPreview && !cartPreview.contains(e.target) && !cartIcon.contains(e.target)) {
            cartPreview.classList.remove('show');
        }
    });
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
        updateCartBadge();
        updateCartPreview();
    });
}

// Update cart badge
function updateCartBadge() {
    const cartCount = document.querySelector('.cart-count');
    const count = getCartCount();
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Update cart preview
function updateCartPreview() {
    const cartPreviewItems = document.getElementById('cartPreviewItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cart = getCart();
    
    if (!cartPreviewItems) return;
    
    if (cart.length === 0) {
        cartPreviewItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        if (cartSubtotal) cartSubtotal.textContent = 'R0.00';
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
            <button class="remove-item" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(getCartSubtotal());
    }
    
    // Add remove listeners
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(parseInt(btn.dataset.index));
        });
    });
}

// Make featured products clickable
function makeProductsClickable() {
    const productCards = document.querySelectorAll('.fc-item');
    
    productCards.forEach((card, index) => {
        // Add click handler
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            // Map to product slugs
            const slugs = [
                'circular-horseshoe-barbell',
                'curved-banana-barbell',
                'nose-straight-stud',
                'segment-ring'
            ];
            window.location.href = `product-detail.html?id=${slugs[index]}`;
        });
    });
}

// Mobile menu
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

// Navbar scroll
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