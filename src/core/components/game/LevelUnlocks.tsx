import { View } from 'react-native';

import { Art } from '@/core/art';
import { HEADWEAR_COLORS, OUTFIT_COLORS } from '@/core/components/character/Avatar';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { gardenArt } from '@/core/garden/elements';
import { type CoreKey, useI18n } from '@/core/i18n';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import type { HeroItem, LevelUnlocks as Unlocks } from '@/core/unlockables';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.sm, alignSelf: 'stretch' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  item: { width: 92, alignItems: 'center', gap: 4, padding: spacing.sm, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.goldSoft },
}));

export function heroItemLabelKey(item: HeroItem): CoreKey {
  switch (item.kind) {
    case 'outfitColor':
      return 'unlock.outfitColor';
    case 'headwearColor':
      return 'unlock.headwearColor';
    case 'scarfPattern':
      return 'unlock.scarfPattern';
    case 'backpackPattern':
      return 'unlock.backpackPattern';
    case 'lanternStyle':
      return 'unlock.lanternStyle';
  }
}

/** What a level-up unlocked: new hero items (wardrobe) and garden elements. */
export function LevelUnlocks({ unlocks }: { unlocks: Unlocks }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  if (unlocks.hero.length === 0 && unlocks.garden.length === 0) return null;
  return (
    <View style={styles.root}>
      <AppText variant="label" color={c.goldText} align="center">
        {t('unlock.title').toUpperCase()}
      </AppText>
      <View style={styles.grid}>
        {unlocks.hero.map((item, i) => {
          const label = t(heroItemLabelKey(item));
          const color = item.kind === 'outfitColor' ? OUTFIT_COLORS[item.index] : item.kind === 'headwearColor' ? HEADWEAR_COLORS[item.index] : null;
          const detail = 'id' in item ? t((item.kind === 'lanternStyle' ? `character.lantern.${item.id}` : `character.pattern.${item.id}`) as CoreKey) : null;
          return (
            <View key={`hero-${i}`} style={styles.item} accessible accessibilityLabel={detail ? `${label}: ${detail}` : label}>
              {color ? (
                <View style={[styles.swatch, { backgroundColor: color }]} />
              ) : (
                <View style={styles.icon}>
                  <Icon name={item.kind === 'lanternStyle' ? 'lantern' : 'sparkle'} size={22} color={c.goldText} />
                </View>
              )}
              <AppText variant="tiny" align="center" numberOfLines={2}>
                {detail ? `${label}: ${detail}` : label}
              </AppText>
            </View>
          );
        })}
        {unlocks.garden.map((element) => (
          <View key={element.id} style={styles.item} accessible accessibilityLabel={`${t('unlock.garden')}: ${t(`garden.el.${element.id}` as CoreKey)}`}>
            <Art name={gardenArt(element.id)} size={40} />
            <AppText variant="tiny" align="center" numberOfLines={2}>
              {t(`garden.el.${element.id}` as CoreKey)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}
