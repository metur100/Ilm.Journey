import { type GameDef, type GameFact, registerGame } from '@/core/games';

import { POSITION_FACTS as P, PRAYER_FACTS } from './data/facts';
import type { PrayerId } from './data/prayers';
import { type GameTexts, prayerNamespace } from './i18n';
import { PrayerGame, type PrayerGameConfig, type RoundKind } from './PrayerGame';

type Texts = { en: GameTexts; de: GameTexts; bs: GameTexts };

interface Spec {
  id: string;
  prayer: PrayerId | 'guide';
  texts: Texts;
  facts: [GameFact[], GameFact[], GameFact[]];
  rounds: RoundKind[];
  order: number;
}

const HOW: Texts = {
  en: { title: '', description: '', howTo: 'Level 1: pray along – swipe and tap to make each movement. Level 2: put the prayer in order. Level 3: lead it yourself.' },
  de: { title: '', description: '', howTo: 'Stufe 1: Bete mit – wische und tippe für jede Bewegung. Stufe 2: Bring das Gebet in die richtige Reihenfolge. Stufe 3: Leite es selbst.' },
  bs: { title: '', description: '', howTo: 'Nivo 1: klanjaj zajedno – prevuci i dodirni za svaki pokret. Nivo 2: poredaj namaz. Nivo 3: klanjaj sam.' },
};

const texts = (en: [string, string], de: [string, string], bs: [string, string]): Texts => ({
  en: { title: en[0], description: en[1], howTo: HOW.en.howTo },
  de: { title: de[0], description: de[1], howTo: HOW.de.howTo },
  bs: { title: bs[0], description: bs[1], howTo: HOW.bs.howTo },
});

const F = PRAYER_FACTS;

