import type { Episode } from '../../prophets-story/episode';
import { T } from '../shared/kit';

/*
 * Yusuf and the storehouses of Egypt – three events, each with its lesson (the brothers, the well and the forgiveness
 * are in the other Yusuf game, yusuf-story-path):
 *  L1 The king's dream and its meaning (12:43–49): memory pairs dream part ↔ meaning (episode).
 *  L2 Store the harvest in its ears for the hard years (12:47–48): the storehouse board.
 *  L3 In charge of the storehouses – trusted, a knowing guardian, full measure (12:54–59, 12:49): connect (episode).
 */

/** L1 – the parts of the king's dream and their meaning (as in the story's memory question yusuf-cows). */
export const DREAM_EPISODE: Episode = {
  kind: 'memory',
  prompt: T(
    'The king had a dream, and Yusuf explained it. Find each part of the dream and its meaning.',
    'Der König hatte einen Traum, und Yusuf deutete ihn. Finde jeden Teil des Traumes und seine Bedeutung.',
    'Kralj je usnio san, a Jusuf ga je protumačio. Nađi svaki dio sna i njegovo značenje.',
  ),
  hints: true,
  peekMs: 2500,
  pairs: [
    { id: 'fat-cows', a: { art: 'animal.cow', label: T('Seven fat cows', 'Sieben fette Kühe', 'Sedam debelih krava') }, b: { label: T('Seven good years', 'Sieben gute Jahre', 'Sedam rodnih godina'), sub: '12:47' } },
    { id: 'thin-cows', a: { art: 'animal.ox', label: T('Seven thin cows', 'Sieben magere Kühe', 'Sedam mršavih krava') }, b: { label: T('Seven hard years', 'Sieben harte Jahre', 'Sedam teških godina'), sub: '12:48' } },
    { id: 'green-ears', a: { art: 'prophet.yusuf-sheaf-green', label: T('Green ears of grain', 'Grüne Ähren', 'Zeleni klasovi') }, b: { label: T('A rich harvest to keep', 'Reiche Ernte zum Aufbewahren', 'Bogata žetva za čuvanje'), sub: '12:47' } },
    { id: 'dry-ears', a: { art: 'prophet.yusuf-sheaf-dry', label: T('Dry ears of grain', 'Vertrocknete Ähren', 'Suhi klasovi') }, b: { label: T('Years of drought', 'Jahre der Dürre', 'Sušne godine'), sub: '12:48' } },
  ],
  factMap: { 'fat-cows': 'king-dream', 'thin-cows': 'king-dream', 'green-ears': 'king-dream', 'dry-ears': 'king-dream' },
};

/** L3 – Yusuf in charge of the storehouses. */
export const GUARDIAN_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'The king put Yusuf in charge of the storehouses. Connect what was said with how it goes on.',
    'Der König setzte Yusuf über die Vorratshäuser. Verbinde das Gesagte mit seiner Fortsetzung.',
    'Kralj je Jusufa postavio nad riznicama. Spoji ono što je rečeno s njegovim nastavkom.',
  ),
  hints: false,
  pairs: [
    { id: 'trusted', left: { art: 'place.house', label: T('The king: "Today you are with us"', 'Der König: „Heute bist du bei uns“', 'Kralj: „Ti si od danas kod nas“') }, right: { label: T('in a high place and trusted', 'in hoher Stellung und vertrauenswürdig', 'na visokom položaju i povjerljiv'), sub: '12:54' } },
    { id: 'guardian', left: { art: 'object.storehouse', label: T('"Put me in charge of the storehouses"', '„Setze mich über die Vorratskammern ein“', '„Postavi me nad riznicama“') }, right: { label: T('I am a knowing guardian', 'ich bin ein kundiger Hüter', 'ja sam čuvar vješt'), sub: '12:55' } },
    { id: 'full-measure', left: { art: 'object.scales', label: T('"I give full measure"', '„Ich gebe volles Maß“', '„Ja mjeru punu dajem“') }, right: { label: T('and I am the best of hosts', 'und bin der beste Gastgeber', 'i najbolji sam domaćin'), sub: '12:59' } },
    { id: 'rain', left: { art: 'garden.olive', label: T('"Then a year will come"', '„Dann kommt ein Jahr“', '„Zatim će doći godina“') }, right: { label: T('in which the people are given rain', 'in dem die Menschen Regen bekommen', 'u kojoj će ljudima biti dana kiša'), sub: '12:49' } },
  ],
  factMap: { trusted: 'yusuf-storehouses', guardian: 'yusuf-storehouses', 'full-measure': 'lesson-yusuf-trustworthy', rain: 'year-of-relief' },
};
