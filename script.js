// Replace the entire contents of your script.js file with this code.

document.addEventListener('DOMContentLoaded', () => {

    // --- NEW: Reddit Click ID Capture ---
    // This code runs as soon as the page is ready.
    // It looks for 'rdt_cid' in the URL and stores it for the session.
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const redditClickId = urlParams.get('rdt_cid');
        if (redditClickId) {
            sessionStorage.setItem('rdt_cid', redditClickId);
            console.log('Reddit Click ID captured and stored:', redditClickId);
        }
    } catch (error) {
        console.error('Error capturing Reddit Click ID:', error);
    }
    // --- END NEW CODE ---


    // --- Stripe Checkout ---
    const stripe = Stripe('pk_live_51NyaJIErsDMwjHJbY7JHPMqfZvkSMv3kOIo775RlVkojW77iW7RYZTmJ6ueDEDTsW2b90AJW9IWLneW4goUJ6ZqI00Vsxy0vpz'); // Your LIVE key
    const serverURL = 'https://co-skip-server.onrender.com';
    const purchaseButtons = document.querySelectorAll('.purchase-btn');

    const clientProductPrices = {
        'Key-1Day': '20.00',
        'Key-7Day': '50.00',
        'Key-30Day': '150.00',
        'Key-1Year': '500.00'
    };

    purchaseButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const productCard = event.target.closest('.pricing-card');
            const productTitle = button.getAttribute('data-product');
            const quantity = 1;

            if (!productTitle) {
                console.error('Product title not found on button.');
                alert('An error occurred. Could not identify the product.');
                return;
            }

            const priceForPixel = clientProductPrices[productTitle] || '0.00';
            const currencyForPixel = 'USD';

            if (typeof rdt === 'function') {
                rdt('track', 'AddToCart', {
                    content_ids: [productTitle],
                    content_name: productTitle.replace(/-/g, ' '),
                    content_type: 'product',
                    value: priceForPixel,
                    currency: currencyForPixel,
                    num_items: quantity
                });
                console.log('Reddit AddToCart Fired:', { productTitle, priceForPixel });
            } else {
                console.warn('Reddit pixel (rdt) not found. AddToCart not fired.');
            }

            const originalButtonText = button.textContent;
            button.disabled = true;
            button.textContent = 'Processing...';

            try {
                // --- MODIFIED: Retrieve Click ID from sessionStorage ---
                const redditClickId = sessionStorage.getItem('rdt_cid') || null;

                const response = await fetch(`${serverURL}/common/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // --- MODIFIED: Send Click ID to your server ---
                    body: JSON.stringify({ 
                        productTitle, 
                        quantity,
                        redditClickId // This will be the stored click ID, or null if it doesn't exist
                    })
                });

                if (!response.ok) {
                    let errorMsg = `Server error: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            errorMsg += ` - ${errorData.message}`;
                        }
                    } catch (e) { /* Ignore */ }
                    throw new Error(errorMsg);
                }

                const session = await response.json();

                if (session && session.url) {
                    window.location.href = session.url;
                } else if (session && session.id) {
                    const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
                    if (error) {
                        throw new Error(`Stripe redirect error: ${error.message}`);
                    }
                } else {
                    throw new Error('Invalid checkout session data received.');
                }

            } catch (error) {
                console.error('Checkout Error:', error);
                alert(`Checkout failed: ${error.message}. Please try again or contact support via Discord.`);
                button.disabled = false;
                button.textContent = originalButtonText;
            }
        });
    });

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        questionButton.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    otherItem.querySelector('.faq-answer').style.padding = '0 1.5rem';
                }
            });

            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                answer.style.padding = '0 1.5rem';
            } else {
                item.classList.add('active');
                answer.style.padding = '0 1.5rem 1.5rem';
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- Mobile Navigation Toggle (Simplified) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksMenu = document.getElementById('nav-links-menu');

    if (mobileNavToggle && navLinksMenu) {
        const navLinksInMenu = navLinksMenu.querySelectorAll('a');

        mobileNavToggle.addEventListener('click', () => {
            const isOpened = navLinksMenu.classList.toggle('active');
            mobileNavToggle.setAttribute('aria-expanded', isOpened);
        });

        const closeMobileMenu = () => {
            navLinksMenu.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
        };

        navLinksInMenu.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
    } else {
        console.error("Mobile navigation elements not found!");
    }

    // --- Smooth Scrolling for Nav Links ---
    const navLinks = document.querySelectorAll('.navbar a[href^="#"], .hero-cta-buttons a[href^="#"], .step-btn[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    e.preventDefault();
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });

}); // End DOMContentLoaded