const SPECS: Spec[] = [
  {
    id: 'salah-guide',
    prayer: 'guide',
    texts: texts(
      ['Salah, Step by Step', 'Every position of the prayer with a clear, moving figure – takbir, ruku’, the 7 points of sajda, the sittings and the selam.'],
      ['Das Gebet Schritt für Schritt', 'Jede Haltung des Gebets mit einer klaren, bewegten Figur – Takbir, Ruku‘, die 7 Punkte der Niederwerfung, das Sitzen und der Salam.'],
      ['Namaz korak po korak', 'Svaki položaj namaza uz jasnu figuru koja se kreće – tekbir, ruku’, 7 tačaka sedžde, sjedenja i selam.'],
    ),
    facts: [[P.sajda, P.takbirHands, P.hands], [P.ruku, P.calm], [P.sitting, P.finger, P.selam]],
    rounds: ['rakat', 'outline', 'sitting'],
    order: 1,
  },
  {
    id: 'salah-sabah',
    prayer: 'sabah',
    texts: texts(
      ['Sabah at Dawn', '2 sunnah and 2 fard at dawn – the fard is recited aloud.'],
      ['Fadschr in der Morgendämmerung', '2 Sunna und 2 Fard in der Morgendämmerung – das Fard wird laut rezitiert.'],
      ['Sabah u zoru', '2 sunneta i 2 farza u zoru – farz se uči naglas.'],
    ),
    facts: [[F.sabah.time, P.takbirHands, P.sajda], [F.sabah.parts, P.ruku], [F.sabah.sunnah, P.selam, P.calm]],
    rounds: ['rakat', 'outline', 'parts'],
    order: 2,
  },
  {
    id: 'salah-podne',
    prayer: 'podne',
    texts: texts(
      ['Podne at Midday', '4 sunnah, 4 fard and 2 sunnah after the sun passes its highest point.'],
      ['Dhuhr am Mittag', '4 Sunna, 4 Fard und 2 Sunna, nachdem die Sonne ihren höchsten Punkt überschritten hat.'],
      ['Podne u podne', '4 sunneta, 4 farza i 2 sunneta nakon što sunce prođe najvišu tačku.'],
    ),
    facts: [[F.podne.time, P.hands, P.sajda], [F.podne.parts, P.twoSittings], [F.podne.twelve, P.fatihaOnly, P.sitting]],
    rounds: ['parts', 'outline', 'sitting'],
    order: 3,
  },
  {
    id: 'salah-ikindija',
    prayer: 'ikindija',
    texts: texts(
      ['Ikindija in the Afternoon', '4 sunnah and 4 fard in the afternoon – the “middle prayer”.'],
      ['Asr am Nachmittag', '4 Sunna und 4 Fard am Nachmittag – das „mittlere Gebet“.'],
      ['Ikindija poslijepodne', '4 sunneta i 4 farza poslijepodne – „srednji namaz“.'],
    ),
    facts: [[F.ikindija.time, F.ikindija.middle, P.finger], [F.ikindija.parts, F.ikindija.ghayr], [P.fatihaOnly, P.twoSittings, P.sitting]],
    rounds: ['parts', 'outline', 'rakat'],
    order: 4,
  },
  {
    id: 'salah-aksam',
    prayer: 'aksam',
    texts: texts(
      ['Akšam at Sunset', '3 fard and 2 sunnah just after the sun has set.'],
      ['Maghrib bei Sonnenuntergang', '3 Fard und 2 Sunna kurz nach Sonnenuntergang.'],
      ['Akšam o zalasku sunca', '3 farza i 2 sunneta odmah nakon zalaska sunca.'],
    ),
    facts: [[F.aksam.time, P.ruku, P.selam], [F.aksam.parts, P.twoSittings], [P.fatihaOnly, P.hands, P.sitting]],
    rounds: ['parts', 'outline', 'sitting'],
    order: 5,
  },
  {
    id: 'salah-jacija',
    prayer: 'jacija',
    texts: texts(
      ['Jacija at Night', '4 sunnah, 4 fard, 2 sunnah and then vitr under the night sky.'],
      ['Ischa in der Nacht', '4 Sunna, 4 Fard, 2 Sunna und danach Witr unter dem Nachthimmel.'],
      ['Jacija noću', '4 sunneta, 4 farza, 2 sunneta i zatim vitr pod noćnim nebom.'],
    ),
    facts: [[F.jacija.time, P.takbirHands, P.sajda], [F.jacija.parts, P.twoSittings], [F.jacija.aloud, P.fatihaOnly, P.finger]],
    rounds: ['parts', 'outline', 'sitting'],
    order: 6,
  },
  {
    id: 'salah-vitr',
    prayer: 'vitr',
    texts: texts(
      ['Vitr and the Kunut', '3 rakats at the end of the night prayer, with the kunut dua in the third.'],
      ['Witr und das Kunut', '3 Rak‘as am Ende des Nachtgebets, mit dem Kunut-Bittgebet in der dritten.'],
      ['Vitr i kunut', '3 rekata na kraju noćnog namaza, s kunut-dovom u trećem.'],
    ),
    facts: [[F.vitr.kunut, P.takbirHands, P.sajda], [F.vitr.parts, F.vitr.differ], [P.twoSittings, P.calm, P.selam]],
    rounds: ['outline', 'kunut', 'rakat'],
    order: 7,
  },
  {
    id: 'salah-dzuma',
    prayer: 'dzuma',
    texts: texts(
      ['Džuma on Friday', 'The Friday prayer: sunnah, the khutbah, 2 fard in congregation and sunnah after it.'],
      ['Das Freitagsgebet', 'Das Freitagsgebet: Sunna, die Chutba, 2 Fard in Gemeinschaft und Sunna danach.'],
      ['Džuma u petak', 'Džuma-namaz: sunnet, hutba, 2 farza u džematu i sunnet poslije.'],
    ),
    facts: [[F.dzuma.command, P.hands, P.sajda], [F.dzuma.parts, P.sitting], [F.dzuma.aloud, P.selam, P.calm]],
    rounds: ['parts', 'outline', 'sitting'],
    order: 8,
  },
];

const COVER: Record<PrayerId | 'guide', string> = {
  guide: 'salah.prayer-cover-guide',
  sabah: 'salah.prayer-cover-sabah',
  podne: 'salah.prayer-cover-podne',
  ikindija: 'salah.prayer-cover-ikindija',
  aksam: 'salah.prayer-cover-aksam',
  jacija: 'salah.prayer-cover-jacija',
  vitr: 'salah.prayer-cover-vitr',
  dzuma: 'salah.prayer-cover-dzuma',
};

function makeGame(s: Spec): GameDef<PrayerGameConfig> {
  return {
    id: s.id,
    topicId: 'salah',
    i18n: prayerNamespace(s.id, s.texts),
    coverArt: COVER[s.prayer],
    hintArt: 'salah.prayer-ruku',
    component: PrayerGame,
    levels: [
      { level: 1, config: { prayer: s.prayer, mode: 'along' }, facts: s.facts[0] },
      { level: 2, config: { prayer: s.prayer, mode: 'order', rounds: s.rounds }, facts: s.facts[1] },
      { level: 3, config: { prayer: s.prayer, mode: 'lead' }, facts: s.facts[2] },
    ],
    teaches: { questionKeys: ['quest:salah-sujud', 'quest:salah-takbir', 'quest:salah-rakahs-match'] },
    order: s.order,
  };
}

export const SALAH_PRAYER_GAMES: GameDef<PrayerGameConfig>[] = SPECS.map(makeGame);

export function registerSalahPrayerGameDefs(): void {
  for (const g of SALAH_PRAYER_GAMES) registerGame(g);
}
