import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { useSeerahI18n } from '../i18n';
import type { ReflectionQuestion } from '../models';
import { MAX_REFLECTION_LENGTH } from '../services/engine';
import { useSeerahStore } from '../store/seerahStore';
import { blockColors } from '../theme';
import { KindTag } from './Blocks';

const useStyles = makeStyles((c) => ({
  card: { gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  options: { gap: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, minHeight: 52, borderColor: c.border, backgroundColor: c.surface },
  input: {
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    color: c.text,
    padding: spacing.md,
    fontFamily: fonts.regular,
    textAlignVertical: 'top',
  },
}));

/**
 * THINK ABOUT IT: write a reflection, choose a ready-made one, or simply continue.
 * Reflections are saved locally and never evaluated.
 */
export function ReflectionCard({ question, episodeId }: { question: ReflectionQuestion; episodeId: string }) {
  const { c, scale } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const saved = useSeerahStore((s) => s.reflections[question.id]);
  const saveReflection = useSeerahStore((s) => s.saveReflection);
  const [text, setText] = useState(saved?.text ?? '');
  const [option, setOption] = useState<number | null>(saved?.optionIndex ?? null);
  const dirty = text.trim() !== (saved?.text ?? '') || option !== (saved?.optionIndex ?? null);
  const accent = blockColors(c, 'reflection');

  const save = () => {
    saveReflection({ questionId: question.id, episodeId, text, optionIndex: option });
  };

  return (
    <Card tone="alt" style={styles.card}>
      <KindTag kind="reflection" />
      <AppText variant="heading">{l(question.prompt)}</AppText>

      <AppText variant="label" color={c.textMuted}>
        {t('reflection.select').toUpperCase()}
      </AppText>
      <View style={styles.options} accessibilityRole="radiogroup">
        {question.options.map((o, i) => {
          const active = option === i;
          return (
            <Pressable
              key={i}
              onPress={() => setOption(active ? null : i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, checked: active }}
              accessibilityLabel={l(o)}
              style={[styles.option, active && { borderColor: accent.fg, backgroundColor: accent.bg }]}
            >
              <Icon name={active ? 'check' : 'feather'} size={18} color={active ? accent.fg : c.textMuted} />
              <AppText variant="body" style={styles.flex}>
                {l(o)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText variant="label" color={c.textMuted}>
        {t('reflection.write').toUpperCase()}
      </AppText>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('reflection.placeholder')}
        placeholderTextColor={c.textMuted}
        multiline
        maxLength={MAX_REFLECTION_LENGTH}
        accessibilityLabel={t('reflection.write')}
        maxFontSizeMultiplier={1.6}
        style={[styles.input, { fontSize: 16 * scale }]}
      />
      <View style={styles.row}>
        <Button
          label={saved && !dirty ? t('reflection.saved') : t('reflection.save')}
          icon={saved && !dirty ? 'check' : 'feather'}
          onPress={save}
          disabled={!dirty}
          size="md"
          fullWidth={false}
        />
        {saved ? (
          <Button
            label={t('reflection.clear')}
            variant="ghost"
            size="md"
            fullWidth={false}
            onPress={() => {
              setText('');
              setOption(null);
              saveReflection({ questionId: question.id, episodeId, text: '', optionIndex: null });
            }}
          />
        ) : null}
      </View>
      <AppText variant="tiny" color={c.textMuted}>
        {t('reflection.note')}
      </AppText>
    </Card>
  );
}
