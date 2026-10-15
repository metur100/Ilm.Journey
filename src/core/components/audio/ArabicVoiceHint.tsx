import { useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { useNamespace } from '@/core/i18n';
import { detectArabicVoice, onArabicSpeechMissing, openTextToSpeechSettings, recheckArabicVoice } from '@/core/services/speech';
import { radius, spacing, useTheme } from '@/core/theme';

import { audioI18n } from './i18n';

/** How long the hint stays when the learner does not act on it. */
export const HINT_DURATION_MS = 9000;

/**
 * App-wide, unobtrusive hint shown when the learner tapped "Listen" on Arabic but the device has no Arabic
 * text-to-speech voice (or could not reach it). Mounted once in the root layout; screens keep their visual feedback.
 */
export function ArabicVoiceHint() {
  const { t } = useNamespace(audioI18n);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedSettings = useRef(false);

  useEffect(() => {
    // Ask the TTS engine early (off the startup path) so the first "Listen" tap speaks without a delay.
    const warmUp = setTimeout(() => void detectArabicVoice(), 1500);
    const unsubscribe = onArabicSpeechMissing(() => {
      setVisible(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), HINT_DURATION_MS);
    });
    // Back from the TTS settings: the learner may have installed a voice.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && openedSettings.current) {
        openedSettings.current = false;
        void recheckArabicVoice();
      }
    });
    return () => {
      clearTimeout(warmUp);
      unsubscribe();
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!visible) return null;

  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        <View style={styles.row}>
          <Icon name="speaker" size={22} color={c.primaryText} />
          <View style={styles.text}>
            <AppText variant="bodyBold">{t('arabicVoice.title')}</AppText>
            <AppText variant="small" color={c.textMuted}>
              {t(Platform.OS === 'android' ? 'arabicVoice.bodyAndroid' : 'arabicVoice.bodyIos')}
            </AppText>
          </View>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={t('arabicVoice.close')} hitSlop={12}>
            <Icon name="close" size={20} color={c.textMuted} />
          </Pressable>
        </View>
        {Platform.OS === 'android' ? (
          <Button
            label={t('arabicVoice.open')}
            icon="settings"
            variant="secondary"
            onPress={() => {
              openedSettings.current = true;
              close();
              void openTextToSpeechSettings();
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.md, elevation: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  text: { flex: 1, gap: spacing.xs },
});
