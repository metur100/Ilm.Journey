import type { GameApi } from '@/core/games';
import { GameBoard, type KitDoneInfo, type KitItem, kitResult, SequenceBoard } from '@/core/games/kit';

import type { MasjidStoryConfig } from './BuildTheMasjidGame';

/*
 * Level 2 of Build the Masjid: the story of the first masjid of Madinah in order. The steps follow the Seerah blocks
 * of the result facts (places.json "madinah", episode-06: the camel knelt, the land was bought from two orphans, the
 * Prophet ﷺ carried bricks with his companions, the masjid became the place of prayer, teaching, consultation and
 * care for the poor – Sahih al-Bukhari 428, 3905; Ibn Hisham).
 */

const T = (en: string, de: string, bs: string) => ({ en, de, bs });

export const STORY: KitItem[] = [
  { id: 'arrive', art: 'garden.palm', label: T('The Prophet ﷺ comes to Madinah, an oasis of palm groves', 'Der Prophet ﷺ kommt nach Medina, eine Oase mit Palmenhainen', 'Poslanik ﷺ dolazi u Medinu, oazu palminih gajeva') },
  { id: 'camel', art: 'animal.camel', label: T('His camel kneels on a piece of land', 'Sein Kamel kniet auf einem Stück Land nieder', 'Njegova deva klekne na komadu zemlje') },
  { id: 'orphans', art: 'object.coins', label: T('The land is bought from two orphans', 'Das Land wird von zwei Waisen gekauft', 'Zemljište se kupuje od dvoje siročadi') },
  { id: 'bricks', art: 'seerah.masjid-walls', label: T('He carries bricks alongside his companions', 'Er trägt mit seinen Gefährten Lehmziegel', 'Nosi cigle zajedno s ashabima') },
  { id: 'centre', art: 'place.masjid-nabawi-early', label: T('A place of prayer, teaching, consultation and care for the poor', 'Ein Ort des Gebets, des Unterrichts, der Beratung und der Fürsorge für die Armen', 'Mjesto namaza, poučavanja, dogovaranja i brige o siromašnima') },
];

/** Story step → fact it teaches (only facts of the level are reported). */
const STORY_FACT: Record<string, string> = { arrive: 'madinah-north', camel: 'first-project', orphans: 'first-project', bricks: 'first-project', centre: 'first-project' };

export function MasjidStory(api: GameApi<MasjidStoryConfig>) {
  const onDone = ({ mistakes, missed }: KitDoneInfo) => {
    const factsMissed = missed.map((id) => STORY_FACT[id]).filter((id): id is string => !!id && api.facts.some((f) => f.id === id));
    api.onComplete(kitResult({ moves: STORY.length, mistakes, factsMissed }));
  };
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <SequenceBoard items={STORY} variant="list" hints={false} prompt={api.t('play.story')} onDone={onDone} />
    </GameBoard>
  );
}
