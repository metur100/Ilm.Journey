import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { TopBar } from '@/core/components/ui/TopBar';
import type { LocalizedText } from '@/core/models';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';
import { STORIES } from '@/features/stories/content';

import { useLearnI18n } from '../i18n';

const TITLE: LocalizedText = {
  en: 'The 25 prophets of the Quran',
  de: 'Die 25 Propheten des Korans',
  bs: 'Svih 25 poslanika Kur’ana',
};

const INTRO: LocalizedText = {
  en: 'Allah sent prophets to every people. The Quran names twenty-five of them, from Adam to Muhammad ﷺ. Tap a prophet to read his story, scene by scene.',
  de: 'Allah sandte zu jedem Volk Propheten. Der Koran nennt fünfundzwanzig von ihnen, von Adam bis Muhammad ﷺ. Tippe einen Propheten an, um seine Geschichte Szene für Szene zu lesen.',
  bs: 'Allah je svakom narodu poslao poslanike. Kur’an imenuje dvadeset pet od njih, od Adema do Muhammeda ﷺ. Dodirni poslanika da pročitaš njegovu priču, scenu po scenu.',
};

const HONORIFIC: Record<string, LocalizedText> = {
  'alayhis-salam': { en: 'peace be upon him', de: 'Friede sei mit ihm', bs: 'a.s.' },
  'sallallahu-alayhi-wa-sallam': { en: 'ﷺ', de: 'ﷺ', bs: 'ﷺ' },
};

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: 120 },
  hero: { gap: spacing.sm },
  body: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  number: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primarySoft },
  texts: { flex: 1, gap: 2 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4 },
}));

export default function ProphetsGuideScreen() {
  const { l } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const theme = topicThemes.prophets;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader gradient={theme.gradient}>
        <TopBar dark />
        <View style={styles.hero}>
          <AppText variant="display" color={c.onNight} accessibilityRole="header">
            {l(TITLE)}
          </AppText>
          <AppText variant="body" color={c.onNight}>
            {l(INTRO)}
          </AppText>
          <AppText variant="small" color={c.onNight}>
            {STORIES.length} · {l({ en: 'prophets', de: 'Propheten', bs: 'poslanika' })}
          </AppText>
        </View>
      </HeroHeader>
      <View style={styles.body}>
        {STORIES.map((story, index) => (
          <Card key={story.id} onPress={() => router.push({ pathname: '/story/[id]', params: { id: story.id } })} accessibilityLabel={`${story.prophetName.bs}: ${story.title.bs}`}>
            <View style={styles.row}>
              <View style={styles.number}>
                <AppText variant="bodyBold" color={c.primaryText}>
                  {index + 1}
                </AppText>
              </View>
              <View style={styles.texts}>
                <AppText variant="bodyBold">
                  {l(story.prophetName)} {HONORIFIC[story.honorific] ? l(HONORIFIC[story.honorific]) : ''} – {l(story.title)}
                </AppText>
                <AppText variant="small" color={c.textMuted}>
                  {l(story.description)}
                </AppText>
                <View style={styles.place}>
                  <Icon name="pin" size={13} color={c.textMuted} />
                  <AppText variant="tiny" color={c.textMuted}>
                    {l(story.place)}
                  </AppText>
                </View>
              </View>
              <Icon name="chevron" size={18} color={c.textMuted} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
