import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { type CoreKey, useI18n } from '@/core/i18n';
import type { Accessory, Character, HairStyle, Headwear, HeroPattern, LanternStyle, Outfit, SkinTone } from '@/core/models';
import { useAppStore } from '@/core/store/appStore';
import { type HeroItem, requiredLevel } from '@/core/unlockables';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { Avatar, HAIR_COLORS, HEADWEAR_COLORS, HERO_PATTERNS, OUTFIT_COLORS, SKIN_TONES } from './Avatar';

const HAIR_STYLES: HairStyle[] = ['short', 'curly', 'long', 'buzz', 'bun'];
const HEADWEAR: Headwear[] = ['none', 'kufi', 'hijab', 'cap'];
const OUTFITS: Outfit[] = ['hoodie', 'thobe', 'jacket', 'abaya'];
const ACCESSORIES: Accessory[] = ['none', 'glasses', 'backpack', 'scarf', 'lantern'];
const LANTERNS: LanternStyle[] = ['classic', 'star', 'crescent'];

interface CharacterEditorProps {
  character: Character;
  onChange: (character: Character) => void;
}

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.lg },
  preview: {
    alignSelf: 'center',
    backgroundColor: c.goldSoft,
    borderRadius: 999,
    padding: spacing.md,
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  group: { gap: spacing.sm },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.surface,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: TOUCH_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchActive: { borderColor: c.text },
  swatchCell: { alignItems: 'center', gap: 2 },
  locked: { opacity: 0.45 },
  chipLocked: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.surfaceAlt },
}));

/**
 * The hero editor (onboarding and profile) with the v2 wardrobe: items that unlock with levels are shown locked with
 * "Level N" (core/unlockables.ts). Never used for prophets or other real persons.
 */
export function CharacterEditor({ character, onChange }: CharacterEditorProps) {
  const { t } = useI18n();
  const styles = useStyles();
  const level = useAppStore((s) => s.level);
  const set = <K extends keyof Character>(key: K, value: Character[K]) => onChange({ ...character, [key]: value });
  const lockOf = (item: HeroItem) => {
    const needed = requiredLevel(item);
    return needed > level ? needed : 0;
  };

  return (
    <View style={styles.root}>
      <View style={styles.preview} accessible accessibilityLabel={t('a11y.avatar')}>
        <Avatar character={character} size={150} />
      </View>
      <SwatchGroup title={t('character.skin')} colorsList={SKIN_TONES} selected={character.skinTone} onSelect={(i) => set('skinTone', i as SkinTone)} />
      <ChipGroup
        title={t('character.headwear')}
        options={HEADWEAR}
        labelKey={(o) => `character.headwear.${o}` as CoreKey}
        selected={character.headwear}
        onSelect={(o) => set('headwear', o)}
      />
      {character.headwear !== 'hijab' ? (
        <>
          <ChipGroup
            title={t('character.hair')}
            options={HAIR_STYLES}
            labelKey={(o) => `character.hair.${o}` as CoreKey}
            selected={character.hairStyle}
            onSelect={(o) => set('hairStyle', o)}
          />
          <SwatchGroup title={t('character.hairColor')} colorsList={HAIR_COLORS} selected={character.hairColor} onSelect={(i) => set('hairColor', i)} />
        </>
      ) : null}
      <ChipGroup
        title={t('character.outfit')}
        options={OUTFITS}
        labelKey={(o) => `character.outfit.${o}` as CoreKey}
        selected={character.outfit}
        onSelect={(o) => set('outfit', o)}
      />
      <SwatchGroup
        title={t('character.outfitColor')}
        colorsList={OUTFIT_COLORS}
        selected={character.outfitColor}
        onSelect={(i) => set('outfitColor', i)}
        lockedLevel={(i) => lockOf({ kind: 'outfitColor', index: i })}
      />
      {character.headwear !== 'none' ? (
        <SwatchGroup
          title={t('character.headwearColor')}
          colorsList={HEADWEAR_COLORS}
          selected={character.headwearColor ?? 0}
          onSelect={(i) => set('headwearColor', i)}
          lockedLevel={(i) => lockOf({ kind: 'headwearColor', index: i })}
          firstLabel={t('character.headwearColor.match')}
        />
      ) : null}
      <ChipGroup
        title={t('character.accessory')}
        options={ACCESSORIES}
        labelKey={(o) => `character.accessory.${o}` as CoreKey}
        selected={character.accessory}
        onSelect={(o) => set('accessory', o)}
      />
      {character.accessory === 'scarf' || character.accessory === 'backpack' ? (
        <ChipGroup<HeroPattern>
          title={t(character.accessory === 'scarf' ? 'character.scarfPattern' : 'character.backpackPattern')}
          options={[...HERO_PATTERNS]}
          labelKey={(o) => `character.pattern.${o}` as CoreKey}
          selected={(character.accessory === 'scarf' ? character.scarfPattern : character.backpackPattern) ?? 'plain'}
          onSelect={(o) => set(character.accessory === 'scarf' ? 'scarfPattern' : 'backpackPattern', o)}
          lockedLevel={(o) => lockOf({ kind: character.accessory === 'scarf' ? 'scarfPattern' : 'backpackPattern', id: o })}
        />
      ) : null}
      {character.accessory === 'lantern' ? (
        <ChipGroup<LanternStyle>
          title={t('character.lanternStyle')}
          options={LANTERNS}
          labelKey={(o) => `character.lantern.${o}` as CoreKey}
          selected={character.lanternStyle ?? 'classic'}
          onSelect={(o) => set('lanternStyle', o)}
          lockedLevel={(o) => lockOf({ kind: 'lanternStyle', id: o })}
        />
      ) : null}
    </View>
  );
}

