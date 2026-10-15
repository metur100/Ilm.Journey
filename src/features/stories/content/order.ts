/**
 * The 25 prophets named in the Quran in the canonical story order (docs/GAMES-V3.md §3.4, docs/STORIES-V3.md §1).
 * The loader takes a story's `order` from this table by id, so stories stay in the right place even while the
 * group authors are still renumbering their JSON files. Unknown ids keep their JSON `order`.
 */
export const PROPHET_ORDER: Readonly<Record<string, number>> = {
  adam: 1,
  idris: 2,
  nuh: 3,
  hud: 4,
  salih: 5,
  ibrahim: 6,
  lut: 7,
  ismail: 8,
  ishaq: 9,
  yaqub: 10,
  yusuf: 11,
  ayyub: 12,
  shuayb: 13,
  musa: 14,
  harun: 15,
  dhulkifl: 16,
  dawud: 17,
  sulayman: 18,
  ilyas: 19,
  alyasa: 20,
  yunus: 21,
  zakariyya: 22,
  yahya: 23,
  isa: 24,
  muhammad: 25,
};

export const PROPHET_COUNT = 25;
