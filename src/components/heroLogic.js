export class SoundManager {
  constructor() {
    this.sounds = {};
    this.isEnabled = false;
    this.init();
  }

  init() {
    this.loadSound('hover', 'https://assets.codepen.io/7558/click-reverb-001.mp3');
    this.loadSound('click', 'https://assets.codepen.io/7558/shutter-fx-001.mp3');
    this.loadSound('textChange', 'https://assets.codepen.io/7558/whoosh-fx-001.mp3');
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
      // unlock audio on user gesture
      Object.values(this.sounds).forEach((a) => {
        a.play().catch(() => {
          a.pause();
          a.currentTime = 0;
        });
        a.pause();
        a.currentTime = 0;
      });
    }
  }

  play(soundName, delay = 0) {
    if (this.isEnabled && this.sounds[soundName]) {
      if (delay > 0) {
        setTimeout(() => {
          try {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
          } catch (e) {
            // ignore
          }
        }, delay);
      } else {
        try {
          this.sounds[soundName].currentTime = 0;
          this.sounds[soundName].play();
        } catch (e) {
          // ignore
        }
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
  // dynamic import GSAP and Lenis (robustly handle default vs named exports)
  const gsapModule = await import('gsap');
  const gsap = gsapModule.default || gsapModule.gsap || gsapModule;
  // import plugins
  const ScrollTriggerModule = await import('gsap/ScrollTrigger');
  const ScrollTrigger = ScrollTriggerModule.default || ScrollTriggerModule.ScrollTrigger || ScrollTriggerModule;
  let CustomEaseModule;
  try {
    CustomEaseModule = await import('gsap/CustomEase');
  } catch (e) {
    CustomEaseModule = null;
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

  const LenisModule = await import('@studio-freight/lenis');
  const Lenis = LenisModule.default || LenisModule;

  // small helper functions and initialization similar to CodePen
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingCounter = document.getElementById('loading-counter');
  let counter = 0;
  const counterInterval = setInterval(() => {
    counter += Math.random() * 3 + 1;
    if (counter >= 100) {
      counter = 100;
      clearInterval(counterInterval);
      setTimeout(() => {
        // fade out counter and overlay
        const counterEl = loadingOverlay.querySelector('.loading-counter');
        if (counterEl) {
          gsap.to(counterEl, { opacity: 0, y: -20, duration: 0.6, ease: 'power2.inOut' });
        }
        gsap.to(loadingOverlay, {
          opacity: 0,
          y: '-100%',
          duration: 1.2,
          ease: 'power3.inOut',
          delay: 0.3,
          onComplete: () => {
            loadingOverlay.style.display = 'none';
            animateColumns();
          }
        });
      }, 200);
    }
    if (loadingCounter) loadingCounter.textContent = `[${Math.floor(counter).toString().padStart(2, '0')}]`;
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

  // Lightweight SplitText replacement: split each featured h3 into word spans
  const splitTexts = {};
  featuredContents.forEach((content, index) => {
    const h3 = content.querySelector('h3');
    if (!h3) return;
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
    // set initial state for non-active
    if (index !== 0) {
      gsap.set(wordEls, { yPercent: 100, opacity: 0 });
    } else {
      gsap.set(wordEls, { yPercent: 0, opacity: 1 });
    }
  });

  // shorten initial loaded stagger for snappier appearance
  function animateColumns() {
    const artistItems = document.querySelectorAll('.artist');
    const categoryItems = document.querySelectorAll('.category');
    artistItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 45);
    });
    categoryItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 45 + 150);
    });
  }

  const fixedSectionTop = fixedSectionElement ? fixedSectionElement.offsetTop : 0;
  const fixedSectionHeight = fixedSectionElement ? fixedSectionElement.offsetHeight : window.innerHeight * 11; // fallback
  let currentSection = 0;
  let isAnimating = false;
  let isSnapping = false;
  let lastProgress = 0;
  let scrollDirection = 0;
  let sectionPositions = [];

  // compute section positions, used for snapping; call on init and on resize
  function computeSectionPositions() {
    const top = fixedSectionElement ? fixedSectionElement.offsetTop : 0;
    const height = fixedSectionElement ? fixedSectionElement.offsetHeight : window.innerHeight * 11;
    const size = Math.max(1, Math.round(height / 10));
    sectionPositions = [];
    for (let i = 0; i < 10; i++) {
      sectionPositions.push(Math.round(top + size * i));
    }
  }
  computeSectionPositions();

  // refresh positions on resize to avoid snapping errors
  function onResize() {
    computeSectionPositions();
    try {
      ScrollTrigger.refresh();
    } catch (e) {
      // ignore if not available yet
    }
    try {
      if (lenis && typeof lenis.resize === 'function') lenis.resize();
    } catch (e) {}
  }
  window.addEventListener('resize', onResize);

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

  // refined changeSection using a gsap timeline for coordinated animations
  function changeSection(newSection) {
    if (newSection === currentSection || isAnimating) return;
    isAnimating = true;
    const isScrollingDown = newSection > currentSection;
    const previousSection = currentSection;
    currentSection = newSection;
    updateProgressNumbers();
    const sectionProgress = currentSection / 9;
    if (progressFill) progressFill.style.width = `${sectionProgress * 100}%`;

    // prepare values
    const ease = CustomEase ? 'customEase' : 'power2.out';
    const t = gsap.timeline({ defaults: { ease } });

    // hide non-relevant featured contents immediately (keep new and prev)
    featuredContents.forEach((content, i) => {
      if (i !== newSection && i !== previousSection) {
        content.classList.remove('active');
        gsap.set(content, { visibility: 'hidden', opacity: 0 });
      }
    });

    // animate previous featured words out (if any)
    const prevWords = splitTexts[`featured-${previousSection}`] || [];
    if (prevWords.length) {
      t.to(prevWords, {
        yPercent: isScrollingDown ? -100 : 100,
        opacity: 0,
        duration: duration * 0.45,
        stagger: isScrollingDown ? 0.025 : -0.025
      }, 0);
      // hide previous content slightly after
      t.add(() => {
        if (featuredContents[previousSection]) {
          featuredContents[previousSection].classList.remove('active');
          gsap.set(featuredContents[previousSection], { visibility: 'hidden' });
        }
      }, duration * 0.45);
    }

    // reveal new words with stagger
    const newWords = splitTexts[`featured-${newSection}`] || [];
    if (newWords.length) {
      // ensure content is visible before anim
      if (featuredContents[newSection]) featuredContents[newSection].classList.add('active');
      gsap.set(newWords, { yPercent: isScrollingDown ? 100 : -100, opacity: 0 });
      t.to(newWords, {
        yPercent: 0,
        opacity: 1,
        duration: duration,
        stagger: isScrollingDown ? 0.045 : -0.045
      }, Math.max(0, 0.08));
    }

    // backgrounds: clip / opacity / parallax
    backgrounds.forEach((bg, i) => {
      // clear classes so timeline controls visuals
      gsap.killTweensOf(bg);
      if (i === newSection) {
        gsap.set(bg, { opacity: 1, y: 0 });
        const fromClip = isScrollingDown ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)';
        const toClip = 'inset(0% 0 0 0)';
        t.set(bg, { clipPath: fromClip }, 0);
        t.to(bg, { clipPath: toClip, duration }, 0.02);
        t.set(bg, { className: '+=active' }, 0);
      } else if (i === previousSection) {
        t.set(bg, { className: '+=previous' }, 0);
        t.to(bg, { y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`, duration: duration * 0.9 }, 0);
        t.to(bg, { opacity: 0, delay: duration * 0.35, duration: duration * 0.45 }, duration * 0.35);
        t.add(() => { bg.classList.remove('previous'); gsap.set(bg, { y: 0 }); }, duration * 0.9);
      } else {
        t.to(bg, { opacity: 0, duration: duration * 0.3 }, 0);
      }
    });

    // artists and categories states
    artists.forEach((artist, i) => {
      if (i === newSection) {
        t.to(artist, { opacity: 1, duration: 0.28 }, 0.02);
        t.add(() => artist.classList.add('active'), 0.02);
      } else {
        t.to(artist, { opacity: 0.3, duration: 0.28 }, 0.02);
        t.add(() => artist.classList.remove('active'), 0.02);
      }
    });

    categories.forEach((category, i) => {
      if (i === newSection) {
        t.to(category, { opacity: 1, duration: 0.28 }, 0.02);
        t.add(() => category.classList.add('active'), 0.02);
      } else {
        t.to(category, { opacity: 0.3, duration: 0.28 }, 0.02);
        t.add(() => category.classList.remove('active'), 0.02);
      }
    });

    // when timeline completes, ensure isAnimating cleared and debug
    t.eventCallback('onComplete', () => {
      isAnimating = false;
    });

    // play small click/text sound with slight sync
    soundManager.play('textChange', 200);
  }

  document.addEventListener('click', () => {
    soundManager.enableAudio();
  }, { once: true });

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

      if (self.progress > 0.1) {
        const newHeight = Math.max(0, 100 - (self.progress - 0.1) * 90);
        gsap.to(fixedContainer, { height: `${newHeight}vh`, duration: 0.1, ease: 'power1.out' });
        const moveY = (-(self.progress - 0.1) * 0.9) * 200;
        gsap.to(header, { y: moveY * 1.5, duration: 0.1, ease: 'power1.out' });
        gsap.to(content, { y: `calc(${moveY}px + (-50%))`, duration: 0.1, ease: 'power1.out' });
        gsap.to(footer, { y: moveY * 0.5, duration: 0.1, ease: 'power1.out' });
      } else {
        gsap.to(fixedContainer, { height: '100vh', duration: 0.1, ease: 'power1.out' });
        gsap.to(header, { y: 0, duration: 0.1, ease: 'power1.out' });
        gsap.to(content, { y: '-50%', duration: 0.1, ease: 'power1.out' });
        gsap.to(footer, { y: 0, duration: 0.1, ease: 'power1.out' });
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') {
      debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
    }
  });

  window.addSound = function (name, url, volume = 0.3) {
    soundManager.addSound(name, url, volume);
  };
}