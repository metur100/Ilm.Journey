import type { GameFact } from '@/core/games';

import { lessonFact } from '../../prophets-story/episode';
import { quran, T } from '../shared/kit';

/** Facts of Fair Measure – wording and references as in the Shuayb story (stories/content/prophets/shuayb.json). */
export const SHUAYB_FACTS = {
  full: {
    id: 'full-measure',
    text: T(
      'Shuayb told his people: "Give full measure and weight with justice, and do not take away from people what is theirs."',
      'Schuaib sagte seinem Volk: „Gebt volles Maß und Gewicht in Gerechtigkeit, und nehmt den Menschen nicht weg, was ihnen gehört.“',
      'Šuajb je rekao svom narodu: „Mjerite i vagajte pravo i ne zakidajte ljudima ono što je njihovo.“',
    ),
    sources: quran('11:85'),
    art: 'prophet.shuayb-scales',
    check: {
      type: 'choice',
      prompt: T('What did Shuayb tell the traders of Madyan?', 'Was sagte Schuaib den Händlern von Madyan?', 'Šta je Šuajb rekao trgovcima Medjena?'),
      options: [
        T('Give full measure and weight', 'Gebt volles Maß und Gewicht', 'Mjerite i vagajte pravo'),
        T('Sell as dear as you can', 'Verkauft so teuer wie möglich', 'Prodajite što skuplje'),
        T('Close the market', 'Schließt den Markt', 'Zatvorite pijacu'),
      ],
      correctIndex: 0,
    },
  },
  even: {
    id: 'even-balance',
    text: T('Shuayb said: "Weigh with an even balance."', 'Schuaib sagte: „Wiegt mit der richtigen Waage.“', 'Šuajb je rekao: „Vagajte ispravnom vagom.“'),
    sources: quran('26:182'),
    art: 'prophet.shuayb-weight',
    reviewKey: 'stories:shuayb-fair',
  },
  madyan: {
    id: 'sent-to-madyan',
    text: T(
      'To Madyan Allah sent their brother Shuayb. He said: "O my people, worship Allah – you have no god other than Him."',
      'Zu Madyan sandte Allah ihren Bruder Schuaib. Er sagte: „O mein Volk, dient Allah – ihr habt keinen Gott außer Ihm.“',
      'Medjenu je Allah poslao njihovog brata Šuajba. On je rekao: „O narode moj, Allahu robujte – vi drugog boga osim Njega nemate.“',
    ),
    sources: quran('7:85'),
    art: 'prophet.shuayb-market',
    reviewKey: 'stories:shuayb-map',
  },
  reform: {
    id: 'set-things-right',
    text: T(
      'Shuayb said: "I only want to set things right as much as I can. My success comes only from Allah."',
      'Schuaib sagte: „Ich will nur Besserung, soweit ich es vermag. Mein Gelingen kommt allein von Allah.“',
      'Šuajb je rekao: „Ja želim samo popravak koliko mogu. Moj uspjeh je samo od Allaha.“',
    ),
    sources: quran('11:88'),
    art: 'prophet.shuayb-measure',
    reviewKey: 'stories:shuayb-reform',
  },
  saved: {
    id: 'shuayb-believers-saved',
    text: T(
      'The proud leaders threatened to drive Shuayb and the believers out of the town. By His mercy Allah saved Shuayb and those who believed with him.',
      'Die hochmütigen Anführer drohten, Schuaib und die Gläubigen aus der Stadt zu vertreiben. In Seiner Barmherzigkeit rettete Allah Schuaib und die, die mit ihm glaubten.',
      'Oholi prvaci su prijetili da će Šuajba i vjernike protjerati iz grada. Svojom milošću Allah je spasio Šuajba i one koji su s njim vjerovali.',
    ),
    sources: quran('7:88', '11:94'),
    art: 'prophet.shuayb-madyan-well',
  },
  lessonOne: lessonFact(
    'shuayb-faith-and-honesty',
    T(
      'Worship Allah alone and be honest with people – faith and honesty belong together, as Shuayb taught in Madyan.',
      'Diene Allah allein und sei ehrlich zu den Menschen – Glaube und Ehrlichkeit gehören zusammen, wie Schuaib es in Madyan lehrte.',
      'Robuj samo Allahu i budi pošten prema ljudima – vjera i poštenje idu zajedno, kako je Šuajb učio u Medjenu.',
    ),
    quran('7:85', '11:84'),
    { art: 'prophet.shuayb-market' },
  ),
  lessonHonest: lessonFact(
    'shuayb-full-measure',
    T(
      'Be honest in every measure. Cheating even a little on the scale is taking what belongs to someone else.',
      'Sei ehrlich bei jedem Maß. Auch ein wenig auf der Waage zu betrügen heißt, jemandem etwas wegzunehmen.',
      'Budi pošten u svakoj mjeri. I malo varanje na vagi znači uzimati ono što pripada drugome.',
    ),
    quran('11:84–85'),
    { art: 'prophet.shuayb-scales', reviewKey: 'stories:shuayb-lesson' },
  ),
  lessonRely: lessonFact(
    'shuayb-rely-on-allah',
    T(
      'Do your best to set things right, even when others mock you – and rely on Allah, because success comes only from Him.',
      'Gib dein Bestes, um die Dinge zu verbessern, auch wenn andere spotten – und verlass dich auf Allah, denn Gelingen kommt allein von Ihm.',
      'Daj sve od sebe da popraviš stanje, i kad ti se drugi rugaju – i osloni se na Allaha, jer uspjeh je samo od Njega.',
    ),
    quran('11:88'),
    { art: 'prophet.shuayb-measure' },
  ),
} satisfies Record<string, GameFact>;
