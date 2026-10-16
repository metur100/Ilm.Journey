import type { GameFact } from '@/core/games';
import type { LocalizedText } from '@/core/models';

/*
 * Content of Prayer Sky – every text is copied from the Salah content of the Learn feature (keep identical):
 * - src/features/learn/content/quests/salah.json  lesson "salah-times" (sections, differenceNote, sources 4:103),
 *   questions "salah-five-tf", "salah-order", "salah-rakahs-match", "salah-maghrib-time"
 * - src/features/learn/content/salah/salah-times.json  lesson "Prayer timetables"
 * Sunnah prayers are not part of this content, so the game only uses the obligatory (fard) rak'ahs.
 */

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_IDS: readonly PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** Prayer names (question "salah-order"). */
export const PRAYER_NAME: Record<PrayerId, LocalizedText> = {
  fajr: { en: 'Fajr', de: 'Fadschr', bs: 'Sabah' },
  dhuhr: { en: 'Dhuhr', de: 'Dhuhr', bs: 'Podne' },
  asr: { en: 'Asr', de: 'Asr', bs: 'Ikindija' },
  maghrib: { en: 'Maghrib', de: 'Maghrib', bs: 'Akšam' },
  isha: { en: 'Isha', de: 'Ischa', bs: 'Jacija' },
};

/** Arabic names (lesson "salah-times" sections). */
export const PRAYER_ARABIC: Record<PrayerId, string> = {
  fajr: 'الْفَجْر',
  dhuhr: 'الظُّهْر',
  asr: 'الْعَصْر',
  maghrib: 'الْمَغْرِب',
  isha: 'الْعِشَاء',
};

/** Section headings of the lesson "salah-times". */
export const PRAYER_HEADING: Record<PrayerId, LocalizedText> = {
  fajr: { en: 'Fajr – dawn', de: 'Fadschr – Morgendämmerung', bs: 'Sabah – zora' },
  dhuhr: { en: 'Dhuhr – midday', de: 'Dhuhr – Mittag', bs: 'Podne' },
  asr: { en: 'Asr – afternoon', de: 'Asr – Nachmittag', bs: 'Ikindija – poslijepodne' },
  maghrib: { en: 'Maghrib – sunset', de: 'Maghrib – Sonnenuntergang', bs: 'Akšam – zalazak sunca' },
  isha: { en: 'Isha – night', de: 'Ischa – Nacht', bs: 'Jacija – noć' },
};

/** Section bodies of the lesson "salah-times" (time + obligatory rak'ahs). */
export const PRAYER_BODY: Record<PrayerId, LocalizedText> = {
  fajr: {
    en: "Fajr is prayed between dawn and sunrise. It has 2 obligatory rak'ahs.",
    de: "Fadschr wird zwischen Morgendämmerung und Sonnenaufgang gebetet. Es hat 2 Pflicht-Rak'as.",
    bs: 'Sabah se klanja između zore i izlaska sunca. Ima 2 farz rekata.',
  },
  dhuhr: {
    en: "Dhuhr is prayed after the sun passes its highest point. It has 4 obligatory rak'ahs.",
    de: "Dhuhr wird gebetet, nachdem die Sonne ihren höchsten Punkt überschritten hat. Es hat 4 Pflicht-Rak'as.",
    bs: 'Podne se klanja nakon što sunce prođe svoju najvišu tačku. Ima 4 farz rekata.',
  },
  asr: {
    en: "Asr is prayed in the afternoon. It has 4 obligatory rak'ahs.",
    de: "Asr wird am Nachmittag gebetet. Es hat 4 Pflicht-Rak'as.",
    bs: 'Ikindija se klanja poslijepodne. Ima 4 farz rekata.',
  },
  maghrib: {
    en: "Maghrib is prayed just after the sun has set. It has 3 obligatory rak'ahs.",
    de: "Maghrib wird kurz nach Sonnenuntergang gebetet. Es hat 3 Pflicht-Rak'as.",
    bs: 'Akšam se klanja odmah nakon zalaska sunca. Ima 3 farz rekata.',
  },
  isha: {
    en: "Isha is prayed at night, after the twilight has gone. It has 4 obligatory rak'ahs.",
    de: "Ischa wird nachts gebetet, wenn die Abenddämmerung vorbei ist. Es hat 4 Pflicht-Rak'as.",
    bs: 'Jacija se klanja noću, kada nestane večernjeg rumenila. Ima 4 farz rekata.',
  },
};

/** Obligatory (fard) rak'ahs (question "salah-rakahs-match"). */
export const RAKAHS: Record<PrayerId, number> = { fajr: 2, dhuhr: 4, asr: 4, maghrib: 3, isha: 4 };

