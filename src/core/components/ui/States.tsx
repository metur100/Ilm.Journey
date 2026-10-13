import { ActivityIndicator, View } from 'react-native';

import { makeStyles, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

const useStyles = makeStyles((c) => ({
  root: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  fill: { flex: 1 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  errorCircle: { backgroundColor: c.errorSoft },
}));

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'sparkle', title, body, actionLabel, onAction }: EmptyStateProps) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={34} color={c.primaryText} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={c.textMuted} align="center">
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} fullWidth={false} /> : null}
    </View>
  );
}

export function LoadingState({ label }: { label?: string }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.root, styles.fill]} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={c.gold} />
      {label ? (
        <AppText variant="small" color={c.textMuted}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

export function ErrorState({ title, body, actionLabel, onAction }: ErrorStateProps) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.root, styles.fill]}>
      <View style={[styles.iconCircle, styles.errorCircle]}>
        <Icon name="info" size={34} color={c.error} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="body" color={c.textMuted} align="center">
        {body}
      </AppText>
      <Button label={actionLabel} onPress={onAction} fullWidth={false} />
    </View>
  );
}
