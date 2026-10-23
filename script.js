/**
 * ====================================================================
 * 💖 POTATO'S 19TH BIRTHDAY - APPLICATION LOGIC (VANILLA JS) 🌸✨
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. STATE & STORAGE MANAGEMENT
  let state = {
    currentSection: 'home',
    soundEnabled: true,
    isPlayingMusic: false,
    theme: localStorage.getItem('potato_theme') || 'light',
    favouriteColorMode: localStorage.getItem('potato_favourite_color') === 'true',
    mascotTapCount: 0,
    flippedReasons: new Set(),
    candlesExtinguished: 0,
    isMicListening: false,
    audioContext: null,
    analyser: null,
    micStream: null,
    giftOpened: false,
    typewriterTimeout: null,
    typewriterIndex: 0,
    charIndex: 0,
    isDeleting: false
  };

  // Load custom overrides from localStorage if user tweaked them in settings
  let config = window.BIRTHDAY_CONFIG || {};
  const savedConfig = localStorage.getItem('potato_custom_config');
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      config = { ...config, ...parsed };
    } catch (e) {
      console.warn('Error parsing saved config:', e);
    }
  }

  // Set theme on body
  document.documentElement.setAttribute('data-theme', state.theme);

  // Apply saved favourite color mode if active
  if (state.favouriteColorMode) {
    document.documentElement.classList.add('neon-blue-mode');
  }

  // ------------------------------------------------------------------
  // 2. DOM ELEMENT REFERENCES
  // ------------------------------------------------------------------
  const openingGate = document.getElementById('opening-gate');
  const btnOpenGate = document.getElementById('btn-open-gate');
  const bgVideo = document.getElementById('bg-video');
  const bgAudio = document.getElementById('bg-audio');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const btnFloatingMusicToggle = document.getElementById('btn-floating-music-toggle');
  const floatingMusicBar = document.getElementById('floating-music-bar');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnSettingsToggle = document.getElementById('btn-settings-toggle');
  const customizerDrawer = document.getElementById('customizer-drawer');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const btnSaveCustom = document.getElementById('btn-save-custom');

  // Favourite Color Buttons
  const btnFavouriteColor = document.getElementById('btn-favourite-color');
  const btnNavFavouriteColor = document.getElementById('btn-nav-favourite-color');
  const favouriteBtnLabel = document.getElementById('favourite-btn-label');

  const bottomNavBtns = document.querySelectorAll('.bottom-nav-btn');
  const viewSections = document.querySelectorAll('.view-section');

  const floatingEmojisContainer = document.getElementById('floating-emojis-container');
  const typewriterText = document.getElementById('typewriter-text');

  // Mascot Companion
  const mascotCompanion = document.getElementById('mascot-companion');
  const mascotSpeechBubble = document.getElementById('mascot-speech-bubble');
  const easterEggModal = document.getElementById('easter-egg-modal');
  const btnCloseEaster = document.getElementById('btn-close-easter');

  // ------------------------------------------------------------------
  // 3. SOUND SYNTHESIS & AUDIO SYSTEM
  // ------------------------------------------------------------------
  let webAudioCtx = null;

  function initWebAudio() {
    if (!webAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) webAudioCtx = new AudioCtx();
    }
    if (webAudioCtx && webAudioCtx.state === 'suspended') {
      webAudioCtx.resume();
    }
  }

  // All other sounds removed - only Meena Bazaar background music is kept
  function playSound() {
    // Intentionally empty: all other sound effects deleted per user request
  }

  // ------------------------------------------------------------------
  // Background Music Controller (Meena Bazaar: 0:50 to 2:59)
  // ------------------------------------------------------------------
  const MUSIC_SKIP_SECONDS = 50;  // 0:50 start
  const MUSIC_END_SECONDS = 179;  // 2:59 cutoff (2*60 + 59)
  let musicFadeInterval = null;

  function applyMusicSkipOffset() {
    if (bgAudio) {
      if (bgAudio.currentTime < MUSIC_SKIP_SECONDS || bgAudio.currentTime >= MUSIC_END_SECONDS) {
        try {
          bgAudio.currentTime = MUSIC_SKIP_SECONDS;
        } catch (err) {
          // Handled once metadata is ready
        }
      }
    }
  }

  if (bgAudio) {
    // Pre-seek as soon as audio metadata loads
    bgAudio.addEventListener('loadedmetadata', applyMusicSkipOffset);
    bgAudio.addEventListener('canplay', () => {
      if (bgAudio.currentTime < MUSIC_SKIP_SECONDS || bgAudio.currentTime >= MUSIC_END_SECONDS) {
        applyMusicSkipOffset();
      }
    });

    // When the track ends natively, loop back to 0:50
    bgAudio.addEventListener('ended', () => {
      try {
        bgAudio.currentTime = MUSIC_SKIP_SECONDS;
      } catch (e) {}
      bgAudio.play().catch(() => {});
    });

    bgAudio.addEventListener('timeupdate', () => {
      if (state.isPlayingMusic) {
        // Enforce 2:59 limit: once it hits 2:59 (179s), loop back to 50s seamlessly!
        if (bgAudio.currentTime >= MUSIC_END_SECONDS) {
          try {
            bgAudio.currentTime = MUSIC_SKIP_SECONDS;
          } catch (e) {}
        } else if (bgAudio.currentTime < 48) {
          // If audio restarted below 50s, jump forward to 50s
          try {
            bgAudio.currentTime = MUSIC_SKIP_SECONDS;
          } catch (e) {}
        }
      }
    });
  }

  function startMusic() {
    initWebAudio();
    if (!bgAudio) return;

    if (!bgAudio.src && config.media?.bgMusic) {
      bgAudio.src = config.media.bgMusic;
    }

    if (musicFadeInterval) {
      clearInterval(musicFadeInterval);
      musicFadeInterval = null;
    }

    applyMusicSkipOffset();

    bgAudio.volume = 0.85;
    const playPromise = bgAudio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          applyMusicSkipOffset();
          state.isPlayingMusic = true;
          updateMusicUI();
        })
        .catch(err => {
          console.warn('Audio play waiting for user interaction:', err);
        });
    } else {
      state.isPlayingMusic = true;
      updateMusicUI();
    }
  }

  function stopMusic() {
    if (musicFadeInterval) {
      clearInterval(musicFadeInterval);
      musicFadeInterval = null;
    }
    if (bgAudio) {
      bgAudio.pause();
    }
    state.isPlayingMusic = false;
    updateMusicUI();
  }

  function playMusic() {
    if (!bgAudio) return;
    initWebAudio();

    if (!bgAudio.src && config.media?.bgMusic) {
      bgAudio.src = config.media.bgMusic;
    }

    applyMusicSkipOffset();
    bgAudio.volume = 0.85;
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          applyMusicSkipOffset();
          state.isPlayingMusic = true;
          updateMusicUI();
        })
        .catch(err => {
          console.warn('Audio play error:', err);
        });
    } else {
      applyMusicSkipOffset();
      state.isPlayingMusic = true;
      updateMusicUI();
    }
  }

  function toggleMusic() {
    if (state.isPlayingMusic) {
      stopMusic();
    } else {
      playMusic();
    }
  }

  function updateMusicUI() {
    // 1. Top Navbar Music Button
    if (btnMusicToggle) {
      const label = btnMusicToggle.querySelector('.music-btn-label');
      if (state.isPlayingMusic) {
        btnMusicToggle.classList.add('music-playing');
        btnMusicToggle.classList.remove('music-stopped');
        btnMusicToggle.title = 'Stop Background Music ⏹️';
        if (label) label.textContent = 'Stop Music';
      } else {
        btnMusicToggle.classList.remove('music-playing');
        btnMusicToggle.classList.add('music-stopped');
        btnMusicToggle.title = 'Play Background Music ▶️';
        if (label) label.textContent = 'Play Music';
      }
    }

    // 2. Floating Quick-Action Music Widget
    const floatingBar = document.getElementById('floating-music-bar');
    const floatingStatus = document.getElementById('floating-music-status-text');
    const floatingBtnText = document.getElementById('floating-music-btn-text');
    const floatingBtnIcon = document.getElementById('floating-music-btn-icon');
    const floatingToggleBtn = document.getElementById('btn-floating-music-toggle');

    if (floatingBar) {
      if (state.isPlayingMusic) {
        floatingBar.classList.add('is-playing');
        floatingBar.classList.remove('is-stopped');
        if (floatingStatus) floatingStatus.textContent = 'Playing';
        if (floatingBtnText) floatingBtnText.textContent = 'Stop Music';
        if (floatingBtnIcon) floatingBtnIcon.textContent = '⏹️';
        if (floatingToggleBtn) {
          floatingToggleBtn.title = 'Stop Music ⏹️';
          floatingToggleBtn.setAttribute('aria-label', 'Stop Background Music');
        }
      } else {
        floatingBar.classList.remove('is-playing');
        floatingBar.classList.add('is-stopped');
        if (floatingStatus) floatingStatus.textContent = 'Paused';
        if (floatingBtnText) floatingBtnText.textContent = 'Play Music';
        if (floatingBtnIcon) floatingBtnIcon.textContent = '▶️';
        if (floatingToggleBtn) {
          floatingToggleBtn.title = 'Play Music ▶️';
          floatingToggleBtn.setAttribute('aria-label', 'Play Background Music');
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // 3A. MUSIC TOGGLE CONTROLLERS (Top Nav & Floating Bar)
  // ------------------------------------------------------------------
  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  const btnFmbDisc = document.getElementById('btn-fmb-disc');
  const btnFmbCollapse = document.getElementById('btn-fmb-collapse');

  if (btnFloatingMusicToggle) {
    btnFloatingMusicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Tapping the circular vinyl disc toggles expand / collapse
  if (btnFmbDisc) {
    btnFmbDisc.addEventListener('click', (e) => {
      e.stopPropagation();
      if (floatingMusicBar) {
        floatingMusicBar.classList.toggle('is-collapsed');
      }
    });
  }

  // Tapping the collapse arrow button collapses the bar
  if (btnFmbCollapse) {
    btnFmbCollapse.addEventListener('click', (e) => {
      e.stopPropagation();
      if (floatingMusicBar) {
        floatingMusicBar.classList.add('is-collapsed');
      }
    });
  }

  // Clicking anywhere outside the expanded floating bar collapses it
  document.addEventListener('click', (e) => {
    if (floatingMusicBar && !floatingMusicBar.classList.contains('is-collapsed')) {
      if (!floatingMusicBar.contains(e.target)) {
        floatingMusicBar.classList.add('is-collapsed');
      }
    }
  });

  // Initial Music UI state update
  updateMusicUI();

  // If user refreshed inside a step and music is paused, start on first interaction (except on Step 3)
  const unlockAudioOnGesture = () => {
    if (!state.isPlayingMusic && state.currentSection !== 'step-3' && !document.body.classList.contains('gate-active')) {
      playMusic();
    }
  };
  document.addEventListener('pointerdown', unlockAudioOnGesture, { once: true });

  // ------------------------------------------------------------------
  // 3B. FAVOURITE COLOR GLOW TOGGLE (Neon Blue Multi-Shade Mode)
  // ------------------------------------------------------------------
  function updateFavouriteColorUI() {
    if (state.favouriteColorMode) {
      document.documentElement.classList.add('neon-blue-mode');
      if (favouriteBtnLabel) {
        favouriteBtnLabel.textContent = "Glowing like u! ✨ (Tap to restore)";
      }
      if (btnFavouriteColor) btnFavouriteColor.classList.add('is-active');
      if (btnNavFavouriteColor) btnNavFavouriteColor.classList.add('is-active');
    } else {
      document.documentElement.classList.remove('neon-blue-mode');
      if (favouriteBtnLabel) {
        favouriteBtnLabel.textContent = "Make it glow like u ✨";
      }
      if (btnFavouriteColor) btnFavouriteColor.classList.remove('is-active');
      if (btnNavFavouriteColor) btnNavFavouriteColor.classList.remove('is-active');
    }
  }

  function toggleFavouriteColor() {
    state.favouriteColorMode = !state.favouriteColorMode;
    localStorage.setItem('potato_favourite_color', state.favouriteColorMode);
    updateFavouriteColorUI();

    if (state.favouriteColorMode) {
      fireConfetti({
        particleCount: 70,
        spread: 80,
        colors: ['#00e5ff', '#38bdf8', '#60a5fa', '#93c5fd', '#ffffff']
      });
      showToast("✨ Switched to your favourite glowing neon blue!");
    } else {
      showToast("🌸 Switched back to warm pastel text!");
    }
  }

  if (btnFavouriteColor) {
    btnFavouriteColor.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavouriteColor();
    });
  }

  if (btnNavFavouriteColor) {
    btnNavFavouriteColor.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavouriteColor();
    });
  }

  // Initialize favourite color UI on load
  updateFavouriteColorUI();

  // ------------------------------------------------------------------
  // 3C. THEME & SETTINGS CONTROLLERS
  // ------------------------------------------------------------------
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('potato_theme', state.theme);
      btnThemeToggle.innerText = state.theme === 'dark' ? '☀️' : '🌙';
    });
    btnThemeToggle.innerText = state.theme === 'dark' ? '☀️' : '🌙';
  }

  if (btnSettingsToggle && customizerDrawer) {
    btnSettingsToggle.addEventListener('click', () => {
      customizerDrawer.classList.toggle('active');
    });
  }

  if (btnCloseDrawer && customizerDrawer) {
    btnCloseDrawer.addEventListener('click', () => {
      customizerDrawer.classList.remove('active');
    });
  }

  // ------------------------------------------------------------------
  // 4. CONFETTI BURST ENGINE (CANVAS-CONFETTI + NATIVE FALLBACK)
  // ------------------------------------------------------------------
  function fireConfetti(options = {}) {
    if (window.confetti) {
      window.confetti({
        particleCount: options.particleCount || 60,
        spread: options.spread || 70,
        origin: options.origin || { y: 0.65 },
        colors: options.colors || ['#ffb6c1', '#fef08a', '#d8b4e2', '#f472b6', '#fed7aa']
      });
    } else {
      // Native DOM particle burst fallback
      createDOMConfetti(options.particleCount || 40);
    }
  }

  function createDOMConfetti(count) {
    const emojis = ['💖', '💛', '🎈', '✨', '🌸', '🎉'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'tap-particle';
      p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = `${60 + Math.random() * 30}vh`;
      p.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  }

  // ------------------------------------------------------------------
  // 5. FLOATING BACKGROUND EMOJIS (Drifting Upward)
  // ------------------------------------------------------------------
  function spawnFloatingEmoji() {
    if (document.hidden) return;
    const emojis = ['💖', '💛', '🎈', '✨', '🌸', '🧋'];
    const el = document.createElement('span');
    el.className = 'floating-emoji';
    el.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    // Randomize position, size, duration
    const leftPos = Math.random() * 95;
    const size = 1.2 + Math.random() * 1.6;
    const duration = 9 + Math.random() * 9;
    const delay = Math.random() * 1.5;

    el.style.left = `${leftPos}%`;
    el.style.fontSize = `${size}rem`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;

    floatingEmojisContainer.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, (duration + delay + 1) * 1000);
  }

  // Seed initial floating emojis & loop
  for (let i = 0; i < 8; i++) spawnFloatingEmoji();
  setInterval(spawnFloatingEmoji, 1800);

  // Tap anywhere to make hearts or potato emojis pop up
  document.addEventListener('pointerdown', (e) => {
    // Avoid spawning directly on buttons to keep clean clicks
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
      return;
    }

    const emojis = ['💕', '💛', '💖', '✨', '🌸'];
    const p = document.createElement('div');
    p.className = 'tap-particle';
    p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = `${e.clientX}px`;
    p.style.top = `${e.clientY}px`;
    document.body.appendChild(p);

    playSound('pop');
    if (navigator.vibrate) navigator.vibrate(15);

    setTimeout(() => p.remove(), 1100);
  });

  // ------------------------------------------------------------------
  // 6. OPENING GATE INTERACTION
  // ------------------------------------------------------------------
  if (btnOpenGate) {
    btnOpenGate.addEventListener('click', () => {
      playSound('chime');
      startMusic();

      // Confetti celebration
      fireConfetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });

      // Animate gate open
      openingGate.classList.add('gate-opened');
      document.body.classList.remove('gate-active');
      document.documentElement.classList.remove('gate-active');
      setTimeout(() => {
        openingGate.style.display = 'none';
        startTypewriter();
      }, 850);
    });
  }

  // ------------------------------------------------------------------
  // 7. TYPEWRITER EFFECT (HOME HERO)
  // ------------------------------------------------------------------
  function startTypewriter() {
    const lines = config.home?.typewriterLines || [
      "Looks like my favourite star has completed another revolution around the sun✨!!",
      "happy birthday my lovely potato 💖💛"
    ];

    function type() {
      const currentString = lines[state.typewriterIndex];

      if (state.isDeleting) {
        state.charIndex--;
        typewriterText.innerText = currentString.substring(0, state.charIndex);
      } else {
        state.charIndex++;
        typewriterText.innerText = currentString.substring(0, state.charIndex);
      }

      let speed = state.isDeleting ? 45 : 90;

      if (!state.isDeleting && state.charIndex === currentString.length) {
        speed = 2200; // Pause at end of line
        state.isDeleting = true;
      } else if (state.isDeleting && state.charIndex === 0) {
        state.isDeleting = false;
        state.typewriterIndex = (state.typewriterIndex + 1) % lines.length;
        speed = 500;
      }

      state.typewriterTimeout = setTimeout(type, speed);
    }

    type();
  }

  // ------------------------------------------------------------------
  // 8. LIVE BIRTHDAY COUNTER ("Days since you blessed this world")
  // ------------------------------------------------------------------
  function updateLiveCounter() {
    const birthDateStr = config.recipient?.birthDate || "2007-10-21T00:00:00";
    const birthTime = new Date(birthDateStr).getTime();
    const now = new Date().getTime();

    const diff = Math.max(0, now - birthTime);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const elDays = document.getElementById('cnt-days');
    const elHours = document.getElementById('cnt-hours');
    const elMins = document.getElementById('cnt-mins');
    const elSecs = document.getElementById('cnt-secs');

    if (elDays) elDays.innerText = days.toLocaleString();
    if (elHours) elHours.innerText = String(hours).padStart(2, '0');
    if (elMins) elMins.innerText = String(minutes).padStart(2, '0');
    if (elSecs) elSecs.innerText = String(seconds).padStart(2, '0');
  }

  updateLiveCounter();
  setInterval(updateLiveCounter, 1000);

  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // 9. STEP-BY-STEP JOURNEY CONTROLLER (Steps 1 to 9)
  // ------------------------------------------------------------------
  let step1NoClicks = 0;
  let currentPolaroidIndex = 0;
  let activeTraitAudio = null;
  let activeTraitBtn = null;
  let step4NoClicks = 0;
  let favAudioElement = document.getElementById('fav-audio-element');
  let traitAudioElement = document.getElementById('trait-audio-element');
  let traitAudioCtx = null;
  let traitGainNode = null;
  let traitCompressor = null;
  let traitHighPass = null;
  let traitLowPass = null;
  let traitMidFilter = null;
  let traitSourceNode = null;
  let isFavAudioPlaying = false;
  let wasMusicPlayingBeforeFav = false;
  let wasMusicPlayingBeforeStep3 = false;

  function navigateToSection(targetId) {
    if (!targetId) return;

    const previousSection = state.currentSection;

    // Confetti on big moments / navigation
    if (targetId.startsWith('step-')) {
      fireConfetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }

    // Automatically resume/play background music when moving from Step 3 to the next page
    if (previousSection === 'step-3' && targetId !== 'step-3') {
      if (!state.isPlayingMusic) {
        playMusic();
      }
      wasMusicPlayingBeforeStep3 = false;
    }

    state.currentSection = targetId;

    // Hide all view-sections first
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(targetId) || document.getElementById(`section-${targetId}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Scroll to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Step-specific initializations
    if (targetId === 'step-2') {
      renderPolaroids();
    } else if (targetId === 'step-3') {
      // On Step 3: background music stops so she can listen to voice notes
      if (state.isPlayingMusic) {
        wasMusicPlayingBeforeStep3 = true;
        stopMusic();
      }
      renderTraitsList();
    } else if (targetId === 'step-5') {
      startFavAudio();
    } else if (targetId === 'step-6') {
      renderPersonalMessage();
    } else if (targetId === 'step-7') {
      resetRunawayButton();
    } else if (targetId === 'step-8') {
      resetMysteryBoxes();
    }
  }

  // Bind all .btn-next-step buttons
  document.addEventListener('click', (e) => {
    const nextBtn = e.target.closest('.btn-next-step');
    if (nextBtn) {
      const nextTarget = nextBtn.getAttribute('data-next');
      if (nextTarget) {
        // Stop any playing trait or fav audio before moving
        stopAllStepAudios();
        navigateToSection(nextTarget);
      }
    }
  });

  // Dock home button
  const dockBtnHome = document.getElementById('dock-btn-home');
  if (dockBtnHome) {
    dockBtnHome.addEventListener('click', () => {
      stopAllStepAudios();
      navigateToSection('home');
    });
  }

  function stopAllStepAudios() {
    if (traitAudioElement) {
      traitAudioElement.pause();
    }
    if (activeTraitAudio) {
      activeTraitAudio.pause();
      if (activeTraitBtn) {
        activeTraitBtn.innerHTML = '<span>🔊</span>';
        activeTraitBtn.classList.remove('is-playing');
      }
      activeTraitAudio = null;
      activeTraitBtn = null;
    }
    if (favAudioElement) {
      favAudioElement.pause();
      isFavAudioPlaying = false;
      const vinyl = document.getElementById('spinning-disc-vinyl');
      if (vinyl) vinyl.classList.remove('is-spinning');
      const icon = document.getElementById('fav-play-icon');
      const text = document.getElementById('fav-play-text');
      if (icon) icon.innerText = '▶';
      if (text) text.innerText = 'Play Voice Note';
      if (wasMusicPlayingBeforeFav) {
        wasMusicPlayingBeforeFav = false;
        playMusic();
      }
    }
  }

  // ------------------------------------------------------------------
  // STEP 1: Special Question & Yes/No Tease
  // ------------------------------------------------------------------
  const btnStep1Yes = document.getElementById('btn-step1-yes');
  const btnStep1No = document.getElementById('btn-step1-no');
  const step1Feedback = document.getElementById('step1-feedback');
  const step1ButtonsContainer = document.getElementById('step1-buttons-container');

  if (btnStep1No) {
    btnStep1No.addEventListener('click', () => {
      step1NoClicks++;
      const noReplies = config.journey?.step1?.noReplies || [
        "Sorry, even if you don't want to know, I still want to tell you 🥹",
        "Tumhe ek baar mein samajh nahi aata? Click YES 😤",
        "Haha, ab pakdo mujhe 😜"
      ];

      if (step1NoClicks === 1) {
        step1Feedback.innerText = noReplies[0];
      } else if (step1NoClicks === 2) {
        step1Feedback.innerText = noReplies[1];
      } else {
        step1Feedback.innerText = noReplies[2];
        // Swap button positions on every 3rd and subsequent click
        if (step1ButtonsContainer) {
          step1ButtonsContainer.style.flexDirection = 
            step1ButtonsContainer.style.flexDirection === 'row-reverse' ? 'row' : 'row-reverse';
        }
      }
      if (navigator.vibrate) navigator.vibrate(25);
    });
  }

  if (btnStep1Yes) {
    btnStep1Yes.addEventListener('click', () => {
      step1Feedback.innerText = config.journey?.step1?.yesReply || "Oh, so you're interested in knowing… okay, I'll tell you 😌";
      fireConfetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      btnStep1Yes.disabled = true;
      btnStep1No.disabled = true;

      setTimeout(() => {
        navigateToSection('step-2');
      }, 2000);
    });
  }

  // ------------------------------------------------------------------
  // STEP 2: Polaroid Photo Cards (6 tilted cards with slide-away)
  // ------------------------------------------------------------------
  function renderPolaroids() {
    const deck = document.getElementById('polaroid-deck');
    const counterText = document.getElementById('polaroid-counter-text');
    if (!deck) return;

    deck.innerHTML = '';
    currentPolaroidIndex = 0;
    const cards = config.journey?.step2?.cards || [];

    if (counterText) {
      counterText.innerText = `Tap the photo for the next one (1 of ${cards.length})`;
    }

    const tilts = [-3, 3, -2, 2.5, -3.5, 1.5];

    // Card 0 must be on TOP of the deck (highest z-index), Card 5 at the bottom
    cards.forEach((cardData, index) => {
      const tilt = tilts[index % tilts.length];
      const cardEl = document.createElement('div');
      cardEl.className = 'polaroid-card';
      cardEl.id = `polaroid-${index}`;
      // index 0 has highest zIndex: (cards.length - index) + 10
      cardEl.style.zIndex = (cards.length - index) + 10;
      cardEl.style.setProperty('--tilt', `${tilt}deg`);
      cardEl.style.transform = `rotate(${tilt}deg)`;

      cardEl.innerHTML = `
        <div class="polaroid-photo-frame">
          <img src="${cardData.src}" alt="Photo ${index + 1}" class="polaroid-img" draggable="false"
               onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried='1'; this.src='assets/'+this.getAttribute('src');}">
        </div>
      `;

      deck.appendChild(cardEl);
    });

    let isSliding = false;
    function advanceCard() {
      if (isSliding) return;
      if (currentPolaroidIndex >= cards.length) {
        navigateToSection('step-3');
        return;
      }

      isSliding = true;
      setTimeout(() => { isSliding = false; }, 320);

      const topCard = document.getElementById(`polaroid-${currentPolaroidIndex}`);
      if (topCard) {
        topCard.classList.add('slide-out');
        topCard.style.pointerEvents = 'none';
      }

      currentPolaroidIndex++;

      if (currentPolaroidIndex < cards.length) {
        if (counterText) {
          counterText.innerText = `Tap the photo for the next one (${currentPolaroidIndex + 1} of ${cards.length})`;
        }
      } else {
        if (counterText) {
          counterText.innerText = "All 6 photos unlocked! ✨";
        }
        if (typeof fireConfetti === 'function') {
          fireConfetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } });
        }
        setTimeout(() => {
          navigateToSection('step-3');
        }, 700);
      }
    }

    // Tapping anywhere on the deck container or the top card advances smoothly
    deck.onclick = (e) => {
      e.stopPropagation();
      advanceCard();
    };

    // Also link the Step 2 Next button to advance cards or proceed
    const btnStep2Next = document.getElementById('btn-step2-next');
    if (btnStep2Next) {
      btnStep2Next.onclick = (e) => {
        e.stopPropagation();
        if (currentPolaroidIndex < cards.length) {
          advanceCard();
        } else {
          navigateToSection('step-3');
        }
      };
    }
  }

  // ------------------------------------------------------------------
  // STEP 3: "Something special for you 💌" (8 Traits & Voice Notes)
  // ------------------------------------------------------------------
  function renderTraitsList() {
    const list = document.getElementById('traits-list');
    if (!list) return;

    list.innerHTML = '';
    const traits = config.journey?.step3?.traits || [];

    traits.forEach(trait => {
      const row = document.createElement('div');
      row.className = 'trait-row';
      row.id = `trait-row-${trait.id}`;

      row.innerHTML = `
        <div class="trait-info">
          <div class="trait-title-row">
            <span class="trait-emoji">${trait.emoji}</span>
            <span class="trait-title">${trait.title}</span>
          </div>
          <p class="trait-desc">${trait.desc}</p>
        </div>
        <button class="trait-audio-btn" data-id="${trait.id}" data-audio="${trait.audio}" data-fallback="${trait.fallbackAudio}" aria-label="Play ${trait.title} voice note">
          <span class="trait-btn-icon">🔊</span>
        </button>
      `;

      const btn = row.querySelector('.trait-audio-btn');
      btn.addEventListener('click', () => {
        handleTraitAudioToggle(trait, btn);
      });

      list.appendChild(row);
    });
  }

  let wasMusicPlayingBeforeTrait = false;

  function initTraitAudioWebAudio() {
    if (!traitAudioElement) {
      traitAudioElement = document.getElementById('trait-audio-element');
    }
    if (!traitAudioElement) return;

    if (!traitAudioCtx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          traitAudioCtx = new AudioContext();
          traitSourceNode = traitAudioCtx.createMediaElementSource(traitAudioElement);

          // 1. High-Pass Filter: removes low rumble, ambient AC hum & table thumps (< 140 Hz)
          traitHighPass = traitAudioCtx.createBiquadFilter();
          traitHighPass.type = 'highpass';
          traitHighPass.frequency.setValueAtTime(30, traitAudioCtx.currentTime);
          traitHighPass.Q.setValueAtTime(0.707, traitAudioCtx.currentTime);

          // 2. Low-Pass Filter: strips high-frequency microphone hiss, fan noise & electronic static (> 5000 Hz)
          traitLowPass = traitAudioCtx.createBiquadFilter();
          traitLowPass.type = 'lowpass';
          traitLowPass.frequency.setValueAtTime(20000, traitAudioCtx.currentTime);
          traitLowPass.Q.setValueAtTime(0.707, traitAudioCtx.currentTime);

          // 3. Peaking Filter: enhances human speech warmth & clarity in core vocal frequencies (1800 Hz)
          traitMidFilter = traitAudioCtx.createBiquadFilter();
          traitMidFilter.type = 'peaking';
          traitMidFilter.frequency.setValueAtTime(1800, traitAudioCtx.currentTime);
          traitMidFilter.gain.setValueAtTime(0, traitAudioCtx.currentTime);
          traitMidFilter.Q.setValueAtTime(1.1, traitAudioCtx.currentTime);

          // 4. Dynamics Compressor: smooths peaks and acts as a vocal leveler
          traitCompressor = traitAudioCtx.createDynamicsCompressor();
          traitCompressor.threshold.setValueAtTime(-18, traitAudioCtx.currentTime);
          traitCompressor.knee.setValueAtTime(10, traitAudioCtx.currentTime);
          traitCompressor.ratio.setValueAtTime(4, traitAudioCtx.currentTime);
          traitCompressor.attack.setValueAtTime(0.003, traitAudioCtx.currentTime);
          traitCompressor.release.setValueAtTime(0.2, traitAudioCtx.currentTime);

          // 5. Gain Node: clean amplification
          traitGainNode = traitAudioCtx.createGain();
          traitGainNode.gain.setValueAtTime(1.0, traitAudioCtx.currentTime);

          // Chain: source -> highpass -> lowpass -> midFilter -> compressor -> gain -> destination
          traitSourceNode.connect(traitHighPass);
          traitHighPass.connect(traitLowPass);
          traitLowPass.connect(traitMidFilter);
          traitMidFilter.connect(traitCompressor);
          traitCompressor.connect(traitGainNode);
          traitGainNode.connect(traitAudioCtx.destination);
        }
      } catch (err) {
        console.warn('Web Audio API not supported or failed to hook:', err);
      }
    }

    if (traitAudioCtx && traitAudioCtx.state === 'suspended') {
      traitAudioCtx.resume().catch(() => {});
    }
  }

  function handleTraitAudioToggle(trait, btn) {
    if (!traitAudioElement) {
      traitAudioElement = document.getElementById('trait-audio-element');
    }

    // If currently playing this trait, pause it
    if (activeTraitBtn === btn && traitAudioElement && !traitAudioElement.paused) {
      traitAudioElement.pause();
      btn.innerHTML = '<span>🔊</span>';
      btn.classList.remove('is-playing');
      activeTraitAudio = null;
      activeTraitBtn = null;
      return;
    }

    // Reset previous playing button
    if (activeTraitBtn) {
      activeTraitBtn.innerHTML = '<span>🔊</span>';
      activeTraitBtn.classList.remove('is-playing');
    }
    if (traitAudioElement) {
      traitAudioElement.pause();
      traitAudioElement.currentTime = 0;
    }
    if (activeTraitAudio && activeTraitAudio !== traitAudioElement) {
      activeTraitAudio.pause();
      activeTraitAudio = null;
    }

    // Stop background music if playing so voice note is heard clearly
    if (state.isPlayingMusic) {
      stopMusic();
    }

    // Initialize Web Audio graph on user gesture and adjust gain boost
    initTraitAudioWebAudio();

    // Configure Denoising Filter & EQ dynamically based on trait.denoise
    if (traitAudioCtx) {
      if (trait.denoise) {
        // Strip low hum & rumble (< 140 Hz)
        if (traitHighPass) {
          traitHighPass.frequency.setValueAtTime(140, traitAudioCtx.currentTime);
        }
        // Strip high-frequency microphone hiss, white noise & room static (> 5000 Hz)
        if (traitLowPass) {
          traitLowPass.frequency.setValueAtTime(5000, traitAudioCtx.currentTime);
        }
        // Boost vocal presence & articulation (+3.5 dB @ 1800 Hz)
        if (traitMidFilter) {
          traitMidFilter.gain.setValueAtTime(3.5, traitAudioCtx.currentTime);
        }
        if (traitCompressor) {
          traitCompressor.threshold.setValueAtTime(-20, traitAudioCtx.currentTime);
          traitCompressor.ratio.setValueAtTime(5, traitAudioCtx.currentTime);
        }
      } else {
        // Transparent pass-through for other clean recordings
        if (traitHighPass) {
          traitHighPass.frequency.setValueAtTime(30, traitAudioCtx.currentTime);
        }
        if (traitLowPass) {
          traitLowPass.frequency.setValueAtTime(20000, traitAudioCtx.currentTime);
        }
        if (traitMidFilter) {
          traitMidFilter.gain.setValueAtTime(0, traitAudioCtx.currentTime);
        }
        if (traitCompressor) {
          traitCompressor.threshold.setValueAtTime(-16, traitAudioCtx.currentTime);
          traitCompressor.ratio.setValueAtTime(4, traitAudioCtx.currentTime);
        }
      }

      const boost = Number(trait.volumeBoost) || 1.0;
      if (traitGainNode) {
        traitGainNode.gain.setValueAtTime(boost, traitAudioCtx.currentTime);
      }
    }

    activeTraitAudio = traitAudioElement;
    activeTraitBtn = btn;

    btn.innerHTML = '<span>⏸</span>';
    btn.classList.add('is-playing');

    if (traitAudioElement) {
      traitAudioElement.src = trait.audio;
      traitAudioElement.load();

      const playPromise = traitAudioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Trait audio primary failed, trying fallback:', trait.audio, err);
          if (trait.fallbackAudio && trait.fallbackAudio !== trait.audio) {
            traitAudioElement.src = trait.fallbackAudio;
            traitAudioElement.load();
            traitAudioElement.play().catch(() => {
              btn.innerHTML = '<span>🔊</span>';
              btn.classList.remove('is-playing');
              activeTraitAudio = null;
              activeTraitBtn = null;
            });
          } else {
            btn.innerHTML = '<span>🔊</span>';
            btn.classList.remove('is-playing');
            activeTraitAudio = null;
            activeTraitBtn = null;
          }
        });
      }

      traitAudioElement.onended = () => {
        btn.innerHTML = '<span>🔊</span>';
        btn.classList.remove('is-playing');
        activeTraitAudio = null;
        activeTraitBtn = null;
      };
    }
  }

  // ------------------------------------------------------------------
  // STEP 4: Favourite Thing Question & 3-Strike Delete Progress Bar
  // ------------------------------------------------------------------
  const btnStep4Yes = document.getElementById('btn-step4-yes');
  const btnStep4No = document.getElementById('btn-step4-no');
  const step4Feedback = document.getElementById('step4-feedback');
  const step4DeleteBox = document.getElementById('step4-delete-box');
  const step4DeleteFill = document.getElementById('step4-delete-fill');
  const step4ButtonsContainer = document.getElementById('step4-buttons-container');

  if (btnStep4No) {
    btnStep4No.addEventListener('click', () => {
      step4NoClicks++;
      const noReplies = config.journey?.step4?.noReplies || [
        "Tum itni ziddi kyu ho? 😤",
        "Please yaar, yes kar do 🥺"
      ];

      if (step4NoClicks === 1) {
        step4Feedback.innerText = noReplies[0];
      } else if (step4NoClicks === 2) {
        step4Feedback.innerText = noReplies[1];
      } else {
        // Third No: Hide buttons, show progress bar and skip to Step 6
        step4Feedback.innerText = '';
        if (step4ButtonsContainer) step4ButtonsContainer.style.display = 'none';
        if (step4DeleteBox) {
          step4DeleteBox.style.display = 'block';
          // Trigger progress fill
          setTimeout(() => {
            if (step4DeleteFill) step4DeleteFill.style.width = '100%';
          }, 50);

          setTimeout(() => {
            // Skip Step 5 and jump straight to Step 6!
            navigateToSection('step-6');
          }, 2600);
        }
      }
    });
  }

  if (btnStep4Yes) {
    btnStep4Yes.addEventListener('click', () => {
      fireConfetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      navigateToSection('step-5');
    });
  }

  // ------------------------------------------------------------------
  // STEP 5: Favourite-Thing Voice Note (fav.mp3 with spinning disc)
  // ------------------------------------------------------------------
  const btnFavPlayPause = document.getElementById('btn-fav-play-pause');
  const favPlayIcon = document.getElementById('fav-play-icon');
  const favPlayText = document.getElementById('fav-play-text');
  const spinningDisc = document.getElementById('spinning-disc-vinyl');

  function startFavAudio() {
    if (!favAudioElement) favAudioElement = document.getElementById('fav-audio-element');
    if (!favAudioElement) return;

    // Pause background music
    if (state.isPlayingMusic) {
      wasMusicPlayingBeforeFav = true;
      stopMusic();
    }

    favAudioElement.currentTime = 0;
    const playPromise = favAudioElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isFavAudioPlaying = true;
          if (spinningDisc) spinningDisc.classList.add('is-spinning');
          if (favPlayIcon) favPlayIcon.innerText = '⏸';
          if (favPlayText) favPlayText.innerText = 'Pause Voice Note';
        })
        .catch(err => {
          console.warn('Autoplay blocked or fav.mp3 missing:', err);
          isFavAudioPlaying = false;
          if (spinningDisc) spinningDisc.classList.remove('is-spinning');
          if (favPlayIcon) favPlayIcon.innerText = '▶';
          if (favPlayText) favPlayText.innerText = 'Play Voice Note';
        });
    }

    favAudioElement.onended = () => {
      isFavAudioPlaying = false;
      if (spinningDisc) spinningDisc.classList.remove('is-spinning');
      if (favPlayIcon) favPlayIcon.innerText = '▶';
      if (favPlayText) favPlayText.innerText = 'Replay Voice Note';

      // Resume background music
      if (wasMusicPlayingBeforeFav) {
        wasMusicPlayingBeforeFav = false;
        playMusic();
      }

      // Automatically move to Step 6
      setTimeout(() => {
        navigateToSection('step-6');
      }, 700);
    };
  }

  if (btnFavPlayPause) {
    btnFavPlayPause.addEventListener('click', () => {
      if (!favAudioElement) return;

      if (isFavAudioPlaying) {
        favAudioElement.pause();
        isFavAudioPlaying = false;
        if (spinningDisc) spinningDisc.classList.remove('is-spinning');
        if (favPlayIcon) favPlayIcon.innerText = '▶';
        if (favPlayText) favPlayText.innerText = 'Play Voice Note';
      } else {
        favAudioElement.play().then(() => {
          isFavAudioPlaying = true;
          if (spinningDisc) spinningDisc.classList.add('is-spinning');
          if (favPlayIcon) favPlayIcon.innerText = '⏸';
          if (favPlayText) favPlayText.innerText = 'Pause Voice Note';
        }).catch(err => {
          console.warn('Audio play error:', err);
        });
      }
    });
  }

  // ------------------------------------------------------------------
  // STEP 6: Message from me (Scrollable letter image)
  // ------------------------------------------------------------------
  function renderPersonalMessage() {
    const imgEl = document.getElementById('step6-message-img');
    if (imgEl && config.journey?.step6?.image) {
      imgEl.src = config.journey.step6.image;
    }
  }

  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // STEP 7: Gift Question & Runaway No Button (Dodges 10 times inside box, then disappears)
  // ------------------------------------------------------------------
  const btnStep7Yes = document.getElementById('btn-step7-yes');
  const btnStep7No = document.getElementById('btn-step7-no');
  const step7Feedback = document.getElementById('step7-feedback');
  const runawayArea = document.getElementById('runaway-area');
  const runawayCard = document.getElementById('runaway-card');
  let noAttempts = 0;
  let lastNoAttemptTime = 0;

  function resetRunawayButton() {
    noAttempts = 0;
    if (btnStep7No) {
      btnStep7No.style.position = '';
      btnStep7No.style.left = '';
      btnStep7No.style.top = '';
      btnStep7No.style.opacity = '1';
      btnStep7No.style.transform = 'none';
      btnStep7No.style.display = '';
      btnStep7No.style.pointerEvents = 'auto';
      btnStep7No.innerHTML = '<span>No</span> <span>🙈</span>';
    }
    if (btnStep7Yes) {
      btnStep7Yes.classList.remove('pulse-glow-big');
      btnStep7Yes.style.transform = 'none';
      btnStep7Yes.style.boxShadow = '';
    }
    if (step7Feedback) step7Feedback.innerHTML = '';
  }

  function handleNoButtonAttempt(e) {
    if (!btnStep7No || !runawayArea) return;

    if (e && e.cancelable) e.preventDefault();

    // Debounce to prevent multiple rapid events (hover + touch + click) burning multiple tries at once
    const now = Date.now();
    if (now - lastNoAttemptTime < 340) return;
    lastNoAttemptTime = now;

    if (noAttempts >= 10) return;

    noAttempts++;

    const teasingMessages = [
      "Arey No mat bolo na! 🥺 (Try 1 of 10)",
      "Still trying to say No? No way! 🙈 (Try 2 of 10)",
      "Nope, dodging you again! 🏃💨 (Try 3 of 10)",
      "Potato please, accept it na! 😂 (Try 4 of 10)",
      "Halfway there... but NO is not an option! 🙅‍♀️ (Try 5 of 10)",
      "You really thought you could click it? 😜 (Try 6 of 10)",
      "Look how fast it runs! ⚡ (Try 7 of 10)",
      "Still trying? Just tap YES! 💖 (Try 8 of 10)",
      "Last chance before it gives up completely! 💨 (Try 9 of 10)"
    ];

    if (noAttempts < 10) {
      // Moves away, BUT STAYS STRICTLY INSIDE THE RUNAWAY BUTTONS BOX
      const areaW = runawayArea.clientWidth;
      const areaH = runawayArea.clientHeight;
      const btnW = btnStep7No.offsetWidth || 100;
      const btnH = btnStep7No.offsetHeight || 44;

      const pad = 12;
      const maxW = Math.max(10, areaW - btnW - (pad * 2));
      const maxH = Math.max(10, areaH - btnH - (pad * 2));

      // Get Yes button bounds inside runawayArea so No doesn't overlap it
      let yesLeft = -999, yesTop = -999, yesRight = -999, yesBottom = -999;
      if (btnStep7Yes) {
        const yesRect = btnStep7Yes.getBoundingClientRect();
        const areaRect = runawayArea.getBoundingClientRect();
        yesLeft = yesRect.left - areaRect.left;
        yesTop = yesRect.top - areaRect.top;
        yesRight = yesLeft + yesRect.width;
        yesBottom = yesTop + yesRect.height;
      }

      let bestX = pad + Math.floor(Math.random() * maxW);
      let bestY = pad + Math.floor(Math.random() * maxH);

      // Pick a spot that does not overlap the YES button
      for (let i = 0; i < 15; i++) {
        const testX = pad + Math.floor(Math.random() * maxW);
        const testY = pad + Math.floor(Math.random() * maxH);
        const overlapsYes = !(
          (testX + btnW) < yesLeft - 15 ||
          testX > yesRight + 15 ||
          (testY + btnH) < yesTop - 10 ||
          testY > yesBottom + 10
        );
        if (!overlapsYes) {
          bestX = testX;
          bestY = testY;
          break;
        }
      }

      // Smooth switch from relative flow to absolute inside the wrapper
      if (btnStep7No.style.position !== 'absolute') {
        const currentRect = btnStep7No.getBoundingClientRect();
        const areaRect = runawayArea.getBoundingClientRect();
        btnStep7No.style.position = 'absolute';
        btnStep7No.style.left = `${currentRect.left - areaRect.left}px`;
        btnStep7No.style.top = `${currentRect.top - areaRect.top}px`;
        void btnStep7No.offsetWidth;
      }

      btnStep7No.style.transition = 'left 0.32s cubic-bezier(0.25, 1, 0.5, 1), top 0.32s cubic-bezier(0.25, 1, 0.5, 1)';
      btnStep7No.style.left = `${bestX}px`;
      btnStep7No.style.top = `${bestY}px`;
      btnStep7No.style.zIndex = '25';

      if (step7Feedback) {
        step7Feedback.innerText = teasingMessages[noAttempts - 1] || `Dodge! (Try ${noAttempts} of 10) 🏃`;
      }

      if (navigator.vibrate) navigator.vibrate(25);
    } else {
      // 10TH TRY: DODGES CLICK AND COMPLETELY DISAPPEARS!
      btnStep7No.style.transition = 'all 0.45s cubic-bezier(0.3, 1.4, 0.5, 1)';
      btnStep7No.style.transform = 'scale(0) rotate(360deg)';
      btnStep7No.style.opacity = '0';
      btnStep7No.style.pointerEvents = 'none';

      setTimeout(() => {
        if (btnStep7No) btnStep7No.style.display = 'none';
      }, 460);

      if (step7Feedback) {
        step7Feedback.innerHTML = `Haha 10 tries over! 💨 The <strong>No</strong> button disappeared completely!<br>Ab to sirf <strong>YES</strong> bolna padega 💖`;
      }

      if (btnStep7Yes) {
        btnStep7Yes.classList.add('pulse-glow-big');
      }

      fireConfetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
    }
  }

  if (btnStep7No) {
    btnStep7No.addEventListener('mouseenter', handleNoButtonAttempt);
    btnStep7No.addEventListener('pointerenter', handleNoButtonAttempt);
    btnStep7No.addEventListener('touchstart', handleNoButtonAttempt, { passive: false });
    btnStep7No.addEventListener('pointerdown', handleNoButtonAttempt);
    btnStep7No.addEventListener('click', handleNoButtonAttempt);
  }

  if (btnStep7Yes) {
    btnStep7Yes.addEventListener('click', () => {
      fireConfetti({ particleCount: 90, spread: 85, origin: { y: 0.6 } });
      navigateToSection('step-8');
    });
  }

  // ------------------------------------------------------------------
  // STEP 8: Choose Gifts (Choose any 2 or Choose All!)
  // ------------------------------------------------------------------
  const selectedGiftBoxIds = new Set();

  function resetMysteryBoxes() {
    selectedGiftBoxIds.clear();
    const boxes = document.querySelectorAll('.mystery-box-item');
    const revealCard = document.getElementById('gift-reveal-card');
    const itemsContainer = document.getElementById('gift-reveal-items-container');
    const counterText = document.getElementById('gift-counter-text');

    if (itemsContainer) itemsContainer.innerHTML = '';
    if (counterText) counterText.innerText = 'Selected: 0 of 2 gifts';

    boxes.forEach(b => {
      b.style.opacity = '1';
      b.style.transform = 'none';
      b.style.pointerEvents = 'auto';
      b.classList.remove('opened', 'selected');
      const icon = b.querySelector('.box-icon');
      if (icon) icon.innerText = '🎁';
    });

    if (revealCard) revealCard.style.display = 'none';
  }

  function renderSelectedGiftsReveal() {
    const revealCard = document.getElementById('gift-reveal-card');
    const itemsContainer = document.getElementById('gift-reveal-items-container');
    const counterText = document.getElementById('gift-counter-text');
    const boxConfigList = config.journey?.step8?.boxes || [];

    if (!revealCard || !itemsContainer) return;

    if (selectedGiftBoxIds.size === 0) {
      revealCard.style.display = 'none';
      if (counterText) counterText.innerText = 'Selected: 0 of 2 gifts';
      return;
    }

    const isAll = selectedGiftBoxIds.size === 4;
    if (counterText) {
      counterText.innerText = isAll ? 'Selected: ALL 4 gifts! 💖✨' : `Selected: ${selectedGiftBoxIds.size} of 2 gifts`;
    }

    itemsContainer.innerHTML = '';

    // If all chosen, show special banner
    if (isAll) {
      const banner = document.createElement('div');
      banner.className = 'gift-all-chosen-banner';
      banner.innerHTML = `✨ Why choose just two when you deserve every single one? 🥹💛`;
      itemsContainer.appendChild(banner);
    }

    selectedGiftBoxIds.forEach(boxId => {
      const boxData = boxConfigList.find(b => b.id === boxId) || {
        id: boxId,
        label: `Box ${boxId}`,
        emoji: '🎁✨',
        title: `Birthday Gift #${boxId}`,
        desc: 'Special curated birthday treasure!',
        images: ['assets/gifts/brac-1.webp']
      };

      const card = document.createElement('div');
      card.className = 'single-revealed-gift-card';

      // Header
      const headerDiv = document.createElement('div');
      headerDiv.innerHTML = `
        <div class="gift-reveal-icon">${boxData.emoji}</div>
        <h3 class="gift-reveal-title">${boxData.title}</h3>
      `;
      card.appendChild(headerDiv);

      // Gallery
      const gallery = document.createElement('div');
      gallery.className = 'gift-reveal-gallery';
      const images = Array.isArray(boxData.images) ? boxData.images : [boxData.images];

      if (images.length > 1) {
        // Multi-image grid (Box 1 bracelets)
        const grid = document.createElement('div');
        grid.className = 'gift-grid-4';
        images.forEach((imgSrc, idx) => {
          const item = document.createElement('div');
          item.className = 'gift-grid-item';
          const img = document.createElement('img');
          img.src = imgSrc;
          img.alt = `${boxData.title} view ${idx + 1}`;
          img.loading = 'lazy';
          img.onerror = function() {
            if (!this.dataset.fallbackTried) {
              this.dataset.fallbackTried = '1';
              this.src = 'assets/' + imgSrc;
            }
          };
          item.appendChild(img);
          grid.appendChild(item);
        });
        gallery.appendChild(grid);
      } else if (images.length === 1) {
        // Single hero image (Boxes 2, 3, 4)
        const singleWrap = document.createElement('div');
        singleWrap.className = 'gift-single-img-wrap';
        const img = document.createElement('img');
        img.src = images[0];
        img.alt = boxData.title;
        img.loading = 'lazy';
        img.onerror = function() {
          if (!this.dataset.fallbackTried) {
            this.dataset.fallbackTried = '1';
            this.src = 'assets/' + images[0];
          }
        };
        singleWrap.appendChild(img);
        gallery.appendChild(singleWrap);
      }

      card.appendChild(gallery);

      // Description
      const descEl = document.createElement('p');
      descEl.className = 'gift-reveal-desc';
      descEl.innerText = boxData.desc;
      card.appendChild(descEl);

      itemsContainer.appendChild(card);
    });

    revealCard.style.display = 'block';
    setTimeout(() => {
      revealCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
  }

  function updateBoxElementsUI() {
    const boxes = document.querySelectorAll('.mystery-box-item');
    const boxConfigList = config.journey?.step8?.boxes || [];

    boxes.forEach(b => {
      const boxId = parseInt(b.getAttribute('data-box') || '1', 10);
      const boxData = boxConfigList.find(x => x.id === boxId) || {};
      const icon = b.querySelector('.box-icon');

      if (selectedGiftBoxIds.has(boxId)) {
        b.classList.add('selected', 'opened');
        if (icon) icon.innerText = boxData.emoji || '🎁✨';
      } else {
        b.classList.remove('selected', 'opened');
        if (icon) icon.innerText = '🎁';
      }
    });
  }

  // Box item click: toggle selection (max 2)
  document.querySelectorAll('.mystery-box-item').forEach(box => {
    box.addEventListener('click', () => {
      const boxId = parseInt(box.getAttribute('data-box') || '1', 10);

      if (selectedGiftBoxIds.has(boxId)) {
        selectedGiftBoxIds.delete(boxId);
      } else {
        if (selectedGiftBoxIds.size >= 2) {
          const oldest = selectedGiftBoxIds.values().next().value;
          selectedGiftBoxIds.delete(oldest);
        }
        selectedGiftBoxIds.add(boxId);
        fireConfetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      }

      updateBoxElementsUI();
      renderSelectedGiftsReveal();
    });
  });

  // "See All Gifts & Choose All" Button
  const btnChooseAllGifts = document.getElementById('btn-choose-all-gifts');
  if (btnChooseAllGifts) {
    btnChooseAllGifts.addEventListener('click', () => {
      selectedGiftBoxIds.clear();
      [1, 2, 3, 4].forEach(id => selectedGiftBoxIds.add(id));
      fireConfetti({ particleCount: 140, spread: 100, origin: { y: 0.6 } });

      updateBoxElementsUI();
      renderSelectedGiftsReveal();
    });
  }

  // ------------------------------------------------------------------
  // STEP 9: Delivery Details Form & WhatsApp Send
  // ------------------------------------------------------------------
  const btnSendWhatsApp = document.getElementById('btn-send-whatsapp');
  const btnCopyDetails = document.getElementById('btn-copy-details');
  const deliveryErrorMsg = document.getElementById('delivery-error-msg');
  const deliveryFormContainer = document.getElementById('delivery-form-container');
  const deliveryThankYou = document.getElementById('delivery-thank-you');
  const btnReplayThankYou = document.getElementById('btn-replay-from-thankyou');

  function getDeliveryFormData() {
    const name = document.getElementById('input-recipient-name')?.value.trim() || '';
    const rawPhone = document.getElementById('input-recipient-phone')?.value.trim() || '';
    const phone = rawPhone.replace(/\D/g, ''); // Digits only
    const address = document.getElementById('input-recipient-address')?.value.trim() || '';
    const sender = document.getElementById('input-parcel-sender')?.value.trim() || '';

    return { name, phone, address, sender };
  }

  function validateDeliveryForm(data) {
    if (!data.name || data.name.length < 2) {
      return "Please enter your name 🥺";
    }
    if (!data.phone || data.phone.length !== 10) {
      return "Please enter a valid 10-digit mobile number for the delivery partner 📱";
    }
    if (!data.address || data.address.length < 10) {
      return "Please enter your complete address including pincode 🏠";
    }
    return null;
  }

  function buildWhatsAppMessage(data) {
    const senderTag = data.sender ? data.sender : 'Not specified';
    const boxConfigList = config.journey?.step8?.boxes || [];
    let giftSummary = 'Birthday Surprise Gift 🎁';

    if (selectedGiftBoxIds && selectedGiftBoxIds.size === 4) {
      giftSummary = 'ALL 4 Curated Birthday Gifts 💖✨';
    } else if (selectedGiftBoxIds && selectedGiftBoxIds.size > 0) {
      giftSummary = Array.from(selectedGiftBoxIds).map(id => {
        const b = boxConfigList.find(x => x.id === id);
        return b ? `${b.emoji} ${b.title}` : `Box ${id}`;
      }).join(' + ');
    }

    return `🎁 Birthday Gift Delivery Details for Potato 💖\n` +
           `━━━━━━━━━━━━━━━━━━━━\n` +
           `🎀 Selected Gift(s): ${giftSummary}\n` +
           `👤 Name: ${data.name}\n` +
           `📞 Phone: ${data.phone}\n` +
           `🏠 Address: ${data.address}\n` +
           `🏷️ Sender Name on Parcel: ${senderTag}\n` +
           `━━━━━━━━━━━━━━━━━━━━\n` +
           `Happy 19th Birthday Potato! 🎂✨`;
  }

  async function saveDeliveryToMongoDB(payload) {
    const endpoints = [
      '/api/delivery',
      'http://localhost:3000/api/delivery',
      'http://127.0.0.1:3000/api/delivery'
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const resData = await response.json();
          console.log('✅ Gift delivery details successfully saved to MongoDB potato database:', resData);
          return resData;
        }
      } catch (err) {
        // Continue trying next endpoint
      }
    }
    console.warn('Backend API server not reached for MongoDB save.');
    return null;
  }

  if (btnSendWhatsApp) {
    btnSendWhatsApp.addEventListener('click', () => {
      const data = getDeliveryFormData();
      const error = validateDeliveryForm(data);

      if (error) {
        if (deliveryErrorMsg) {
          deliveryErrorMsg.innerText = error;
          deliveryErrorMsg.style.display = 'block';
        }
        return;
      }

      if (deliveryErrorMsg) deliveryErrorMsg.style.display = 'none';

      // Determine selected gifts details for MongoDB and WhatsApp
      const boxConfigList = config.journey?.step8?.boxes || [];
      const chosenGiftsList = [];
      let giftSummary = 'Birthday Surprise Gift 🎁';

      const selectedIds = Array.from(selectedGiftBoxIds || []);
      const isAllGifts = selectedIds.length === 4;

      if (isAllGifts) {
        giftSummary = 'ALL 4 Curated Birthday Gifts 💖✨';
        [1, 2, 3, 4].forEach(id => {
          const b = boxConfigList.find(x => x.id === id);
          if (b) {
            chosenGiftsList.push({
              boxId: b.id,
              boxLabel: b.label || `Box ${b.id}`,
              emoji: b.emoji,
              title: b.title,
              desc: b.desc
            });
          }
        });
      } else if (selectedIds.length > 0) {
        giftSummary = selectedIds.map(id => {
          const b = boxConfigList.find(x => x.id === id);
          if (b) {
            chosenGiftsList.push({
              boxId: b.id,
              boxLabel: b.label || `Box ${b.id}`,
              emoji: b.emoji,
              title: b.title,
              desc: b.desc
            });
          }
          return b ? `${b.emoji} ${b.title}` : `Box ${id}`;
        }).join(' + ');
      }

      // Asynchronously save to MongoDB database "potato"
      saveDeliveryToMongoDB({
        name: data.name,
        phone: data.phone,
        address: data.address,
        senderOnParcel: data.sender || 'Not specified',
        selectedGiftIds: selectedIds,
        selectedGiftsSummary: giftSummary,
        chosenGiftsList: chosenGiftsList,
        chosenAllGifts: isAllGifts,
        totalGiftsChosen: chosenGiftsList.length
      });

      const waNumber = config.sender?.whatsappNumber || '919876543210';
      const msg = buildWhatsAppMessage(data);
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

      window.open(waUrl, '_blank');

      // Show thank you screen
      if (deliveryFormContainer) deliveryFormContainer.style.display = 'none';
      if (deliveryThankYou) deliveryThankYou.style.display = 'block';

      // Big confetti celebration
      fireConfetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
    });
  }

  if (btnCopyDetails) {
    btnCopyDetails.addEventListener('click', () => {
      const data = getDeliveryFormData();
      const error = validateDeliveryForm(data);

      if (error) {
        if (deliveryErrorMsg) {
          deliveryErrorMsg.innerText = error;
          deliveryErrorMsg.style.display = 'block';
        }
        return;
      }

      if (deliveryErrorMsg) deliveryErrorMsg.style.display = 'none';

      const msg = buildWhatsAppMessage(data);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(() => {
          showToast('Copied to clipboard! 📋 Just paste into WhatsApp.');
        }).catch(() => {
          showToast('Details ready to send! 📋');
        });
      } else {
        showToast('Details ready to send! 📋');
      }

      // Show thank you screen
      if (deliveryFormContainer) deliveryFormContainer.style.display = 'none';
      if (deliveryThankYou) deliveryThankYou.style.display = 'block';

      fireConfetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
    });
  }

  if (btnReplayThankYou) {
    btnReplayThankYou.addEventListener('click', () => {
      // Reset forms and return to home
      if (deliveryFormContainer) deliveryFormContainer.style.display = 'block';
      if (deliveryThankYou) deliveryThankYou.style.display = 'none';
      step1NoClicks = 0;
      step4NoClicks = 0;
      if (btnStep1Yes) btnStep1Yes.disabled = false;
      if (btnStep1No) btnStep1No.disabled = false;
      if (step4ButtonsContainer) step4ButtonsContainer.style.display = 'flex';
      if (step4DeleteBox) step4DeleteBox.style.display = 'none';
      if (step4DeleteFill) step4DeleteFill.style.width = '0%';
      navigateToSection('home');
      fireConfetti({ particleCount: 60, spread: 70 });
    });
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'journey-toast';
    toast.innerText = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#4a2c11';
    toast.style.color = '#fff';
    toast.style.padding = '10px 22px';
    toast.style.borderRadius = '999px';
    toast.style.fontWeight = '700';
    toast.style.fontSize = '0.95rem';
    toast.style.zIndex = '99999';
    toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  // ------------------------------------------------------------------
  // UI INITIALIZATION & RENDER
  // ------------------------------------------------------------------
  function updateAllUIText() {
    const rName = config.recipient?.realName || 'Potato';
    const sName = config.sender?.name || 'Himanshu';

    document.querySelectorAll('.recipient-name-bind').forEach(el => el.innerText = rName);
    document.querySelectorAll('.sender-name-bind').forEach(el => el.innerText = sName);

    const upfrontPrivacyEl = document.getElementById('upfront-privacy-text');
    if (upfrontPrivacyEl && config.journey?.step9?.privacyNote) {
      upfrontPrivacyEl.innerText = config.journey.step9.privacyNote;
    }
    const privacyEl = document.getElementById('privacy-note-text');
    if (privacyEl && config.journey?.step9?.privacyNote) {
      privacyEl.innerText = config.journey.step9.privacyNote;
    }

    const thankYouTitleEl = document.querySelector('.thank-you-title');
    if (thankYouTitleEl && config.journey?.step9?.thankYouTitle) {
      thankYouTitleEl.innerText = config.journey.step9.thankYouTitle;
    }
    const thankYouMsgEl = document.querySelector('.thank-you-msg');
    if (thankYouMsgEl && config.journey?.step9?.thankYouMessage) {
      thankYouMsgEl.innerText = config.journey.step9.thankYouMessage;
    }
  }


    // 20. RAINBOW COLOR WATER LAKE - INTERACTIVE LIQUID RIPPLES
  // ------------------------------------------------------------------
  const ripplesCanvas = document.getElementById('lake-ripples-canvas');
  if (ripplesCanvas) {
    const ctx = ripplesCanvas.getContext('2d');
    let width = ripplesCanvas.width = window.innerWidth;
    let height = ripplesCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = ripplesCanvas.width = window.innerWidth;
      height = ripplesCanvas.height = window.innerHeight;
    });

    const ripples = [];
    const rainbowColors = [
      'rgba(255, 117, 140, ', // Romantic Rose Pink
      'rgba(251, 146, 60, ',  // Warm Sunset Orange
      'rgba(244, 114, 182, ', // Sweet Blush Pink
      'rgba(168, 85, 247, ',  // Twilight Lavender
      'rgba(56, 189, 248, ',  // Dreamy Sky Blue
      'rgba(129, 140, 248, ', // Soft Indigo Periwinkle
      'rgba(244, 63, 94, '    // Vivid Coral Rose
    ];

    function createWaterRipple(x, y, maxR = 90) {
      if (ripples.length > 25) return;
      const color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
      ripples.push({
        x,
        y,
        radius: 3,
        maxRadius: maxR,
        speed: 1.8 + Math.random() * 1.4,
        alpha: 0.65,
        color
      });
    }

    // Interactive pointer ripple
    let lastMoveTime = 0;
    window.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - lastMoveTime > 120) {
        lastMoveTime = now;
        createWaterRipple(e.clientX, e.clientY, 60 + Math.random() * 40);
      }
    }, { passive: true });

    window.addEventListener('pointerdown', (e) => {
      createWaterRipple(e.clientX, e.clientY, 100 + Math.random() * 50);
    }, { passive: true });

    // Ambient lake raindrops/ripples
    setInterval(() => {
      if (!document.hidden) {
        const randX = Math.random() * width;
        const randY = Math.random() * height;
        createWaterRipple(randX, randY, 70 + Math.random() * 60);
      }
    }, 2400);

    function animateRipples() {
      ctx.clearRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color}${r.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = `${r.color}0.8)`;
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Inner harmonic ripple echo
        if (r.radius > 16) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius - 12, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.color}${r.alpha * 0.5})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      }

      requestAnimationFrame(animateRipples);
    }

    animateRipples();
  }

  // Initial render
  updateAllUIText();
});
