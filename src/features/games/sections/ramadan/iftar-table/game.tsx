import type { GameApi } from '@/core/games';
import { type BuildPart, BuildScene, GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * The Iftar Table: set the table by the window at sunset. The fast is broken with fresh dates, else dry dates, else
 * a few sips of water (Abu Dawud 2356); then the meal – and a plate to share (Bukhari 6).
 * Every level sets other things on the table:
 * L1: the meal (soup, bread, olives, the jug) anywhere, with silhouettes – iftar is the meal at sunset.
 * L2: breaking the fast the Sunnah way, in order – fresh dates, else dry dates, else water.
 * L3: no silhouettes – dishes to share with guests and the plate for the neighbour (Bukhari 6).
 */

export const IFTAR_TABLE_ID = 'iftar-table';

const i18n = defineNamespace(`game.${IFTAR_TABLE_ID}`, {
  en: {
    title: 'The Iftar Table',
    description: 'The sun is setting – set the iftar table: dates and water first, then the meal to share.',
    howTo: 'Drag each dish to its place on the table (or tap it, then its place).',
    'play.free': 'The sun is setting – set the iftar meal: drag each dish to its place.',
    'play.order': 'Break the fast the Sunnah way: fresh dates, else dry dates, else a few sips of water.',
    'play.share': 'Guests are coming! Set the dishes to share – and remember the neighbour.',
    'reveal.title': 'Iftar is ready!',
    'reveal.caption': 'The sun has set – we break the fast with dates and water.',
  },
  de: {
    title: 'Der Iftar-Tisch',
    description: 'Die Sonne geht unter – deck den Iftar-Tisch: zuerst Datteln und Wasser, dann das Essen zum Teilen.',
    howTo: 'Zieh jedes Gericht an seinen Platz auf dem Tisch (oder tippe darauf und dann auf seinen Platz).',
    'play.free': 'Die Sonne geht unter – deck das Iftar-Essen: Zieh jedes Gericht an seinen Platz.',
    'play.order': 'Brich das Fasten nach der Sunna: frische Datteln, sonst getrocknete, sonst ein paar Schlucke Wasser.',
    'play.share': 'Gäste kommen! Stell die Gerichte zum Teilen hin – und denk an den Nachbarn.',
    'reveal.title': 'Der Iftar ist bereit!',
    'reveal.caption': 'Die Sonne ist untergegangen – wir brechen das Fasten mit Datteln und Wasser.',
  },
  bs: {
    title: 'Iftarska sofra',
    description: 'Sunce zalazi – postavi iftarsku sofru: prvo hurme i voda, pa jelo koje dijelimo.',
    howTo: 'Prevuci svako jelo na njegovo mjesto na sofri (ili ga dodirni, pa njegovo mjesto).',
    'play.free': 'Sunce zalazi – postavi iftarsko jelo: prevuci svako jelo na njegovo mjesto.',
    'play.order': 'Iftari po sunnetu: svježe hurme, inače suhe, inače nekoliko gutljaja vode.',
    'play.share': 'Dolaze gosti! Postavi jela za dijeljenje – i sjeti se komšije.',
    'reveal.title': 'Iftar je spreman!',
    'reveal.caption': 'Sunce je zašlo – post prekidamo hurmom i vodom.',
  },
});

const P = {
  fresh: {
    id: 'fresh-dates',
    art: 'ramadan.fresh-dates',
    label: T('Fresh dates', 'Frische Datteln', 'Svježe hurme'),
    slot: { x: 0.02, y: 0.5, w: 0.19, h: 0.18 },
    caption: T('Fresh dates first – that is how the Prophet ﷺ broke his fast.', 'Zuerst frische Datteln – so brach der Prophet ﷺ sein Fasten.', 'Prvo svježe hurme – tako je Poslanik ﷺ iftario.'),
  },
  dry: {
    id: 'dry-dates',
    art: 'food.dates',
    label: T('Dry dates', 'Getrocknete Datteln', 'Suhe hurme'),
    slot: { x: 0.21, y: 0.52, w: 0.17, h: 0.16 },
    caption: T('No fresh dates? Then dry dates.', 'Keine frischen Datteln? Dann getrocknete.', 'Nema svježih hurmi? Onda suhe.'),
  },
  water: {
    id: 'water',
    art: 'food.water',
    label: T('Water', 'Wasser', 'Voda'),
    slot: { x: 0.38, y: 0.48, w: 0.11, h: 0.2 },
    caption: T('And a few sips of water.', 'Und ein paar Schlucke Wasser.', 'I nekoliko gutljaja vode.'),
  },
  soup: {
    id: 'soup',
    art: 'food.soup',
    label: T('Soup', 'Suppe', 'Čorba'),
    slot: { x: 0.61, y: 0.5, w: 0.18, h: 0.18 },
    caption: T('Then the warm meal.', 'Dann das warme Essen.', 'Zatim toplo jelo.'),
  },
  bread: {
    id: 'bread',
    art: 'food.bread',
    label: T('Bread', 'Brot', 'Hljeb'),
    slot: { x: 0.8, y: 0.5, w: 0.18, h: 0.18 },
    caption: T('Bread for everyone at the table.', 'Brot für alle am Tisch.', 'Hljeb za sve za sofrom.'),
  },
  jug: {
    id: 'jug',
    art: 'object.water-jug',
    label: T('Water jug', 'Wasserkrug', 'Ibrik s vodom'),
    slot: { x: 0.49, y: 0.42, w: 0.12, h: 0.26 },
    caption: T('A jug, so every glass can be filled.', 'Ein Krug, damit jedes Glas gefüllt werden kann.', 'Ibrik, da se svaka čaša može napuniti.'),
  },
  olives: {
    id: 'olives',
    art: 'food.olives',
    label: T('Olives', 'Oliven', 'Masline'),
    slot: { x: 0.02, y: 0.5, w: 0.19, h: 0.18 },
    caption: T('Olives and bread – a simple, blessed meal.', 'Oliven und Brot – ein einfaches, gesegnetes Essen.', 'Masline i hljeb – jednostavno, blagoslovljeno jelo.'),
  },
  rice: {
    id: 'rice',
    art: 'food.rice',
    label: T('Rice for the guests', 'Reis für die Gäste', 'Riža za goste'),
    slot: { x: 0.61, y: 0.5, w: 0.18, h: 0.18 },
    caption: T('Cook a little more – there is enough for guests.', 'Koch etwas mehr – es reicht für Gäste.', 'Skuhaj malo više – ima dovoljno i za goste.'),
  },
  fruit: {
    id: 'fruit',
    art: 'food.fruit-bowl',
    label: T('Fruit to share', 'Obst zum Teilen', 'Voće za dijeljenje'),
    slot: { x: 0.21, y: 0.52, w: 0.17, h: 0.16 },
    caption: T('A bowl of fruit for everyone at the table.', 'Eine Schale Obst für alle am Tisch.', 'Zdjela voća za sve za sofrom.'),
  },
  milk: {
    id: 'milk',
    art: 'food.milk',
    label: T('Milk for the guests', 'Milch für die Gäste', 'Mlijeko za goste'),
    slot: { x: 0.38, y: 0.48, w: 0.11, h: 0.2 },
    caption: T('Inviting guests to iftar – sharing makes the table rich.', 'Gäste zum Iftar einladen – Teilen macht den Tisch reich.', 'Pozvati goste na iftar – dijeljenje čini sofru bogatom.'),
  },
  share: {
    id: 'share-plate',
    art: 'object.plate',
    label: T('A plate for the neighbour', 'Ein Teller für den Nachbarn', 'Tanjir za komšiju'),
    slot: { x: 0.77, y: 0.69, w: 0.2, h: 0.12 },
    caption: T('Sharing iftar – the Prophet ﷺ was most generous in Ramadan.', 'Iftar teilen – der Prophet ﷺ war im Ramadan am großzügigsten.', 'Dijeljenje iftara – Poslanik ﷺ je u ramazanu bio najdarežljiviji.'),
  },
} satisfies Record<string, BuildPart>;

export interface IftarConfig {
  parts: BuildPart[];
  ordered: boolean;
  ghosts: boolean;
  hints: boolean;
  prompt: 'play.free' | 'play.order' | 'play.share';
}

const FACT_OF: Record<string, string> = {
  'share-plate': FACTS.generous.id,
  rice: FACTS.generous.id,
  fruit: FACTS.generous.id,
  milk: FACTS.generous.id,
  'fresh-dates': FACTS.iftarDates.id,
  'dry-dates': FACTS.iftarDates.id,
  water: FACTS.iftarDates.id,
  soup: FACTS.iftar.id,
  bread: FACTS.iftar.id,
  jug: FACTS.iftar.id,
  olives: FACTS.iftar.id,
};

function IftarTableGame(api: GameApi<IftarConfig>) {
  const { parts, ordered, ghosts, hints, prompt } = api.config;
  return (
    <GameBoard api={api} padding={8}>
      <BuildScene
        scene="ramadan.iftar-table"
        parts={parts}
        ordered={ordered}
        ghosts={ghosts}
        hints={hints}
        prompt={api.t(prompt)}
        reveal={{ title: api.t('reveal.title'), caption: api.t('reveal.caption') }}
        onDone={finishWith(api, parts.length, (id) => FACT_OF[id])}
      />
    </GameBoard>
  );
}

export const iftarTableGame = ramadanGame<IftarConfig>({
  id: IFTAR_TABLE_ID,
  i18n,
  coverArt: 'ramadan.iftar-feast',
  hintArt: 'food.dates',
  component: IftarTableGame,
  levels: [
    { level: 1, config: { parts: [P.soup, P.bread, P.jug, P.olives], ordered: false, ghosts: true, hints: true, prompt: 'play.free' }, facts: [FACTS.iftar] },
    { level: 2, config: { parts: [P.fresh, P.dry, P.water], ordered: true, ghosts: true, hints: false, prompt: 'play.order' }, facts: [FACTS.iftarDates] },
    { level: 3, config: { parts: [P.rice, P.fruit, P.milk, P.share], ordered: false, ghosts: false, hints: false, prompt: 'play.share' }, facts: [FACTS.generous] },
  ],
  teaches: { questionKeys: ['quest:ramadan-iftar-dates', 'quest:ramadan-charity-scenario'] },
  order: 70,
});
