/**
 * HANZALA - Portfolio Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initial elements reveal is handled by scroll handler

  // ---- Custom Cursor ----
  const cursor = document.getElementById('cursor');
  
  if (cursor && window.innerWidth > 768) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    
    // Lerp speed (lower is more drag/larger gap)
    const speed = 0.2;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      
      requestAnimationFrame(animateCursor);
    };
    
    animateCursor();

    // Hover effect on interactive elements
    const hoverElements = document.querySelectorAll('a, button, .project-card, .service-card, input, textarea');
    
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
      });
    });
  }

  // ---- Services Accordion ----
  const accordionItems = document.querySelectorAll('.accordion-item');
  const serviceImages = document.querySelectorAll('.service-img');

  if (accordionItems.length > 0) {
    accordionItems.forEach(item => {
      const header = item.querySelector('.accordion-header');
      
      const openAccordion = () => {
        const isActive = item.classList.contains('active');
        const index = item.getAttribute('data-index');
        
        // If it's already open and we triggered this via hover, do nothing
        // If triggered via click and already open, let it close (handled below)
        
        // Close all items
        accordionItems.forEach(i => {
          i.classList.remove('active');
          const body = i.querySelector('.accordion-body');
          if (body) body.style.maxHeight = null;
        });
        
        // If it wasn't active, open it
        if (!isActive) {
          item.classList.add('active');
          const body = item.querySelector('.accordion-body');
          if (body) body.style.maxHeight = body.scrollHeight + "px";
        }
        
        // Image switching
        serviceImages.forEach(img => img.classList.remove('active'));
        const targetImage = document.querySelector(`.service-img[data-index="${index}"]`);
        if (targetImage) targetImage.classList.add('active');
      };

      // Open on hover (only for mouse to prevent mobile double-firing)
      item.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
          if (!item.classList.contains('active')) {
            openAccordion();
          }
        }
      });

      // Close when mouse leaves the item
      item.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') {
          if (item.classList.contains('active')) {
            item.classList.remove('active');
            const body = item.querySelector('.accordion-body');
            if (body) body.style.maxHeight = null;
          }
        }
      });

      // Toggle on click (mainly for mobile/touch)
      header.addEventListener('click', openAccordion);
    });
  }

  // ---- Number Counter Animation ----
  const animateNumbers = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
      const target = +stat.getAttribute('data-count');
      const duration = 2000; // 2 seconds
      const steps = 60; // 60 frames per second
      const stepValue = target / (duration / (1000 / steps));
      let current = 0;
      
      const updateNumber = setInterval(() => {
        current += stepValue;
        if (current >= target) {
          stat.innerText = target;
          clearInterval(updateNumber);
        } else {
          stat.innerText = Math.ceil(current);
        }
      }, 1000 / steps);
    });
  };

  // Only run number animation once stat section is in view
  let animated = false;
  const statSection = document.querySelector('.stats-stripe');

  // ---- Navigation ----
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMobileDrawer = document.getElementById('nav-mobile-drawer');
  const navMobileClose = document.getElementById('nav-mobile-close');
  const navCompact = document.getElementById('nav-compact');
  const navItems = document.querySelectorAll('.nav-link[data-nav], .nav-mobile-link[data-nav]');

  // Scroll direction tracking
  let lastScrollY = 0;
  let scrollDirection = 'up'; // 'up' or 'down'
  let ticking = false;
  const SCROLL_THRESHOLD = 50; // min scroll from top before direction matters
  const DIRECTION_DELTA = 5;   // min px delta to register as direction change

  // Mobile menu toggle
  if (navToggle && navMobileDrawer) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMobileDrawer.classList.toggle('open');
    });
  }

  // Mobile menu close button
  if (navMobileClose && navMobileDrawer) {
    navMobileClose.addEventListener('click', () => {
      if(navToggle) navToggle.classList.remove('active');
      navMobileDrawer.classList.remove('open');
    });
  }

  // Compact state click — scroll to contact section
  if (navCompact) {
    navCompact.addEventListener('click', () => {
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        // Adding +40 perfectly frames the title right beneath the floating pill
        const targetTop = contactSection.offsetTop + 40;
        smoothScrollTo(targetTop, 900);
      }
    });
  }

  // Active link switching on scroll
  const sections = document.querySelectorAll('section');
  
  const updateActiveLink = () => {
    let current = '';
    const scrollPos = window.scrollY;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= (sectionTop - sectionHeight / 3)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href').substring(1) === current) {
        item.classList.add('active');
      }
    });
  };

  // ---- Custom Spring Scroll Animation ----
  // Easing: custom bezier that mimics Framer Motion spring feel
  const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  let scrollAnimationId = null;

  const smoothScrollTo = (targetY, duration = 900) => {
    // Cancel any existing scroll animation
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    // Disable CSS scroll-behavior during JS animation
    document.documentElement.style.scrollBehavior = 'auto';

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        scrollAnimationId = requestAnimationFrame(step);
      } else {
        scrollAnimationId = null;
        // Re-enable CSS scroll-behavior after animation
        document.documentElement.style.scrollBehavior = '';
      }
    };

    scrollAnimationId = requestAnimationFrame(step);
  };

  // Smooth scroll and close menu on click
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('href');
      if(targetId.startsWith('#')) {
          e.preventDefault();
          const targetSection = document.querySelector(targetId);
          if (targetSection) {
            // Close mobile drawer
            if (navMobileDrawer && navMobileDrawer.classList.contains('open')) {
              navToggle.classList.remove('active');
              navMobileDrawer.classList.remove('open');
            }
            
            // Custom spring scroll to section
            const targetTop = targetSection.offsetTop - 80;
            smoothScrollTo(targetTop, 900);
          }
      }
    });
  });

  // ---- Intercept ALL anchor links for spring scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Skip nav items (already handled above) to avoid double binding
    if (anchor.hasAttribute('data-nav')) return;

    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId.length <= 1) return;

      e.preventDefault();
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const targetTop = targetEl.offsetTop - 80;
        smoothScrollTo(targetTop, 900);
      }
    });
  });

  // ---- Reveal Animations on Scroll ----
  // CACHE all DOM refs once — avoids re-querying on every scroll frame
  const allRevealEls = document.querySelectorAll('.reveal-up, .reveal-left');
  const cachedProcessSection = document.getElementById('process');
  const cachedTimelineContainer = document.querySelector('.nexus-timeline');
  const cachedTimelineLine = document.getElementById('nexus-timeline-line');
  const cachedSteps = document.querySelectorAll('.nexus-step');
  const cachedStepDots = document.querySelectorAll('.nexus-step-dot');
  const cachedProcessCtaWrap = document.getElementById('process-cta-wrap');
  const cachedStickyWords = document.querySelectorAll('.sticky-word');

  // Reveal elements when they scroll into view using IntersectionObserver
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute('data-delay') || 0;
        // Small stagger (50ms per step) so grouped elements cascade quickly
        el.style.transitionDelay = `${delay * 50}ms`;
        el.classList.add('revealed');
        // Stop observing once revealed
        revealObserver.unobserve(el);
        // Clean up transitionDelay after animation completes
        el.addEventListener('transitionend', () => {
          el.style.transitionDelay = '';
        }, { once: true });
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  allRevealEls.forEach(el => revealObserver.observe(el));

  const revealElements = () => {
    const windowHeight = window.innerHeight;
    const revealThreshold = 100;

    // Run stats animation if visible
    if (statSection && !animated) {
      const statTop = statSection.getBoundingClientRect().top;
      if (statTop < windowHeight - revealThreshold) {
        animateNumbers();
        animated = true;
      }
    }

    // Process Section Animation (Nexus Style)
    if (cachedTimelineContainer && cachedTimelineLine) {
        const containerRect = cachedTimelineContainer.getBoundingClientRect();
        const startTrigger = windowHeight * 0.5;
        let scrollProgress = 0;
        
        if (containerRect.top <= startTrigger) {
           const scrolled = startTrigger - containerRect.top;
           scrollProgress = (scrolled / containerRect.height) * 100;
           scrollProgress = Math.max(0, Math.min(100, scrollProgress));
           cachedTimelineLine.style.height = `${scrollProgress}%`;
        } else {
           cachedTimelineLine.style.height = '0%';
        }
        
        // Step Dots styling — scale up and fill when step crosses trigger
        cachedSteps.forEach((step, index) => {
            const stepRect = step.getBoundingClientRect();
            if (stepRect.top <= startTrigger + 20) {
                if (cachedStepDots[index]) cachedStepDots[index].classList.add('active');
            } else {
                if (cachedStepDots[index]) cachedStepDots[index].classList.remove('active');
            }
        });

        // Show CTA buttons when Week 5 (index 3) is reached
        if (cachedProcessCtaWrap) {
            const week5Step = cachedSteps[3];
            if (week5Step) {
                const stepRect = week5Step.getBoundingClientRect();
                if (stepRect.top <= startTrigger + 20) {
                    cachedProcessCtaWrap.classList.add('active');
                } else {
                    cachedProcessCtaWrap.classList.remove('active');
                }
            }
        }

        // Animate Words sequentially based on scroll progress
        if (cachedStickyWords.length) {
            // Scale so that all words light up by ~65-70% scroll progress (around Week 5)
            const finishProgress = 70;
            const wordStep = finishProgress / cachedStickyWords.length;
            cachedStickyWords.forEach((word, index) => {
                // Offset the trigger slightly so the first word isn't active at 0%
                const triggerPoint = (index + 0.25) * wordStep;
                if (scrollProgress > triggerPoint) {
                    word.classList.add('active');
                } else {
                    word.classList.remove('active');
                }
            });
        }
    }
  };

  // Combine core scroll bindings into a highly-performant singular rAF loop
  let navMorphTimeout = null;
  let currentNavState = 'expanded';
  let pendingNavState = null; // what the timeout is about to switch to

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        // Determine desired nav state
        let desiredState = currentNavState;

        if (currentScrollY <= SCROLL_THRESHOLD) {
          desiredState = 'expanded';
        } else if (delta > DIRECTION_DELTA) {
          desiredState = 'compact';
        } else if (delta < -DIRECTION_DELTA) {
          desiredState = 'expanded';
        }

        if (desiredState !== currentNavState) {
          if (currentScrollY <= SCROLL_THRESHOLD) {
            // At top: switch immediately
            if (navMorphTimeout) { clearTimeout(navMorphTimeout); navMorphTimeout = null; }
            pendingNavState = null;
            currentNavState = 'expanded';
            navbar.classList.remove('scrolled');
          } else if (pendingNavState !== desiredState) {
            // Only reset the timer if direction actually reversed
            if (navMorphTimeout) { clearTimeout(navMorphTimeout); navMorphTimeout = null; }
            pendingNavState = desiredState;
            navMorphTimeout = setTimeout(() => {
              currentNavState = desiredState;
              if (desiredState === 'compact') {
                navbar.classList.add('scrolled');
              } else {
                navbar.classList.remove('scrolled');
              }
              navMorphTimeout = null;
              pendingNavState = null;
            }, 50);
          }
          // else: timer is already pending for this state, let it fire
        }

        lastScrollY = currentScrollY;

        updateActiveLink();
        revealElements();
        
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Trigger initial reveal on load
  if (document.readyState === 'complete') {
    setTimeout(handleScroll, 100);
  } else {
    window.addEventListener('load', () => setTimeout(handleScroll, 100));
  }

  // ---- Testimonial Slider ----
  const testimonialTrack = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');

  if (testimonialTrack) {
    const originalCards = Array.from(testimonialTrack.children);
    const totalSlides = originalCards.length;

    // Clone first and last cards for seamless looping
    const firstClone = originalCards[0].cloneNode(true);
    const lastClone = originalCards[totalSlides - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    testimonialTrack.appendChild(firstClone);
    testimonialTrack.insertBefore(lastClone, originalCards[0]);

    // All cards including clones
    const allCards = Array.from(testimonialTrack.children);
    // currentIndex 0 = lastClone, 1 = first real, ... totalSlides = last real, totalSlides+1 = firstClone
    let currentIndex = 1; // start on first real slide
    let isTransitioning = false;

    const setPosition = (index, animate = true) => {
      if (animate) {
        testimonialTrack.style.transition = 'transform 0.5s ease';
      } else {
        testimonialTrack.style.transition = 'none';
      }
      testimonialTrack.style.transform = `translateX(-${index * 100}%)`;
      // Update active class on all cards
      allCards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
      });
    };

    // Initialize
    setPosition(currentIndex, false);

    testimonialTrack.addEventListener('transitionend', () => {
      isTransitioning = false;
      // If we landed on the first clone (after last real), snap to real first
      if (currentIndex === totalSlides + 1) {
        currentIndex = 1;
        setPosition(currentIndex, false);
      }
      // If we landed on the last clone (before first real), snap to real last
      if (currentIndex === 0) {
        currentIndex = totalSlides;
        setPosition(currentIndex, false);
      }
    });

    const nextSlide = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      setPosition(currentIndex);
    };

    const prevSlide = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex--;
      setPosition(currentIndex);
    };

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-slide every 3 seconds
    let slideInterval = setInterval(nextSlide, 3000);

    // Pause on hover
    const sliderWrapper = document.querySelector('.testimonial-slider-wrapper');
    if (sliderWrapper) {
      sliderWrapper.addEventListener('mouseenter', () => clearInterval(slideInterval));
      sliderWrapper.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, 3000);
      });
    }
  }

  // ---- Project Modal Logic ----
  // Define project data object mapped to index based on their view button id
  const projectData = {
    "1": {
        title: "Limelite",
        desc: "An e-commerce based website made in Shopify with a custom theme, designed to provide a premium shopping experience with stunning visuals and smooth animations.",
        category: "E-Commerce",
        services: "Web Dev, Shopify Customization",
        year: "2026",
        tags: ["Shopify", "Custom Theme", "E-Commerce"],
        image: "img/Limelite.jpeg"
    },
    "2": {
        title: "Daddy Zinger",
        desc: "I spearheaded the complete UI/UX design and frontend development for Daddy Zinger, a popular fast-food cafe in Bahawalpur. The website delivers a mouth-watering digital experience built for speed, responsive menus, and seamless Whatsapp ordering integration.",
        category: "Food & Beverage",
        services: "UI/UX, Full Development",
        year: "2024",
        tags: ["Web Dev", "UI/UX", "WhatsApp Integration"],
        image: "img/DaddyZinger.jpeg"
    },
    "3": {
        title: "Zyvora Digital",
        desc: "A complete website and UI/UX design for a Digital Marketing Agency. The site was built entirely on WordPress with a focus on high performance and clean aesthetics.",
        category: "Digital Agency",
        services: "UI/UX, WordPress",
        year: "2024",
        tags: ["WordPress", "UI/UX", "Marketing"],
        image: "img/Zyvora-Digital.jpeg"
    },
    "4": {
        title: "FitElite",
        desc: "A high-performance, modern landing page tailored for fitness professionals, designed to showcase training programs and drive client engagement. The website provides a platform for personalized workout plans, client tracking, and establishing a strong online fitness presence.",
        category: "Health & Fitness",
        services: "Full Web Development",
        year: "2024",
        tags: ["Web Dev", "Gym Trainer", "Fitness"],
        image: "img/FitElite.jpeg"
    },
    "5": {
        title: "HoverHomes",
        desc: "HoverHomes is a premium real estate listing platform showcasing luxury properties. Implemented highly optimized virtual tour integrations and structured data SEO features to ensure properties rank highly on search engines.",
        category: "Real Estate",
        services: "Web Dev, Technical SEO",
        year: "2024",
        tags: ["UI/UX", "SEO", "Mobile Friendly"],
        image: "img/Real-Estate.jpeg"
    },
    "6": {
        title: "HealthVibe",
        desc: "HealthVibe is a comprehensive health and wellness platform that connects users with medical professionals. It features a modern medical UI, seamless appointment booking, and personalized health tracking.",
        category: "Health & Wellness",
        services: "UI/UX, Full Development",
        year: "2024",
        tags: ["Web Dev", "UI/UX", "Healthcare"],
        image: "img/Medical.jpeg"
    }
  };

  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const viewBtns = document.querySelectorAll('.project-card');

  // Modal elements
  const mImg = document.getElementById('modal-img');
  const mTitle = document.getElementById('modal-title');
  const mDesc = document.getElementById('modal-desc');
  const mCat = document.getElementById('modal-category');
  const mServ = document.getElementById('modal-services');
  const mYear = document.getElementById('modal-year');
  const mTags = document.getElementById('modal-tags');

  const openModal = (id) => {
    const data = projectData[id];
    if(!data) return;

    // Populate data
    mImg.src = data.image;
    mImg.alt = data.title;
    mTitle.innerText = data.title;
    mDesc.innerText = data.desc;
    mCat.innerText = data.category;
    mServ.innerText = data.services;
    mYear.innerText = data.year;
    
    // Populate tags
    mTags.innerHTML = '';
    data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.innerText = tag;
        mTags.appendChild(span);
    });

    // Populate live link if exists
    const mLink = document.getElementById('modal-link');
    if (mLink) {
        if (data.link) {
            mLink.href = data.link;
            mLink.style.display = 'inline-flex';
        } else {
            mLink.style.display = 'none';
        }
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    modal.classList.remove('active');
    // Set timeout to wait for animation
    setTimeout(() => {
        document.body.style.overflow = '';
    }, 400); 
  };

  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent card click if we had it
        const id = btn.getAttribute('data-project');
        openModal(id);
    });
  });

  if (modalClose) {
      modalClose.addEventListener('click', closeModal);
  }

  // Close when clicking outside of modal content
  if(modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
      });
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
          closeModal();
      }
  });


  // ---- Contact Form Handling ----
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending...</span>';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      // Simulate form submission
      setTimeout(() => {
        submitBtn.innerHTML = '<span>Message Sent! ✓</span>';
        submitBtn.style.background = '#22c55e';
        submitBtn.style.opacity = '1';
        
        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }
  // ---- Day/Night Theme Toggle ----
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const root = document.documentElement;

  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  root.setAttribute('data-theme', savedTheme);
  if (themeLabel) {
    themeLabel.textContent = savedTheme === 'light' ? 'Light Mode' : 'Dark Mode';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Apply transition class globally before switching theme
      root.classList.add('theme-transitioning');
      
      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      if (themeLabel) {
        themeLabel.textContent = newTheme === 'light' ? 'Light Mode' : 'Dark Mode';
      }
      
      // Remove the transition class after the animation completes
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 300);
    });
  }

  // ========== FAB Toggle Logic ==========
  const fabToggle = document.getElementById('fab-toggle');
  const fabMenu = document.getElementById('fab-menu');
  const fabIconOpen = document.querySelector('.fab-icon-open');
  const fabIconClose = document.querySelector('.fab-icon-close');

  if (fabToggle && fabMenu) {
    fabToggle.addEventListener('click', () => {
      fabMenu.classList.toggle('active');
      
      if (fabMenu.classList.contains('active')) {
        fabIconOpen.style.display = 'none';
        fabIconClose.style.display = 'block';
      } else {
        fabIconOpen.style.display = 'block';
        fabIconClose.style.display = 'none';
      }
    });

    // Close FAB menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!fabToggle.contains(e.target) && !fabMenu.contains(e.target) && fabMenu.classList.contains('active')) {
        fabMenu.classList.remove('active');
        fabIconOpen.style.display = 'block';
        fabIconClose.style.display = 'none';
      }
    });
  }

});
