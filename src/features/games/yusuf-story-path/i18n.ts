import { defineNamespace } from '@/core/i18n';

const en = {
  title: "Yusuf's Story Trail",
  description: 'Build a ten-stop timeline from the dream and well to the king’s dream and forgiveness.',
  howTo: 'At each stop, choose the next event in Yusuf’s story. The trail uses objects and places only; prophets are never depicted.',
  'play.progress': 'Story stop {current} of {total}',
  'play.prompt': 'Which event comes next?',
  'play.tryAgain': 'Not that stop – look at the timeline and try again.',
  'play.correct': 'The next stop is on the trail.',
} as const;

const de = {
  title: 'Yusufs Geschichtenpfad',
  description: 'Baue eine Zehn-Stationen-Zeitlinie vom Traum und Brunnen bis zum Traum des Königs und zur Vergebung.',
  howTo: 'Wähle an jeder Station das nächste Ereignis aus Yusufs Geschichte. Der Pfad zeigt nur Gegenstände und Orte; Propheten werden nie dargestellt.',
  'play.progress': 'Geschichtenstation {current} von {total}',
  'play.prompt': 'Welches Ereignis kommt als Nächstes?',
  'play.tryAgain': 'Das ist nicht die nächste Station – schau auf die Zeitlinie und versuche es erneut.',
  'play.correct': 'Die nächste Station ist auf dem Pfad.',
} as const;

const bs = {
  title: 'Jusufov put kroz priču',
  description: 'Sastavi vremensku liniju od deset stanica, od sna i bunara do kraljevog sna i oprosta.',
  howTo: 'Na svakoj stanici izaberi sljedeći događaj iz Jusufove priče. Put prikazuje samo predmete i mjesta; poslanici se ne prikazuju.',
  'play.progress': 'Stanica priče {current} od {total}',
  'play.prompt': 'Koji događaj dolazi sljedeći?',
  'play.tryAgain': 'To nije sljedeća stanica – pogledaj vremensku liniju i pokušaj ponovo.',
  'play.correct': 'Sljedeća stanica je na putu.',
} as const;

export const yusufStoryI18n = defineNamespace('game.yusuf-story-path', { en, de, bs });