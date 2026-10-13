import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components/ui/AppText';
import { PatternBackground } from '@/core/components/ui/PatternBackground';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useI18n } from '@/core/i18n';
import { makeStyles, spacing, useTheme } from '@/core/theme';

/** welcome → language → who is learning → name → character → how it works → start */
export const ONBOARDING_STEPS = 7;

interface OnboardingFrameProps {
  step: number;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  topRow: { minHeight: 56 },
  spacer: { height: 56 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotOn: { backgroundColor: c.gold },
  dotCurrent: { width: 22 },
  content: { padding: spacing.xl, gap: spacing.lg, flexGrow: 1 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.sm },
}));

/** Shared night-sky layout for every onboarding step (dark in both schemes). */
export function OnboardingFrame({ step, title, subtitle, children, footer, showBack = true }: OnboardingFrameProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  useStatusBar(true);
  return (
    <LinearGradient colors={c.headerGradient} style={styles.root}>
      <PatternBackground />
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.topRow}>{showBack ? <TopBar dark onBack={() => router.back()} /> : <View style={styles.spacer} />}</View>
          <View style={styles.dots} accessible accessibilityLabel={t('onboarding.step', { current: step, total: ONBOARDING_STEPS })}>
            {Array.from({ length: ONBOARDING_STEPS }, (_, i) => (
              <View key={i} style={[styles.dot, i < step && styles.dotOn, i === step - 1 && styles.dotCurrent]} />
            ))}
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {title ? (
              <AppText variant="display" color={c.onNight} align="center" accessibilityRole="header">
                {title}
              </AppText>
            ) : null}
            {subtitle ? (
              <AppText variant="body" color={c.onNightMuted} align="center">
                {subtitle}
              </AppText>
            ) : null}
            {children}
          </ScrollView>
          <View style={styles.footer}>{footer}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
