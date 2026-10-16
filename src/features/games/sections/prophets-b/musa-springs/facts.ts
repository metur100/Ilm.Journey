import type { GameFact } from '@/core/games';

import { quran, T } from '../shared/kit';

/** Facts of Twelve Springs – wording and references as in the Musa story (stories/content/prophets/musa.json). */
export const MUSA_FACTS = {
  springs: {
    id: 'twelve-springs',
    text: T(
      'When Musa asked Allah for water for his people, Allah said: "Strike the rock with your staff." Twelve springs gushed out of it, and every tribe knew its own drinking place.',
      'Als Musa Allah um Wasser für sein Volk bat, sprach Allah: „Schlag mit deinem Stab auf den Felsen.“ Zwölf Quellen sprudelten daraus hervor, und jeder Stamm kannte seine eigene Trinkstelle.',
      'Kada je Musa molio Allaha da napoji svoj narod, Allah je rekao: „Udari štapom svojim po kamenu!“ Iz njega je provrelo dvanaest izvora, i svako pleme je znalo svoje pojilo.',
    ),
    sources: quran('2:60', '7:160'),
    art: 'prophet.musa-springs',
    check: {
      type: 'choice',
      prompt: T('How many springs gushed from the rock?', 'Wie viele Quellen sprudelten aus dem Felsen?', 'Koliko je izvora provrelo iz kamena?'),
      options: [T('Twelve', 'Zwölf', 'Dvanaest'), T('Three', 'Drei', 'Tri'), T('Seven', 'Sieben', 'Sedam')],
      correctIndex: 0,
    },
  },
  provision: {
    id: 'eat-and-drink',
    text: T(
      '"Eat and drink from what Allah provides, and do not spread corruption on the earth."',
      '„Esst und trinkt von dem, was Allah euch versorgt, und stiftet kein Unheil auf der Erde.“',
      '„Jedite i pijte od onoga čime vas Allah opskrbljuje i ne činite nered po Zemlji.“',
    ),
    sources: quran('2:60'),
    art: 'prophet.musa-spring-1',
  },
  withMe: {
    id: 'my-lord-is-with-me',
    text: T(
      'At the sea Musa said: "My Lord is with me – He will guide me." Allah parted the sea and saved Musa and all who were with him.',
      'Am Meer sagte Musa: „Mein Herr ist mit mir – Er wird mich leiten.“ Allah teilte das Meer und rettete Musa und alle, die bei ihm waren.',
      'Kod mora Musa je rekao: „Sa mnom je moj Gospodar – On će me uputiti.“ Allah je razdvojio more i spasio Musaa i sve koji su bili s njim.',
    ),
    sources: quran('26:62–65'),
    art: 'prophet.musa-sea-path',
    reviewKey: 'stories:musa-sea',
  },
} satisfies Record<string, GameFact>;
