import type { Episode } from '../../prophets-story/episode';
import { T } from '../shared/kit';

/*
 * Ayyub – three events of his life, each with its lesson:
 *  L1 The long test – what touched him and how he met it (21:83–84, 38:41, 38:44): sort (episode).
 *  L2 His dua and Allah's answer (21:83–84): put it in order (episode).
 *  L3 Healed – the cool spring, his family given back (38:42–43, 21:84): bring a withered garden back to life.
 */

/** L1 – the test and how Ayyub met it. */
export const TEST_EPISODE: Episode = {
  kind: 'sort',
  prompt: T(
    'Allah tested Ayyub, a good servant. Sort: what was his test – and what did Ayyub do?',
    'Allah prüfte Ayyub, einen guten Diener. Sortiere: Was war seine Prüfung – und was tat Ayyub?',
    'Allah je iskušao Ejjuba, dobrog roba. Razvrstaj: šta je bilo njegovo iskušenje – a šta je Ejjub činio?',
  ),
  hints: true,
  bins: [
    { id: 'test', art: 'prophet.ayyub-plant-dry', label: T('His test', 'Seine Prüfung', 'Njegovo iskušenje') },
    { id: 'ayyub', art: 'prophet.ayyub-plant-sprout', label: T('What Ayyub did', 'Was Ayyub tat', 'Šta je Ejjub činio') },
  ],
  items: [
    { id: 'illness', bin: 'test', label: T('Illness touched him', 'Krankheit traf ihn', 'Zadesila ga je bolest'), sub: '21:83' },
    { id: 'family-lost', bin: 'test', label: T('He lost his family', 'Er verlor seine Familie', 'Izgubio je porodicu'), sub: '21:84' },
    { id: 'hardship', bin: 'test', label: T('A long, hard time', 'Eine lange, schwere Zeit', 'Dugo, teško vrijeme'), sub: '38:41' },
    { id: 'stayed-patient', bin: 'ayyub', label: T('He stayed patient', 'Er blieb geduldig', 'Ostao je strpljiv'), sub: '38:44' },
    { id: 'turned-back', bin: 'ayyub', label: T('He kept turning back to Allah', 'Er wandte sich stets Allah zu', 'Stalno se Allahu obraćao'), sub: '38:44' },
  ],
  factMap: { illness: 'ayyub-tested', 'family-lost': 'ayyub-tested', hardship: 'ayyub-tested', 'stayed-patient': 'lesson-ayyub-patience', 'turned-back': 'lesson-ayyub-patience' },
};

/** L2 – the dua and the answer, in order. */
export const DUA_EPISODE: Episode = {
  kind: 'sequence',
  prompt: T(
    'Ayyub called out to his Lord. Put his dua and Allah’s answer in order.',
    'Ayyub rief zu seinem Herrn. Bring sein Bittgebet und Allahs Antwort in die richtige Reihenfolge.',
    'Ejjub je zavapio svome Gospodaru. Poredaj njegovu dovu i Allahov odgovor.',
  ),
  hints: false,
  items: [
    { id: 'called', art: 'object.prayer-mat', label: T('Ayyub calls out to his Lord', 'Ayyub ruft zu seinem Herrn', 'Ejjub zove svoga Gospodara'), sub: '21:83' },
    { id: 'harm', art: 'prophet.ayyub-plant-dry', label: T('"Harm has touched me …"', '„Mich hat Unheil getroffen …“', '„Mene je nevolja snašla …“'), sub: '21:83' },
    { id: 'most-merciful', art: 'story.lamp', label: T('"… and You are the Most Merciful of the merciful."', '„… und Du bist der Barmherzigste der Barmherzigen.“', '„… a Ti si od milostivih najmilostiviji.“'), sub: '21:83' },
    { id: 'answered', art: 'prophet.ayyub-spring', label: T('Allah answers him', 'Allah erhört ihn', 'Allah mu se odaziva'), sub: '21:84' },
  ],
  factMap: { called: 'ayyub-call', harm: 'ayyub-call', 'most-merciful': 'lesson-ayyub-ask', answered: 'lesson-ayyub-ask' },
};
