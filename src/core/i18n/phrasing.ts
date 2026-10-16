/**
 * Content rule (docs/GAMES-V3.md §2): truths are stated directly, never framed as somebody's opinion. The forbidden
 * patterns live here so that the repository-wide scan (src/core/__tests__/phrasing.test.ts) and per-section test
 * helpers check exactly the same thing. This file is the only non-test file the scan skips: it spells out the
 * patterns themselves.
 */
// `(?<!\p{L})` / `(?!\p{L})` are word boundaries that also work for ü, č, ž …
const B = '(?<!\\p{L})';
const E = '(?!\\p{L})';
const rx = (body: string) => new RegExp(`${B}(?:${body})${E}`, 'iu');

export const FORBIDDEN_PHRASES: { lang: 'en' | 'de' | 'bs'; pattern: RegExp }[] = [
  // English
  {
    lang: 'en',
    pattern: rx(
      'muslims? (?:believe|believes|think|thinks|say|says|consider|considers|hold|holds|regard|regards|see|sees|feel|feels|are taught|are told|accept|accepts)',
    ),
  },
  { lang: 'en', pattern: rx('(?:it is|is|are) believed(?: by muslims)?(?: that| to)') },
  { lang: 'en', pattern: rx('for muslims') },
  { lang: 'en', pattern: rx('according to (?:islam|islamic|muslim)(?: belief| tradition| teaching)?') },
  { lang: 'en', pattern: rx('(?:muslim|islamic) (?:belief|faith) (?:says|holds|teaches)') },
  { lang: 'en', pattern: rx('islam teaches') },
  { lang: 'en', pattern: rx('in (?:islamic|muslim) (?:tradition|belief)') },
  { lang: 'en', pattern: rx('in islam,? (?:it is|people) (?:believe|believed|say|said)') },
  // German
  {
    lang: 'de',
    pattern: rx('muslime (?:glauben|sagen|denken|meinen|halten|sehen|betrachten|lernen, dass|sind überzeugt)'),
  },
  { lang: 'de', pattern: rx('(?:ein )?muslim glaubt') },
  { lang: 'de', pattern: rx('für muslime') },
  { lang: 'de', pattern: rx('nach (?:muslimischem|islamischem) (?:glauben|verständnis)') },
  { lang: 'de', pattern: rx('(?:im islam|laut (?:dem )?islam) glaubt man') },
  { lang: 'de', pattern: rx('laut (?:dem )?islam') },
  { lang: 'de', pattern: rx('der islam lehrt') },
  { lang: 'de', pattern: rx('in der (?:islamischen|muslimischen) (?:überlieferung|tradition|glaubenslehre)') },
  // Bosnian
  {
    lang: 'bs',
    pattern: rx('muslimani (?:vjeruju|smatraju|kažu|misle|drže|tvrde|vide)'),
  },
  { lang: 'bs', pattern: rx('musliman (?:vjeruje|smatra|misli)') },
  { lang: 'bs', pattern: rx('za muslimane') },
  { lang: 'bs', pattern: rx('prema (?:islamskom|muslimanskom) (?:vjerovanju|učenju|shvatanju)') },
  { lang: 'bs', pattern: rx('prema islamu|po islamu') },
  { lang: 'bs', pattern: rx('islam (?:nas )?uči') },
  { lang: 'bs', pattern: rx('u (?:islamskoj|muslimanskoj) (?:predaji|tradiciji)') },
  { lang: 'bs', pattern: rx('vjeruje se da') },
  // "Muslims this, Muslims that": present-tense descriptions of practice from the outside. Write "we …" or an
  // impersonal sentence instead. Historical narration in the past tense ("The Muslims prayed / migrated …") stays.
  {
    lang: 'en',
    pattern: rx(
      'muslims (?:all over the world |everywhere |around the world )?(?:pray|face|fast|give|recite|perform|gather|speak up|say|try|celebrate|follow|practise|practice|read|learn|wear)',
    ),
  },
  { lang: 'en', pattern: rx('(?:do|should|must|can) muslims|for (?:adult |all |every )?muslims|(?:a|every) muslim(?:\'s|’s)|the muslim (?:greeting|community lives)') },
  {
    lang: 'de',
    pattern: rx('muslime (?:auf der ganzen welt |überall )?(?:beten|fasten|geben|rezitieren|richten sich|versammeln sich|setzen sich|feiern|lesen|folgen|sprechen|sagen|versuchen)'),
  },
  { lang: 'de', pattern: rx('(?:beten|fasten|wenden sich|versammeln sich) muslime|für (?:erwachsene |alle )?muslime|den tag eines muslims') },
  {
    lang: 'bs',
    pattern: rx('muslimani (?:širom svijeta |svugdje |zajedno )?(?:klanjaju|poste|daju|uče|dijele|se okreću|se okupljaju|se zalažu|prakticiraju|izgovaraju)'),
  },
  { lang: 'bs', pattern: rx('za (?:odrasle |sve )?muslimane|zašto muslimani|dan muslimana') },
];

/** Every forbidden phrasing found in `text` (empty when the text states truths directly). */
export function findForbiddenPhrases(text: string): { lang: string; match: string }[] {
  const hits: { lang: string; match: string }[] = [];
  for (const { lang, pattern } of FORBIDDEN_PHRASES) {
    const m = text.match(pattern);
    if (m) hits.push({ lang, match: m[0] });
  }
  return hits;
}
