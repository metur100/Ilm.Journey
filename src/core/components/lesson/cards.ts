import type { Language, LocalizedText, TopicId } from '@/core/models';

/**
 * Lesson cards (docs/GAMES.md principle 4): a lesson's sections become short, swipeable cards – an illustration,
 * 2–3 short sentences and at most one small interaction. Pure logic (no React) so it can be tested on every
 * content section.
 *
 * Splitting rules:
 *  - a card holds the text of ONE language; long sections are split at sentence boundaries only
 *    (never inside a sentence), at most {@link MAX_SENTENCES_PER_CARD} sentences and about
 *    {@link MAX_CARD_CHARS} characters per card (a single longer sentence keeps its own card);
 *  - multi-line bodies (numbered steps, bullet lists) are split at line breaks as well;
 *  - the text is preserved exactly: joining the card texts gives the original after whitespace normalisation.
 *
 * Interaction rules (deterministic, one per card):
 *  1. `flip`   – first card of a section with `arabic` (front: Arabic + transliteration, back: heading + text);
 *  2. `match`  – at most one card per lesson: the first card of the LAST headed section without Arabic whose heading
 *                differs from another headed section's heading (drag the right heading of two onto the text);
 *  3. `reveal` – first card of any other headed section (heading is the prompt, the text is revealed on tap);
 *  4. `none`   – everything else (continuation cards, sections without heading).
 */

/** One lesson section as input for the cards (unit `LessonSection` / quest `QuestLessonSection` plus id and art). */
export interface LessonCardSource {
  /** Stable section id: `unit:<unitId>#<index>` or `lesson:<lessonId>#<index>`. */
  id: string;
  heading?: LocalizedText;
  body: LocalizedText;
  arabic?: string;
  transliteration?: string;
  /** Art library name (`category.name`); falls back to `fallbackArt`. */
  art?: string;
}

export type LessonCardInteraction =
  | { kind: 'none' }
  | { kind: 'reveal' }
  | { kind: 'flip' }
  /** `options` are the two headings in display order, `answer` is the correct one (= the card's heading). */
  | { kind: 'match'; options: [string, string]; answer: string };

export type LessonCardInteractionKind = LessonCardInteraction['kind'];

export interface LessonCard {
  /** `<sourceId>/<part>` – unique within a lesson. */
  id: string;
  sourceId: string;
  /** 0-based position of this card within its section and the section's card count. */
  part: number;
  partCount: number;
  /** Section heading in the requested language (on every card of the section). */
  heading?: string;
  /** 1–3 sentences of the section body in the requested language (original text, line breaks kept). */
  text: string;
  /** Only on the first card of the section. */
  arabic?: string;
  transliteration?: string;
  art: string;
  interaction: LessonCardInteraction;
}

export interface BuildLessonCardsOptions {
  /** Art used when a section has no own art (see {@link TOPIC_FALLBACK_ART}). */
  fallbackArt: string;
  language: Language;
}

export const MAX_SENTENCES_PER_CARD = 3;
/** Soft limit: a card takes more than one sentence only while it stays within this many characters. */
export const MAX_CARD_CHARS = 240;

/** Topic illustration used when a section has no entry in the art map. */
export const TOPIC_FALLBACK_ART: Record<TopicId, string> = {
  salah: 'object.prayer-mat',
  quran: 'object.quran-stand',
  prophets: 'scene.mountains',
  seerah: 'place.kaaba',
  akhlaq: 'ui.heart',
  ramadan: 'object.lantern-ramadan',
  history: 'object.scroll',
  sufara: 'object.pen',
  arabic: 'object.book',
};

// ---------------------------------------------------------------------------------------------------------------
// Sentence splitting
// ---------------------------------------------------------------------------------------------------------------

/** A sentence as a half-open range `[start, end)` of the source text (no surrounding whitespace). */
export interface TextSpan {
  start: number;
  end: number;
}

