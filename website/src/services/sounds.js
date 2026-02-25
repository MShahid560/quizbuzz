// Sound effects using Web Audio API (no external files needed!)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (err) {
    // Silently fail if audio not supported
  }
};

export const sounds = {
  // Correct answer — happy ascending notes
  correct: () => {
    playTone(523, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
  },

  // Wrong answer — sad descending notes
  wrong: () => {
    playTone(300, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.2), 150);
  },

  // Tick sound for timer
  tick: () => {
    playTone(800, 0.05, 'square', 0.1);
  },

  // Urgent ticking when time is low
  urgentTick: () => {
    playTone(1000, 0.08, 'square', 0.2);
  },

  // Level up fanfare
  levelUp: () => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.4), i * 120);
    });
  },

  // Quiz complete
  complete: () => {
    [392, 523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.3), i * 100);
    });
  },

  // Button click
  click: () => {
    playTone(600, 0.05, 'sine', 0.15);
  },

  // Challenge received
  challenge: () => {
    playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(550, 0.1, 'sine', 0.3), 150);
    setTimeout(() => playTone(440, 0.2, 'sine', 0.3), 300);
  },

  // Countdown beep
  countdown: () => {
    playTone(440, 0.1, 'sine', 0.25);
  }
};

// Sound enabled/disabled setting
export const isSoundEnabled = () => {
  return localStorage.getItem('quizbuzz_sound') !== 'false';
};

export const toggleSound = () => {
  const current = isSoundEnabled();
  localStorage.setItem('quizbuzz_sound', !current);
  return !current;
};

export const playSound = (soundName) => {
  if (!isSoundEnabled()) return;
  if (sounds[soundName]) sounds[soundName]();
};