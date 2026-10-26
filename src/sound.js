import { LS_SOUND_KEY } from './constants';

const audio = {
  ctx: null,
  enabled: true,
};

export function loadSoundPref() {
  try {
    audio.enabled = localStorage.getItem(LS_SOUND_KEY) !== '0';
  } catch (e) {
    audio.enabled = true;
  }
}

export function saveSoundPref() {
  try {
    localStorage.setItem(LS_SOUND_KEY, audio.enabled ? '1' : '0');
  } catch (e) {
    // ignore
  }
}

export function isSoundEnabled() {
  return audio.enabled;
}

export function setSoundEnabled(value) {
  audio.enabled = !!value;
  saveSoundPref();
}

function ensureAudioContext() {
  if (!audio.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audio.ctx = new AC();
  }
  if (audio.ctx && audio.ctx.state === 'suspended') {
    audio.ctx.resume().catch(() => {});
  }
  return audio.ctx;
}

function tone(freq, start, duration, type, gain) {
  const ctx = audio.ctx;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain || 0.2, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  const stopAt = start + duration + 0.02;
  osc.start(start);
  osc.stop(stopAt);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

export function playClick() {
  if (!audio.enabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  tone(800, ctx.currentTime, 0.05, 'sine', 0.22);
}

export function playPlace() {
  if (!audio.enabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  tone(300, ctx.currentTime, 0.06, 'triangle', 0.25);
}

export function playRotate() {
  if (!audio.enabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  tone(600, ctx.currentTime, 0.06, 'sine', 0.2);
}

export function playErase() {
  if (!audio.enabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  tone(220, ctx.currentTime, 0.06, 'triangle', 0.2);
}

export function playWin() {
  if (!audio.enabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    tone(f, t + i * 0.12, 0.22, 'sine', 0.2);
  });
}

export function playMenu() {
  if (!audio.enabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  tone(500, ctx.currentTime, 0.04, 'sine', 0.16);
}

export function initSound() {
  loadSoundPref();
  ensureAudioContext();
}

// Load the pref synchronously at import time so the UI reflects it on first render.
loadSoundPref();
