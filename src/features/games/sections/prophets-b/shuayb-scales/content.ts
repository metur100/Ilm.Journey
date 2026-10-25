import type { Episode } from '../../prophets-story/episode';
import { T } from '../shared/kit';

/*
 * Shuayb – three events of his life, each with its lesson:
 *  L1 Sent to Madyan (7:85–86, 11:84): connect each part of his call with its meaning (ConnectPairs).
 *  L2 Full measure and fair weight (11:84–85, 26:181–183): balance the scales exactly (the game's own scale board).
 *  L3 Mocked and threatened – "I only want to set things right"; the believers saved (11:87–88, 7:88, 11:94): order.
 */

/** L1 – the call of Shuayb in Madyan. */
export const CALL_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'Allah sent Shuayb to the people of Madyan. Connect each part of his call with the rest of it.',
    'Allah sandte Schuaib zum Volk von Madyan. Verbinde jeden Teil seines Aufrufs mit seiner Fortsetzung.',
    'Allah je poslao Šuajba narodu Medjena. Spoji svaki dio njegova poziva s njegovim nastavkom.',
  ),
  hints: true,
  pairs: [
    { id: 'worship', left: { art: 'prophet.shuayb-market', label: T('"O my people, worship Allah"', '„O mein Volk, dient Allah“', '„O narode moj, Allahu robujte“') }, right: { label: T('you have no god other than Him', 'ihr habt keinen Gott außer Ihm', 'vi drugog boga osim Njega nemate'), sub: '7:85' } },
    { id: 'proof', left: { art: 'object.scroll', label: T('Clear proof has come to you', 'Ein klarer Beweis ist zu euch gekommen', 'Došao vam je jasan dokaz') }, right: { label: T('from your Lord', 'von eurem Herrn', 'od Gospodara vašeg'), sub: '7:85' } },
    { id: 'no-corruption', left: { art: 'garden.sapling', label: T('Do not spread corruption on the earth', 'Stiftet kein Unheil auf der Erde', 'Ne činite nered na Zemlji') }, right: { label: T('after it has been set right', 'nachdem sie in Ordnung gebracht wurde', 'nakon što je uređena'), sub: '7:85' } },
    { id: 'few', left: { art: 'animal.sheep', label: T('Remember when you were few', 'Denkt daran, als ihr wenige wart', 'Sjetite se kad vas je bilo malo') }, right: { label: T('and He made you many', 'und Er euch zahlreich machte', 'pa vas je On umnožio'), sub: '7:86' } },
  ],
  factMap: { worship: 'sent-to-madyan', proof: 'sent-to-madyan', 'no-corruption': 'lesson-shuayb-faith-and-honesty', few: 'lesson-shuayb-faith-and-honesty' },
};

/** L3 – the answer of his people, his reply and the rescue, in order. */
export const ANSWER_EPISODE: Episode = {
  kind: 'sequence',
  prompt: T(
    'His people did not want to listen. Put what happened in order.',
    'Sein Volk wollte nicht hören. Bring das Geschehen in die richtige Reihenfolge.',
    'Njegov narod nije htio slušati. Poredaj šta se dogodilo.',
  ),
  hints: false,
  items: [
    { id: 'mocked', art: 'prophet.shuayb-market', label: T('They mock: "Does your prayer tell you …?"', 'Sie spotten: „Befiehlt dir dein Gebet …?“', 'Rugaju se: „Zar ti tvoj namaz naređuje …?“'), sub: '11:87' },
    { id: 'set-right', art: 'prophet.shuayb-measure', label: T('"I only want to set things right"', '„Ich will nur Besserung“', '„Ja želim samo popravak“'), sub: '11:88' },
    { id: 'threat', art: 'scene.city', label: T('The leaders threaten to drive the believers out', 'Die Anführer drohen, die Gläubigen zu vertreiben', 'Prvaci prijete da će protjerati vjernike'), sub: '7:88' },
    { id: 'rescued', art: 'prophet.shuayb-madyan-well', label: T('Allah saves Shuayb and the believers', 'Allah rettet Schuaib und die Gläubigen', 'Allah spašava Šuajba i vjernike'), sub: '11:94' },
  ],
  factMap: { mocked: 'set-things-right', 'set-right': 'set-things-right', threat: 'shuayb-believers-saved', rescued: 'shuayb-believers-saved' },
};