/** differenceNote of the quest lesson "salah-times". */
export const TIMES_DIFFERENCE_NOTE: LocalizedText = {
  en: 'Exact prayer times are calculated differently by different scholars and organisations (for example the start of Asr). Follow the timetable of your local masjid or community.',
  de: 'Die genauen Gebetszeiten werden von Gelehrten und Organisationen unterschiedlich berechnet (zum Beispiel der Beginn von Asr). Richte dich nach dem Gebetskalender deiner Moschee oder Gemeinde.',
  bs: 'Tačna vremena namaza različiti učenjaci i organizacije računaju različito (npr. početak ikindije). Prati vaktiju svoje džamije ili zajednice.',
};

const QURAN_4_103 = [{ sourceName: 'Quran', sourceReference: '4:103' }];

export const SKY_FACTS = {
  fixedTimes: {
    id: 'prayer-fixed-times',
    // quests/salah.json › lessons › salah-times › sections[0]
    text: {
      en: 'The Quran says that prayer has been prescribed for the believers at fixed times. There are five obligatory (fard) prayers every day.',
      de: 'Der Koran sagt, dass das Gebet den Gläubigen zu festgesetzten Zeiten vorgeschrieben ist. Es gibt jeden Tag fünf Pflichtgebete (fard).',
      bs: "Kur'an kaže da je namaz vjernicima propisan u tačno određeno vrijeme. Svaki dan ima pet obaveznih (farz) namaza.",
    },
    sources: QURAN_4_103,
    art: 'sky.dawn',
    reviewKey: 'quest:salah-five-tf',
  },
  maghrib: {
    id: 'maghrib-after-sunset',
    text: PRAYER_BODY.maghrib,
    sources: QURAN_4_103,
    art: 'sky.sunset',
    reviewKey: 'quest:salah-maghrib-time',
  },
  timesDiffer: {
    id: 'prayer-times-differ',
    text: TIMES_DIFFERENCE_NOTE,
    sources: QURAN_4_103,
    art: 'sky.afternoon',
  },
  rakahs: {
    id: 'rakahs-seventeen',
    // quests/salah.json › questions › salah-rakahs-match › explanation
    text: {
      en: "Fajr 2, Dhuhr 4, Asr 4, Maghrib 3 and Isha 4 obligatory rak'ahs – 17 in total each day.",
      de: "Fadschr 2, Dhuhr 4, Asr 4, Maghrib 3 und Ischa 4 Pflicht-Rak'as – insgesamt 17 am Tag.",
      bs: 'Sabah 2, podne 4, ikindija 4, akšam 3 i jacija 4 farz rekata – ukupno 17 dnevno.',
    },
    sources: QURAN_4_103,
    art: 'pose.bowing',
    reviewKey: 'quest:salah-rakahs-match',
  },
  fajrTwo: {
    id: 'fajr-two-rakahs',
    text: PRAYER_BODY.fajr,
    sources: QURAN_4_103,
    art: 'sky.dawn',
  },
  dayOrder: {
    id: 'prayer-day-order',
    // quests/salah.json › questions › salah-order › explanation
    text: {
      en: 'The day of prayer starts with Fajr at dawn, then Dhuhr at midday, Asr in the afternoon, Maghrib after sunset and Isha at night.',
      de: 'Der Gebetstag beginnt mit Fadschr in der Morgendämmerung, dann Dhuhr am Mittag, Asr am Nachmittag, Maghrib nach Sonnenuntergang und Ischa in der Nacht.',
      bs: 'Dan počinje sabahom u zoru, zatim podne u podne, ikindija poslijepodne, akšam nakon zalaska sunca i jacija noću.',
    },
    sources: QURAN_4_103,
    art: 'sky.night',
    reviewKey: 'quest:salah-order',
  },
  timetables: {
    id: 'prayer-timetables',
    // salah/salah-times.json › lesson › "Prayer timetables"
    text: {
      en: 'Prayer times change every day with the sun. Communities publish timetables so everyone knows when each prayer begins.',
      de: 'Die Gebetszeiten ändern sich jeden Tag mit der Sonne. Gemeinden veröffentlichen Kalender, damit alle wissen, wann jedes Gebet beginnt.',
      bs: 'Vremena namaza mijenjaju se svaki dan sa suncem. Zajednice objavljuju vaktije kako bi svi znali kada nastupa svaki namaz.',
    },
    sources: QURAN_4_103,
    art: 'object.clock',
  },
} satisfies Record<string, GameFact>;
