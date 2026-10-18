import { type AudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Linking, Platform } from 'react-native';

import { canSynthesize, synthesizeSpeech } from '../../../modules/audio-volume';
import type { Language } from '../models';

import { audioSessionReady, boostLearnerAudio, LOUDNESS_GAIN } from './audioSession';

/**
 * Optional audio layer. Everything here uses the device's own text-to-speech engine, so no audio files are bundled.
 * See docs/AUDIO.md.
 *
 * Arabic needs care: Android's TTS engines only ship the system language by default. When the Arabic voice data is
 * missing, expo-speech silently falls back to the default (e.g. English) voice, which reads Arabic letters as
 * nothing at all – the learner hears silence. So we pick an Arabic voice explicitly and tell the learner (once,
 * inline) how to install one when the device has none.
 *
 * Loudness: TTS engines play much more quietly than music and their playback cannot be boosted. On Android the
 * utterance is therefore rendered to a (cached) file by the native module and played through an expo-audio player with
 * the learner-audio boost; the engine's own playback is the fallback (iOS, or when rendering fails).
 *
 * A future version can swap `NarrationProvider` for recorded narration by human readers.
 */
export interface SpeakOptions {
  /** The audio started (rendering the utterance may take a moment). */
  onStart?: () => void;
  /** Finished, stopped or failed – called exactly once per utterance. */
  onDone?: () => void;
}

export interface NarrationProvider {
  speak(text: string, language: Language, options?: SpeakOptions): void;
  stop(): void;
}

/** Speech.stop() returns a promise: a rejection (no TTS engine yet) must not surface as an unhandled error. */
function stopQuietly(): void {
  const pending: Promise<void> | undefined = Speech.stop();
  pending?.catch?.(() => undefined);
}

// ---------- one utterance at a time ----------

/** Increases with every new utterance / stop, so a late result of an older one is ignored. */
let session = 0;
let player: AudioPlayer | null = null;
let finish: (() => void) | null = null;

function done(): void {
  const f = finish;
  finish = null;
  f?.();
}

/** Stops whatever is speaking (boosted player or the engine) and reports the old utterance as done. */
function endCurrent(): void {
  session += 1;
  const p = player;
  player = null;
  if (p) {
    try {
      p.pause();
      p.remove();
    } catch {
      // ignore
    }
  }
  stopQuietly();
  done();
}

interface Utterance {
  text: string;
  /** BCP-47 tag for the engine. */
  language: string;
  voice?: string;
  rate: number;
  options?: SpeakOptions;
  onError?: () => void;
}

/** The engine's own playback (iOS, or when the boosted path is not available). */
function speakDirect(u: Utterance, my: number): void {
  const end = () => {
    if (my === session) done();
  };
  try {
    Speech.speak(u.text, {
      language: u.language,
      voice: u.voice,
      rate: u.rate,
      volume: 1,
      onStart: u.options?.onStart,
      onDone: end,
      onStopped: end,
      onError: () => {
        end();
        u.onError?.();
      },
    });
  } catch {
    end();
    u.onError?.();
  }
}

function say(u: Utterance): void {
  endCurrent();
  const my = session;
  finish = u.options?.onDone ?? null;
  if (!canSynthesize) {
    speakDirect(u, my);
    return;
  }
  void synthesizeSpeech(u.text, u.language, u.voice, u.rate).then(async (path) => {
    if (my !== session) return;
    if (!path) {
      speakDirect(u, my);
      return;
    }
    await audioSessionReady();
    if (my !== session) return;
    try {
      const next = createAudioPlayer({ uri: path.startsWith('file://') ? path : `file://${path}` });
      player = next;
      boostLearnerAudio(next, LOUDNESS_GAIN.speech);
      next.addListener('playbackStatusUpdate', (s) => {
        if (player !== next) return;
        if (s.didJustFinish || s.error) {
          player = null;
          try {
            next.remove();
          } catch {
            // ignore
          }
          done();
        }
      });
      next.play();
      u.options?.onStart?.();
    } catch {
      player = null;
      speakDirect(u, my);
    }
  });
}

const LOCALES: Record<Language, string> = { bs: 'bs-BA', de: 'de-DE', en: 'en-GB' };

export const deviceNarration: NarrationProvider = {
  speak(text, language, options) {
    say({ text, language: LOCALES[language], rate: 0.95, options });
  },
  stop() {
    endCurrent();
  },
};

// ---------- Arabic voice ----------

/** `unknown` until the engine was asked; `missing` when the TTS engine offers no Arabic voice at all. */
export type ArabicVoiceStatus = 'unknown' | 'available' | 'missing';

