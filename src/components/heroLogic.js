console.log('[debug] heroLogic module loaded');

export class SoundManager {
  constructor() {
    this.sounds = {};
    this.isEnabled = false;
    this.init();
  }

  init() {
    // Use remote URLs directly from CodePen assets
    const remoteBase = 'https://assets.codepen.io/7558/';
    this.loadSound('hover', `${remoteBase}click-reverb-001.mp3`);
    this.loadSound('click', `${remoteBase}shutter-fx-001.mp3`);
    this.loadSound('textChange', `${remoteBase}whoosh-fx-001.mp3`);
  }

  loadSound(name, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    if (name === 'hover') {
      audio.volume = 0.15;
    } else {
      audio.volume = 0.3;
    }
    this.sounds[name] = audio;
  }

  enableAudio() {
    if (!this.isEnabled) {
      this.isEnabled = true;
      console.log('Audio enabled');
    }
  }

  play(soundName, delay = 0) {
    if (this.isEnabled && this.sounds[soundName]) {
      if (delay > 0) {
        setTimeout(() => {
          this.sounds[soundName].currentTime = 0;
          this.sounds[soundName].play().catch((e) => {
            console.log('Audio play failed:', e);
          });
        }, delay);
      } else {
        // Reset the audio to beginning and play immediately
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch((e) => {
          console.log('Audio play failed:', e);
        });
      }
    }
  }

  addSound(name, url, volume = 0.3) {
    this.loadSound(name, url);
    if (this.sounds[name]) this.sounds[name].volume = volume;
  }
}

export const soundManager = new SoundManager();

