import { ScrollView, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { SourceList } from '@/core/components/ui/SourceList';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, shadows, spacing, useTheme } from '@/core/theme';

import { type SeerahBlock, type SeerahDate, sourceRefs } from './content';

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
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
}));

interface BlockCardProps {
  /** Small heading above the title (e.g. the part's name). */
  eyebrow: string;
  title: string;
  art: string;
  block: SeerahBlock;
  date: SeerahDate | null;
  maxHeight: number;
  onContinue: () => void;
  t: GameApi['t'];
  l: GameApi['l'];
}

/** The card a placed part reveals: the Seerah block with its label ("Established fact" …), date and sources. */
export function BlockCard({ eyebrow, title, art, block, date, maxHeight, onContinue, t, l }: BlockCardProps) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.card, { maxHeight }]} accessibilityLiveRegion="polite">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <View style={styles.art}>
            <Art name={art} size={52} />
          </View>
          <View style={styles.flex}>
            <AppText variant="label" color={c.goldText}>
              {eyebrow.toUpperCase()}
            </AppText>
            <AppText variant="heading" accessibilityRole="header">
              {title}
            </AppText>
          </View>
        </View>
        <View style={styles.pills}>
          <View style={[styles.pill, block.kind === 'fact' ? styles.fact : styles.interpretation]}>
            <AppText variant="label" color={block.kind === 'fact' ? c.primaryText : c.goldText}>
              {t(`label.${block.kind}`)}
            </AppText>
          </View>
          {date ? (
            <>
              <View style={[styles.pill, styles.muted]}>
                <AppText variant="tiny">{l(date.label)}</AppText>
              </View>
              <View style={[styles.pill, styles.muted]}>
                <AppText variant="tiny" color={c.textMuted}>
                  {t(`certainty.${date.certainty}`)}
                </AppText>
              </View>
            </>
          ) : null}
        </View>
        <AppText variant="body">{l(block.text)}</AppText>
        {date?.note ? (
          <AppText variant="small" color={c.textMuted}>
            {l(date.note)}
          </AppText>
        ) : null}
        <SourceList sources={sourceRefs(block.sourceIds)} />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t('play.continue')} iconRight="chevron" onPress={onContinue} />
      </View>
    </View>
  );
}
