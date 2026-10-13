import { View } from 'react-native';

import { useI18n } from '@/core/i18n';
import type { LocalizedText, SourceRef } from '@/core/models';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

const useStyles = makeStyles((c) => ({
  box: { backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  note: { backgroundColor: c.infoSoft },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
}));

/** Lists the references a lesson, story or question is based on. */
export function SourceList({ sources }: { sources?: SourceRef[] }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  if (!sources || sources.length === 0) return null;
  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Icon name="book" size={16} color={c.textMuted} />
        <AppText variant="label" color={c.textMuted}>
          {t('common.sources').toUpperCase()}
        </AppText>
      </View>
      {sources.map((s) => (
        <AppText key={`${s.sourceName}-${s.sourceReference}`} variant="small" color={c.textMuted}>
          {s.sourceReference && s.sourceReference !== '—' ? `${s.sourceName} ${s.sourceReference}` : s.sourceName}
        </AppText>
      ))}
    </View>
  );
}

/** Highlights that legitimate scholarly differences exist on this topic. */
export function DifferenceNote({ note }: { note?: LocalizedText }) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  if (!note) return null;
  return (
    <View style={[styles.box, styles.note]}>
      <View style={styles.header}>
        <Icon name="info" size={16} color={c.info} />
        <AppText variant="label" color={c.info}>
          {t('common.scholarsDiffer').toUpperCase()}
        </AppText>
      </View>
      <AppText variant="small" color={c.text}>
        {l(note)}
      </AppText>
    </View>
  );
}
