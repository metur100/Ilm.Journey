import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import { hudaybiyyahI18n } from './i18n';

/*
 * The Treaty of al-Hudaybiyyah (episode 08, event "hudaybiyyah"). Wording and terms exactly as the Seerah content
 * gives them (Sahih al-Bukhari 2731, Ibn Hisham); the order of the days follows the episode (question e08-q3).
 */

const FACTS = {
  wording: blockFact('wording-of-the-treaty', 'e08.main1', { art: 'seerah.treaty-scroll' }),
  pledge: blockFact('pledge-under-the-tree', 'e08.main0', { art: 'seerah.pledge-tree', reviewKey: 'seerah:e08-q6' }),
  terms: blockFact('terms-of-the-treaty', 'e08.main2', { art: 'seerah.treaty-scroll' }),
  opening: blockFact('an-opening', 'e08.main5', { art: 'seerah.caravan-trail' }),
  example: blockFact('acting-first', 'e08.main3', { art: 'animal.sheep' }),
  victory: blockFact('clear-victory', 'e08.main4', { art: 'seerah.hudaybiyyah-camp', reviewKey: 'seerah:e08-q2' }),
};

const STEPS = ['set-out', 'camp', 'envoy', 'pledge', 'suhayl', 'written', 'sacrifice', 'fath'];
const line = (i: number) => ({ x: 0.2, y: 0.22 + i * 0.145, w: 0.6, h: 0.12 });

export const hudaybiyyahGame = seerahGame({
  id: 'hudaybiyyah-treaty',
  i18n: hudaybiyyahI18n,
  coverArt: 'seerah.hudaybiyyah-camp',
  hintArt: 'seerah.treaty-scroll',
  levels: [
    {
      config: {
        mode: 'sort',
        prompt: 'play.l1',
        bins: [
          { id: 'written', label: { key: 'bin.written' }, art: 'seerah.treaty-scroll' },
          { id: 'left-out', label: { key: 'bin.left-out' }, art: 'object.scroll' },
        ],
        items: [
          { id: 'your-name', label: { key: 'word.your-name' }, bin: 'written' },
          { id: 'ibn-abdullah', label: { key: 'word.ibn-abdullah' }, bin: 'written' },
          { id: 'basmalah', label: { key: 'word.basmalah' }, bin: 'left-out' },
          { id: 'messenger', label: { key: 'word.messenger' }, bin: 'left-out' },
        ],
        factMap: { 'your-name': 'wording-of-the-treaty', 'ibn-abdullah': 'wording-of-the-treaty', basmalah: 'wording-of-the-treaty', messenger: 'wording-of-the-treaty' },
      },
      facts: [FACTS.wording, FACTS.pledge],
    },
    {
      config: {
        mode: 'build',
        prompt: 'play.l2',
        scene: 'seerah.treaty-scroll',
        ghosts: true,
        hints: false,
        parts: [
          { id: 'truce', label: { key: 'term.truce' }, art: 'object.hourglass', slot: line(0), caption: { key: 'caption.truce' } },
          { id: 'return', label: { key: 'term.return' }, art: 'animal.camel', slot: line(1), caption: { key: 'caption.return' } },
          { id: 'umrah', label: { key: 'term.umrah' }, art: 'seerah.kaaba', slot: line(2), caption: { key: 'caption.umrah' } },
          { id: 'one-way', label: { key: 'term.one-way' }, art: 'seerah.letter-sealed', slot: line(3), caption: { key: 'caption.one-way' } },
        ],
        reveal: { title: { key: 'reveal.title' }, caption: { text: blockText('e08.main4') } },
        factMap: { truce: 'terms-of-the-treaty', return: 'terms-of-the-treaty', umrah: 'terms-of-the-treaty', 'one-way': 'terms-of-the-treaty' },
      },
      facts: [FACTS.terms, FACTS.opening],
    },
    {
      config: {
        mode: 'sequence',
        prompt: 'play.l3',
        hints: false,
        items: STEPS.map((s) => ({ id: s, label: { key: `step.${s}` } })),
        factMap: { 'set-out': 'clear-victory', camp: 'clear-victory', envoy: 'clear-victory', pledge: 'clear-victory', suhayl: 'acting-first', written: 'acting-first', sacrifice: 'acting-first', fath: 'clear-victory' },
      },
      facts: [FACTS.example, FACTS.victory],
    },
  ],
  questionKeys: ['seerah:e08-q2', 'seerah:e08-q3', 'seerah:e08-q6'],
  order: 9,
});

export function registerHudaybiyyahTreatyGame(): void {
  registerGame(hudaybiyyahGame);
}
