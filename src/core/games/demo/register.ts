import { registerGame } from '../registry';
import type { GameDef, GameFact } from '../types';
import { type DemoStarsConfig, DemoStarsGame } from './DemoStarsGame';
import { demoI18n } from './i18n';

/*
 * Demo game ("Star Path") – a development fixture that proves the framework end to end (shelf → intro → how to play
 * → level select → play → result → review). It is marked `dev: true`, so production builds hide it from the Play tab,
 * the game of the day and quests. Facts are copied from the Ibrahim story (src/features/stories/content/prophets/
 * ibrahim.json) with their sources – the same rule every real game follows.
 */

const FACTS: Record<'sky' | 'sets' | 'story', GameFact> = {
  sky: {
    id: 'ibrahim-sky',
    text: {
      en: 'The Quran describes how Ibrahim pointed to a star, then to the bright moon, then to the sun. Each of them set and disappeared. Ibrahim declared that he turns to the One who created the heavens and the earth.',
      de: 'Der Koran beschreibt, wie Ibrahim auf einen Stern zeigte, dann auf den hellen Mond, dann auf die Sonne. Jeder von ihnen ging unter und verschwand. Ibrahim erklärte, dass er sich dem zuwendet, der die Himmel und die Erde erschaffen hat.',
      bs: "Kur'an opisuje kako je Ibrahim pokazao na zvijezdu, zatim na sjajni mjesec, pa na sunce. Svako od njih je zašlo i nestalo. Ibrahim je izjavio da se okreće Onome koji je stvorio nebesa i Zemlju.",
    },
    sources: [{ sourceName: 'Quran', sourceReference: '6:74–79' }],
    art: 'garden.stars',
    check: {
      type: 'choice',
      prompt: {
        en: 'The star, the moon and the sun all set. What was Ibrahim showing his people?',
        de: 'Stern, Mond und Sonne gingen alle unter. Was wollte Ibrahim seinem Volk zeigen?',
        bs: 'Zvijezda, mjesec i sunce svi su zašli. Šta je Ibrahim pokazivao svom narodu?',
      },
      options: [
        { en: 'That they cannot be God, because they disappear', de: 'Dass sie nicht Gott sein können, weil sie verschwinden', bs: 'Da ne mogu biti Bog, jer nestaju' },
        { en: 'That they should be worshipped', de: 'Dass man sie anbeten sollte', bs: 'Da im treba robovati' },
        { en: 'That the night is scary', de: 'Dass die Nacht unheimlich ist', bs: 'Da je noć strašna' },
      ],
      correctIndex: 0,
    },
  },
  sets: {
    id: 'everything-sets',
    text: {
      en: 'Everything that sets is created. Ibrahim turned to the Creator of the heavens and the earth.',
      de: 'Alles, was untergeht, ist erschaffen. Ibrahim wandte sich dem Schöpfer der Himmel und der Erde zu.',
      bs: 'Sve što zalazi je stvoreno. Ibrahim se okrenuo Stvoritelju nebesa i Zemlje.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '6:76–79' }],
    art: 'garden.moon',
    // An existing question of the Stories feature covers this fact – review uses it instead of a generated one.
    reviewKey: 'stories:ibrahim-sky',
  },
  story: {
    id: 'ibrahim-story',
    text: {
      en: 'The fire became cool, the idols could not speak, the Kaaba was built with Ismail, and the star, moon and sun all set.',
      de: 'Das Feuer wurde kühl, die Götzen konnten nicht sprechen, die Kaaba wurde mit Ismail gebaut, und Stern, Mond und Sonne gingen unter.',
      bs: 'Vatra je postala hladna, kipovi nisu mogli govoriti, Kaba je sagrađena s Ismailom, a zvijezda, mjesec i sunce su zašli.',
    },
    sources: [
      { sourceName: 'Quran', sourceReference: '6:74–83' },
      { sourceName: 'Quran', sourceReference: '21:51–70' },
      { sourceName: 'Quran', sourceReference: '2:124–129' },
    ],
    art: 'garden.sun',
  },
};

export const DEMO_GAME_ID = 'demo-stars';

export const demoGame: GameDef<DemoStarsConfig> = {
  id: DEMO_GAME_ID,
  challengeCount: 16,
  topicId: 'prophets',
  i18n: demoI18n,
  coverArt: 'garden.stars',
  hintArt: 'garden.stars',
  component: DemoStarsGame,
  levels: [
    { level: 1, config: { count: 3 }, facts: [FACTS.sky] },
    { level: 2, config: { count: 5 }, facts: [FACTS.sets] },
    { level: 3, config: { count: 8 }, facts: [FACTS.story] },
  ],
  dev: true,
};

export function registerDemoGame(): void {
  registerGame(demoGame);
}
