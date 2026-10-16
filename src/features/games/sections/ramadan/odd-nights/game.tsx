import type { GameApi } from '@/core/games';
import { GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { StarNights } from '../shared/engines/StarNights';
import { FACTS } from '../shared/facts';

/*
 * The Odd Nights: Laylat al-Qadr is sought in the odd nights of the last ten nights (Bukhari 2017; Quran 97).
 * L1: the last ten nights as stars – light the odd ones, with hints. L2: the whole month in the sky – find the odd
 * nights of the last ten without help. L3: in order, and only night 21 shows its number – count the stars.
 */

export const ODD_NIGHTS_ID = 'odd-nights';

const i18n = defineNamespace(`game.${ODD_NIGHTS_ID}`, {
  en: {
    title: 'The Odd Nights',
    description: 'Laylat al-Qadr is better than a thousand months. Seek it in the odd nights of the last ten.',
    howTo: 'Tap the stars of the odd nights of the last ten nights. They light up gold.',
    'play.ten': 'The last ten nights of Ramadan: light the odd ones.',
    'play.month': 'All thirty nights: light only the odd nights of the last ten.',
    'play.count': 'Light the odd nights in order – only night 21 shows its number. Count!',
    night: 'Night {n}',
    found: 'Night {n} – an odd night of the last ten.',
    next: 'Not this one – count on to the next odd night.',
  },
  de: {
    title: 'Die ungeraden Nächte',
    description: 'Laylat al-Qadr ist besser als tausend Monate. Suche sie in den ungeraden der letzten zehn Nächte.',
    howTo: 'Tippe auf die Sterne der ungeraden Nächte unter den letzten zehn. Sie leuchten golden.',
    'play.ten': 'Die letzten zehn Nächte des Ramadan: Lass die ungeraden leuchten.',
    'play.month': 'Alle dreißig Nächte: Lass nur die ungeraden der letzten zehn leuchten.',
    'play.count': 'Lass die ungeraden Nächte der Reihe nach leuchten – nur Nacht 21 zeigt ihre Zahl. Zähle!',
    night: 'Nacht {n}',
    found: 'Nacht {n} – eine ungerade der letzten zehn Nächte.',
    next: 'Nicht diese – zähle weiter bis zur nächsten ungeraden Nacht.',
  },
  bs: {
    title: 'Neparne noći',
    description: 'Lejletul-kadr je bolja od hiljadu mjeseci. Traži je u neparnim od posljednjih deset noći.',
    howTo: 'Dodirni zvijezde neparnih noći među posljednjih deset. Zasjat će zlatno.',
    'play.ten': 'Posljednjih deset noći ramazana: upali neparne.',
    'play.month': 'Svih trideset noći: upali samo neparne od posljednjih deset.',
    'play.count': 'Pali neparne noći redom – samo 21. noć pokazuje svoj broj. Broji!',
    night: '{n}. noć',
    found: '{n}. noć – neparna od posljednjih deset.',
    next: 'Ne ova – broji dalje do sljedeće neparne noći.',
  },
});

const LAST_TEN = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const ODD = [21, 23, 25, 27, 29];
const MONTH = Array.from({ length: 30 }, (_, i) => i + 1);

export interface OddNightsConfig {
  nights: number[];
  ordered: boolean;
  hints: boolean;
  onlyFirstNumber: boolean;
  prompt: 'play.ten' | 'play.month' | 'play.count';
}

function OddNightsGame(api: GameApi<OddNightsConfig>) {
  const { nights, ordered, hints, onlyFirstNumber, prompt } = api.config;
  return (
    <GameBoard api={api} padding={8}>
      <StarNights
        nights={nights}
        targets={ODD}
        ordered={ordered}
        hints={hints}
        band={nights.length > 10 ? LAST_TEN : undefined}
        numbered={onlyFirstNumber ? (n) => n === 21 : undefined}
        prompt={api.t(prompt)}
        texts={{ night: (n) => api.t('night', { n }), found: (n) => api.t('found', { n }), next: api.t('next') }}
        onDone={finishWith(api, ODD.length)}
      />
    </GameBoard>
  );
}

export const oddNightsGame = ramadanGame<OddNightsConfig>({
  id: ODD_NIGHTS_ID,
  i18n,
  coverArt: 'ramadan.qadr-sky',
  hintArt: 'object.star8',
  component: OddNightsGame,
  levels: [
    { level: 1, config: { nights: LAST_TEN, ordered: false, hints: true, onlyFirstNumber: false, prompt: 'play.ten' }, facts: [FACTS.qadr] },
    { level: 2, config: { nights: MONTH, ordered: false, hints: false, onlyFirstNumber: false, prompt: 'play.month' }, facts: [FACTS.qadrSurah] },
    { level: 3, config: { nights: LAST_TEN, ordered: true, hints: false, onlyFirstNumber: true, prompt: 'play.count' }, facts: [FACTS.taraweeh] },
  ],
  teaches: { questionKeys: ['quest:ramadan-qadr', 'quest:ramadan-qadr-when'] },
  order: 60,
});
