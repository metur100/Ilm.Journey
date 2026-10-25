import type { GameFact } from '@/core/games';
import type { PathStop, SortBin, SortItem } from '@/core/games/kit';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { quran, T } from '../shared';

/*
 * Lut – The Night Journey, three events (story lut.json): L1 his call as a trustworthy messenger (26:160–164,
 * 29:28–29), L2 protecting his guests (11:77–81), L3 leaving by night – Allah saved Lut and the believers
 * (11:81, 27:56–57). What happened to the town is narrated in the facts only, never played.
 */

export const LUT_FACTS = {
  messenger: {
    id: 'lut-trustworthy',
    text: T(
      'Lut said: "I am a trustworthy messenger to you. So fear Allah and obey me. I ask no reward from you."',
      'Lut sagte: „Ich bin euch ein vertrauenswürdiger Gesandter. So fürchtet Allah und gehorcht mir. Ich verlange keinen Lohn von euch.“',
      'Lut je rekao: „Ja sam vam poslanik povjerljivi. Zato se Allaha bojte i mene slušajte. Ja od vas ne tražim nagradu.“',
    ),
    sources: [quran('26:162–164')],
    art: 'prophet.lut-lantern',
    reviewKey: 'stories:lut-trust',
  },
  warned: {
    id: 'lut-warned-wrongs',
    text: T(
      'Lut warned his people: they robbed travellers on the road and did wrong openly in their gatherings.',
      'Lut warnte sein Volk: Sie beraubten Reisende auf der Straße und taten offen Unrecht in ihren Versammlungen.',
      'Lut je opominjao svoj narod: pljačkali su putnike na putu i javno činili zlo na svojim skupovima.',
    ),
    sources: [quran('29:29')],
    art: 'prophet.lut-city',
  },
  standUp: lessonFact(
    'stand-up',
    T(
      'Keep calling to good even when many people do wrong or laugh at you – doing right sometimes takes courage.',
      'Ruf weiter zum Guten auf, auch wenn viele Unrecht tun oder dich auslachen – das Richtige zu tun braucht manchmal Mut.',
      'Nastavi pozivati dobru i kad mnogi čine zlo ili ti se smiju – činiti ispravno ponekad traži hrabrost.',
    ),
    [quran('26:160–164'), quran('29:28–29')],
    { art: 'prophet.lut-lantern' },
  ),
  guests: {
    id: 'lut-protected-guests',
    text: T(
      'When guests came, Lut stood up for them: "Fear Allah and do not disgrace me before my guests. Is there not one sensible man among you?"',
      'Als Gäste kamen, stellte sich Lut vor sie: „Fürchtet Allah und bringt mich vor meinen Gästen nicht in Schande. Gibt es unter euch keinen vernünftigen Mann?“',
      'Kad su došli gosti, Lut se zauzeo za njih: „Bojte se Allaha i ne sramotite me pred mojim gostima. Zar među vama nema nijednog razumnog čovjeka?“',
    ),
    sources: [quran('11:77–78')],
    art: 'place.house',
    reviewKey: 'stories:lut-guests',
  },
  protect: lessonFact(
    'protect',
    T(
      'Honour your guests and protect people who need help – Lut stood up for his guests even when he was alone.',
      'Ehre deine Gäste und schütze die, die Hilfe brauchen – Lut stellte sich vor seine Gäste, auch als er allein war.',
      'Poštuj svoje goste i štiti one kojima treba pomoć – Lut se zauzeo za svoje goste čak i kad je bio sam.',
    ),
    [quran('11:78')],
    { art: 'place.house' },
  ),
  night: {
    id: 'lut-leave-by-night',
    text: T(
      'The messengers said: "Leave with your family in a part of the night, and let none of you look back. Is the morning not near?"',
      'Die Gesandten sagten: „Brich mit deiner Familie in einem Teil der Nacht auf, und keiner von euch soll sich umdrehen. Ist der Morgen nicht nahe?“',
      'Izaslanici su rekli: „Kreni sa svojom porodicom u jednom dijelu noći i neka se niko od vas ne osvrće. Zar jutro nije blizu?“',
    ),
    sources: [quran('11:81')],
    art: 'prophet.lut-night-map',
    check: {
      type: 'trueFalse',
      statement: T('Lut was told to look back at the town while leaving.', 'Lut wurde gesagt, beim Aufbruch auf die Stadt zurückzublicken.', 'Lutu je rečeno da se pri polasku osvrće na grad.'),
      correct: false,
    },
  },
  pure: {
    id: 'lut-stay-pure',
    text: T(
      'His people mocked the believers as "people who want to stay pure" – but Allah saved Lut and the believers.',
      'Sein Volk verspottete die Gläubigen als „Leute, die rein bleiben wollen“ – doch Allah rettete Lut und die Gläubigen.',
      'Njegov narod rugao se vjernicima kao „ljudima koji žele biti čisti“ – ali Allah je spasio Luta i vjernike.',
    ),
    sources: [quran('27:56–57')],
    art: 'prophet.lut-lantern',
    reviewKey: 'stories:lut-saved',
  },
  company: lessonFact(
    'company',
    T(
      'Stay away from bad deeds and choose friends who help you do good – Allah saved Lut and the believers who kept pure.',
      'Halte dich von schlechten Taten fern und wähle Freunde, die dir helfen, Gutes zu tun – Allah rettete Lut und die Gläubigen, die rein blieben.',
      'Kloni se loših djela i biraj prijatelje koji ti pomažu da činiš dobro – Allah je spasio Luta i vjernike koji su ostali čisti.',
    ),
    [quran('27:56–57'), quran('51:35–36')],
    { art: 'story.sun' },
  ),
} satisfies Record<string, GameFact>;

