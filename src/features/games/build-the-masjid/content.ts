import type { LocalizedText, SourceRef } from '@/core/models';

/*
 * Content of Build the Masjid – copied unchanged from the Seerah content (src/features/seerah/content: episode-06.json,
 * events.json "mosque" / "qibla", places.json "makkah" / "madinah", questions/episode-06.json). Each placed part reveals
 * one of these blocks with its label and sources. Parts the Seerah content does not describe (palm-trunk pillars,
 * palm-leaf roof, the suffa) are left out on purpose.
 */

export type SeerahSourceId = 'bukhari-428' | 'bukhari-3905' | 'bukhari-40' | 'q-2-144' | 'ibn-hisham';

/** Seerah sources as core `SourceRef`s (name + reference = the Seerah short label). */
export const SOURCE_REFS: Record<SeerahSourceId, SourceRef> = {
  'bukhari-428': { sourceName: 'Sahih al-Bukhari', sourceReference: '428' },
  'bukhari-3905': { sourceName: 'Sahih al-Bukhari', sourceReference: '3905' },
  'bukhari-40': { sourceName: 'Sahih al-Bukhari', sourceReference: '40' },
  'q-2-144': { sourceName: 'Quran', sourceReference: 'al-Baqarah 2:144' },
  'ibn-hisham': { sourceName: 'Ibn Hisham', sourceReference: '' },
};

export const sourceRefs = (ids: readonly SeerahSourceId[]): SourceRef[] => ids.map((id) => SOURCE_REFS[id]);

/** A Seerah content block with its label: "Established fact" or "Historical interpretation". */
export interface SeerahBlock {
  kind: 'fact' | 'interpretation';
  text: LocalizedText;
  sourceIds: SeerahSourceId[];
}

export interface SeerahDate {
  label: LocalizedText;
  certainty: 'established' | 'approximate' | 'disputed';
  note: LocalizedText | null;
}

// ---------- blocks ----------

export const OASIS: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "Madinah was an oasis of farms and palm groves. Its Arab tribes, the Aws and Khazraj, had a history of conflict, and several Jewish tribes lived there as well.",
    de: "Medina war eine Oase mit Feldern und Palmenhainen. Ihre arabischen Stämme, die Aus und Chazradsch, hatten eine Geschichte von Konflikten, und auch mehrere jüdische Stämme lebten dort.",
    bs: "Medina je bila oaza njiva i palminih gajeva. Njena arapska plemena, Evs i Hazredž, imala su historiju sukoba, a tu je živjelo i nekoliko jevrejskih plemena.",
  },
  sourceIds: ['ibn-hisham'],
};
export const FIRST_PROJECT: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "The first project was a mosque. The land was bought from two orphans, and the Prophet ﷺ carried bricks alongside his companions. The mosque became the place of prayer, teaching, consultation and care for the poor.",
    de: "Das erste Vorhaben war eine Moschee. Das Land wurde von zwei Waisen gekauft, und der Prophet ﷺ trug zusammen mit seinen Gefährten Lehmziegel. Die Moschee wurde zum Ort des Gebets, des Unterrichts, der Beratung und der Fürsorge für die Armen.",
    bs: "Prvi projekat bio je mesdžid. Zemljište je kupljeno od dvoje siročadi, a Poslanik ﷺ je zajedno s ashabima nosio cigle. Mesdžid je postao mjesto namaza, poučavanja, dogovaranja i brige o siromašnima.",
  },
  sourceIds: ['bukhari-428'],
};
export const QIBLA_CHANGE: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "Sixteen or seventeen months after the Hijrah, the qiblah was changed from Jerusalem to the Kaʿbah in Makkah.",
    de: "Sechzehn oder siebzehn Monate nach der Hidschra wurde die Gebetsrichtung von Jerusalem zur Kaaba in Mekka geändert.",
    bs: "Šesnaest ili sedamnaest mjeseci nakon Hidžre kibla je promijenjena s Jerusalema na Kabu u Mekki.",
  },
  sourceIds: ['bukhari-40', 'q-2-144'],
};
export const MOSQUE_LAND: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "The Prophet ﷺ bought the land where his camel knelt from two orphans and built the mosque with his companions, working alongside them. It became the centre of prayer, learning and community life.",
    de: "Der Prophet ﷺ kaufte das Land, auf dem sein Kamel niederkniete, von zwei Waisen und baute die Moschee mit seinen Gefährten, wobei er selbst mitarbeitete. Sie wurde zum Zentrum von Gebet, Lernen und Gemeinschaftsleben.",
    bs: "Poslanik ﷺ je od dvoje siročadi kupio zemlju na kojoj je kleknula njegova deva i s ashabima izgradio mesdžid, radeći zajedno s njima. Postao je središte namaza, učenja i života zajednice.",
  },
  sourceIds: ['bukhari-428', 'bukhari-3905'],
};
export const QIBLA_JERUSALEM: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "The Muslims had prayed towards Jerusalem. Then the command came to turn towards al-Masjid al-Haram in Makkah.",
    de: "Die Muslime hatten in Richtung Jerusalem gebetet. Dann kam das Gebot, sich zu al-Masdschid al-Haram in Mekka zu wenden.",
    bs: "Muslimani su klanjali prema Jerusalemu. Zatim je došla naredba da se okrenu prema Mesdžidul-haramu u Mekki.",
  },
  sourceIds: ['bukhari-40', 'q-2-144'],
};
export const MADINAH_NORTH: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "An oasis town about 400 km north of Makkah, home of the Aws and Khazraj and of several Jewish tribes. After the Hijrah it became known as al-Madinah, \"the City\".",
    de: "Eine Oasenstadt etwa 400 km nördlich von Mekka, Heimat der Aus und Chazradsch sowie mehrerer jüdischer Stämme. Nach der Hidschra wurde sie als al-Madina, „die Stadt“, bekannt.",
    bs: "Oazni grad oko 400 km sjeverno od Mekke, dom Evsa i Hazredža te nekoliko jevrejskih plemena. Nakon Hidžre postao je poznat kao el-Medina, „Grad“.",
  },
  sourceIds: ['ibn-hisham'],
};
export const MOSQUE_DATE: SeerahDate = {
  label: {
    en: "1 AH / 622 CE",
    de: "1 n. H. / 622 n. Chr.",
    bs: "1. g. po H. / 622. g.",
  },
  certainty: 'established',
  note: null,
};
export const QIBLA_DATE: SeerahDate = {
  label: {
    en: "2 AH / 624 CE",
    de: "2 n. H. / 624 n. Chr.",
    bs: "2. g. po H. / 624. g.",
  },
  certainty: 'established',
  note: {
    en: "Sixteen or seventeen months after the Hijrah, according to Sahih al-Bukhari.",
    de: "Sechzehn oder siebzehn Monate nach der Hidschra, nach Sahih al-Bukhari.",
    bs: "Šesnaest ili sedamnaest mjeseci nakon Hidžre, prema Sahihu el-Buharija.",
  },
};

/** Coordinates of the places (places.json) – the qibla directions are computed from them. */
export const MADINAH = { lat: 24.4672, lon: 39.6112 };
export const MAKKAH = { lat: 21.4225, lon: 39.8262 };
/** Jerusalem is not a Seerah map place; modern coordinates of the city (direction only, for the first qibla). */
export const JERUSALEM = { lat: 31.778, lon: 35.2354 };
