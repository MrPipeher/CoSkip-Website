// =================================================================
// CO-SKIP V3 - MASTER SCRIPT (LAUNCH READY)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- NEW MODULE: OS DETECTION & PLATFORM LOCK ---
    // This module runs first to prevent macOS users from being able to click purchase buttons.
    try {
        const isMacUser = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        if (isMacUser) {
            console.log('macOS detected. Disabling all purchase options.');

            // --- TARGETED ELEMENTS BASED ON YOUR HTML ---
            const subscribeBtn = document.getElementById('subscribe-now-btn');
            const purchaseButtons = document.querySelectorAll('.purchase-btn');
            const navCtaButton = document.querySelector('.nav-cta'); // Your "Become a Founder" button
            // --- END TARGETED ELEMENTS ---

            const allButtonsToDisable = [...purchaseButtons];
            if (subscribeBtn) allButtonsToDisable.push(subscribeBtn);
            if (navCtaButton) allButtonsToDisable.push(navCtaButton);

            // Loop through each button and disable it with a clear message
            allButtonsToDisable.forEach(button => {
                if (button) {
                    button.disabled = true;
                    button.style.pointerEvents = 'none';
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                    
                    // A smarter way to change the text without breaking layout too much
                    if (button.classList.contains('nav-cta') || button.id === 'subscribe-now-btn') {
                        button.textContent = 'macOS Not Supported';
                    } else {
                        // For smaller buttons like "Get X-Day Key"
                        button.textContent = 'Not Supported';
                    }

                    // Also disable the link behavior for the nav-cta button
                    if (button.tagName === 'A') {
                        button.href = 'javascript:void(0);';
                    }
                }
            });

            // Show a highly visible, dedicated warning banner if one exists
            const macWarningBanner = document.getElementById('mac-warning-banner');
            if (macWarningBanner) {
                macWarningBanner.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error during OS detection:', error);
    }

    // --- MODULE 1: ANALYTICS & TRACKING ---
    // Captures Reddit Click ID from the URL and stores it for the session.
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const redditClickId = urlParams.get('rdt_cid');
        if (redditClickId) {
            sessionStorage.setItem('rdt_cid', redditClickId);
            console.log('Reddit Click ID captured:', redditClickId);
        }
    } catch (error) {
        console.error('Error capturing Reddit Click ID:', error);
    }

    // --- MODULE 2: LAUNCH EVENT COUNTDOWN ---
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        // NOTE: Month is 0-11, so 10 is November.
        const launchEndDate = new Date(2025, 10, 13, 23, 59, 59).getTime();
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = launchEndDate - now;
            if (distance < 0) {
                countdownElement.innerHTML = "EVENT ENDED";
                clearInterval(countdownInterval);
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownElement.innerHTML = `${days}D ${hours}H ${minutes}M ${seconds}S`;
        };
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }

    // --- MODULE 3: MOBILE NAVIGATION ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksMenu = document.getElementById('nav-links-menu');
    if (mobileNavToggle && navLinksMenu) {
        mobileNavToggle.addEventListener('click', () => {
            const isOpened = navLinksMenu.classList.toggle('active');
            mobileNavToggle.setAttribute('aria-expanded', isOpened);
            document.body.classList.toggle('nav-open');
        });
    }

    // --- MODULE 4: TESTIMONIAL CAROUSEL (SWIPER.JS) ---
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    if (testimonialCarousel) {
        const swiper = new Swiper('.testimonial-carousel', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
    }

    // --- MODULE 5: FOUNDER'S PACT TABS ---
    const tabsContainer = document.querySelector('.tabs-container');
    if (tabsContainer) {
        const tabButtons = tabsContainer.querySelectorAll('.tab-button');
        const tabPanes = tabsContainer.querySelectorAll('.tab-pane');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabPanes.forEach(pane => {
                    pane.classList.toggle('active', pane.id === targetTabId);
                });
            });
        });
    }

    // --- MODULE 6: PRICING TOGGLE ---
    const pricingToggleSwitch = document.getElementById('pricing-toggle-switch');
    if (pricingToggleSwitch) {
        const subPlan = document.getElementById('subscription-plan');
        const paygPlans = document.getElementById('pay-as-you-go-plans');
        const toggleLabels = document.querySelectorAll('.toggle-label');
        const updatePricingView = () => {
            const isSubChecked = pricingToggleSwitch.checked;
            subPlan.classList.toggle('active', isSubChecked);
            paygPlans.classList.toggle('active', !isSubChecked);
            toggleLabels[1].classList.toggle('active', isSubChecked); // Monthly
            toggleLabels[0].classList.toggle('active', !isSubChecked); // PAYG
        };
        pricingToggleSwitch.addEventListener('change', updatePricingView);
        updatePricingView();
    }

    // --- MODULE 7: FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        questionButton.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- MODULE 8: STRIPE PAYMENT INTEGRATION ---
    const serverURL = 'https://co-skip-server.onrender.com';
    //const serverURL = 'http://localhost:5000';

    // Handle Subscription Checkout
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    subscribeButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const productTitle = button.getAttribute('data-product');
            if (!productTitle) {
                alert('An error occurred. Could not identify the subscription plan.');
                return;
            }
            
            const originalButtonText = button.textContent;
            button.disabled = true;
            button.textContent = 'Processing...';

            const redditClickId = sessionStorage.getItem('rdt_cid') || null;

            try {
                const response = await fetch(`${serverURL}/common/create-subscription-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productTitle, redditClickId }) // Send the specific product title
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Server responded with an error');
                }
                const session = await response.json();
                window.location.href = session.url;

            } catch (error) {
                console.error('Error creating subscription checkout session:', error);
                alert('Could not initiate subscription checkout. Please try again or contact support.');
                button.disabled = false;
                button.textContent = originalButtonText;
            }
        });
    });

    // Handle Pay-as-you-go Checkout (GLOBAL KEY VERSION)
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    purchaseButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const productTitle = button.getAttribute('data-product');
            if (!productTitle) {
                alert('An error occurred. Could not identify the product.');
                return;
            }
            
            // Logic to determine Version based on Product Title
            // Ensure this matches your exact product naming convention
            let program = 'Co-Skip-v2';
            if (productTitle.includes('Ghost') || productTitle.includes('Elite')) {
                 program = 'Co-Skip-v3'; 
            }

            // --- GET GLOBAL KEY ---
            const globalInput = document.getElementById('global-loyalty-key');
            let previousKey = null;

            if (globalInput && globalInput.value.trim() !== "") {
                previousKey = globalInput.value.trim();
            }
            // ---------------------

            const originalButtonText = button.textContent;
            button.disabled = true;
            button.textContent = 'Processing...';

            try {
                const redditClickId = sessionStorage.getItem('rdt_cid') || null;
                
                const response = await fetch(`${serverURL}/common/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        productTitle, 
                        quantity: 1, 
                        redditClickId, 
                        program, 
                        previousKey // Sending the global key
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Server error: ${response.status}`);
                }
                
                const session = await response.json();
                if (session && session.url) window.location.href = session.url;
                else throw new Error('Invalid checkout session data received.');

            } catch (error) {
                console.error('Checkout Error:', error);
                alert(`Checkout failed: ${error.message}`);
                button.disabled = false;
                button.textContent = originalButtonText;
            }
        });
    });

}); // END OF DOMContentLoaded