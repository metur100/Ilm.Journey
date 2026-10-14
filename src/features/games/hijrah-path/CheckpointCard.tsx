import { ScrollView, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { SourceList } from '@/core/components/ui/SourceList';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, shadows, spacing, useTheme } from '@/core/theme';

import { type Checkpoint, type SeerahBlock, sourceRefs } from './content';

const useStyles = makeStyles((c) => ({
  card: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.goldBorder, ...shadows(c.shadow).raised },
  scroll: { padding: spacing.lg, gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  art: { width: 60, height: 60, borderRadius: 30, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  flex: { flex: 1, gap: 2 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1 },
  fact: { backgroundColor: c.primarySoft, borderColor: c.primaryBorder },
  interpretation: { backgroundColor: c.goldSoft, borderColor: c.goldBorder },
  muted: { backgroundColor: c.surfaceAlt, borderColor: c.border },
  block: { gap: spacing.xs },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
}));

/** Label pill of a Seerah block: "Established fact" or "Historical interpretation" (as in the Seerah feature). */
export function KindPill({ kind, t }: { kind: SeerahBlock['kind']; t: GameApi['t'] }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.pill, kind === 'fact' ? styles.fact : styles.interpretation]}>
      <AppText variant="label" color={kind === 'fact' ? c.primaryText : c.goldText}>
        {t(`label.${kind}`)}
      </AppText>
    </View>
  );
}

interface CheckpointCardProps {
  checkpoint: Checkpoint;
  number: number;
  /** Full cards show every block with its label and sources; short cards (level 3 tracing) only title and date. */
  full: boolean;
  maxHeight: number;
  onContinue: () => void;
  t: GameApi['t'];
  l: GameApi['l'];
}

/** The card a checkpoint reveals: title, date with its certainty, the Seerah blocks with labels and sources. */
export function CheckpointCard({ checkpoint, number, full, maxHeight, onContinue, t, l }: CheckpointCardProps) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.card, { maxHeight }]} accessibilityLiveRegion="polite">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <View style={styles.art}>
            <Art name={checkpoint.art} size={52} />
          </View>
          <View style={styles.flex}>
            <AppText variant="label" color={c.goldText}>
              {t('play.stop', { number, total: 5 }).toUpperCase()}
            </AppText>
            <AppText variant="heading" accessibilityRole="header" accessibilityLabel={t('a11y.card', { number, title: l(checkpoint.title) })}>
              {l(checkpoint.title)}
            </AppText>
          </View>
        </View>
        <View style={styles.pills}>
          <View style={[styles.pill, styles.muted]}>
            <AppText variant="tiny">{l(checkpoint.date.label)}</AppText>
          </View>
          <View style={[styles.pill, styles.muted]}>
            <AppText variant="tiny" color={c.textMuted}>
              {t(`certainty.${checkpoint.date.certainty}`)}
            </AppText>
          </View>
          {checkpoint.approximate ? (
            <View style={[styles.pill, styles.interpretation]}>
              <AppText variant="tiny" color={c.goldText}>
                {t('play.approxPlace')}
              </AppText>
            </View>
          ) : null}
        </View>
        {full
          ? checkpoint.blocks.map((block, i) => (
              <View key={i} style={styles.block}>
                <View style={styles.pills}>
                  <KindPill kind={block.kind} t={t} />
                </View>
                <AppText variant="body">{l(block.text)}</AppText>
                <SourceList sources={sourceRefs(block.sourceIds)} />
              </View>
            ))
          : null}
        {full && checkpoint.date.note ? (
          <AppText variant="small" color={c.textMuted}>
            {l(checkpoint.date.note)}
          </AppText>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t('play.continue')} iconRight="chevron" onPress={onContinue} />
      </View>
    </View>
  );
}
