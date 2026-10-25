import type { Episode } from '../../prophets-story/episode';
import { T } from '../shared/kit';

/*
 * Yaqub – three events of his life, each with its lesson:
 *  L1 Yusuf taken away – "beautiful patience" (12:11–18): put it in order (episode).
 *  L2 The years of grief – "do not despair of the mercy of Allah" (12:84–87): connect (episode).
 *  L3 The shirt brought from Egypt – his sight restored (12:93–96): lay the caravan's road across the desert.
 */

/** L1 – the day Yusuf did not come home. */
export const TAKEN_EPISODE: Episode = {
  kind: 'sequence',
  prompt: T(
    'One day Yaqub’s sons took Yusuf out with them. Put what happened in order.',
    'Eines Tages nahmen Yaqubs Söhne Yusuf mit hinaus. Bring das Geschehen in die richtige Reihenfolge.',
    'Jednog dana Jakubovi sinovi poveli su Jusufa sa sobom. Poredaj šta se dogodilo.',
  ),
  hints: true,
  items: [
    { id: 'ask-to-take', art: 'animal.sheep', label: T('The brothers ask to take Yusuf out', 'Die Brüder bitten, Yusuf mitzunehmen', 'Braća traže da povedu Jusufa'), sub: '12:11–12' },
    { id: 'wolf-fear', art: 'animal.wolf', label: T('Yaqub fears a wolf might eat him', 'Yaqub fürchtet, ein Wolf könnte ihn fressen', 'Jakub se boji da ga vuk ne pojede'), sub: '12:13' },
    { id: 'false-blood', art: 'prophet.yaqub-shirt', label: T('They bring his shirt with false blood', 'Sie bringen sein Hemd mit falschem Blut', 'Donose njegovu košulju s lažnom krvlju'), sub: '12:18' },
    { id: 'sabr-jamil', art: 'prophet.yaqub-home', label: T('"Beautiful patience – Allah’s help is sought"', '„Schöne Geduld – Allahs Hilfe wird gesucht“', '„Lijepo strpljenje – od Allaha se pomoć traži“'), sub: '12:18' },
  ],
  factMap: { 'ask-to-take': 'beautiful-patience', 'wolf-fear': 'beautiful-patience', 'false-blood': 'lesson-yaqub-beautiful-patience', 'sabr-jamil': 'lesson-yaqub-beautiful-patience' },
};

/** L2 – what Yaqub said in the years of grief. */
export const GRIEF_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'Years passed, and Yaqub also had to let another son go. Connect what he said with how it goes on.',
    'Jahre vergingen, und Yaqub musste noch einen Sohn gehen lassen. Verbinde, was er sagte, mit der Fortsetzung.',
    'Prolazile su godine, a Jakub je morao pustiti još jednog sina. Spoji ono što je rekao s nastavkom.',
  ),
  hints: false,
  pairs: [
    { id: 'complain', left: { art: 'story.lamp', label: T('"I only complain of my grief and sorrow"', '„Ich klage meinen Kummer und meine Trauer“', '„Ja se žalim na svoju tugu i brigu“') }, right: { label: T('to Allah', 'nur Allah', 'samo Allahu'), sub: '12:86' } },
    { id: 'know', left: { art: 'object.book', label: T('"I know from Allah"', '„Ich weiß von Allah“', '„Ja znam od Allaha“') }, right: { label: T('what you do not know', 'was ihr nicht wisst', 'ono što vi ne znate'), sub: '12:86' } },
    { id: 'search', left: { art: 'animal.camel', label: T('"Go and look for Yusuf"', '„Geht und sucht nach Yusuf“', '„Idite i raspitajte se o Jusufu“') }, right: { label: T('and his brother', 'und seinem Bruder', 'i njegovom bratu'), sub: '12:87' } },
    { id: 'no-despair', left: { art: 'garden.sun', label: T('"Do not despair"', '„Gebt die Hoffnung nicht auf“', '„Ne gubite nadu“') }, right: { label: T('of the mercy of Allah', 'auf Allahs Barmherzigkeit', 'u Allahovu milost'), sub: '12:87' } },
  ],
  factMap: { complain: 'complain-to-allah', know: 'complain-to-allah', search: 'never-despair', 'no-despair': 'lesson-yaqub-never-despair' },
};
