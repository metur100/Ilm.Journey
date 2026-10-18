import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { Art, hasArt } from '../../art';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { SourceList } from '../../components/ui/SourceList';
import { useI18n } from '../../i18n';
import { makeStyles, radius, shadows, spacing, useTheme } from '../../theme';
import type { GameFact } from '../types';

const useStyles = makeStyles((c) => ({
  fact: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: spacing.lg, gap: spacing.md, ...shadows(c.shadow).card },
  factHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  factArt: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  factText: { flex: 1 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: spacing.md },
}));

/** "You learned" card: illustration, the fact and its sources. */
export function FactCard({ fact }: { fact: GameFact }) {
  const { l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.fact}>
      <View style={styles.factHead}>
        <View style={styles.factArt}>{fact.art && hasArt(fact.art) ? <Art name={fact.art} size={52} /> : <Icon name="sparkle" size={30} color={c.goldText} />}</View>
        <AppText variant="body" style={styles.factText}>
          {l(fact.text)}
        </AppText>
      </View>
      <SourceList sources={fact.sources} />
    </View>
  );
}

/** Three stars that pop in one after another (static under reduced motion). */
export function StarsBurst({ stars, reduced, size = 56 }: { stars: number; reduced: boolean; size?: number }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const values = useState(() => [0, 1, 2].map(() => new Animated.Value(reduced ? 1 : 0)))[0];

  useEffect(() => {
    if (reduced) return;
    Animated.stagger(
      220,
      values.map((v) => Animated.spring(v, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true })),
    ).start();
  }, [reduced, values]);

  return (
    <View style={styles.starsRow} accessible accessibilityLabel={t('a11y.stars', { count: stars })}>
      {values.map((v, i) => {
        const earned = i < stars;
        const big = i === 1;
        return (
          <Animated.View key={i} style={{ transform: [{ scale: v }, { translateY: big ? -8 : 0 }] }}>
            <Icon name={earned ? 'star' : 'starOutline'} size={big ? size * 1.25 : size} color={earned ? c.gold : c.locked} />
          </Animated.View>
        );
      })}
    </View>
  );
}
