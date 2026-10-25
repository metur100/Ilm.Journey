import { type GameDef, type GameFact, registerGame } from '@/core/games';

import { type MasjidConfig, BuildTheMasjidGame } from './BuildTheMasjidGame';
import { FIRST_PROJECT, MADINAH_NORTH, MOSQUE_LAND, OASIS, QIBLA_CHANGE, QIBLA_JERUSALEM, type SeerahBlock, sourceRefs } from './content';
import { masjidI18n } from './i18n';
import { MAIN_BUILD, QIBLA_FACT_ID } from './logic';

/*
 * Build the Masjid (Seerah, episode 06). Every result fact is a Seerah block copied unchanged with its sources; checks
 * reuse the Seerah questions of episode 06 (e06-q1, e06-q2). The parts and their inline captions are in logic.ts / i18n.
 *
 *   Every level teaches something new (owner feedback: no level repeats the content of another):
 *   Level 1 – build it, guided: the next part and its place glow (morning).
 *   Level 2 – the story of the first masjid in order: arrival, the camel, the two orphans, the bricks, its uses (SequenceBoard).
 *   Level 3 – the masjid stands; the qibla changes: turn it to the Kaʿbah and add the new shade and the Suffa (evening).
 */

const fromBlock = (block: SeerahBlock) => ({ text: block.text, sources: sourceRefs(block.sourceIds) });

export const MASJID_FACTS = {
  land: {
    id: 'mosque-land',
    ...fromBlock(MOSQUE_LAND),
    art: 'place.masjid-nabawi-early',
    check: {
      type: 'choice',
      // Seerah question e06-q1.
      prompt: {
        en: 'What was the first major project after the Prophet ﷺ arrived in Madinah?',
        de: 'Was war das erste große Vorhaben nach der Ankunft des Propheten ﷺ in Medina?',
        bs: 'Šta je bio prvi veliki projekat nakon dolaska Poslanika ﷺ u Medinu?',
      },
      options: [
        { en: 'Building the mosque', de: 'Der Bau der Moschee', bs: 'Gradnja mesdžida' },
        { en: 'Building a city wall', de: 'Der Bau einer Stadtmauer', bs: 'Gradnja gradskog zida' },
        { en: 'Digging the trench', de: 'Das Ausheben des Grabens', bs: 'Kopanje hendeka' },
      ],
      correctIndex: 0,
    },
  },
  oasis: { id: 'madinah-oasis', ...fromBlock(OASIS), art: 'garden.palm' },
  firstProject: { id: 'first-project', ...fromBlock(FIRST_PROJECT), art: 'place.masjid-nabawi-early', reviewKey: 'seerah:e06-q4' },
  jerusalem: { id: 'qibla-jerusalem', ...fromBlock(QIBLA_JERUSALEM), art: 'object.compass' },
  change: {
    id: QIBLA_FACT_ID,
    ...fromBlock(QIBLA_CHANGE),
    art: 'object.kaaba-icon',
    check: {
      type: 'trueFalse',
      // Seerah question e06-q2.
      statement: {
        en: 'The Muslims in Madinah first prayed towards Jerusalem before the qiblah was changed to the Kaʿbah.',
        de: 'Die Muslime in Medina beteten zuerst in Richtung Jerusalem, bevor die Gebetsrichtung zur Kaaba geändert wurde.',
        bs: 'Muslimani u Medini su najprije klanjali prema Jerusalemu prije nego što je kibla promijenjena prema Kabi.',
      },
      correct: true,
    },
  },
  north: { id: 'madinah-north', ...fromBlock(MADINAH_NORTH), art: 'place.madinah-city' },
} satisfies Record<string, GameFact>;

export const MASJID_GAME_ID = 'build-the-masjid';


export const masjidGame: GameDef<MasjidConfig> = {
  id: MASJID_GAME_ID,
  topicId: 'seerah',
  i18n: masjidI18n,
  coverArt: 'seerah.masjid-finished',
  hintArt: 'seerah.masjid-finished',
  component: BuildTheMasjidGame,
  levels: [
    { level: 1, config: { parts: MAIN_BUILD, guided: true, time: 'morning' }, facts: [MASJID_FACTS.land, MASJID_FACTS.oasis] },
    { level: 2, config: { mode: 'story' }, facts: [MASJID_FACTS.firstProject, MASJID_FACTS.north] },
    {
      level: 3,
      config: { parts: [], standing: true, guided: false, time: 'evening', afterQibla: ['shade-south', 'suffa'] },
      facts: [MASJID_FACTS.jerusalem, MASJID_FACTS.change],
    },
  ],
  teaches: { questionKeys: ['seerah:e06-q1', 'seerah:e06-q2', 'seerah:e06-q4'] },
  order: 20,
};

export function registerBuildTheMasjidGame(): void {
  registerGame(masjidGame);
}
