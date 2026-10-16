import type { GameFact } from '@/core/games';

/*
 * Content of Find the Qibla – religious texts are copied from the Salah content of the Learn feature (keep identical):
 * - src/features/learn/content/quests/salah.json  lesson "salah-qibla" (summary, sections; sources 2:142–144,
 *   Sahih al-Bukhari 40), questions "salah-qibla-mc", "salah-first-qibla"
 * Quran 2:149–150 ("wherever you are, turn your faces toward it") is added for "everywhere".
 * The great-circle fact is a method note (geometry), not a religious claim, and is labelled as such.
 */

export const QIBLA_FACTS = {
  kaaba: {
    id: 'qibla-kaaba',
    // quests/salah.json › lessons › salah-qibla › sections[0]
    text: {
      en: 'The Qibla is the direction of the Kaaba in Makkah. Allah commanded the believers to turn their faces towards it in prayer. So all over the world the prayer faces one direction – like circles around the Kaaba.',
      de: 'Die Qibla ist die Richtung der Kaaba in Mekka. Allah gebot den Gläubigen, sich im Gebet zu ihr zu wenden. So richtet sich das Gebet auf der ganzen Welt in eine Richtung – wie Kreise um die Kaaba.',
      bs: 'Kibla je smjer Kabe u Mekki. Allah je naredio vjernicima da se u namazu okrenu prema njoj. Tako je namaz širom svijeta okrenut u jednom smjeru – kao krugovi oko Kabe.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '2:144' }],
    art: 'object.kaaba-icon',
    reviewKey: 'quest:salah-qibla-mc',
  },
  everywhere: {
    id: 'qibla-everywhere',
    // quests/salah.json › lessons › salah-qibla › summary
    text: {
      en: 'Wherever we are, we face the Kaaba in Makkah when we pray.',
      de: 'Wo immer wir sind, richten wir uns beim Gebet zur Kaaba in Mekka aus.',
      bs: 'Gdje god da smo, u namazu se okrećemo prema Kabi u Mekki.',
    },
    sources: [
      { sourceName: 'Quran', sourceReference: '2:144' },
      { sourceName: 'Quran', sourceReference: '2:149–150' },
    ],
    art: 'object.compass',
    // quests/salah.json › questions › salah-qibla-mc
    check: {
      type: 'choice',
      prompt: { en: 'Which direction do we face in prayer?', de: 'In welche Richtung wenden wir uns beim Gebet?', bs: 'U kojem smjeru se okrećemo u namazu?' },
      options: [
        { en: 'Towards the rising sun', de: 'Zur aufgehenden Sonne', bs: 'Prema izlasku sunca' },
        { en: 'Towards the Kaaba in Makkah', de: 'Zur Kaaba in Mekka', bs: 'Prema Kabi u Mekki' },
        { en: 'Any direction they like', de: 'In jede beliebige Richtung', bs: 'U bilo kojem smjeru' },
      ],
      correctIndex: 1,
    },
  },
  shortestPath: {
    id: 'qibla-shortest-path',
    text: {
      en: 'Method note: the qibla direction from a place is the start of the shortest path on the globe (a great circle) to the Kaaba. That is why from New York it points north-east, even though Makkah lies south-east on a flat map.',
      de: 'Methodenhinweis: Die Qibla-Richtung von einem Ort ist der Anfang des kürzesten Wegs auf dem Globus (eines Großkreises) zur Kaaba. Darum zeigt sie von New York nach Nordosten, obwohl Mekka auf einer flachen Karte im Südosten liegt.',
      bs: 'Napomena o metodi: smjer kible iz nekog mjesta je početak najkraćeg puta po globusu (velikog kruga) do Kabe. Zato iz New Yorka pokazuje prema sjeveroistoku, iako Mekka na ravnoj karti leži na jugoistoku.',
    },
    sources: [{ sourceName: 'Method note: great-circle initial bearing (spherical geometry)', sourceReference: '—' }],
    art: 'scene.map-world-simple',
  },
  firstQibla: {
    id: 'first-qibla',
    // quests/salah.json › lessons › salah-qibla › sections[1]
    text: {
      en: 'In the early years in Madinah, Muslims prayed towards Bayt al-Maqdis in Jerusalem. Then Allah changed the Qibla to the Kaaba.',
      de: 'In den ersten Jahren in Medina beteten die Muslime in Richtung Bait al-Maqdis in Jerusalem. Dann änderte Allah die Qibla zur Kaaba.',
      bs: 'U prvim godinama u Medini muslimani su klanjali prema Bejtul-Makdisu u Jerusalemu. Zatim je Allah promijenio kiblu prema Kabi.',
    },
    sources: [
      { sourceName: 'Quran', sourceReference: '2:142–144' },
      { sourceName: 'Sahih al-Bukhari', sourceReference: '40' },
    ],
    art: 'place.kaaba',
    reviewKey: 'quest:salah-first-qibla',
  },
} satisfies Record<string, GameFact>;
