import { Linking, Pressable, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { getSource, resolve } from '../content';
import { useSeerahI18n } from '../i18n';
import type { BlockKind, ContentBlock, EpisodeSources, Source } from '../models';
import { openNode } from '../navigation';
import { sourceShortLabel } from '../services/sources';
import { blockColors } from '../theme';
import { BookmarkButton } from './Controls';

const KIND_ICON: Record<BlockKind, IconName> = { fact: 'check', interpretation: 'scroll', reflection: 'feather' };

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  block: { borderLeftWidth: 4, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, backgroundColor: c.surface },
  refs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ref: { borderWidth: 1, borderColor: c.border, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 36, justifyContent: 'center' },
  legend: { gap: spacing.sm },
  legendRow: { borderRadius: radius.md, padding: spacing.md, gap: 6, backgroundColor: c.surface },
  legendRowNight: { backgroundColor: c.nightSoft },
  sourceCard: { gap: spacing.xs },
  sourceHead: { flexDirection: 'row', alignItems: 'center' },
  typeChip: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: c.goldSoft },
  sections: { gap: spacing.lg },
  section: { gap: spacing.sm },
  touch: { minHeight: TOUCH_TARGET },
}));

/** Label pill: Established fact / Historical interpretation / Reflection. */
export function KindTag({ kind }: { kind: BlockKind }) {
  const { c } = useTheme();
  const { t } = useSeerahI18n();
  const styles = useStyles();
  const col = blockColors(c, kind);
  return (
    <View style={[styles.tag, { backgroundColor: col.bg }]}>
      <Icon name={KIND_ICON[kind]} size={13} color={col.fg} strokeWidth={2.4} />
      <AppText variant="label" color={col.fg}>
        {t(`kind.${kind}`)}
      </AppText>
    </View>
  );
}

/** A statement labelled as established fact, historical interpretation or reflection, with its sources. */
export function BlockView({ block }: { block: ContentBlock }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const col = blockColors(c, block.kind);
  const sources = resolve(block.sourceIds, getSource);
  return (
    <View style={[styles.block, { borderLeftColor: col.fg }]}>
      <View accessible accessibilityLabel={`${t(`kind.${block.kind}`)}. ${l(block.text)}`} style={styles.section}>
        <KindTag kind={block.kind} />
        <AppText variant="reading">{l(block.text)}</AppText>
      </View>
      {sources.length ? (
        <View style={styles.refs}>
          {sources.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => openNode('source', s.id)}
              accessibilityRole="link"
              accessibilityLabel={`${t('type.source')}: ${sourceShortLabel(s)}`}
              style={styles.ref}
              hitSlop={6}
            >
              <AppText variant="tiny" color={c.goldText}>
                {sourceShortLabel(s)}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function KindLegend({ onNight }: { onNight?: boolean }) {
  const { c } = useTheme();
  const { t } = useSeerahI18n();
  const styles = useStyles();
  return (
    <View style={styles.legend}>
      {(['fact', 'interpretation', 'reflection'] as const).map((kind) => (
        <View key={kind} style={[styles.legendRow, onNight && styles.legendRowNight]}>
          <KindTag kind={kind} />
          <AppText variant="small" color={onNight ? c.onNightMuted : c.textMuted}>
            {t(`kind.${kind}.desc`)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** A structured source record (type, title, author, reference, notes, verified link). */
export function SourceCard({ source, compact }: { source: Source; compact?: boolean }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const host = source.url ? source.url.replace(/^https:\/\//, '').split('/')[0] : null;
  return (
    <Card style={styles.sourceCard}>
      <View style={styles.sourceHead}>
        <View style={styles.typeChip}>
          <AppText variant="label" color={c.goldText}>
            {t(`source.type.${source.type}`)}
          </AppText>
        </View>
        <View style={styles.flex} />
        <BookmarkButton type="source" id={source.id} />
      </View>
      <AppText variant="bodyBold">{source.type === 'quran' ? t('source.type.quran') : source.title}</AppText>
      {source.author ? (
        <AppText variant="small" color={c.textMuted}>
          {source.author}
        </AppText>
      ) : null}
      <AppText variant="small">{source.reference}</AppText>
      {!compact && source.notes ? (
        <AppText variant="small" color={c.textMuted}>
          {l(source.notes)}
        </AppText>
      ) : null}
      {source.url && host ? (
        <Button
          label={t('sources.open')}
          variant="secondary"
          icon="external"
          size="md"
          accessibilityHint={t('sources.openHint', { host })}
          onPress={() => Linking.openURL(source.url as string).catch(() => undefined)}
        />
      ) : null}
    </Card>
  );
}

/** Sources of an episode, grouped as primary, secondary and further reading. */
export function SourceSections({ sources }: { sources: EpisodeSources }) {
  const { c } = useTheme();
  const { t } = useSeerahI18n();
  const styles = useStyles();
  const groups = [
    { key: 'primary', title: t('sources.primary'), ids: sources.primary },
    { key: 'secondary', title: t('sources.secondary'), ids: sources.secondary },
    { key: 'further', title: t('sources.further'), ids: sources.further },
  ].filter((g) => g.ids.length > 0);
  return (
    <View style={styles.sections}>
      {groups.map((g) => (
        <View key={g.key} style={styles.section}>
          <AppText variant="label" color={c.textMuted} accessibilityRole="header">
            {g.title.toUpperCase()}
          </AppText>
          {resolve(g.ids, getSource).map((s) => (
            <SourceCard key={s.id} source={s} compact />
          ))}
        </View>
      ))}
    </View>
  );
}
