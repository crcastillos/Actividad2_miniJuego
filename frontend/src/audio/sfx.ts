export type SfxKind =
  | "playerShot"
  | "enemyShot"
  | "moveStart"
  | "enemyDestroyedBasic"
  | "enemyDestroyedFast"
  | "enemyDestroyedTank"
  | "hit"
  | "extraLife"
  | "waveCleared"
  | "gameOver"
  | "uiClick"
  | "pause"
  | "resume"
  | "startGame"
  | "quit";

type OscType = OscillatorType;

interface Tone {
  freq: number;
  duration: number;
  type?: OscType;
  slideTo?: number;
  gain?: number;
  delay?: number;
}

const MUTE_KEY = "neon-swarm.sfx-muted";
const MAX_VOICES = 8;

let audioCtx: AudioContext | null = null;
let muted = false;
let voices = 0;
const liveGains = new Set<GainNode>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!audioCtx) {
    audioCtx = new Ctor();
  }
  return audioCtx;
}

export async function unlock(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    await ctx.resume();
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (value) {
    stopAll();
  }
  persistMuted(value);
}

export async function loadMuted(): Promise<boolean> {
  try {
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    muted = (await AsyncStorage.getItem(MUTE_KEY)) === "1";
  } catch {
    muted = false;
  }
  return muted;
}

function persistMuted(value: boolean): void {
  void import("@react-native-async-storage/async-storage")
    .then(({ default: AsyncStorage }) => AsyncStorage.setItem(MUTE_KEY, value ? "1" : "0"))
    .catch(() => undefined);
}

export function stopAll(): void {
  for (const gain of liveGains) {
    try {
      gain.gain.value = 0;
      gain.disconnect();
    } catch {
      // Node may already be stopped.
    }
  }
  liveGains.clear();
  voices = 0;
}

export function play(kind: SfxKind): void {
  if (muted) {
    return;
  }
  const tones = patch(kind);
  for (const tone of tones) {
    beep(tone);
  }
}

function patch(kind: SfxKind): Tone[] {
  switch (kind) {
    case "playerShot":
      return [{ freq: 880, duration: 0.08, type: "square", gain: 0.08 }];
    case "enemyShot":
      return [{ freq: 220, duration: 0.1, type: "square", gain: 0.07 }];
    case "moveStart":
      return [{ freq: 120, duration: 0.04, type: "square", gain: 0.035 }];
    case "enemyDestroyedBasic":
      return [{ freq: 420, duration: 0.12, type: "sawtooth", slideTo: 140, gain: 0.09 }];
    case "enemyDestroyedFast":
      return [{ freq: 540, duration: 0.1, type: "sawtooth", slideTo: 180, gain: 0.09 }];
    case "enemyDestroyedTank":
      return [{ freq: 280, duration: 0.2, type: "sawtooth", slideTo: 70, gain: 0.11 }];
    case "hit":
      return [{ freq: 180, duration: 0.22, type: "square", slideTo: 60, gain: 0.1 }];
    case "extraLife":
      return [
        { freq: 523, duration: 0.08, type: "square", gain: 0.08 },
        { freq: 659, duration: 0.08, type: "square", gain: 0.08, delay: 0.08 },
        { freq: 784, duration: 0.12, type: "square", gain: 0.08, delay: 0.16 },
      ];
    case "waveCleared":
      return [
        { freq: 392, duration: 0.09, type: "square", gain: 0.08 },
        { freq: 523, duration: 0.09, type: "square", gain: 0.08, delay: 0.09 },
        { freq: 659, duration: 0.14, type: "square", gain: 0.09, delay: 0.18 },
      ];
    case "gameOver":
      return [{ freq: 330, duration: 0.55, type: "sawtooth", slideTo: 70, gain: 0.1 }];
    case "uiClick":
      return [{ freq: 700, duration: 0.04, type: "square", gain: 0.04 }];
    case "pause":
      return [{ freq: 260, duration: 0.08, type: "triangle", gain: 0.06 }];
    case "resume":
      return [{ freq: 390, duration: 0.08, type: "triangle", gain: 0.06 }];
    case "startGame":
      return [
        { freq: 440, duration: 0.07, type: "square", gain: 0.07 },
        { freq: 660, duration: 0.12, type: "square", gain: 0.07, delay: 0.07 },
      ];
    case "quit":
      return [{ freq: 240, duration: 0.12, type: "triangle", slideTo: 140, gain: 0.06 }];
    default:
      return [];
  }
}

function beep(tone: Tone): void {
  const ctx = getAudioContext();
  if (!ctx || voices >= MAX_VOICES) {
    return;
  }
  if (ctx.state !== "running") {
    void ctx.resume();
  }

  const startAt = ctx.currentTime + (tone.delay ?? 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tone.type ?? "square";
  osc.frequency.setValueAtTime(tone.freq, startAt);
  if (tone.slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(tone.slideTo, 20), startAt + tone.duration);
  }

  const volume = tone.gain ?? 0.08;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + tone.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  liveGains.add(gain);
  voices += 1;

  osc.start(startAt);
  osc.stop(startAt + tone.duration + 0.02);
  osc.onended = () => {
    liveGains.delete(gain);
    voices = Math.max(0, voices - 1);
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {
      // Already disconnected.
    }
  };
}