const TERMINALS = '.!?…';
/** Characters that may directly follow the terminal punctuation and still belong to the sentence. */
const CLOSERS = '"\'”“’‘»«)]';
/** Characters that may open a new sentence besides upper-case letters, digits and Arabic script. */
const OPENERS = '"\'„“‘«»([•–-';
/** Leading characters of a token that are not part of the word (`(e.g.`, `„z.`). */
const TOKEN_PREFIX = /^["'„“‘«»(\[]+/;

/**
 * Abbreviations that end with a period but do not end a sentence (lower-case, without the final period).
 * Single letters (`z. B.`, `n. H.`, `h.`) and dotted letter groups (`e.g.`, `i.e.`, `d.h.`) are handled generally.
 */
export const ABBREVIATIONS: Record<Language, readonly string[]> = {
  en: ['approx', 'ca', 'cf', 'vs', 'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'no', 'vol', 'pp', 'fig', 'ch'],
  de: ['bzw', 'ca', 'usw', 'vgl', 'gest', 'geb', 'chr', 'nr', 'jh', 'jhd', 'evtl', 'ggf', 'inkl', 'bspw', 'sog', 'hl', 'dr', 'prof', 'st', 'abs', 'bd', 'ff'],
  bs: ['npr', 'tj', 'itd', 'sl', 'god', 'br', 'st', 'str', 'sv', 'hz', 'tzv', 'pos', 'dr', 'prof', 'gl', 'rkt', 'odn'],
};

const isWhitespace = (ch: string) => /\s/.test(ch);
const isDigit = (ch: string) => ch >= '0' && ch <= '9';
/** Upper-case letter in any cased script (Latin incl. č/ć/š/ž/đ/Ü, Cyrillic, Greek) – avoids `\p{…}` for Hermes. */
const isUpper = (ch: string) => ch !== ch.toLowerCase() && ch === ch.toUpperCase();
const isArabic = (ch: string) => {
  const code = ch.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06ff) || (code >= 0x0750 && code <= 0x077f) || (code >= 0xfb50 && code <= 0xfdff) || (code >= 0xfe70 && code <= 0xfeff);
};

const startsSentence = (ch: string) => isUpper(ch) || isDigit(ch) || isArabic(ch) || OPENERS.includes(ch);

/**
 * Is the period at `dot` (the only terminal char of its run) part of an abbreviation, ordinal or list number
 * rather than the end of a sentence?
 */
function isNonTerminalPeriod(text: string, dot: number, lineStart: number, language: Language): boolean {
  let tokenStart = dot;
  while (tokenStart > lineStart && !isWhitespace(text[tokenStart - 1])) tokenStart -= 1;
  const rawToken = text.slice(tokenStart, dot);
  const token = rawToken.replace(TOKEN_PREFIX, '');
  if (!token) return false;

  // Single letters and dotted letter groups: "z. B.", "n. H.", "h.", "e.g.", "i.e.", "d.h.", "u.a."
  if (/^[A-Za-zÀ-žА-я]$/.test(token) || /^([A-Za-zÀ-ž]\.)+[A-Za-zÀ-ž]$/.test(token)) return true;

  const lower = token.toLowerCase();
  if (ABBREVIATIONS[language].includes(lower)) return true;

  if (/^\d+$/.test(token)) {
    // "1. Make the intention…" – a list number at the beginning of a line.
    const before = text.slice(lineStart, tokenStart);
    if (/^[\s•\-–]*$/.test(before)) return true;
    // German/Bosnian ordinals: "im 16. Jahrhundert", "Godine 622. Poslanik …" – a number right after a word.
    // After a dash or comma ("… – 4. Zusammen 17 …") the number ends the sentence.
    if (language !== 'en') {
      let p = tokenStart - 1;
      while (p >= lineStart && isWhitespace(text[p])) p -= 1;
      if (p >= lineStart && /[A-Za-zÀ-žА-я]/.test(text[p])) return true;
    }
  }
  return false;
}

/** Splits one line (no line breaks inside) into sentence spans. */
function splitLine(text: string, lineStart: number, lineEnd: number, language: Language): TextSpan[] {
  const spans: TextSpan[] = [];
  let start = lineStart;
  while (start < lineEnd && isWhitespace(text[start])) start += 1;

  let i = start;
  while (i < lineEnd) {
    const ch = text[i];
    if (!TERMINALS.includes(ch)) {
      i += 1;
      continue;
    }
    // Run of terminal punctuation ("?!", "...") followed by closing quotes/brackets.
    let j = i;
    while (j < lineEnd && TERMINALS.includes(text[j])) j += 1;
    const singlePeriod = j - i === 1 && ch === '.';
    while (j < lineEnd && CLOSERS.includes(text[j])) j += 1;
    if (j >= lineEnd || !isWhitespace(text[j])) {
      i = j;
      continue;
    }
    let k = j;
    while (k < lineEnd && isWhitespace(text[k])) k += 1;
    if (k >= lineEnd) break;
    const nonTerminal = singlePeriod && isNonTerminalPeriod(text, i, lineStart, language);
    if (startsSentence(text[k]) && !nonTerminal) {
      spans.push({ start, end: j });
      start = k;
    }
    i = k;
  }

  let end = lineEnd;
  while (end > start && isWhitespace(text[end - 1])) end -= 1;
  if (end > start) spans.push({ start, end });
  return spans;
}

/**
 * Splits a text into sentence spans. Line breaks always end a sentence (numbered steps and bullet lists stay one
 * item per unit). Spans never overlap and cover every non-whitespace character of the text.
 */
export function sentenceSpans(text: string, language: Language): TextSpan[] {
  const spans: TextSpan[] = [];
  let lineStart = 0;
  for (let i = 0; i <= text.length; i += 1) {
    if (i === text.length || text[i] === '\n') {
      spans.push(...splitLine(text, lineStart, i, language));
      lineStart = i + 1;
    }
  }
  return spans;
}

/** The sentences of a text (exact substrings of the original). */
export function splitSentences(text: string, language: Language): string[] {
  return sentenceSpans(text, language).map((s) => text.slice(s.start, s.end));
}

/**
 * Groups consecutive sentences into cards: as few cards as possible, each with at most `maxSentences` sentences
 * and at most `maxChars` characters (a single sentence may be longer); among those, the most balanced split
 * (smallest longest card). Returns the groups as span ranges of the original text.
 */
export function groupSpans(spans: TextSpan[], maxSentences = MAX_SENTENCES_PER_CARD, maxChars = MAX_CARD_CHARS): TextSpan[] {
  const n = spans.length;
  if (n === 0) return [];
  // best[i]: optimal grouping of the first i sentences.
  const best: { cards: number; longest: number; prev: number }[] = [{ cards: 0, longest: 0, prev: -1 }];
  for (let i = 1; i <= n; i += 1) {
    let choice: { cards: number; longest: number; prev: number } | null = null;
    for (let size = 1; size <= Math.min(maxSentences, i); size += 1) {
      const from = i - size;
      const length = spans[i - 1].end - spans[from].start;
      if (size > 1 && length > maxChars) continue;
      const base = best[from];
      const candidate = { cards: base.cards + 1, longest: Math.max(base.longest, length), prev: from };
      if (!choice || candidate.cards < choice.cards || (candidate.cards === choice.cards && candidate.longest < choice.longest)) choice = candidate;
    }
    best.push(choice!);
  }
  const groups: TextSpan[] = [];
  for (let i = n; i > 0; i = best[i].prev) groups.unshift({ start: spans[best[i].prev].start, end: spans[i - 1].end });
  return groups;
}

/** Splits a section text into card texts (exact substrings, original order). */
export function splitIntoCardTexts(text: string, language: Language): string[] {
  return groupSpans(sentenceSpans(text, language)).map((g) => text.slice(g.start, g.end));
}

/** Collapses all whitespace runs to single spaces and trims – for comparing card texts with the original. */
export const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------------------------------------------

const pick = (text: LocalizedText | undefined, language: Language) => (text ? text[language] || text.en : '');

/** Small deterministic string hash (djb2) – used to vary the order of match options without randomness. */
export function stableHash(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) hash = ((hash * 33) ^ value.charCodeAt(i)) >>> 0;
  return hash;
}