/** L1 – what Lut called to and what he warned against (26:160–164, 29:28–29). */
export const CALL_BINS: SortBin[] = [
  { id: 'call', label: T('Lut called to', 'Lut rief auf zu', 'Lut je pozivao'), art: 'prophet.lut-lantern' },
  { id: 'warn', label: T('Lut warned against', 'Lut warnte vor', 'Lut je opominjao od'), art: 'prophet.lut-ruins' },
];

export const CALL_ITEMS: SortItem[] = [
  { id: 'fear', bin: 'call', label: T('Fear Allah', 'Allah fürchten', 'Bojati se Allaha'), sub: '26:161' },
  { id: 'obey', bin: 'call', label: T('Obey the messenger', 'Dem Gesandten gehorchen', 'Slušati poslanika'), sub: '26:163' },
  { id: 'no-reward', bin: 'call', label: T('"I ask no reward from you"', '„Ich verlange keinen Lohn“', '„Ne tražim od vas nagradu“'), sub: '26:164' },
  { id: 'pure', bin: 'call', label: T('Stay pure', 'Rein bleiben', 'Ostati čist'), art: 'garden.water-drop', sub: '27:56' },
  { id: 'rob', bin: 'warn', label: T('Robbing travellers', 'Reisende berauben', 'Pljačkati putnike'), sub: '29:29' },
  { id: 'gatherings', bin: 'warn', label: T('Wrong in gatherings', 'Unrecht in Versammlungen', 'Zlo na skupovima'), sub: '29:29' },
  { id: 'shameful', bin: 'warn', label: T('Shameful deeds', 'Schändliche Taten', 'Sramna djela'), sub: '7:80' },
  { id: 'mock', bin: 'warn', label: T('Mocking the good', 'Die Guten verspotten', 'Rugati se dobrima'), sub: '27:56' },
];

export const CALL_FACT: Record<string, string> = {
  fear: LUT_FACTS.messenger.id,
  obey: LUT_FACTS.messenger.id,
  'no-reward': LUT_FACTS.messenger.id,
  pure: LUT_FACTS.standUp.id,
  rob: LUT_FACTS.warned.id,
  gatherings: LUT_FACTS.warned.id,
  shameful: LUT_FACTS.warned.id,
  mock: LUT_FACTS.standUp.id,
};

