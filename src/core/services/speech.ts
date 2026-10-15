import * as Speech from 'expo-speech';
import { Linking, Platform } from 'react-native';

import type { Language } from '../models';

/**
 * Optional audio layer. Everything here uses the device's own text-to-speech engine, so no audio files are bundled.
 * See docs/AUDIO.md.
 *
 * Arabic needs care: Android's TTS engines only ship the system language by default. When the Arabic voice data is
 * missing, expo-speech silently falls back to the default (e.g. English) voice, which reads Arabic letters as
 * nothing at all – the learner hears silence. So we pick an Arabic voice explicitly and tell the learner (once,
 * inline) how to install one when the device has none.
 *
 * A future version can swap `NarrationProvider` for recorded narration by human readers.
 */
export interface NarrationProvider {
  speak(text: string, language: Language): void;
  stop(): void;
}

const LOCALES: Record<Language, string> = { bs: 'bs-BA', de: 'de-DE', en: 'en-GB' };

export const deviceNarration: NarrationProvider = {
  speak(text, language) {
    try {
      Speech.stop();
      Speech.speak(text, { language: LOCALES[language], rate: 0.95 });
    } catch {
      // Narration is optional.
    }
  },
  stop() {
    try {
      Speech.stop();
    } catch {
      // ignore
    }
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
  const say = () => {
    try {
      Speech.stop();
      Speech.speak(text, {
        language: 'ar',
        voice: voiceId,
        rate: 0.75,
        onDone: options.onDone,
        // Typically: the voice data is not installed and the device is offline (Google TTS streams missing voices).
        onError: () => {
          if (__DEV__) console.warn('[speech] Arabic utterance failed');
          reportMissing();
        },
      });
    } catch {
      reportMissing();
    }
  };
  if (status === 'unknown') {
    void detectArabicVoice().then((s) => {
      if (s === 'available') say();
      else reportMissing();
    });
    return true;
  }
  say();
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
