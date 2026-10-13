import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Dialog } from '@/core/components/ui/AppModal';
import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { Screen } from '@/core/components/ui/Screen';
import { ChoiceRow, LinkRow, ToggleRow } from '@/core/components/ui/SettingRow';
import { TopBar } from '@/core/components/ui/TopBar';
import { LANGUAGE_NAMES, LOCALE_TAGS, useI18n } from '@/core/i18n';
import { LANGUAGES, type ThemeMode } from '@/core/models';
import { ensurePermission, REMINDER_HOURS } from '@/core/services/notifications';
import { stopSpeaking } from '@/core/services/speech';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

const useStyles = makeStyles(() => ({
  section: { gap: spacing.sm },
  card: { gap: spacing.xs },
  version: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
}));

export default function SettingsScreen() {
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const [confirmReset, setConfirmReset] = useState(false);
  const [denied, setDenied] = useState(false);

  const doReset = async () => {
    setConfirmReset(false);
    await resetProgress();
    router.replace('/onboarding');
  };

  const toggleReminder = async (value: boolean) => {
    setDenied(false);
    if (value) {
      const permission = await ensurePermission(language);
      if (permission !== 'granted') {
        setDenied(true);
        return;
      }
    }
    updateSettings({ reminderEnabled: value });
  };

  const time = (hour: number) => new Date(2000, 0, 1, hour).toLocaleTimeString(LOCALE_TAGS[language], { hour: '2-digit', minute: '2-digit' });

  return (
    <Screen header={<TopBar title={t('settings.title')} />}>
      <Section title={t('settings.general')}>
        <AppText variant="bodyBold">{t('settings.language')}</AppText>
        <ChoiceRow
          label={t('settings.language')}
          options={LANGUAGES.map((lang) => ({ value: lang, label: LANGUAGE_NAMES[lang] }))}
          value={settings.language}
          onChange={(lang) => updateSettings({ language: lang })}
        />
        <AppText variant="bodyBold">{t('settings.theme')}</AppText>
        <ChoiceRow
          label={t('settings.theme')}
          options={THEME_MODES.map((mode) => ({ value: mode, label: t(`settings.theme.${mode}`) }))}
          value={settings.themeMode}
          onChange={(mode) => updateSettings({ themeMode: mode })}
        />
        <ToggleRow icon="speaker" label={t('settings.sound')} value={settings.sound} onChange={(v) => updateSettings({ sound: v })} />
        <ToggleRow icon="sparkle" label={t('settings.haptics')} value={settings.haptics} onChange={(v) => updateSettings({ haptics: v })} />
        <ToggleRow
          icon="book"
          label={t('settings.narration')}
          description={t('settings.narrationDesc')}
          value={settings.narration}
          onChange={(v) => {
            if (!v) stopSpeaking();
            updateSettings({ narration: v });
          }}
        />
      </Section>

      <Section title={t('settings.accessibility')}>
        <ToggleRow icon="eye" label={t('settings.largeText')} value={settings.largeText} onChange={(v) => updateSettings({ largeText: v })} />
        <ToggleRow icon="sun" label={t('settings.highContrast')} value={settings.highContrast} onChange={(v) => updateSettings({ highContrast: v })} />
        <ToggleRow icon="shield" label={t('settings.reducedMotion')} value={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
      </Section>

      <Section title={t('settings.reminders')}>
        <ToggleRow icon="bell" label={t('settings.reminder')} description={t('settings.reminderDesc')} value={settings.reminderEnabled} onChange={toggleReminder} />
        {denied ? (
          <AppText variant="small" color={c.error}>
            {t('settings.reminderDenied')}
          </AppText>
        ) : null}
        {settings.reminderEnabled ? (
          <>
            <AppText variant="small" color={c.textMuted}>
              {t('settings.reminderTime', { time: time(settings.reminderHour) })}
            </AppText>
            <ChoiceRow
              label={t('settings.reminderTime', { time: time(settings.reminderHour) })}
              options={REMINDER_HOURS.map((h) => ({ value: h as number, label: time(h) }))}
              value={settings.reminderHour}
              onChange={(h) => updateSettings({ reminderHour: h })}
            />
          </>
        ) : null}
      </Section>

      <Section title={t('settings.info')}>
        <LinkRow icon="info" label={t('settings.about')} onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'about' } })} />
        <LinkRow icon="shield" label={t('settings.privacy')} onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'privacy' } })} />
        <LinkRow icon="book" label={t('settings.sources')} onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'sources' } })} />
      </Section>

      <Section title={t('settings.data')}>
        <LinkRow icon="trash" label={t('settings.reset')} onPress={() => setConfirmReset(true)} danger />
        <AppText variant="small" color={c.textMuted}>
          {t('settings.resetDesc')}
        </AppText>
      </Section>

      <View style={styles.version}>
        <Icon name="star" size={18} color={c.gold} />
        <AppText variant="tiny" color={c.textMuted}>
          {t('app.name')} · {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })} · {t('app.credit')}
        </AppText>
      </View>

      <Dialog
        visible={confirmReset}
        title={t('settings.resetTitle')}
        body={t('settings.resetBody')}
        confirmLabel={t('settings.resetConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
        destructive
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <AppText variant="label" color={c.textMuted} accessibilityRole="header">
        {title.toUpperCase()}
      </AppText>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}
