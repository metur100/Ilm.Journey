import type { SourceRef } from '@/core/models';

import type { Source } from '../models';

/** Short reference shown under a statement or a question, e.g. "Quran 96:1–5 · Sahih al-Bukhari 3". */
export function sourceShortLabel(source: Source): string {
  if (source.type === 'quran') return `Quran ${source.reference.replace(/^Surah\s+/, '')}`;
  if (source.type === 'hadith') {
    const number = source.reference.match(/^Hadith\s+([\d–-]+)/)?.[1];
    return number ? `${source.title} ${number}` : source.title;
  }
  return source.author ? `${source.author.split(' (')[0]}` : source.title;
}

/**
 * Core `SourceRef` for the question feedback panel. The name carries sira's short label exactly as
 * sira showed it under quiz answers (the reference is part of the label).
 */
export function toSourceRef(source: Source): SourceRef {
  return { sourceName: sourceShortLabel(source), sourceReference: '' };
}
