/* ============================================
   ĐỒNG PHỤC Y TẾ QUỲNH CHÂU - Main JavaScript
   Interactions, Animations & Functionality
   ============================================ */

(function () {
    'use strict';

    /* ── Preloader ── */
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        window.addEventListener('load', function () {
            setTimeout(function () {
                preloader.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }, 800);
        });

        // Fallback: hide preloader after 3 seconds regardless
        setTimeout(function () {
            preloader.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }, 3000);
    }

    /* ── Header Scroll Effect ── */
    function initHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        var lastScrollY = 0;
        var ticking = false;

        function updateHeader() {
            var scrollY = window.scrollY;
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScrollY = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ── Mobile Navigation ── */
    function initMobileNav() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        // Create overlay
        var overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);

        function openMenu() {
            toggle.classList.add('active');
            menu.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('no-scroll');
        }

        function closeMenu() {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }

        toggle.addEventListener('click', function () {
            if (menu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        overlay.addEventListener('click', closeMenu);

        // Close on nav link click
        var navLinks = menu.querySelectorAll('.nav-link');
        navLinks.forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    }

    /* ── Active Navigation Link ── */
    function initActiveNav() {
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link');

        function updateActiveLink() {
            var scrollY = window.scrollY + 100;

            sections.forEach(function (section) {
                var sectionTop = section.offsetTop;
                var sectionHeight = section.offsetHeight;
                var sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(function (link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink, { passive: true });
    }

    /* ── Smooth Scroll ── */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;

                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    var headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
                    var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ── Counter Animation ── */
    function initCounters() {
        var counters = document.querySelectorAll('[data-target]');
        var observed = new Set();

        function animateCounter(counter) {
            var target = parseInt(counter.getAttribute('data-target'));
            var duration = 2000;
            var startTime = null;

            function easeOutQuart(t) {
                return 1 - Math.pow(1 - t, 4);
            }

            function updateCount(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var easedProgress = easeOutQuart(progress);
                var current = Math.floor(easedProgress * target);

                // Format number
                if (target >= 1000) {
                    counter.textContent = current.toLocaleString('vi-VN');
                } else {
                    counter.textContent = current;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.textContent = target.toLocaleString('vi-VN');
                }
            }

            requestAnimationFrame(updateCount);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !observed.has(entry.target)) {
                        observed.add(entry.target);
                        animateCounter(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(function (counter) {
                observer.observe(counter);
            });
        }
    }

    /* ── Product Filter ── */
    function initProductFilter() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var productCards = document.querySelectorAll('.product-card');

        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = this.getAttribute('data-filter');

                // Update active button
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                // Filter products with animation
                productCards.forEach(function (card) {
                    var category = card.getAttribute('data-category');

                    if (filter === 'all' || category === filter) {
                        card.classList.remove('hidden');
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(function () {
                            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(function () {
                            card.classList.add('hidden');
                        }, 300);
                    }
                });
            });
        });
    }

    /* ── Testimonial Slider ── */
    function initTestimonialSlider() {
        var track = document.querySelector('.testimonial-track');
        var cards = document.querySelectorAll('.testimonial-card');
        var prevBtn = document.querySelector('.testimonial-prev');
        var nextBtn = document.querySelector('.testimonial-next');
        var dotsContainer = document.getElementById('testimonialDots');

        if (!track || cards.length === 0) return;

        var currentIndex = 0;
        var totalSlides = cards.length;
        var autoPlayInterval;

        // Create dots
        for (var i = 0; i < totalSlides; i++) {
            var dot = document.createElement('button');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            dot.setAttribute('data-index', i);
            dotsContainer.appendChild(dot);
        }

        var dots = dotsContainer.querySelectorAll('.testimonial-dot');

        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            currentIndex = index;
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

            dots.forEach(function (d, i) {
                d.classList.toggle('active', i === currentIndex);
            });
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        if (nextBtn) nextBtn.addEventListener('click', function () {
            nextSlide();
            resetAutoPlay();
        });

        if (prevBtn) prevBtn.addEventListener('click', function () {
            prevSlide();
            resetAutoPlay();
        });

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                goToSlide(parseInt(this.getAttribute('data-index')));
                resetAutoPlay();
            });
        });

        // Auto play
        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        startAutoPlay();

        // Pause on hover
        var slider = document.getElementById('testimonialSlider');
        if (slider) {
            slider.addEventListener('mouseenter', function () {
                clearInterval(autoPlayInterval);
            });
            slider.addEventListener('mouseleave', startAutoPlay);
        }

        // Touch support
        var touchStartX = 0;
        var touchEndX = 0;

        track.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                resetAutoPlay();
            }
        }, { passive: true });
    }

    /* ── Scroll Animations ── */
    function initScrollAnimations() {
        var animatedElements = document.querySelectorAll(
            '.section-header, .product-card, .process-step, .gallery-item, ' +
            '.about-feature, .contact-card, .about-image-wrapper, .about-content-col, ' +
            '.contact-form-wrapper, .cta-content'
        );

        if (!('IntersectionObserver' in window)) {
            // Fallback: show all
            animatedElements.forEach(function (el) {
                el.classList.add('fade-in', 'visible');
            });
            return;
        }

        animatedElements.forEach(function (el) {
            el.classList.add('fade-in');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Add staggered delay for grid items
                    var parent = entry.target.parentElement;
                    if (parent) {
                        var siblings = parent.querySelectorAll('.fade-in');
                        var index = Array.prototype.indexOf.call(siblings, entry.target);
                        entry.target.style.transitionDelay = (index * 0.1) + 's';
                    }
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(function (el) {
            observer.observe(el);
        });

        // Process timeline animation
        var processTimeline = document.querySelector('.process-timeline');
        if (processTimeline) {
            var timelineObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        timelineObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            timelineObserver.observe(processTimeline);
        }
    }

    /* ── Back to Top ── */
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;

        window.addEventListener('scroll', function () {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ── Contact Form ── */
    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic validation
            var name = form.querySelector('#name');
            var phone = form.querySelector('#phone');
            var service = form.querySelector('#service');
            var isValid = true;

            [name, phone, service].forEach(function (field) {
                if (!field.value.trim()) {
                    field.style.borderColor = '#e74c3c';
                    isValid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            // Phone validation
            if (phone.value.trim()) {
                var phoneRegex = /^[0-9+\-\s()]{8,15}$/;
                if (!phoneRegex.test(phone.value.trim())) {
                    phone.style.borderColor = '#e74c3c';
                    isValid = false;
                }
            }

            if (!isValid) return;

            // Simulate form submission
            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            var isVietnamese = document.documentElement.lang === 'vi';
            submitBtn.innerHTML = '<span>' + (isVietnamese ? 'Đang gửi...' : 'Sending...') + '</span>';
            submitBtn.disabled = true;

            setTimeout(function () {
                var wrapper = form.parentElement;
                wrapper.innerHTML = '<div class="form-success">' +
                    '<div class="form-success-icon">' +
                    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
                    '</div>' +
                    '<h3>' + (isVietnamese ? 'Gửi thành công!' : 'Sent successfully!') + '</h3>' +
                    '<p>' + (isVietnamese ? 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ.' : 'Thank you for contacting us. We will respond within 24 hours.') + '</p>' +
                    '</div>';
            }, 1500);
        });

        // Remove error style on input
        form.querySelectorAll('input, select, textarea').forEach(function (field) {
            field.addEventListener('input', function () {
                this.style.borderColor = '';
            });
        });
    }

    /* ── Initialize Everything ── */
    function init() {
        initPreloader();
        initHeader();
        initMobileNav();
        initActiveNav();
        initSmoothScroll();
        initCounters();
        initProductFilter();
        initTestimonialSlider();
        initScrollAnimations();
        initBackToTop();
        initContactForm();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
