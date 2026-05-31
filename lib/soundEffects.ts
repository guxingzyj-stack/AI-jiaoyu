"use client";

type AudioContextConstructor = new () => AudioContext;

type AudioWindow = Window & {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
};

type Tone = {
  duration: number;
  frequency: number;
  gain?: number;
  type?: OscillatorType;
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  try {
    const audioWindow = window as AudioWindow;
    const AudioContextCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextCtor) return null;

    const context = audioContext ?? new AudioContextCtor();
    audioContext = context;
    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }

    return context;
  } catch {
    return null;
  }
}

function playTone({ duration, frequency, gain = 0.035, type = "sine" }: Tone, delay = 0) {
  const context = getAudioContext();
  if (!context) return;

  try {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const volume = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain, start + 0.015);
    volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  } catch {
    // Audio feedback is optional; never let it interrupt the adventure flow.
  }
}

function playSequence(tones: Tone[], gap = 0.055) {
  tones.forEach((tone, index) => playTone(tone, index * gap));
}

export function playClickSound() {
  playTone({ duration: 0.07, frequency: 660, gain: 0.018, type: "triangle" });
}

export function playCorrectSound() {
  playSequence([
    { duration: 0.08, frequency: 660, gain: 0.028, type: "triangle" },
    { duration: 0.11, frequency: 880, gain: 0.032, type: "sine" }
  ]);
}

export function playWrongSound() {
  playSequence([
    { duration: 0.1, frequency: 260, gain: 0.018, type: "sine" },
    { duration: 0.13, frequency: 210, gain: 0.014, type: "sine" }
  ], 0.07);
}

export function playRewardSound() {
  playSequence([
    { duration: 0.08, frequency: 740, gain: 0.028, type: "triangle" },
    { duration: 0.08, frequency: 988, gain: 0.03, type: "triangle" },
    { duration: 0.16, frequency: 1318, gain: 0.026, type: "sine" }
  ], 0.06);
}

export function playCompleteSound() {
  playSequence([
    { duration: 0.09, frequency: 523, gain: 0.026, type: "triangle" },
    { duration: 0.09, frequency: 659, gain: 0.028, type: "triangle" },
    { duration: 0.09, frequency: 784, gain: 0.03, type: "triangle" },
    { duration: 0.18, frequency: 1046, gain: 0.026, type: "sine" }
  ], 0.07);
}

export function playNovaSound() {
  playSequence([
    { duration: 0.07, frequency: 880, gain: 0.018, type: "sine" },
    { duration: 0.1, frequency: 1174, gain: 0.018, type: "triangle" }
  ], 0.055);
}
