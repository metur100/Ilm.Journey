import type { GameFact } from '@/core/games';
import type { BuildPart, PathStop, PourVessel } from '@/core/games/kit';

import { bukhari, quran, T } from '../shared';

/* Ismail – Safa and Marwa: Hajar's seven runs, the spring of Zamzam and its basin (Bukhari 3364; Quran 2:158, 14:37). */

export const ISMAIL_FACTS = {
  seven: {
    id: 'ismail-seven-runs',
    text: T(
      'Hajar went between the hills of Safa and Marwa seven times looking for help. The Prophet ﷺ said: "That is the sa\'y that people make between them."',
      'Hadschar ging siebenmal zwischen den Hügeln Safa und Marwa hin und her, um Hilfe zu suchen. Der Prophet ﷺ sagte: „Das ist der Sa\'y, den die Menschen zwischen ihnen machen.“',
      'Hadžera je sedam puta prešla između brežuljaka Safe i Merve tražeći pomoć. Poslanik, s.a.v.s., rekao je: „To je sa\'j koji ljudi čine između njih.“',
    ),
    sources: [bukhari('3364')],
    art: 'prophet.ismail-hill',
    reviewKey: 'stories:ismail-seven',
  },
  symbols: {
    id: 'ismail-safa-marwa-symbols',
    text: T('Safa and Marwa are among the symbols of Allah.', 'Safa und Marwa gehören zu den Zeichen Allahs.', 'Safa i Merva su od Allahovih obilježja.'),
    sources: [quran('2:158')],
    art: 'prophet.ismail-safa-marwa',
  },
  zamzam: {
    id: 'ismail-zamzam-spring',
    text: T(
      'By Allah\'s mercy the spring of Zamzam came forth in the valley; Hajar filled her waterskin.',
      'Durch Allahs Barmherzigkeit entsprang im Tal die Quelle Zamzam; Hadschar füllte ihren Wasserschlauch.',
      'Allahovom milošću u dolini je potekao izvor Zemzem; Hadžera je napunila svoju mješinu.',
    ),
    sources: [bukhari('3364')],
    art: 'prophet.ismail-zamzam',
    reviewKey: 'stories:ismail-zamzam',
  },
  trust: {
    id: 'ismail-hajar-trust',
    text: T(
      'When Hajar heard that Allah had commanded it, she said: "Then He will not leave us."',
      'Als Hadschar hörte, dass Allah es befohlen hatte, sagte sie: „Dann wird Er uns nicht im Stich lassen.“',
      'Kad je Hadžera čula da je to Allah naredio, rekla je: „Onda nas On neće napustiti.“',
    ),
    sources: [bukhari('3364')],
    art: 'prophet.ismail-valley',
    reviewKey: 'stories:ismail-trust',
  },
  basin: {
    id: 'ismail-basin-birds',
    text: T(
      'Hajar made a basin around the spring. Birds circling over the valley showed travellers that there was water, and they settled there.',
      'Hadschar baute ein Becken um die Quelle. Vögel, die über dem Tal kreisten, zeigten Reisenden, dass es Wasser gab, und sie ließen sich dort nieder.',
      'Hadžera je oko izvora napravila bazen. Ptice koje su kružile iznad doline pokazale su putnicima da ima vode i oni su se tu nastanili.',
    ),
    sources: [bukhari('3364')],
    art: 'garden.bird',
  },
  valley: {
    id: 'ismail-valley-dua',
    text: T(
      'Ibrahim prayed: "Our Lord, I have settled some of my family in a valley without plants, near Your Sacred House."',
      'Ibrahim betete: „Unser Herr, ich habe einige meiner Familie in einem Tal ohne Pflanzen angesiedelt, bei Deinem heiligen Haus.“',
      'Ibrahim je molio: „Gospodaru naš, nastanio sam neke od svoje porodice u dolini bez rastinja, kod Tvoje svete Kuće.“',
    ),
    sources: [quran('14:37')],
    art: 'prophet.ismail-valley',
  },
} satisfies Record<string, GameFact>;

const SAFA = T('Safa', 'Safa', 'Safa');
const MARWA = T('Marwa', 'Marwa', 'Merva');

