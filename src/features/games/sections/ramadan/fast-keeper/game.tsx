import type { GameApi } from '@/core/games';
import { GameBoard, type SortBin, SortBins, type SortItem } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * Fast Keeper – what breaks the fast and what does not (Hanafi practice, Bosnian ilmihal; 2:187; Bukhari 1933).
 * L1: six pictures, hints. L2: eight things incl. miswak, saliva, rinsing the mouth, no hints.
 * L3: the twist – the same act forgetfully or on purpose; one card at a time.
 */

export const FAST_KEEPER_ID = 'fast-keeper';

const i18n = defineNamespace(`game.${FAST_KEEPER_ID}`, {
  en: {
    title: 'Fast Keeper',
    description: 'Between dawn and sunset: what breaks the fast – and what does not?',
    howTo: 'Drag each card into the right basket (or tap the card, then the basket).',
    'play.prompt': 'Does it break the fast? Sort each card.',
    'play.twist': 'Careful: did it happen by forgetting or on purpose?',
    'bin.breaks': 'Breaks the fast',
    'bin.keeps': 'The fast goes on',
  },
  de: {
    title: 'Fastenhüter',
    description: 'Zwischen Morgendämmerung und Sonnenuntergang: Was bricht das Fasten – und was nicht?',
    howTo: 'Zieh jede Karte in den richtigen Korb (oder tippe auf die Karte und dann auf den Korb).',
    'play.prompt': 'Bricht es das Fasten? Sortiere jede Karte.',
    'play.twist': 'Achtung: Ist es aus Vergessen oder mit Absicht passiert?',
    'bin.breaks': 'Bricht das Fasten',
    'bin.keeps': 'Das Fasten bleibt',
  },
  bs: {
    title: 'Čuvar posta',
    description: 'Između zore i zalaska sunca: šta kvari post – a šta ne?',
    howTo: 'Prevuci svaku karticu u pravu korpu (ili dodirni karticu, pa korpu).',
    'play.prompt': 'Da li kvari post? Razvrstaj svaku karticu.',
    'play.twist': 'Pažljivo: da li se desilo iz zaborava ili namjerno?',
    'bin.breaks': 'Kvari post',
    'bin.keeps': 'Post ostaje',
  },
});

const I = {
  bread: { id: 'bread', art: 'food.bread', label: T('Eating bread', 'Brot essen', 'Jesti hljeb'), bin: 'breaks' },
  water: { id: 'water', art: 'food.water', label: T('Drinking water', 'Wasser trinken', 'Piti vodu'), bin: 'breaks' },
  juice: { id: 'juice', art: 'ramadan.juice', label: T('A glass of juice', 'Ein Glas Saft', 'Čaša soka'), bin: 'breaks' },
  shower: { id: 'shower', art: 'ramadan.shower', label: T('Taking a shower', 'Duschen', 'Tuširanje'), bin: 'keeps' },
  sleep: { id: 'sleep', art: 'ramadan.pillow', label: T('A nap', 'Ein Nickerchen', 'Kratko spavanje'), bin: 'keeps' },
  flower: { id: 'flower', art: 'garden.flower-rose', label: T('Smelling a rose', 'An einer Rose riechen', 'Mirisati ružu'), bin: 'keeps' },
  gum: { id: 'gum', art: 'ramadan.gum', label: T('Chewing gum', 'Kaugummi kauen', 'Žvakati žvaku'), bin: 'breaks' },
  miswak: { id: 'miswak', art: 'ramadan.miswak', label: T('Using a miswak', 'Den Miswak benutzen', 'Koristiti misvak'), bin: 'keeps' },
  saliva: { id: 'saliva', art: 'body.mouth', label: T('Swallowing your own saliva', 'Den eigenen Speichel schlucken', 'Gutati svoju pljuvačku'), bin: 'keeps' },
  rinse: { id: 'rinse', art: 'body.water-on-hands', label: T('Rinsing the mouth in wudu', 'Mund ausspülen bei der Gebetswaschung', 'Ispiranje usta pri abdestu'), bin: 'keeps' },
  dates: { id: 'dates', art: 'food.dates', label: T('Eating a date at noon', 'Mittags eine Dattel essen', 'Pojesti hurmu u podne'), bin: 'breaks' },
  milk: { id: 'milk', art: 'food.milk', label: T('Drinking milk', 'Milch trinken', 'Piti mlijeko'), bin: 'breaks' },
  forgotDrink: { id: 'forgot-drink', art: 'ramadan.thought', label: T('Drinks water – forgot the fast', 'Trinkt Wasser – Fasten vergessen', 'Pije vodu – zaboravio post'), bin: 'keeps' },
  purposeDrink: { id: 'purpose-drink', art: 'food.water', label: T('Drinks water on purpose', 'Trinkt absichtlich Wasser', 'Namjerno pije vodu'), bin: 'breaks' },
  forgotEat: { id: 'forgot-eat', art: 'ramadan.thought', label: T('Eats soup – forgot the fast', 'Isst Suppe – Fasten vergessen', 'Jede čorbu – zaboravio post'), bin: 'keeps' },
  purposeEat: { id: 'purpose-eat', art: 'food.soup', label: T('Eats soup on purpose', 'Isst absichtlich Suppe', 'Namjerno jede čorbu'), bin: 'breaks' },
} satisfies Record<string, SortItem>;

export interface FastKeeperConfig {
  items: SortItem[];
  hints: boolean;
  visible?: number;
  twist?: boolean;
}

const FORGOT = new Set(['forgot-drink', 'forgot-eat', 'purpose-drink', 'purpose-eat']);

function FastKeeperGame(api: GameApi<FastKeeperConfig>) {
  const { items, hints, visible, twist } = api.config;
  const bins: SortBin[] = [
    { id: 'breaks', label: api.t('bin.breaks'), art: 'kit.crate' },
    { id: 'keeps', label: api.t('bin.keeps'), art: 'kit.basket' },
  ];
  return (
    <GameBoard api={api}>
      <SortBins
        bins={bins}
        items={items}
        hints={hints}
        visible={visible}
        prompt={api.t(twist ? 'play.twist' : 'play.prompt')}
        onDone={finishWith(api, items.length, (id) => (FORGOT.has(id) ? FACTS.forgot.id : undefined))}
      />
    </GameBoard>
  );
}

export const fastKeeperGame = ramadanGame<FastKeeperConfig>({
  id: FAST_KEEPER_ID,
  i18n,
  coverArt: 'ramadan.juice',
  hintArt: 'kit.basket',
  component: FastKeeperGame,
  levels: [
    { level: 1, config: { items: [I.bread, I.shower, I.water, I.sleep, I.juice, I.flower], hints: true }, facts: [FACTS.fastTime] },
    { level: 2, config: { items: [I.gum, I.miswak, I.saliva, I.dates, I.rinse, I.milk, I.shower, I.juice], hints: false }, facts: [FACTS.breaks] },
    { level: 3, config: { items: [I.forgotDrink, I.purposeDrink, I.rinse, I.purposeEat, I.forgotEat, I.gum], hints: false, visible: 2, twist: true }, facts: [FACTS.forgot, FACTS.sawm] },
  ],
  teaches: { questionKeys: ['quest:ramadan-fast-time'] },
  order: 30,
});