export async function initPage() {
  console.log('[debug] initPage called');
  // dynamic import GSAP and Lenis (robustly handle default vs named exports)
  const gsapModule = await import('gsap');
  console.log('[debug] gsap imported');
  const gsap = gsapModule.default || gsapModule.gsap || gsapModule;
  // import plugins
  const ScrollTriggerModule = await import('gsap/ScrollTrigger');
  console.log('[debug] ScrollTrigger imported');
  const ScrollTrigger = ScrollTriggerModule.default || ScrollTriggerModule.ScrollTrigger || ScrollTriggerModule;
  let CustomEaseModule;
  try {
    CustomEaseModule = await import('gsap/CustomEase');
    console.log('[debug] CustomEase imported');
  } catch (e) {
    CustomEaseModule = null;
    console.log('[debug] CustomEase not available');
  }
  const CustomEase = CustomEaseModule && (CustomEaseModule.default || CustomEaseModule.CustomEase || CustomEaseModule);
  if (CustomEase) {
    gsap.registerPlugin(CustomEase);
    try {
      CustomEase.create('customEase', 'M0,0 C0.86,0 0.07,1 1,1');
    } catch (e) {
      // ignore if already created
    }
  }

  gsap.registerPlugin(ScrollTrigger);
  console.log('[debug] gsap plugins registered');

  const LenisModule = await import('@studio-freight/lenis');
  console.log('[debug] Lenis imported');
  const Lenis = LenisModule.default || LenisModule;

  // Loading counter animation
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingCounter = document.getElementById('loading-counter');
  let counter = 0;
  // Animate counter from 00 to 100
  const counterInterval = setInterval(() => {
    counter += Math.random() * 3 + 1; // Random increment for realistic feel
    if (counter >= 100) {
      counter = 100;
      clearInterval(counterInterval);
      // When counter reaches 100, start fade out
      setTimeout(() => {
        // First animate the loading text out
        gsap.to(loadingOverlay.querySelector('.loading-counter'), {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power2.inOut'
        });
        gsap.to(loadingOverlay.childNodes[0], {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            // Then slide overlay up and out to reveal content
            gsap.to(loadingOverlay, {
              y: '-100%',
              duration: 1.2,
              ease: 'power3.inOut',
              delay: 0.3,
              onComplete: () => {
                loadingOverlay.style.display = 'none';
                // Start staggered animation for left and right columns
                animateColumns();
              }
            });
          }
        });
      }, 200); // Small delay after reaching 100
    }
    if (loadingCounter) loadingCounter.textContent = `[${counter.toFixed(0).padStart(2, '0')}]`;
  }, 30);

  // Lenis init
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  const duration = 0.64;
  const parallaxAmount = 5; // move declaration before any scroll-triggered handlers
  const debugInfo = document.getElementById('debug-info');
  const fixedContainer = document.getElementById('fixed-container');
  const fixedSectionElement = document.querySelector('.fixed-section');
  const header = document.querySelector('.header');
  const content = document.querySelector('.content');
  const footer = document.getElementById('footer');
  const leftColumn = document.getElementById('left-column');
  const rightColumn = document.getElementById('right-column');
  const featured = document.getElementById('featured');
  const backgrounds = document.querySelectorAll('.background-image');
  const artists = document.querySelectorAll('.artist');
  const categories = document.querySelectorAll('.category');
  const featuredContents = document.querySelectorAll('.featured-content');
  const progressFill = document.getElementById('progress-fill');
  const currentSectionDisplay = document.getElementById('current-section');


  // Split text into words for animation (manual SplitText replacement)
  const splitTexts = {};
  try {
    featuredContents.forEach((content, index) => {
      const h3 = content.querySelector('h3');
      if (h3) {
        const words = h3.textContent.trim().split(/\s+/);
        h3.textContent = '';
        const wordEls = [];
        words.forEach((w) => {
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          mask.style.display = 'inline-block';
          mask.style.overflow = 'hidden';
          const word = document.createElement('span');
          word.className = 'split-word';
          word.textContent = w + ' ';
          mask.appendChild(word);
          h3.appendChild(mask);
          wordEls.push(word);
        });
        splitTexts[`featured-${index}`] = wordEls;
        // Set initial state
        if (index !== 0) {
          gsap.set(wordEls, {
            yPercent: 100,
            opacity: 0
          });
        } else {
          gsap.set(wordEls, {
            yPercent: 0,
            opacity: 1
          });
        }
      }
    });
  } catch (error) {
    console.error('SplitText error:', error);
  }

  // Function to animate columns with stagger
  function animateColumns() {
    const artistItems = document.querySelectorAll('.artist');
    const categoryItems = document.querySelectorAll('.category');
    // Animate left column (artists) first
    artistItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 60);
    });
    // Animate right column (categories) with slight delay
    categoryItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 60 + 200); // 200ms delay after artists start
    });
  }

  // Function to update progress numbers
  function updateProgressNumbers() {
    if (currentSectionDisplay) {
      currentSectionDisplay.textContent = (currentSection + 1).toString().padStart(2, '0');
    }
  }

  // Calculate exact scroll positions for each section
  gsap.set(fixedContainer, {
    height: '100vh'
  });

  const fixedSectionTop = fixedSectionElement ? fixedSectionElement.offsetTop : 0;
  const fixedSectionHeight = fixedSectionElement ? fixedSectionElement.offsetHeight : window.innerHeight * 11;
  let currentSection = 0;
  let isAnimating = false;
  let isSnapping = false;
  let lastProgress = 0;
  let scrollDirection = 0;
  let sectionPositions = [];
  
  // Each section takes 10% of the total scroll distance
  for (let i = 0; i < 10; i++) {
    sectionPositions.push(fixedSectionTop + (fixedSectionHeight * i) / 10);
  }

  // cleanup: if the page will ever unmount, user can remove listener via window.removeEventListener('resize', onResize)

  function navigateToSection(index) {
    if (index === currentSection || isAnimating || isSnapping) return;
    soundManager.enableAudio();
    soundManager.play('click');
    isSnapping = true;
    const targetPosition = sectionPositions[index] ?? (sectionPositions[sectionPositions.length - 1]);
    changeSection(index);
    lenis.scrollTo(targetPosition, {
      duration: 0.8,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      lock: true,
      onComplete: () => {
        isSnapping = false;
      }
    });
  }

  function updateProgressNumbers() {
    if (currentSectionDisplay) currentSectionDisplay.textContent = (currentSection + 1).toString().padStart(2, '0');
  }

  const mainScrollTrigger = ScrollTrigger.create({
    trigger: '.fixed-section',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.fixed-container',
    pinSpacing: true,
    onUpdate: (self) => {
      if (isSnapping) return;
      const progress = self.progress;
      const progressDelta = progress - lastProgress;
      if (Math.abs(progressDelta) > 0.001) {
        scrollDirection = progressDelta > 0 ? 1 : -1;
      }
      const targetSection = Math.min(9, Math.floor(progress * 10));
      if (targetSection !== currentSection && !isAnimating) {
        const nextSection = currentSection + (targetSection > currentSection ? 1 : -1);
        snapToSection(nextSection);
      }
      lastProgress = progress;
      const sectionProgress = currentSection / 9;
      if (progressFill) progressFill.style.width = `${sectionProgress * 100}%`;
      if (debugInfo) debugInfo.textContent = `Section: ${currentSection}, Target: ${targetSection}, Progress: ${progress.toFixed(3)}, Direction: ${scrollDirection}`;
    }
  });

  function snapToSection(targetSection) {
    if (targetSection < 0 || targetSection > 9 || targetSection === currentSection || isAnimating) return;
    isSnapping = true;
    changeSection(targetSection);
    const targetPosition = sectionPositions[targetSection];
    lenis.scrollTo(targetPosition, {
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      lock: true,
      onComplete: () => {
        isSnapping = false;
      }
    });
  }

  function changeSection(newSection) {
    if (newSection === currentSection || isAnimating) return;
    isAnimating = true;
    const isScrollingDown = newSection > currentSection;
    const previousSection = currentSection;
    currentSection = newSection;

    // Update progress numbers
    updateProgressNumbers();

    // Update progress fill based on current section
    const sectionProgress = currentSection / 9;
    if (progressFill) progressFill.style.width = `${sectionProgress * 100}%`;

    if (debugInfo) debugInfo.textContent = `Changing to Section: ${newSection} (${isScrollingDown ? 'Down' : 'Up'})`;

    // Hide non-relevant featured contents
    featuredContents.forEach((content, i) => {
      if (i !== newSection && i !== previousSection) {
        content.classList.remove('active');
        gsap.set(content, {
          visibility: 'hidden',
          opacity: 0
        });
      }
    });

    // Animate previous featured words out (if any)
    if (previousSection !== null && previousSection !== undefined) {
      const prevWords = splitTexts[`featured-${previousSection}`] || [];
      if (prevWords && prevWords.length) {
        gsap.to(prevWords, {
          yPercent: isScrollingDown ? -100 : 100,
          opacity: 0,
          duration: duration * 0.6,
          stagger: isScrollingDown ? 0.03 : -0.03,
          ease: CustomEase ? 'customEase' : 'power2.out',
          onComplete: () => {
            if (featuredContents[previousSection]) {
              featuredContents[previousSection].classList.remove('active');
              gsap.set(featuredContents[previousSection], {
                visibility: 'hidden'
              });
            }
          }
        });
      }
    }

    // Reveal new words with stagger
    const newWords = splitTexts[`featured-${newSection}`] || [];
    if (newWords && newWords.length) {
      // Play text change sound with a 250ms delay to avoid overlapping with click sound
      soundManager.play('textChange', 250);

      featuredContents[newSection].classList.add('active');
      gsap.set(featuredContents[newSection], {
        visibility: 'visible',
        opacity: 1
      });
      gsap.set(newWords, {
        yPercent: isScrollingDown ? 100 : -100,
        opacity: 0
      });
      gsap.to(newWords, {
        yPercent: 0,
        opacity: 1,
        duration: duration,
        stagger: isScrollingDown ? 0.05 : -0.05,
        ease: CustomEase ? 'customEase' : 'power2.out'
      });
    }

    // Backgrounds: clip / opacity / parallax
    backgrounds.forEach((bg, i) => {
      bg.classList.remove('previous', 'active');
      if (i === newSection) {
        if (isScrollingDown) {
          gsap.set(bg, {
            opacity: 1,
            y: 0,
            clipPath: 'inset(100% 0 0 0)'
          });
          gsap.to(bg, {
            clipPath: 'inset(0% 0 0 0)',
            duration: duration,
            ease: CustomEase ? 'customEase' : 'power2.out'
          });
        } else {
          gsap.set(bg, {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0 0 100% 0)'
          });
          gsap.to(bg, {
            clipPath: 'inset(0 0 0% 0)',
            duration: duration,
            ease: CustomEase ? 'customEase' : 'power2.out'
          });
        }
        bg.classList.add('active');
      } else if (i === previousSection) {
        bg.classList.add('previous');
        gsap.to(bg, {
          y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`,
          duration: duration,
          ease: CustomEase ? 'customEase' : 'power2.out'
        });
        gsap.to(bg, {
          opacity: 0,
          delay: duration * 0.5,
          duration: duration * 0.5,
          ease: CustomEase ? 'customEase' : 'power2.out',
          onComplete: () => {
            bg.classList.remove('previous');
            gsap.set(bg, {
              y: 0
            });
            isAnimating = false;
          }
        });
      } else {
        gsap.to(bg, {
          opacity: 0,
          duration: duration * 0.3,
          ease: CustomEase ? 'customEase' : 'power2.out'
        });
      }
    });

    // Artists and categories states
    artists.forEach((artist, i) => {
      if (i === newSection) {
        artist.classList.add('active');
        gsap.to(artist, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        artist.classList.remove('active');
        gsap.to(artist, {
          opacity: 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    categories.forEach((category, i) => {
      if (i === newSection) {
        category.classList.add('active');
        gsap.to(category, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        category.classList.remove('active');
        gsap.to(category, {
          opacity: 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }

  // Add click and hover handlers for navigation
  artists.forEach((artist, index) => {
    artist.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToSection(index);
    });

    artist.addEventListener('mouseenter', () => {
      soundManager.enableAudio();
      soundManager.play('hover');
    });
  });

  categories.forEach((category, index) => {
    category.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToSection(index);
    });

    category.addEventListener('mouseenter', () => {
      soundManager.enableAudio();
      soundManager.play('hover');
    });
  });

  // Enable audio on any user interaction
  document.addEventListener('click', () => {
    soundManager.enableAudio();
  }, { once: true });

  const progressBarTrigger = ScrollTrigger.create({
    trigger: '.scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      // global progress
    }
  });

  ScrollTrigger.create({
    trigger: '.end-section',
    start: 'top center',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (self.progress > 0.1) {
        footer.classList.add('blur');
        leftColumn.classList.add('blur');
        rightColumn.classList.add('blur');
        featured.classList.add('blur');
      } else {
        footer.classList.remove('blur');
        leftColumn.classList.remove('blur');
        rightColumn.classList.remove('blur');
        featured.classList.remove('blur');
      }

      // Only start unpinning when we're actually in the end section
      if (self.progress > 0.1) {
        const newHeight = Math.max(0, 100 - ((self.progress - 0.1) / 0.9) * 100);
        gsap.to(fixedContainer, {
          height: `${newHeight}vh`,
          duration: 0.1,
          ease: 'power1.out'
        });
        const moveY = (-(self.progress - 0.1) / 0.9) * 200;
        gsap.to(header, {
          y: moveY * 1.5,
          duration: 0.1,
          ease: 'power1.out'
        });
        gsap.to(content, {
          y: `calc(${moveY}px + (-50%))`,
          duration: 0.1,
          ease: 'power1.out'
        });
        gsap.to(footer, {
          y: moveY * 0.5,
          duration: 0.1,
          ease: 'power1.out'
        });
      } else {
        // Reset positions when scrolling back up
        gsap.to(fixedContainer, {
          height: '100vh',
          duration: 0.1,
          ease: 'power1.out'
        });
        gsap.to(header, {
          y: 0,
          duration: 0.1,
          ease: 'power1.out'
        });
        gsap.to(content, {
          y: '-50%',
          duration: 0.1,
          ease: 'power1.out'
        });
        gsap.to(footer, {
          y: 0,
          duration: 0.1,
          ease: 'power1.out'
        });
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') {
      debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Initialize progress numbers
  updateProgressNumbers();

  if (debugInfo) debugInfo.textContent = 'Current Section: 0 (Initial)';
}

// Global access to sound manager for adding more sounds later
window.addSound = function (name, url, volume = 0.3) {
  soundManager.addSound(name, url, volume);
};