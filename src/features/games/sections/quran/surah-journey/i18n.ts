import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Surah Journey',
  description: 'The first fifteen surahs of the ilmihal: Al-Fatiha and then An-Nas backwards to Al-Qari’ah – each level is five complete surahs.',
  howTo: 'Put every ayah of the surah in the order of the mushaf. When one surah is complete, the next begins automatically.',
  'play.prompt': 'Surah {name}: put all ayahs in order ({index} of {total}).',
  'play.surah': 'Surah {index} of {total}',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Surens Reise',
  description: 'Die ersten fünfzehn Suren des Ilmihal: Al-Fatiha und dann An-Nas rückwärts bis Al-Qari’a – jede Stufe sind fünf vollständige Suren.',
  howTo: 'Bringe alle Verse der Sure in die Reihenfolge des Mushafs. Ist eine Sure fertig, beginnt die nächste automatisch.',
  'play.prompt': 'Sure {name}: Bringe alle Verse in die richtige Reihenfolge ({index} von {total}).',
  'play.surah': 'Sure {index} von {total}',
};

const bs: Record<Key, string> = {
  title: 'Putovanje kroz sure',
  description: 'Prvih petnaest sura ilmihala: El-Fatiha, pa En-Nas unazad do El-Kari’a – svaki nivo je pet cijelih sura.',
  howTo: 'Poredaj sve ajete sure redoslijedom mushafa. Kad je jedna sura gotova, sljedeća počinje sama.',
  'play.prompt': 'Sura {name}: poredaj sve ajete po redu ({index} od {total}).',
  'play.surah': 'Sura {index} od {total}',
};

export const surahJourneyI18n = defineNamespace('game.surah-journey', { en, de, bs });
