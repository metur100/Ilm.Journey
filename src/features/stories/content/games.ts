/**
 * The casual game(s) of each prophet's story (src/features/games/sections/prophets-a|b|c). The story overview offers
 * "Play the game" for every id that is registered. Keys are story ids (content/order.ts).
 */
export const STORY_GAMES: Readonly<Record<string, readonly string[]>> = {
  adam: ['adam-garden-names'],
  idris: ['idris-high-station'],
  nuh: ['ark-of-nuh'],
  hud: ['hud-valley-of-ad'],
  salih: ['salih-water-days'],
  ibrahim: ['ibrahim-kaaba-walls'],
  lut: ['lut-night-journey'],
  ismail: ['ismail-safa-marwa'],
  ishaq: ['ishaq-glad-tidings'],
  yaqub: ['yaqub-shirt-road'],
  yusuf: ['yusuf-story-path', 'yusuf-storehouse'],
  ayyub: ['ayyub-garden'],
  shuayb: ['shuayb-scales'],
  musa: ['musa-springs'],
  harun: ['harun-helper'],
  dhulkifl: ['dhulkifl-lanterns'],
  dawud: ['dawud-armour'],
  sulayman: ['sulayman-ants-valley'],
  ilyas: ['ilyas-lanterns'],
  alyasa: ['alyasa-among-best'],
  yunus: ['yunus-darkness-light'],
  zakariyya: ['zakariyya-mihrab'],
  yahya: ['yahya-qualities'],
  isa: ['isa-palm-dates'],
  muhammad: ['muhammad-messengers-chain'],
};
