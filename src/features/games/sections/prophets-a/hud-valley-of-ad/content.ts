import type { GameFact } from '@/core/games';
import type { SceneSpot, SortBin, SortItem } from '@/core/games/kit';

import { quran, T } from '../shared';

/* Hud – The Valley of ʿAd: the gifts Allah gave ʿAd (26:132–134), Hud's call (7:65, 11:52) and their pride (26:128–130, 41:15). */

export const HUD_FACTS = {
  gifts: {
    id: 'hud-gifts-of-allah',
    text: T(
      'Hud reminded his people: Allah gave you livestock and children, gardens and springs.',
      'Hud erinnerte sein Volk: Allah gab euch Vieh und Kinder, Gärten und Quellen.',
      'Hud je podsjetio svoj narod: Allah vam je dao stoku i djecu, bašče i izvore.',
    ),
    sources: [quran('26:132–134')],
    art: 'prophet.hud-spring',
    reviewKey: 'stories:hud-gifts',
  },
  iram: {
    id: 'hud-iram-pillars',
    text: T(
      'ʿAd built Iram, the city of lofty pillars, whose like had not been made in the lands.',
      'Die ʿAd bauten Iram, die Stadt der hohen Säulen, deren Gleichen im Land nicht erschaffen worden war.',
      'Ad je sagradio Irem, grad visokih stubova, kakav nije bio stvoren u zemljama.',
    ),
    sources: [quran('89:6–8')],
    art: 'prophet.hud-iram',
  },
  istighfar: {
    id: 'hud-istighfar-rain',
    text: T(
      'Hud said: Ask your Lord for forgiveness – He will send you rain in abundance and add strength to your strength.',
      'Hud sagte: Bittet euren Herrn um Vergebung – Er wird euch reichlich Regen senden und eurer Stärke Stärke hinzufügen.',
      'Hud je rekao: Tražite oprost od Gospodara svoga – On će vam slati obilnu kišu i dodati snagu vašoj snazi.',
    ),
    sources: [quran('11:52')],
    art: 'story.cloud',
    reviewKey: 'stories:hud-istighfar',
  },
  pride: {
    id: 'hud-who-is-stronger',
    text: T(
      'ʿAd grew proud and said: "Who is stronger than us?" But Allah, who created them, is far stronger.',
      'Die ʿAd wurden hochmütig und sagten: „Wer ist stärker als wir?“ Doch Allah, der sie erschuf, ist viel stärker.',
      'Ad se uzoholio i rekao: „Ko je od nas jači?“ A Allah, koji ih je stvorio, mnogo je jači.',
    ),
    sources: [quran('41:15')],
    art: 'prophet.hud-tower',
    check: {
      type: 'choice',
      prompt: T('What did ʿAd say in their pride?', 'Was sagten die ʿAd in ihrem Hochmut?', 'Šta je Ad rekao u svojoj oholosti?'),
      options: [T('"Who is stronger than us?"', '„Wer ist stärker als wir?“', '„Ko je od nas jači?“'), T('"Thank you, Allah."', '„Danke, Allah.“', '„Hvala Ti, Allahu.“'), T('"Let us share."', '„Lasst uns teilen.“', '„Hajde da dijelimo.“')],
      correctIndex: 0,
    },
  },
  saved: {
    id: 'hud-saved-by-mercy',
    text: T(
      'Allah saved Hud and those who believed with him by His mercy.',
      'Allah rettete Hud und die, die mit ihm glaubten, durch Seine Barmherzigkeit.',
      'Allah je Svojom milošću spasio Huda i one koji su s njim vjerovali.',
    ),
    sources: [quran('11:58')],
    art: 'story.sun',
    reviewKey: 'stories:hud-saved',
  },
} satisfies Record<string, GameFact>;