/** Start on Safa, then seven runs, ending on Marwa (positions on `prophet.ismail-safa-marwa`, 400 × 240). */
export const RUNS: PathStop[] = Array.from({ length: 8 }, (_, i) => {
  const onSafa = i % 2 === 0;
  const name = onSafa ? SAFA : MARWA;
  return {
    id: i === 0 ? 'start' : `run-${i}`,
    label: i === 0 ? name : { en: `${i} · ${name.en}`, de: `${i} · ${name.de}`, bs: `${i} · ${name.bs}` },
    sub: i === 0 ? undefined : `${i}/7`,
    at: { x: onSafa ? 0.15 : 0.86, y: 0.42 + i * 0.045 },
    caption:
      i === 7
        ? T('Seven runs – then, by Allah\'s mercy, the spring of Zamzam (Bukhari 3364).', 'Sieben Läufe – dann, durch Allahs Barmherzigkeit, die Quelle Zamzam (Bukhari 3364).', 'Sedam trčanja – a zatim, Allahovom milošću, izvor Zemzem (Buhari 3364).')
        : undefined,
  };
});

/** L2: fill the waterskins at the spring (Bukhari 3364: she filled her waterskin). */
export const SKINS: PourVessel[] = [
  { id: 'skin-1', art: 'prophet.ismail-waterskin', label: T('Waterskin', 'Wasserschlauch', 'Mješina'), target: 0.7, tolerance: 0.07 },
  { id: 'skin-2', art: 'prophet.ismail-waterskin', label: T('Waterskin', 'Wasserschlauch', 'Mješina'), target: 0.5, tolerance: 0.07 },
  { id: 'skin-3', art: 'prophet.ismail-waterskin', label: T('Waterskin', 'Wasserschlauch', 'Mješina'), target: 0.85, tolerance: 0.06 },
];

/** L3: the basin around the spring and the birds that brought travellers (`prophet.ismail-zamzam-site`, 400 × 300). */
const box = (x: number, y: number, w: number, h: number) => ({ x: x / 400, y: y / 300, w: w / 400, h: h / 300 });
export const SITE: BuildPart[] = [
  { id: 'basin-back', art: 'prophet.ismail-basin-back', label: T('Basin, back', 'Becken hinten', 'Bazen, iza'), slot: box(140, 210, 120, 23), caption: T('Hajar shapes a basin around the water.', 'Hadschar formt ein Becken um das Wasser.', 'Hadžera pravi bazen oko vode.') },
  { id: 'basin-front', art: 'prophet.ismail-basin-front', label: T('Basin, front', 'Becken vorne', 'Bazen, sprijeda'), slot: box(130, 232, 140, 28), caption: T('The water is kept safe.', 'Das Wasser wird bewahrt.', 'Voda je sačuvana.') },
  { id: 'skin', art: 'prophet.ismail-waterskin', label: T('Waterskin', 'Wasserschlauch', 'Mješina'), slot: box(292, 196, 40, 46), caption: T('She fills her waterskin (Bukhari 3364).', 'Sie füllt ihren Wasserschlauch (Bukhari 3364).', 'Puni svoju mješinu (Buhari 3364).') },
  { id: 'bird-1', art: 'garden.bird', label: T('Bird', 'Vogel', 'Ptica'), slot: box(90, 50, 44, 36), caption: T('Birds circle above the water …', 'Vögel kreisen über dem Wasser …', 'Ptice kruže iznad vode …') },
  { id: 'bird-2', art: 'garden.bird', label: T('Bird', 'Vogel', 'Ptica'), slot: box(260, 70, 40, 32), caption: T('… and travellers see that there is water here.', '… und Reisende sehen, dass es hier Wasser gibt.', '… a putnici vide da ovdje ima vode.') },
];

export const ITEM_FACT: Record<string, string> = {
  ...Object.fromEntries(RUNS.map((r) => [r.id, ISMAIL_FACTS.seven.id])),
  ...Object.fromEntries(SKINS.map((s) => [s.id, ISMAIL_FACTS.zamzam.id])),
  ...Object.fromEntries(SITE.map((s) => [s.id, ISMAIL_FACTS.basin.id])),
};
