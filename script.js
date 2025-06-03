document.addEventListener('DOMContentLoaded', () => {

    // --- Stripe Checkout ---
    const stripe = Stripe('pk_live_51NyaJIErsDMwjHJbY7JHPMqfZvkSMv3kOIo775RlVkojW77iW7RYZTmJ6ueDEDTsW2b90AJW9IWLneW4goUJ6ZqI00Vsxy0vpz'); // Your LIVE key
    const serverURL = 'https://co-skip-server.onrender.com';
    const purchaseButtons = document.querySelectorAll('.purchase-btn');

    // Define product prices client-side for the pixel (mirroring server-side)
    // This is for the 'value' in AddToCart. Ensure it's a string.
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
            const quantity = 1; // This is for the Reddit pixel num_items

            if (!productTitle) {
                console.error('Product title not found on button.');
                alert('An error occurred. Could not identify the product.');
                return;
            }

            // --- NEW: Reddit Pixel AddToCart Event ---
            const priceForPixel = clientProductPrices[productTitle] || '0.00'; // Get price for the current product
            const currencyForPixel = 'USD'; // Assuming USD

            if (typeof rdt === 'function') { // Check if Reddit pixel function exists
                rdt('track', 'AddToCart', {
                    content_ids: [productTitle],      // Array of product SKUs/IDs
                    content_name: productTitle.replace(/-/g, ' '), // e.g., "Key 1Day" for readability
                    content_type: 'product',          // Or 'product_group'
                    value: priceForPixel,             // String: Price of the item(s) being added
                    currency: currencyForPixel,       // String: Currency code
                    num_items: quantity               // Number: How many of this item
                });
                console.log('Reddit AddToCart Fired:', { productTitle, priceForPixel });
            } else {
                console.warn('Reddit pixel (rdt) not found. AddToCart not fired.');
            }
            // --- END NEW: Reddit Pixel AddToCart Event ---


            const originalButtonText = button.textContent;
            button.disabled = true;
            button.textContent = 'Processing...';

            try {
                const response = await fetch(`${serverURL}/common/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productTitle, quantity }) // quantity here is for Stripe
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

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    otherItem.querySelector('.faq-answer').style.padding = '0 1.5rem'; // Reset padding
                }
            });

            // Toggle the clicked item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                answer.style.padding = '0 1.5rem'; // Reset padding
            } else {
                item.classList.add('active');
                answer.style.padding = '0 1.5rem 1.5rem'; // Add padding before calculating height
                answer.style.maxHeight = answer.scrollHeight + 'px'; // Set max-height based on content
            }
        });
    });

    // --- Mobile Navigation Toggle (Simplified) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksMenu = document.getElementById('nav-links-menu');

    if (mobileNavToggle && navLinksMenu) {
        const navLinksInMenu = navLinksMenu.querySelectorAll('a'); // Get all links/buttons

        // Toggle Menu Visibility
        mobileNavToggle.addEventListener('click', () => {
            const isOpened = navLinksMenu.classList.toggle('active');
            mobileNavToggle.setAttribute('aria-expanded', isOpened);
        });

        // Function to close the menu (Simplified)
        const closeMobileMenu = () => {
            navLinksMenu.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
        };

        // Close menu when a link inside it is clicked
        navLinksInMenu.forEach(link => {
            link.addEventListener('click', (e) => {
                // Close the menu regardless of link type for simplicity now
                // We assume the separate smooth scroll handler will manage scrolling
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
            // Ensure it's an internal link before preventing default
            if (href && href.startsWith('#') && href.length > 1) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    e.preventDefault(); // Prevent default only if target exists
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20; // Adjust offset (20px extra space)

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Optional: Close mobile nav if open after click
                    // Add mobile nav closing logic here if you implement it
                }
            }
        });
    });


}); // End DOMContentLoaded