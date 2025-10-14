// Replace the entire contents of your script.js file with this code.

// --- LAUNCH EVENT CONFIGURATION ---
    // IMPORTANT: Set the end date 30 days from your launch day.
    // Example: For a launch on July 27th, 2024, the end date is August 26th, 2024.
    // FORMAT: Year, Month (0-11), Day, Hour, Minute, Second
    const launchEndDate = new Date(2025, 10, 13, 23, 59, 59).getTime(); // August 26th, 2024
    // --- END OF CONFIGURATION ---


    // --- LAUNCH EVENT LOGIC ---
    const countdownElement = document.getElementById('countdown');

    function updateLaunchBanner() {
        if (countdownElement) {
            const now = new Date().getTime();
            const distance = launchEndDate - now;

            if (distance < 0) {
                countdownElement.innerHTML = "EVENT ENDED";
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdownElement.innerHTML = `${days}D ${hours}H ${minutes}M ${seconds}S`;
            }
        }
    }

    // Run the banner update immediately and then every second
    if (countdownElement) {
        updateLaunchBanner();
        setInterval(updateLaunchBanner, 1000);
    }

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

    // PASTE THIS RIGHT BEFORE YOUR "// --- Stripe Checkout ---" SECTION

    // --- NEW: Subscription Checkout ---
    const subscribeBtn = document.getElementById('subscribe-now-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', async () => {
            // This must match the product ID key in your server's config
            const productTitle = 'Co-Skip-Elite-Subscription'; 
            const program = 'Co-Skip-v2';

            const originalButtonText = subscribeBtn.textContent;
            subscribeBtn.disabled = true;
            subscribeBtn.textContent = 'Processing...';

            // Retrieve Reddit click_id if present in session storage
            const redditClickId = sessionStorage.getItem('rdt_cid') || null;

            try {
                const response = await fetch(`${serverURL}/common/create-subscription-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ redditClickId, program })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Server responded with an error');
                }

                const session = await response.json();
                window.location.href = session.url; // Redirect to Stripe

            } catch (error) {
                console.error('Error creating subscription checkout session:', error);
                alert('Could not initiate subscription checkout. Please try again or contact support.');
                subscribeBtn.disabled = false;
                subscribeBtn.textContent = originalButtonText;
            }
        });
    }


    // --- Stripe Checkout ---
    const stripe = Stripe('pk_live_51NyaJIErsDMwjHJbY7JHPMqfZvkSMv3kOIo775RlVkojW77iW7RYZTmJ6ueDEDTsW2b90AJW9IWLneW4goUJ6ZqI00Vsxy0vpz'); // Your LIVE key
    const serverURL = 'https://co-skip-server.onrender.com';
    // HIDE THE OLD ONE-TIME PURCHASE OPTIONS
    document.getElementById('old-pricing-options').style.display = 'none';
    const purchaseButtons = document.querySelectorAll('.purchase-btn');

    const clientProductPrices = {
        'Key-1Day': '20.00',
        'Key-7Day': '50.00',
        'Key-30Day': '150.00',
        'Key-1Year': '500.00',
        'Co-Skip-Elite-Subscription': '50.00'
    };

    purchaseButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const productCard = event.target.closest('.pricing-card');
            const productTitle = button.getAttribute('data-product');
            const program = button.getAttribute('data-program'); 
            const quantity = 1;

            if (!productTitle || !program) { // Also check for program now
                console.error('Product title or program not found on button.');
                alert('An error occurred. Could not identify the product version.');
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
                        redditClickId,
                        program: program
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