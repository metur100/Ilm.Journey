import type { GameFact } from '@/core/games';

import { lessonFact } from '../../prophets-story/episode';
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
  river: {
    id: 'musa-on-the-river',
    text: T(
      'Allah inspired Musa’s mother to place her baby in a chest on the river and not to be sad. The river carried him to Fir’awn’s household, and he refused every nurse – so Allah returned him to his mother.',
      'Allah gab Musas Mutter ein, ihr Baby in eine Kiste auf den Fluss zu legen und nicht traurig zu sein. Der Fluss trug ihn zum Haus des Pharao, und er wollte von keiner Amme trinken – so gab Allah ihn seiner Mutter zurück.',
      'Allah je nadahnuo Musaovu majku da svoje dijete stavi u sanduk na rijeku i da ne tuguje. Rijeka ga je odnijela do faraonove porodice, a on nije htio sisati ni kod jedne dojilje – pa ga je Allah vratio majci.',
    ),
    sources: quran('28:7–13'),
    art: 'prophet.musa-chest',
    reviewKey: 'stories:musa-next',
  },
  lessonPromise: lessonFact(
    'musa-promise',
    T(
      'Allah’s promise is true. Do your part and trust Allah with the result, as Musa’s mother did when she placed her baby on the river.',
      'Allahs Versprechen ist wahr. Tu deinen Teil und vertraue Allah das Ergebnis an, wie Musas Mutter, als sie ihr Baby auf den Fluss setzte.',
      'Allahovo obećanje je istina. Uradi svoj dio i prepusti ishod Allahu, kao Musaova majka kad je spustila dijete u rijeku.',
    ),
    quran('28:7', '28:13'),
    { art: 'prophet.musa-chest' },
  ),
  lessonHope: lessonFact(
    'musa-hope',
    T(
      'Never lose hope, even when everything looks lost. Allah is with those who trust Him – "My Lord is with me, He will guide me."',
      'Verliere nie die Hoffnung, auch wenn alles verloren scheint. Allah ist mit denen, die auf Ihn vertrauen – „Mein Herr ist mit mir, Er wird mich leiten.“',
      'Nikad ne gubi nadu, i kad se čini da je sve izgubljeno. Allah je s onima koji se u Njega pouzdaju – „Sa mnom je moj Gospodar, On će me uputiti.“',
    ),
    quran('26:61–62'),
    { art: 'prophet.musa-sea-path', reviewKey: 'stories:musa-lesson' },
  ),
  lessonThanks: lessonFact(
    'musa-thanks',
    T(
      'Thank Allah for His provision by using it well: eat and drink from what He gives and do not spoil the earth.',
      'Danke Allah für Seine Versorgung, indem du sie gut nutzt: Iss und trink von dem, was Er gibt, und verdirb die Erde nicht.',
      'Zahvali Allahu na opskrbi tako što ćeš je dobro koristiti: jedi i pij od onoga što On daje i ne kvari Zemlju.',
    ),
    quran('2:60'),
    { art: 'prophet.musa-spring-1' },
  ),
} satisfies Record<string, GameFact>;