let status: ArabicVoiceStatus = 'unknown';
let voiceId: string | undefined;
let detection: Promise<ArabicVoiceStatus> | null = null;
const statusListeners = new Set<(s: ArabicVoiceStatus) => void>();
const missingListeners = new Set<() => void>();

function setStatus(next: ArabicVoiceStatus) {
  if (status === next) return;
  status = next;
  for (const listener of statusListeners) listener(next);
}

function isArabic(voice: Speech.Voice | null | undefined): voice is Speech.Voice {
  return typeof voice?.language === 'string' && voice.language.toLowerCase().startsWith('ar');
}

/**
 * Picks the best Arabic voice: Android lists voices that are not downloaded yet as well, so prefer the ones the engine
 * marks as installed/offline ("-local"), then any other Arabic voice ("-network" voices stream from Google when online).
 */
export function pickArabicVoice(voices: readonly Speech.Voice[]): Speech.Voice | null {
  const arabic = voices.filter(isArabic);
  if (arabic.length === 0) return null;
  const score = (v: Speech.Voice) => {
    const id = `${v.identifier} ${v.name}`.toLowerCase();
    let s = 0;
    if (id.includes('local')) s += 4;
    if (id.includes('network')) s -= 2;
    if (v.quality === Speech.VoiceQuality.Enhanced) s += 1;
    if (/^ar[-_](sa|xa)/i.test(v.language)) s += 1;
    return s;
  };
  return [...arabic].sort((a, b) => score(b) - score(a))[0] ?? null;
}

/** Asks the TTS engine once whether it has an Arabic voice. Never rejects. */
export function detectArabicVoice(): Promise<ArabicVoiceStatus> {
  if (!detection) {
    detection = Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const voice = pickArabicVoice(Array.isArray(voices) ? voices : []);
        voiceId = voice?.identifier;
        if (__DEV__) console.info(`[speech] Arabic voice: ${voice ? `${voice.identifier} (${voice.language})` : 'none'}`);
        setStatus(voice ? 'available' : 'missing');
        return status;
      })
      .catch(() => {
        setStatus('missing');
        return status;
      });
  }
  return detection;
}

export function arabicVoiceStatus(): ArabicVoiceStatus {
  return status;
}

/** Subscribe to Arabic voice status changes. Returns an unsubscribe function. */
export function onArabicVoiceStatus(listener: (s: ArabicVoiceStatus) => void): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

/** Called whenever the learner asked for Arabic speech but the device could not say it (UI shows the install hint). */
export function onArabicSpeechMissing(listener: () => void): () => void {
  missingListeners.add(listener);
  return () => {
    missingListeners.delete(listener);
  };
}

function reportMissing() {
  for (const listener of missingListeners) listener();
}

/** Forget the cached answer, e.g. when the learner comes back from the TTS settings after installing a voice. */
export function recheckArabicVoice(): Promise<ArabicVoiceStatus> {
  detection = null;
  setStatus('unknown');
  return detectArabicVoice();
}

/**
 * Arabic pronunciation for letters and words. Returns false when the device has no Arabic voice (the caller still gives
 * visual feedback; the app-wide hint explains how to install one).
 */
export function speakArabic(text: string, options: { onDone?: () => void } = {}): boolean {
  if (!text) return false;
  if (status === 'missing') {
    reportMissing();
    return false;
  }
  const speak = () =>
    say({
      text,
      language: 'ar',
      voice: voiceId,
      rate: 0.75,
      options: { onDone: options.onDone },
      // Typically: the voice data is not installed and the device is offline (Google TTS streams missing voices).
      onError: () => {
        if (__DEV__) console.warn('[speech] Arabic utterance failed');
        reportMissing();
      },
    });
  if (status === 'unknown') {
    void detectArabicVoice().then((s) => {
      if (s === 'available') speak();
      else reportMissing();
    });
    return true;
  }
  speak();
  return true;
}

/** Opens the system text-to-speech settings (where the Arabic voice data is installed). */
export async function openTextToSpeechSettings(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  for (const action of ['com.android.settings.TTS_SETTINGS', 'android.settings.ACCESSIBILITY_SETTINGS']) {
    try {
      await Linking.sendIntent(action);
      return true;
    } catch {
      // try the next one
    }
  }
  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  deviceNarration.stop();
}

/** Tests: forget the cached detection. */
export function resetArabicVoiceForTests(next: ArabicVoiceStatus = 'unknown', id?: string): void {
  status = next;
  voiceId = id;
  detection = next === 'unknown' ? null : Promise.resolve(next);
  statusListeners.clear();
  missingListeners.clear();
}
