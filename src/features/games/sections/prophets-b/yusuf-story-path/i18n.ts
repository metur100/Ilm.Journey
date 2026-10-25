import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Yusuf – the Best of Stories',
  description: 'Three events of Yusuf’s life: the dream and the well, honest and pure in prison, and forgiving his brothers – each with its lesson.',
  howTo: 'Level 1: put each stop of the story on the next stone of the path. Level 2: connect each moment with what Yusuf said or did. Level 3: put the end of the story in order and check it.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Yusuf – die schönste Geschichte',
  description: 'Drei Ereignisse aus Yusufs Leben: der Traum und der Brunnen, ehrlich und rein im Gefängnis und die Vergebung für seine Brüder – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Lege jede Station der Geschichte auf den nächsten Stein des Pfades. Stufe 2: Verbinde jeden Moment mit dem, was Yusuf sagte oder tat. Stufe 3: Bring das Ende der Geschichte in die richtige Reihenfolge und prüfe es.',
};

const bs: Record<Key, string> = {
  title: 'Jusuf – najljepše kazivanje',
  description: 'Tri događaja iz Jusufova života: san i bunar, iskren i čist u tamnici, te oprost braći – svaki sa svojom poukom.',
  howTo: 'Nivo 1: stavi svaku stanicu kazivanja na sljedeći kamen puta. Nivo 2: spoji svaki trenutak s onim što je Jusuf rekao ili učinio. Nivo 3: poredaj kraj kazivanja i provjeri.',
};

export const yusufStoryI18n = defineNamespace('game.yusuf-story-path', { en, de, bs });