/** L2 – the guests, in order (11:77–81). */
export const GUESTS_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'list',
  prompt: T(
    'Guests came to Lut. Put what happened in order, then tap Check.',
    'Gäste kamen zu Lut. Bring in die richtige Reihenfolge, was geschah, und tippe auf Prüfen.',
    'Lutu su došli gosti. Poredaj šta se desilo, pa dodirni Provjeri.',
  ),
  hints: false,
  items: [
    { id: 'arrive', art: 'place.house', label: T('Guests came; Lut was worried for them', 'Gäste kamen; Lut sorgte sich um sie', 'Došli su gosti; Lut se zabrinuo za njih'), sub: '11:77' },
    { id: 'hurried', art: 'prophet.lut-city', label: T('The people hurried to his house', 'Die Leute eilten zu seinem Haus', 'Narod je pohrlio njegovoj kući'), sub: '11:78' },
    { id: 'disgrace', label: T('"Do not disgrace me before my guests"', '„Bringt mich nicht vor meinen Gästen in Schande“', '„Ne sramotite me pred gostima“'), sub: '11:78' },
    { id: 'sensible', label: T('"Is there not one sensible man?"', '„Gibt es keinen vernünftigen Mann?“', '„Zar nema nijednog razumnog čovjeka?“'), sub: '11:78' },
    { id: 'messengers', art: 'prophet.lut-lantern', label: T('"We are messengers of your Lord"', '„Wir sind Gesandte deines Herrn“', '„Mi smo izaslanici tvog Gospodara“'), sub: '11:81' },
  ],
  factMap: { arrive: 'lut-protected-guests', hurried: 'lut-protected-guests', disgrace: 'lesson-protect', sensible: 'lesson-protect', messengers: 'lut-protected-guests' },
};

/** L3 – out of the town by night, up into the hills before dawn (positions on the 300 × 400 `lut-night-map`). */
export const NIGHT_PATH: PathStop[] = [
  { id: 'gate', label: T('Town gate', 'Stadttor', 'Gradska kapija'), art: 'prophet.lut-lantern', at: { x: 0.5, y: 0.93 } },
  { id: 'night', label: T('Part of the night', 'Teil der Nacht', 'Dio noći'), at: { x: 0.56, y: 0.8 }, caption: T('Leave in a part of the night (11:81).', 'Brich in einem Teil der Nacht auf (11:81).', 'Kreni u jednom dijelu noći (11:81).') },
  { id: 'forward', label: T('Keep going', 'Weitergehen', 'Samo naprijed'), at: { x: 0.5, y: 0.675 }, caption: T('Let none of you look back (11:81).', 'Keiner soll sich umdrehen (11:81).', 'Neka se niko ne osvrće (11:81).') },
  { id: 'valley', label: T('The valley', 'Das Tal', 'Dolina'), at: { x: 0.37, y: 0.57 } },
  { id: 'rise', label: T('Up the hill', 'Den Hügel hinauf', 'Uz brdo'), at: { x: 0.47, y: 0.475 }, caption: T('"They will not reach you" (11:81).', '„Sie werden nicht zu dir gelangen“ (11:81).', '„Oni do tebe neće doprijeti“ (11:81).') },
  { id: 'ridge', label: T('The ridge', 'Der Kamm', 'Greben'), at: { x: 0.6, y: 0.36 } },
  { id: 'dawn', label: T('Dawn', 'Morgen', 'Zora'), art: 'story.sun', at: { x: 0.57, y: 0.27 }, caption: T('Allah saved the believers (51:35).', 'Allah rettete die Gläubigen (51:35).', 'Allah je spasio vjernike (51:35).') },
];

export const STOP_FACT: Record<string, string> = Object.fromEntries(NIGHT_PATH.map((s) => [s.id, s.id === 'dawn' ? LUT_FACTS.pure.id : LUT_FACTS.night.id]));