function ChipGroup<T extends string>({
  title,
  options,
  labelKey,
  selected,
  onSelect,
  lockedLevel,
}: {
  title: string;
  options: T[];
  labelKey: (option: T) => CoreKey;
  selected: T;
  onSelect: (option: T) => void;
  /** Level needed for a locked option (0 = available). */
  lockedLevel?: (option: T) => number;
}) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  return (
    <View style={styles.group}>
      <AppText variant="label" color={c.textMuted}>
        {title.toUpperCase()}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {options.map((option) => {
          const active = option === selected;
          const label = t(labelKey(option));
          const lock = lockedLevel?.(option) ?? 0;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled: lock > 0 }}
              accessibilityLabel={lock > 0 ? t('character.lockedOption', { group: title, value: label, level: lock }) : t('character.option', { group: title, value: label })}
              onPress={() => {
                if (lock > 0) {
                  feedback.failure();
                  return;
                }
                feedback.tap();
                onSelect(option);
              }}
              style={[styles.chip, active && styles.chipActive, lock > 0 && styles.chipLocked]}
            >
              {lock > 0 ? (
                <View style={styles.chipLocked}>
                  <Icon name="lock" size={14} color={c.textMuted} />
                  <AppText variant="small" color={c.textMuted}>
                    {`${label} · ${t('common.level', { level: lock })}`}
                  </AppText>
                </View>
              ) : (
                <AppText variant="small" color={active ? c.onPrimary : c.text}>
                  {label}
                </AppText>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SwatchGroup({
  title,
  colorsList,
  selected,
  onSelect,
  lockedLevel,
  firstLabel,
}: {
  title: string;
  colorsList: readonly string[];
  selected: number;
  onSelect: (index: number) => void;
  lockedLevel?: (index: number) => number;
  /** Label of swatch 0 when it means "matching" (empty colour). */
  firstLabel?: string;
}) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  return (
    <View style={styles.group}>
      <AppText variant="label" color={c.textMuted}>
        {title.toUpperCase()}
      </AppText>
      <View style={styles.swatches}>
        {colorsList.map((color, index) => {
          const active = index === selected;
          const lock = lockedLevel?.(index) ?? 0;
          const value = index === 0 && firstLabel ? firstLabel : String(index + 1);
          return (
            <View key={`${index}-${color}`} style={styles.swatchCell}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: active, disabled: lock > 0 }}
                accessibilityLabel={lock > 0 ? t('character.lockedOption', { group: title, value, level: lock }) : t('character.option', { group: title, value })}
                onPress={() => {
                  if (lock > 0) {
                    feedback.failure();
                    return;
                  }
                  feedback.tap();
                  onSelect(index);
                }}
                style={[styles.swatch, { backgroundColor: color || c.surfaceAlt }, !color && { borderColor: c.border }, active && styles.swatchActive, lock > 0 && styles.locked]}
              >
                {lock > 0 ? (
                  <Icon name="lock" size={18} color={c.onAccent} />
                ) : active ? (
                  <Icon name="check" size={20} color={color ? c.onAccent : c.text} strokeWidth={3} />
                ) : !color ? (
                  <Icon name="sparkle" size={18} color={c.textMuted} />
                ) : null}
              </Pressable>
              {lock > 0 ? (
                <AppText variant="tiny" color={c.textMuted}>
                  {t('common.level', { level: lock })}
                </AppText>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
