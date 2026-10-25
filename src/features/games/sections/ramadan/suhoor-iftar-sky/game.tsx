import type { GameApi } from '@/core/games';
import { GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';
import type { LocalizedText } from '@/core/models';

import { finishWith, ramadanGame } from '../shared/define';
import { SkyDial, type SkyMoment, type SkyRound } from '../shared/engines/SkyDial';
import { FACTS, T } from '../shared/facts';

/*
 * Suhoor & Iftar Sky: drag the sun (or the moon) along the arc of the day to the right moment.
 * "Eat and drink until the white thread of dawn becomes distinct … then complete the fast until the night" (2:187).
 * Every level asks about other moments: L1 the frame of the fast (dawn, sunset) with labels and a glowing target.
 * L2 the meals and the night prayer (suhoor, taraweeh), labels on, no glow. L3 a whole fasting day without labels
 * (morning, noon, the hungry afternoon, eating again at night).
 */

export const SKY_ID = 'suhoor-iftar-sky';

const i18n = defineNamespace(`game.${SKY_ID}`, {
  en: {
    title: 'Suhoor & Iftar Sky',
    description: 'Move the sun across the Ramadan sky: when does the fast begin, when is iftar, when is the night prayer?',
    howTo: 'Drag the sun or the moon along the arc (or tap a point), then tap "Here!".',
    here: 'Here!',
    earlier: 'Earlier than that – move the sun back.',
    later: 'Later than that – move the sun on.',
    moment: 'Move the sun to: {label}',
  },
  de: {
    title: 'Suhur- und Iftar-Himmel',
    description: 'Bewege die Sonne über den Ramadan-Himmel: Wann beginnt das Fasten, wann ist Iftar, wann das Nachtgebet?',
    howTo: 'Zieh die Sonne oder den Mond über den Bogen (oder tippe auf einen Punkt) und tippe dann auf „Hier!“.',
    here: 'Hier!',
    earlier: 'Früher – schieb die Sonne zurück.',
    later: 'Später – schieb die Sonne weiter.',
    moment: 'Sonne bewegen zu: {label}',
  },
  bs: {
    title: 'Nebo sehura i iftara',
    description: 'Pomjeraj sunce preko ramazanskog neba: kada počinje post, kada je iftar, kada noćni namaz?',
    howTo: 'Prevuci sunce ili mjesec po luku (ili dodirni tačku), pa dodirni „Ovdje!“.',
    here: 'Ovdje!',
    earlier: 'Ranije – vrati sunce nazad.',
    later: 'Kasnije – pomjeri sunce dalje.',
    moment: 'Pomjeri sunce na: {label}',
  },
});

const LABELS: Record<SkyMoment, LocalizedText> = {
  'late-night': T('Before dawn', 'Vor der Dämmerung', 'Prije zore'),
  dawn: T('Dawn (Fajr)', 'Dämmerung (Fadschr)', 'Zora (sabah)'),
  morning: T('Morning', 'Morgen', 'Jutro'),
  noon: T('Noon', 'Mittag', 'Podne'),
  afternoon: T('Afternoon', 'Nachmittag', 'Ikindija'),
  sunset: T('Sunset (Maghrib)', 'Sonnenuntergang (Maghrib)', 'Zalazak (akšam)'),
  night: T('Night (Isha)', 'Nacht (Ischa)', 'Noć (jacija)'),
};

const R = {
  begin: {
    id: 'begin',
    moment: 'dawn',
    prompt: T('The fast begins. Where is the sun?', 'Das Fasten beginnt. Wo ist die Sonne?', 'Post počinje. Gdje je sunce?'),
    caption: T('At dawn (Fajr) we stop eating and drinking.', 'In der Morgendämmerung (Fadschr) hören wir auf zu essen und zu trinken.', 'U zoru (sabah) prestajemo jesti i piti.'),
  },
  iftar: {
    id: 'iftar',
    moment: 'sunset',
    prompt: T('Time for iftar! Where is the sun?', 'Zeit für den Iftar! Wo ist die Sonne?', 'Vrijeme je za iftar! Gdje je sunce?'),
    caption: T('At sunset (Maghrib) we break the fast – with dates or water.', 'Bei Sonnenuntergang (Maghrib) brechen wir das Fasten – mit Datteln oder Wasser.', 'O zalasku sunca (akšam) prekidamo post – hurmom ili vodom.'),
  },
  suhoor: {
    id: 'suhoor',
    moment: 'late-night',
    prompt: T('Time for suhoor, the blessed meal. When?', 'Zeit für den Suhur, die gesegnete Mahlzeit. Wann?', 'Vrijeme za sehur, berićetni obrok. Kada?'),
    caption: T('Suhoor is eaten before dawn – there is blessing in it.', 'Der Suhur wird vor der Dämmerung gegessen – in ihm liegt Segen.', 'Sehur se jede prije zore – u njemu je bereket.'),
  },
  taraweeh: {
    id: 'taraweeh',
    moment: 'night',
    prompt: T('The night prayer of Ramadan (taraweeh). When?', 'Das Nachtgebet des Ramadan (Tarawih). Wann?', 'Noćni namaz ramazana (teravija). Kada?'),
    caption: T('Taraweeh is prayed at night, after Isha.', 'Tarawih wird nachts gebetet, nach dem Ischa.', 'Teravija se klanja noću, nakon jacije.'),
  },
  midday: {
    id: 'midday',
    moment: 'noon',
    prompt: T('Still fasting at Dhuhr. Where is the sun?', 'Beim Dhuhr fasten wir noch. Wo ist die Sonne?', 'U podne još postimo. Gdje je sunce?'),
    caption: T('The fast lasts the whole day – from dawn until sunset.', 'Das Fasten dauert den ganzen Tag – von der Dämmerung bis Sonnenuntergang.', 'Post traje cijeli dan – od zore do zalaska sunca.'),
  },
  morning: {
    id: 'morning',
    moment: 'morning',
    prompt: T('The first hours of the fast. Where is the sun?', 'Die ersten Stunden des Fastens. Wo ist die Sonne?', 'Prvi sati posta. Gdje je sunce?'),
    caption: T('In the morning we are already fasting – since dawn.', 'Am Morgen fasten wir schon – seit der Dämmerung.', 'Ujutro već postimo – od zore.'),
  },
  asr: {
    id: 'asr',
    moment: 'afternoon',
    prompt: T('Asr – you are hungry, but it is not iftar yet. Where is the sun?', 'Asr – du hast Hunger, aber es ist noch nicht Iftar. Wo ist die Sonne?', 'Ikindija – gladan si, ali još nije iftar. Gdje je sunce?'),
    caption: T('Be patient – the fast lasts until sunset.', 'Hab Geduld – das Fasten dauert bis Sonnenuntergang.', 'Strpi se – post traje do zalaska sunca.'),
  },
  nightMeal: {
    id: 'night-meal',
    moment: 'night',
    prompt: T('After iftar – eating and drinking are allowed again. When?', 'Nach dem Iftar – Essen und Trinken sind wieder erlaubt. Wann?', 'Poslije iftara – jelo i piće su opet dozvoljeni. Kada?'),
    caption: T('At night eating and drinking are allowed (2:187).', 'Nachts darf man essen und trinken (2:187).', 'Noću je dozvoljeno jesti i piti (2:187).'),
  },
} satisfies Record<string, SkyRound>;

export interface SkyConfig {
  rounds: SkyRound[];
  labels: boolean;
  hints: boolean;
}

const FACT_OF: Record<string, string> = {
  begin: FACTS.fastTime.id,
  midday: FACTS.fastTime.id,
  iftar: FACTS.iftar.id,
  suhoor: FACTS.suhoor.id,
  taraweeh: FACTS.taraweeh.id,
  morning: FACTS.sawm.id,
  asr: FACTS.sawm.id,
  'night-meal': FACTS.sawm.id,
};

function SuhoorIftarSkyGame(api: GameApi<SkyConfig>) {
  const { rounds, labels, hints } = api.config;
  return (
    <GameBoard api={api}>
      <SkyDial
        rounds={rounds}
        labels={LABELS}
        showLabels={labels}
        hints={hints}
        texts={{ here: api.t('here'), earlier: api.t('earlier'), later: api.t('later'), moment: (label) => api.t('moment', { label }) }}
        onDone={finishWith(api, rounds.length, (id) => FACT_OF[id])}
      />
    </GameBoard>
  );
}

export const suhoorIftarSkyGame = ramadanGame<SkyConfig>({
  id: SKY_ID,
  i18n,
  coverArt: 'ramadan.sky-arc',
  hintArt: 'garden.sun',
  component: SuhoorIftarSkyGame,
  levels: [
    { level: 1, config: { rounds: [R.begin, R.iftar], labels: true, hints: true }, facts: [FACTS.fastTime, FACTS.iftar] },
    { level: 2, config: { rounds: [R.suhoor, R.taraweeh], labels: true, hints: false }, facts: [FACTS.suhoor, FACTS.taraweeh] },
    { level: 3, config: { rounds: [R.morning, R.midday, R.asr, R.nightMeal], labels: false, hints: false }, facts: [FACTS.sawm] },
  ],
  teaches: { questionKeys: ['quest:ramadan-fast-time', 'quest:ramadan-meals-match', 'quest:ramadan-suhoor-blessing'] },
  order: 20,
});
