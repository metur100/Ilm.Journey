import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import type { MapQuestion } from '@/core/models';
import type { QuestionComponentProps } from '@/core/registry';
import { evaluateAnswer } from '@/core/services/quiz';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { isMapPlace } from '../content/places';
import { useStoriesI18n } from '../i18n';
import type { MapPlaceId } from '../models';
import { StoryMapArt } from './StoryMapArt';

const useStyles = makeStyles(() => ({ root: { gap: spacing.md } }));

/**
 * Renderer of the `map` question type (registered with `registerQuestionRenderer('map', …)`).
 * Tapping a place is the answer, so QuestionView's success/failure feedback is the tap feedback (this
 * module is imported by register.ts and must stay free of native audio imports).
 */
export function StoryMapQuestion({ question, onAnswered, locked }: QuestionComponentProps<MapQuestion>) {
  const { t } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const [picked, setPicked] = useState<MapPlaceId | null>(null);
  const places = question.places.filter(isMapPlace);
  const name = (id: string) => (isMapPlace(id) ? t(`place.${id}`) : id);

  const choose = (place: MapPlaceId) => {
    if (picked || locked) return;
    setPicked(place);
    onAnswered({ correct: evaluateAnswer(question, { type: 'place', place }), correctAnswer: name(question.correctPlace) });
  };

  return (
    <View style={styles.root}>
      <AppText variant="small" color={c.textMuted}>
        {t('q.map.hint')}
      </AppText>
      <StoryMapArt
        places={places}
        name={name}
        onPress={choose}
        disabled={!!picked || locked}
        pinState={(id) => (picked === null ? 'idle' : id === question.correctPlace ? 'right' : id === picked ? 'wrong' : 'idle')}
        placeLabel={(id) => {
          if (picked === null) return name(id);
          if (id === question.correctPlace) return `${name(id)}, ${t('a11y.correct')}`;
          return id === picked ? `${name(id)}, ${t('a11y.incorrect')}` : name(id);
        }}
      />
    </View>
  );
}
