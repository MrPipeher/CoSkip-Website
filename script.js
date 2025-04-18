document.addEventListener('DOMContentLoaded', () => {

    // --- Stripe Checkout ---
    const stripe = Stripe('pk_live_51NyaJIErsDMwjHJbY7JHPMqfZvkSMv3kOIo775RlVkojW77iW7RYZTmJ6ueDEDTsW2b90AJW9IWLneW4goUJ6ZqI00Vsxy0vpz'); // Your LIVE key
    const serverURL = 'https://server5000.acserver.org';
    const purchaseButtons = document.querySelectorAll('.purchase-btn');

    purchaseButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const productCard = event.target.closest('.pricing-card'); // Use pricing-card now
            const productTitle = button.getAttribute('data-product');
            const quantity = 1;

            // Basic check if productTitle exists
            if (!productTitle) {
                console.error('Product title not found on button.');
                alert('An error occurred. Could not identify the product.');
                return;
            }

            const originalButtonText = button.textContent; // Store original text
            button.disabled = true;
            button.textContent = 'Processing...';

            try {
                const response = await fetch(`${serverURL}/common/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productTitle, quantity })
                });

                if (!response.ok) {
                    // Try to get error message from server response if possible
                    let errorMsg = `Server error: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            errorMsg += ` - ${errorData.message}`;
                        }
                    } catch (e) { /* Ignore if response is not JSON */ }
                    throw new Error(errorMsg);
                }

                const session = await response.json();

                if (session && session.url) {
                    // Redirect to Stripe Checkout
                    window.location.href = session.url;
                } else if (session && session.id) {
                    // Alternative: Use Stripe.js redirectToCheckout (might be needed depending on server setup)
                    const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
                    if (error) {
                        throw new Error(`Stripe redirect error: ${error.message}`);
                    }
                }
                 else {
                    throw new Error('Invalid checkout session data received.');
                }

            } catch (error) {
                console.error('Checkout Error:', error);
                alert(`Checkout failed: ${error.message}. Please try again or contact support via Discord.`);
                button.disabled = false;
                button.textContent = originalButtonText; // Restore original text on error
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

    // --- Mobile Navigation Toggle ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksMenu = document.getElementById('nav-links-menu');
    const navLinksInMenu = navLinksMenu.querySelectorAll('a'); // Get all links within the menu

    if (mobileNavToggle && navLinksMenu) {
        mobileNavToggle.addEventListener('click', () => {
            const isOpened = navLinksMenu.classList.toggle('active');
            mobileNavToggle.setAttribute('aria-expanded', isOpened);
            document.body.classList.toggle('nav-open', isOpened); // Toggle body class
        });

        // Function to close the menu
        const closeMobileMenu = () => {
            navLinksMenu.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        };

        // Close menu when a link inside it is clicked (for anchor links)
        navLinksInMenu.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only close if it's an internal anchor link or the mobile CTA button
                const isInternalLink = link.getAttribute('href')?.startsWith('#');
                const isMobileCta = link.classList.contains('mobile-cta'); // Check if it's the mobile button

                if (isInternalLink || isMobileCta) {
                    closeMobileMenu();
                }
                // Let external links or non-anchor links behave normally
            });
        });

        // Optional: Close menu if user clicks outside of it (on the overlay)
        document.body.addEventListener('click', (e) => {
            // Check if the click is outside the menu AND outside the toggle button
            if (document.body.classList.contains('nav-open') &&
                !navLinksMenu.contains(e.target) &&
                !mobileNavToggle.contains(e.target))
             {
                closeMobileMenu();
            }
        });

         // Optional: Close menu on Escape key press
         document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
                closeMobileMenu();
            }
         });
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