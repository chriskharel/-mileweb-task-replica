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
  // dynamic import GSAP and Lenis
  const [{ gsap }, { default: Lenis }] = await Promise.all([
    import('gsap'),
    import('@studio-freight/lenis')
  ]);
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);

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
            gsap.to(loadingOverlay, {
              y: '-100%',
              duration: 1.2,
              ease: 'power3.inOut',
              delay: 0.3,
              onComplete: () => {
                loadingOverlay.style.display = 'none';
                animateColumns();
              }
            });
          }
        });
      }, 200);
    }
    loadingCounter.textContent = `[${Math.floor(counter).toString().padStart(2, '0')}]`;
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

  function animateColumns() {
    const artistItems = document.querySelectorAll('.artist');
    const categoryItems = document.querySelectorAll('.category');
    artistItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 60);
    });
    categoryItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 60 + 200);
    });
  }

  function updateProgressNumbers() {
    currentSectionDisplay.textContent = (currentSection + 1).toString().padStart(2, '0');
  }

  const fixedSectionTop = fixedSectionElement.offsetTop;
  const fixedSectionHeight = fixedSectionElement.offsetHeight;
  let currentSection = 0;
  let isAnimating = false;
  let isSnapping = false;
  let lastProgress = 0;
  let scrollDirection = 0;
  let sectionPositions = [];
  for (let i = 0; i < 10; i++) {
    sectionPositions.push(fixedSectionTop + fixedSectionHeight * i);
  }

  function navigateToSection(index) {
    if (index === currentSection || isAnimating || isSnapping) return;
    soundManager.enableAudio();
    soundManager.play('click');
    isSnapping = true;
    const targetPosition = sectionPositions[index];
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

  document.addEventListener('click', () => {
    soundManager.enableAudio();
  }, { once: true });

  updateProgressNumbers();

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
      progressFill.style.width = `${sectionProgress * 100}%`;
      debugInfo.textContent = `Section: ${currentSection}, Target: ${targetSection}, Progress: ${progress.toFixed(3)}, Direction: ${scrollDirection}`;
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

  const parallaxAmount = 5;

  function changeSection(newSection) {
    if (newSection === currentSection || isAnimating) return;
    isAnimating = true;
    const isScrollingDown = newSection > currentSection;
    const previousSection = currentSection;
    currentSection = newSection;
    updateProgressNumbers();
    const sectionProgress = currentSection / 9;
    progressFill.style.width = `${sectionProgress * 100}%`;

    featuredContents.forEach((content, i) => {
      if (i !== newSection && i !== previousSection) {
        content.classList.remove('active');
        gsap.set(content, { visibility: 'hidden', opacity: 0 });
      }
    });

    if (previousSection !== null) {
      const prevWords = null; // simplified - not using SplitText here
      if (prevWords) {
        gsap.to(prevWords, {
          yPercent: isScrollingDown ? -100 : 100,
          opacity: 0,
          duration: duration * 0.6,
          stagger: isScrollingDown ? 0.03 : -0.03,
          ease: 'power2.out',
          onComplete: () => {
            featuredContents[previousSection].classList.remove('active');
            gsap.set(featuredContents[previousSection], { visibility: 'hidden' });
          }
        });
      }
    }

    // reveal new section content
    if (featuredContents[newSection]) {
      soundManager.play('textChange', 250);
      featuredContents[newSection].classList.add('active');
      gsap.set(featuredContents[newSection], { visibility: 'visible', opacity: 1 });
      gsap.fromTo(
        featuredContents[newSection],
        { yPercent: isScrollingDown ? 100 : -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration, ease: 'power2.out' }
      );
    }

    backgrounds.forEach((bg, i) => {
      bg.classList.remove('previous', 'active');
      if (i === newSection) {
        if (isScrollingDown) {
          gsap.set(bg, { opacity: 1, y: 0, clipPath: 'inset(100% 0 0 0)' });
          gsap.to(bg, { clipPath: 'inset(0% 0 0 0)', duration, ease: 'power2.out' });
        } else {
          gsap.set(bg, { opacity: 1, y: 0, clipPath: 'inset(0 0 100% 0)' });
          gsap.to(bg, { clipPath: 'inset(0 0 0% 0)', duration, ease: 'power2.out' });
        }
        bg.classList.add('active');
      } else if (i === previousSection) {
        bg.classList.add('previous');
        gsap.to(bg, { y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`, duration, ease: 'power2.out' });
        gsap.to(bg, { opacity: 0, delay: duration * 0.5, duration: duration * 0.5, ease: 'power2.out', onComplete: () => { bg.classList.remove('previous'); gsap.set(bg, { y: 0 }); isAnimating = false; } });
      } else {
        gsap.to(bg, { opacity: 0, duration: duration * 0.3, ease: 'power2.out' });
      }
    });

    artists.forEach((artist, i) => {
      if (i === newSection) {
        artist.classList.add('active');
        gsap.to(artist, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      } else {
        artist.classList.remove('active');
        gsap.to(artist, { opacity: 0.3, duration: 0.3, ease: 'power2.out' });
      }
    });

    categories.forEach((category, i) => {
      if (i === newSection) {
        category.classList.add('active');
        gsap.to(category, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      } else {
        category.classList.remove('active');
        gsap.to(category, { opacity: 0.3, duration: 0.3, ease: 'power2.out' });
      }
    });
  }

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