import React from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { makeStyles, radius, shadows, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Button } from './Button';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissable?: boolean;
}

const useStyles = makeStyles((c) => ({
  backdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows(c.shadow).raised,
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
}));

/** Centred card modal with dimmed backdrop. */
export function AppModal({ visible, onClose, children, dismissable = true }: AppModalProps) {
  const reduced = useReducedMotion();
  const styles = useStyles();
  return (
    <RNModal visible={visible} transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissable ? onClose : undefined}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <View style={styles.card} accessibilityViewIsModal>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

interface DialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

/** Confirmation dialog (e.g. before resetting progress or leaving a unit). */
export function Dialog({ visible, title, body, confirmLabel, cancelLabel, onConfirm, onCancel, destructive }: DialogProps) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <AppModal visible={visible} onClose={onCancel}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="body" color={c.textMuted}>
        {body}
      </AppText>
      <View style={styles.actions}>
        <Button label={confirmLabel} onPress={onConfirm} variant={destructive ? 'danger' : 'primary'} />
        <Button label={cancelLabel} onPress={onCancel} variant="secondary" />
      </View>
    </AppModal>
  );
}