const SPOT = {
  cattle: { id: 'cattle', label: T('Livestock', 'Vieh', 'Stoka'), art: 'animal.cow', spotArt: 'animal.cow', at: { x: 0.05, y: 0.6, w: 0.22, h: 0.22 }, caption: T('Livestock – a gift from Allah (26:133).', 'Vieh – eine Gabe Allahs (26:133).', 'Stoka – Allahov dar (26:133).') },
  sheep: { id: 'sheep', label: T('Sheep', 'Schafe', 'Ovce'), art: 'animal.sheep', spotArt: 'animal.sheep', at: { x: 0.32, y: 0.74, w: 0.16, h: 0.16 }, caption: T('Grazing flocks (26:133).', 'Weidende Herden (26:133).', 'Stada na ispaši (26:133).') },
  garden: { id: 'garden', label: T('Gardens', 'Gärten', 'Bašče'), art: 'garden.pomegranate', spotArt: 'garden.pomegranate', at: { x: 0.56, y: 0.44, w: 0.18, h: 0.3 }, caption: T('Gardens full of fruit (26:134).', 'Gärten voller Früchte (26:134).', 'Bašče pune plodova (26:134).') },
  spring: { id: 'spring', label: T('Springs', 'Quellen', 'Izvori'), art: 'prophet.hud-spring', spotArt: 'prophet.hud-spring', at: { x: 0.68, y: 0.76, w: 0.3, h: 0.2 }, caption: T('Springs of fresh water (26:134).', 'Quellen frischen Wassers (26:134).', 'Izvori svježe vode (26:134).') },
  palm: { id: 'palm', label: T('Date palms', 'Dattelpalmen', 'Palme'), art: 'garden.palm', spotArt: 'garden.palm', at: { x: 0.02, y: 0.3, w: 0.16, h: 0.3 }, caption: T('Gardens and fruit trees (26:134).', 'Gärten und Fruchtbäume (26:134).', 'Bašče i voćke (26:134).') },
  tower: { id: 'tower', label: T('Show-off tower', 'Prunkturm', 'Kula za razmetanje'), spotArt: 'prophet.hud-tower', target: false, at: { x: 0.44, y: 0.18, w: 0.1, h: 0.3 } },
} satisfies Record<string, SceneSpot>;

export const SPOTS_L1: SceneSpot[] = [SPOT.cattle, SPOT.garden, SPOT.spring, SPOT.sheep];
/** L2: one after another ("Find: …"); the tower built for show (26:128) is not a gift to find. */
export const SPOTS_L2: SceneSpot[] = [SPOT.cattle, SPOT.sheep, SPOT.palm, SPOT.garden, SPOT.spring, SPOT.tower];

export const BINS: SortBin[] = [
  { id: 'gift', label: T('Gift of Allah', 'Gabe Allahs', 'Allahov dar'), art: 'prophet.hud-spring' },
  { id: 'call', label: T("Hud's call", 'Huds Aufruf', 'Hudov poziv'), art: 'object.lamp' },
  { id: 'pride', label: T('Their pride', 'Ihr Hochmut', 'Njihova oholost'), art: 'prophet.hud-tower' },
];

export const SORT_ITEMS: SortItem[] = [
  { id: 'livestock', bin: 'gift', label: T('Livestock', 'Vieh', 'Stoka'), art: 'animal.cow' },
  { id: 'gardens', bin: 'gift', label: T('Gardens', 'Gärten', 'Bašče'), art: 'garden.pomegranate' },
  { id: 'springs', bin: 'gift', label: T('Springs', 'Quellen', 'Izvori'), art: 'garden.water-drop' },
  { id: 'worship', bin: 'call', label: T('Worship Allah alone', 'Allah allein dienen', 'Robovati samo Allahu') },
  { id: 'forgive', bin: 'call', label: T('Ask for forgiveness', 'Um Vergebung bitten', 'Tražiti oprost') },
  { id: 'obey', bin: 'call', label: T('Fear Allah and obey', 'Allah fürchten und gehorchen', 'Bojati se Allaha i slušati') },
  { id: 'landmarks', bin: 'pride', label: T('Towers to show off', 'Türme zum Angeben', 'Kule za razmetanje'), art: 'prophet.hud-tower' },
  { id: 'stronger', bin: 'pride', label: T('"Who is stronger than us?"', '„Wer ist stärker als wir?“', '„Ko je jači od nas?“') },
  { id: 'tyrants', bin: 'pride', label: T('Striking like tyrants', 'Wie Tyrannen zuschlagen', 'Udarati kao silnici') },
];

export const ITEM_FACT: Record<string, string> = {
  ...Object.fromEntries(SPOTS_L2.map((s) => [s.id, HUD_FACTS.gifts.id])),
  livestock: HUD_FACTS.gifts.id,
  gardens: HUD_FACTS.gifts.id,
  springs: HUD_FACTS.gifts.id,
  worship: HUD_FACTS.istighfar.id,
  forgive: HUD_FACTS.istighfar.id,
  obey: HUD_FACTS.istighfar.id,
  landmarks: HUD_FACTS.pride.id,
  stronger: HUD_FACTS.pride.id,
  tyrants: HUD_FACTS.pride.id,
};
