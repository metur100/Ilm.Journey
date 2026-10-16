import type { GameFact } from '@/core/games';
import type { CatchItem, PathStop, SortBin, SortItem } from '@/core/games/kit';

import { quran, T } from '../shared';

/* Lut – The Night Journey: his call (26:160–164), what he warned against (29:28–29), leaving by night (11:81). */

export const LUT_FACTS = {
  messenger: {
    id: 'lut-trustworthy',
    text: T(
      'Lut said: "I am a trustworthy messenger to you. So fear Allah and obey me."',
      'Lut sagte: „Ich bin euch ein vertrauenswürdiger Gesandter. So fürchtet Allah und gehorcht mir.“',
      'Lut je rekao: „Ja sam vam poslanik povjerljivi. Zato se Allaha bojte i mene slušajte.“',
    ),
    sources: [quran('26:162–163')],
    art: 'prophet.lut-lantern',
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
  guests: {
    id: 'lut-protected-guests',
    text: T('Lut said: "Fear Allah and do not disgrace me before my guests."', 'Lut sagte: „Fürchtet Allah und bringt mich vor meinen Gästen nicht in Schande.“', 'Lut je rekao: „Bojte se Allaha i ne sramotite me pred mojim gostima.“'),
    sources: [quran('11:78')],
    art: 'place.house',
    reviewKey: 'stories:lut-guests',
  },
  night: {
    id: 'lut-leave-by-night',
    text: T(
      'The messengers said: "Leave with your family in a part of the night, and let none of you look back."',
      'Die Gesandten sagten: „Brich mit deiner Familie in einem Teil der Nacht auf, und keiner von euch soll sich umdrehen.“',
      'Izaslanici su rekli: „Kreni sa svojom porodicom u jednom dijelu noći i neka se niko od vas ne osvrće.“',
    ),
    sources: [quran('11:81')],
    art: 'prophet.lut-night-map',
    check: {
      type: 'trueFalse',
      statement: T('Lut was told to look back at the town while leaving.', 'Lut wurde gesagt, beim Aufbruch auf die Stadt zurückzublicken.', 'Lutu je rečeno da se pri polasku osvrće na grad.'),
      correct: false,
    },
  },
  morning: {
    id: 'lut-morning-near',
    text: T('"Their appointed time is the morning – is the morning not near?"', '„Ihre Frist ist der Morgen – ist der Morgen nicht nahe?“', '„Njima je rok jutro – a zar jutro nije blizu?“'),
    sources: [quran('11:81')],
    art: 'story.sun',
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
} satisfies Record<string, GameFact>;

export const CALL_BINS: SortBin[] = [
  { id: 'call', label: T('Lut called to', 'Lut rief auf zu', 'Lut je pozivao'), art: 'prophet.lut-lantern' },
  { id: 'warn', label: T('Lut warned against', 'Lut warnte vor', 'Lut je opominjao od'), art: 'prophet.lut-ruins' },
];

export const CALL_ITEMS: SortItem[] = [
  { id: 'fear', bin: 'call', label: T('Fear Allah', 'Allah fürchten', 'Bojati se Allaha') },
  { id: 'obey', bin: 'call', label: T('Obey the messenger', 'Dem Gesandten gehorchen', 'Slušati poslanika') },
  { id: 'guests', bin: 'call', label: T('Honour your guests', 'Gäste ehren', 'Paziti goste'), art: 'place.house' },
  { id: 'pure', bin: 'call', label: T('Stay pure', 'Rein bleiben', 'Ostati čist'), art: 'garden.water-drop' },
  { id: 'rob', bin: 'warn', label: T('Robbing travellers', 'Reisende berauben', 'Pljačkati putnike') },
  { id: 'gatherings', bin: 'warn', label: T('Wrong in gatherings', 'Unrecht in Versammlungen', 'Zlo na skupovima') },
  { id: 'mock', bin: 'warn', label: T('Mocking the good', 'Die Guten verspotten', 'Rugati se dobrima') },
  { id: 'harm-guests', bin: 'warn', label: T('Harming guests', 'Gästen schaden', 'Nauditi gostima') },
];

/** L2: out of the town by night, up into the hills before dawn (positions on the 300 × 400 `lut-night-map`). */
export const NIGHT_PATH: PathStop[] = [
  { id: 'gate', label: T('Town gate', 'Stadttor', 'Gradska kapija'), art: 'prophet.lut-lantern', at: { x: 0.5, y: 0.93 } },
  { id: 'night', label: T('Part of the night', 'Teil der Nacht', 'Dio noći'), at: { x: 0.56, y: 0.8 }, caption: T('Leave in a part of the night (11:81).', 'Brich in einem Teil der Nacht auf (11:81).', 'Kreni u jednom dijelu noći (11:81).') },
  { id: 'forward', label: T('Keep going', 'Weitergehen', 'Samo naprijed'), at: { x: 0.5, y: 0.675 }, caption: T('Let none of you look back (11:81).', 'Keiner soll sich umdrehen (11:81).', 'Neka se niko ne osvrće (11:81).') },
  { id: 'valley', label: T('The valley', 'Das Tal', 'Dolina'), at: { x: 0.37, y: 0.57 } },
  { id: 'rise', label: T('Up the hill', 'Den Hügel hinauf', 'Uz brdo'), at: { x: 0.47, y: 0.475 }, caption: T('"They will not reach you" (11:81).', '„Sie werden nicht zu dir gelangen“ (11:81).', '„Oni do tebe neće doprijeti“ (11:81).') },
  { id: 'ridge', label: T('The ridge', 'Der Kamm', 'Greben'), at: { x: 0.6, y: 0.36 } },
  { id: 'dawn', label: T('Dawn', 'Morgen', 'Zora'), art: 'story.sun', at: { x: 0.57, y: 0.27 }, caption: T('"Is the morning not near?" (11:81).', '„Ist der Morgen nicht nahe?“ (11:81).', '„Zar jutro nije blizu?“ (11:81).') },
];

/** L3: collect the good Lut called to; let the wrongs pass by. */
export const CATCH_ITEMS: CatchItem[] = [
  { id: 'c-fear', good: true, label: T('Fear of Allah', 'Gottesfurcht', 'Bogobojaznost') },
  { id: 'c-truth', good: true, label: T('Truth', 'Wahrheit', 'Istina') },
  { id: 'c-guests', good: true, label: T('Kind to guests', 'Gastfreundlich', 'Gostoprimstvo') },
  { id: 'c-pure', good: true, label: T('Purity', 'Reinheit', 'Čistoća'), art: 'garden.water-drop' },
  { id: 'c-help', good: true, label: T('Helping', 'Helfen', 'Pomaganje') },
  { id: 'c-rob', good: false, label: T('Robbing', 'Rauben', 'Pljačka') },
  { id: 'c-mock', good: false, label: T('Mocking', 'Spott', 'Ruganje') },
  { id: 'c-harm', good: false, label: T('Harming', 'Schaden', 'Nanošenje zla') },
];

export const ITEM_FACT: Record<string, string> = {
  fear: LUT_FACTS.messenger.id,
  obey: LUT_FACTS.messenger.id,
  guests: LUT_FACTS.guests.id,
  pure: LUT_FACTS.pure.id,
  rob: LUT_FACTS.warned.id,
  gatherings: LUT_FACTS.warned.id,
  mock: LUT_FACTS.pure.id,
  'harm-guests': LUT_FACTS.guests.id,
  ...Object.fromEntries(NIGHT_PATH.map((s) => [s.id, s.id === 'dawn' ? LUT_FACTS.morning.id : LUT_FACTS.night.id])),
  'c-fear': LUT_FACTS.messenger.id,
  'c-truth': LUT_FACTS.messenger.id,
  'c-guests': LUT_FACTS.guests.id,
  'c-pure': LUT_FACTS.pure.id,
  'c-help': LUT_FACTS.guests.id,
  'c-rob': LUT_FACTS.warned.id,
  'c-mock': LUT_FACTS.pure.id,
  'c-harm': LUT_FACTS.guests.id,
};