/** Index of the section that gets the lesson's `match` card, and the distractor heading; null when none qualifies. */
export function chooseMatchSection(sections: readonly LessonCardSource[], language: Language): { index: number; distractor: string } | null {
  const headed = sections
    .map((s, index) => ({ index, heading: pick(s.heading, language).trim(), hasArabic: !!s.arabic, hasText: !!pick(s.body, language).trim() }))
    .filter((s) => s.heading && s.hasText);
  for (let h = headed.length - 1; h >= 0; h -= 1) {
    const candidate = headed[h];
    if (candidate.hasArabic) continue;
    // Nearest other headed section with a different heading (prefer the previous one).
    const others = [...headed.slice(0, h).reverse(), ...headed.slice(h + 1)];
    const distractor = others.find((o) => o.heading !== candidate.heading);
    if (distractor) return { index: candidate.index, distractor: distractor.heading };
  }
  return null;
}

/** Builds the cards of one lesson in the requested language. Sections with empty text produce no card. */
export function buildLessonCards(sections: readonly LessonCardSource[], { fallbackArt, language }: BuildLessonCardsOptions): LessonCard[] {
  const match = chooseMatchSection(sections, language);
  const cards: LessonCard[] = [];
  sections.forEach((section, index) => {
    const body = pick(section.body, language);
    const texts = splitIntoCardTexts(body, language);
    const heading = pick(section.heading, language).trim() || undefined;
    texts.forEach((text, part) => {
      const id = `${section.id}/${part}`;
      let interaction: LessonCardInteraction = { kind: 'none' };
      if (part === 0) {
        if (section.arabic) interaction = { kind: 'flip' };
        else if (match && match.index === index && heading) {
          const options: [string, string] = stableHash(id) % 2 === 0 ? [heading, match.distractor] : [match.distractor, heading];
          interaction = { kind: 'match', options, answer: heading };
        } else if (heading) interaction = { kind: 'reveal' };
      }
      cards.push({
        id,
        sourceId: section.id,
        part,
        partCount: texts.length,
        heading,
        text,
        ...(part === 0 && section.arabic ? { arabic: section.arabic, transliteration: section.transliteration } : {}),
        art: section.art || fallbackArt,
        interaction,
      });
    });
  });
  return cards;
}
