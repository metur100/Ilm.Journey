import type { LocalizedText, SourceRef } from '@/core/models';

/*
 * Content of the Hijrah Path game – copied unchanged from the Seerah content (src/features/seerah/content:
 * episode-05.json, events.json, places.json, routes.json, questions/episode-05.json). Nothing here is new: every block
 * keeps its label (fact / interpretation) and its source ids, and the tests compare each block with the Seerah files.
 */

export type SeerahSourceId = 'q-8-30' | 'q-9-40' | 'bukhari-3905' | 'bukhari-3653' | 'ibn-hisham';

/**
 * The Seerah sources as core `SourceRef`s. Name + reference render exactly the Seerah short label
 * (`sourceShortLabel` in src/features/seerah/services/sources.ts), e.g. "Quran al-Tawbah 9:40", "Sahih al-Bukhari 3905".
 */
export const SOURCE_REFS: Record<SeerahSourceId, SourceRef> = {
  'q-8-30': { sourceName: 'Quran', sourceReference: 'al-Anfal 8:30' },
  'q-9-40': { sourceName: 'Quran', sourceReference: 'al-Tawbah 9:40' },
  'bukhari-3905': { sourceName: 'Sahih al-Bukhari', sourceReference: '3905' },
  'bukhari-3653': { sourceName: 'Sahih al-Bukhari', sourceReference: '3653' },
  'ibn-hisham': { sourceName: 'Ibn Hisham', sourceReference: '' },
};

export const sourceRefs = (ids: readonly SeerahSourceId[]): SourceRef[] => ids.map((id) => SOURCE_REFS[id]);

/** A Seerah content block with its label: "Established fact" or "Historical interpretation". */
export interface SeerahBlock {
  kind: 'fact' | 'interpretation';
  text: LocalizedText;
  sourceIds: SeerahSourceId[];
}

/** An event date of the Seerah timeline with its certainty label. */
export interface SeerahDate {
  label: LocalizedText;
  certainty: 'established' | 'approximate' | 'disputed';
  note: LocalizedText | null;
}

// ---------- blocks (episode-05 context/mainEvent, event "quba", place "thawr") ----------

export const PLOT_AND_DEPARTURE_CONTEXT: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "The Muslims of Makkah then left for Yathrib in small groups. The Quran mentions that Quraysh plotted to imprison, kill or expel the Prophet ﷺ.",
    de: "Die Muslime Mekkas zogen daraufhin in kleinen Gruppen nach Yathrib. Der Koran erwähnt, dass die Quraisch planten, den Propheten ﷺ einzusperren, zu töten oder zu vertreiben.",
    bs: "Mekanski muslimani su potom u malim skupinama odlazili u Jesrib. Kur'an spominje da su Kurejšije kovali zavjeru da Poslanika ﷺ zatvore, ubiju ili protjeraju.",
  },
  sourceIds: ['q-8-30', 'ibn-hisham'],
};
export const DEPARTURE: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "ʿAʾishah reported that the Prophet ﷺ came to Abu Bakr's house at an unusual hour to tell him that permission to emigrate had come. Abu Bakr had prepared two camels. They hired a guide who knew the routes, and left Makkah secretly.",
    de: "Aischa berichtete, dass der Prophet ﷺ zu ungewöhnlicher Stunde zu Abu Bakrs Haus kam, um ihm mitzuteilen, dass die Erlaubnis zur Auswanderung gekommen sei. Abu Bakr hatte zwei Kamele vorbereitet. Sie heuerten einen ortskundigen Führer an und verließen Mekka heimlich.",
    bs: "Aiša je prenijela da je Poslanik ﷺ došao u Ebu Bekrovu kuću u neuobičajeno vrijeme da mu kaže da je stigla dozvola za iseljenje. Ebu Bekr je bio pripremio dvije deve. Unajmili su vodiča koji je poznavao puteve i tajno napustili Mekku.",
  },
  sourceIds: ['bukhari-3905'],
};
export const CAVE: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "They hid for three nights in the Cave of Thawr, south of Makkah. When the searchers came close, Abu Bakr was afraid, and the Prophet ﷺ reassured him: \"Do not grieve; Allah is with us.\" The Quran mentions this moment.",
    de: "Sie versteckten sich drei Nächte in der Höhle Thaur südlich von Mekka. Als die Verfolger nahe kamen, hatte Abu Bakr Angst, und der Prophet ﷺ beruhigte ihn: „Sei nicht traurig; Allah ist mit uns.“ Der Koran erwähnt diesen Moment.",
    bs: "Tri noći su se skrivali u pećini Sevr, južno od Mekke. Kada su se tragači približili, Ebu Bekr se uplašio, a Poslanik ﷺ ga je umirio: „Ne brini, Allah je s nama.“ Kur'an spominje taj trenutak.",
  },
  sourceIds: ['q-9-40', 'bukhari-3653'],
};
export const GUIDE: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "Abu Bakr's son ʿAbdullah brought them news from Makkah each night, and his freed man ʿAmir ibn Fuhayrah grazed sheep nearby and brought them milk. Then they travelled with their guide towards Madinah.",
    de: "Abu Bakrs Sohn Abdullah brachte ihnen jede Nacht Neuigkeiten aus Mekka, und sein Freigelassener Amir ibn Fuhaira weidete in der Nähe Schafe und brachte ihnen Milch. Dann reisten sie mit ihrem Führer Richtung Medina.",
    bs: "Ebu Bekrov sin Abdullah donosio im je svake noći vijesti iz Mekke, a njegov oslobođenik Amir ibn Fuhejra napasao je ovce u blizini i donosio im mlijeko. Zatim su s vodičem putovali prema Medini.",
  },
  sourceIds: ['bukhari-3905'],
};
export const ARRIVAL: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "The Muslims of Madinah had gone out every morning to wait for him. He arrived at Quba, stayed there some days, and then entered the city. Yathrib became al-Madinah.",
    de: "Die Muslime Medinas waren jeden Morgen hinausgegangen, um auf ihn zu warten. Er kam in Quba an, blieb dort einige Tage und zog dann in die Stadt ein. Aus Yathrib wurde al-Madina.",
    bs: "Muslimani Medine izlazili su svako jutro da ga čekaju. Stigao je u Kubu, ostao tu nekoliko dana, a zatim ušao u grad. Jesrib je postao el-Medina.",
  },
  sourceIds: ['bukhari-3905'],
};
export const ROUTE_APPROXIMATE: SeerahBlock = {
  kind: 'interpretation',
  text: {
    en: "The exact route is not fully known. The sources describe an unusual path towards the coast; any line on a map is an approximation.",
    de: "Der genaue Weg ist nicht vollständig bekannt. Die Quellen beschreiben einen ungewöhnlichen Weg Richtung Küste; jede Linie auf einer Karte ist eine Annäherung.",
    bs: "Tačan put nije u potpunosti poznat. Izvori opisuju neuobičajen put prema obali; svaka linija na mapi samo je približna.",
  },
  sourceIds: ['ibn-hisham'],
};
export const QUBA: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "The people of Madinah had been waiting each morning. The Prophet ﷺ stayed some days in Quba, where a mosque was founded, before continuing into the town.",
    de: "Die Menschen in Medina hatten jeden Morgen gewartet. Der Prophet ﷺ blieb einige Tage in Quba, wo eine Moschee gegründet wurde, bevor er in die Stadt weiterzog.",
    bs: "Stanovnici Medine su ga svako jutro čekali. Poslanik ﷺ je ostao nekoliko dana u Kubi, gdje je osnovan mesdžid, a zatim je nastavio u grad.",
  },
  sourceIds: ['bukhari-3905'],
};
export const THAWR_SOUTH: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "A cave in a mountain south of Makkah – in the opposite direction from Madinah. The Quran refers to the two in the cave in Surah al-Tawbah 9:40.",
    de: "Eine Höhle in einem Berg südlich von Mekka – in der Gegenrichtung zu Medina. Der Koran erwähnt die zwei in der Höhle in Sure at-Tauba 9:40.",
    bs: "Pećina u brdu južno od Mekke – u suprotnom smjeru od Medine. Kur'an spominje dvojicu u pećini u suri et-Tevbe 9:40.",
  },
  sourceIds: ['q-9-40', 'bukhari-3905'],
};
export const HIJRAH_DATE: SeerahDate = {
  label: {
    en: "622 CE (1 AH)",
    de: "622 n. Chr. (1 n. H.)",
    bs: "622. g. (1. g. po H.)",
  },
  certainty: 'established',
  note: {
    en: "The year is established. Later, under ʿUmar, the Islamic calendar was counted from this year.",
    de: "Das Jahr ist gesichert. Später, unter Umar, wurde der islamische Kalender ab diesem Jahr gezählt.",
    bs: "Godina je potvrđena. Kasnije, za vrijeme Omera, islamski kalendar počeo se računati od te godine.",
  },
};
export const QUBA_DATE: SeerahDate = {
  label: {
    en: "622 CE (Rabiʿ al-Awwal, 1 AH)",
    de: "622 n. Chr. (Rabiʿ al-Awwal, 1 n. H.)",
    bs: "622. g. (rebiul-evvel, 1. g. po H.)",
  },
  certainty: 'established',
  note: {
    en: "The month is established; the exact day differs slightly between reports.",
    de: "Der Monat ist gesichert; der genaue Tag weicht in den Berichten leicht ab.",
    bs: "Mjesec je potvrđen; tačan dan se u predajama malo razlikuje.",
  },
};

/** Explanation of the Seerah ordering question e05-q3 (sources bukhari-3905, ibn-hisham). */
export const ORDER_EXPLANATION: SeerahBlock = {
  kind: 'fact',
  text: {
    en: "The pledges prepared the way; then the secret departure, the cave, Quba and finally Madinah.",
    de: "Die Treueeide bereiteten den Weg; dann der heimliche Aufbruch, die Höhle, Quba und schließlich Medina.",
    bs: "Prisege su pripremile put; zatim tajni odlazak, pećina, Kuba i na kraju Medina.",
  },
  sourceIds: ['bukhari-3905', 'ibn-hisham'],
};

// ---------- the route (routes.json "route-hijrah": lat/lon, approximate between Thawr and Quba) ----------

export const ROUTE_HIJRAH: readonly { lat: number; lon: number }[] = [
  { lat: 21.4225, lon: 39.8262 },
  { lat: 21.3775, lon: 39.8497 },
  { lat: 21.75, lon: 39.3 },
  { lat: 22.5, lon: 39.1 },
  { lat: 23.3, lon: 38.95 },
  { lat: 24.0, lon: 39.3 },
  { lat: 24.4393, lon: 39.6172 },
  { lat: 24.4672, lon: 39.6112 },
];

// ---------- checkpoints ----------

export type CheckpointId = 'depart' | 'cave' | 'guide' | 'quba' | 'madinah';

export interface Checkpoint {
  id: CheckpointId;
  /** Index of the route point where the checkpoint lies. */
  routeIndex: number;
  /** Map label (place names from places.json; the guide stop is an approximate station of the route). */
  place: LocalizedText;
  /** Card title: the stages of the Seerah ordering question e05-q3 (the guide title follows the "hijrah" event). */
  title: LocalizedText;
  blocks: SeerahBlock[];
  date: SeerahDate;
  art: string;
  /** The position itself is approximate (stations between Thawr and Quba). */
  approximate: boolean;
  /** Where the pin head is drawn relative to the real point (map units) – Makkah/Thawr and Quba/Madinah lie close. */
  pinOffset: { dx: number; dy: number };
}

export const CHECKPOINTS: readonly Checkpoint[] = [
  {
    id: 'depart',
    routeIndex: 0,
    place: { en: 'Makkah', de: 'Mekka', bs: 'Mekka' },
    title: { en: 'Leaving Makkah secretly', de: 'Heimlicher Aufbruch aus Mekka', bs: 'Tajni odlazak iz Mekke' },
    blocks: [PLOT_AND_DEPARTURE_CONTEXT, DEPARTURE],
    date: HIJRAH_DATE,
    art: 'place.makkah-city',
    approximate: false,
    pinOffset: { dx: 24, dy: -16 },
  },
  {
    id: 'cave',
    routeIndex: 1,
    place: { en: 'Cave of Thawr', de: 'Höhle Thaur', bs: 'Pećina Sevr' },
    title: { en: 'Three nights in the Cave of Thawr', de: 'Drei Nächte in der Höhle Thaur', bs: 'Tri noći u pećini Sevr' },
    blocks: [CAVE],
    date: HIJRAH_DATE,
    art: 'place.cave-thawr',
    approximate: false,
    pinOffset: { dx: 22, dy: 18 },
  },
  {
    id: 'guide',
    routeIndex: 4,
    place: { en: 'Towards the coast', de: 'Richtung Küste', bs: 'Prema obali' },
    title: { en: 'With a hired guide', de: 'Mit einem angeheuerten Führer', bs: 'S unajmljenim vodičem' },
    blocks: [GUIDE, ROUTE_APPROXIMATE],
    date: HIJRAH_DATE,
    art: 'animal.camel',
    approximate: true,
    pinOffset: { dx: 0, dy: 0 },
  },
  {
    id: 'quba',
    routeIndex: 6,
    place: { en: 'Quba', de: 'Quba', bs: 'Kuba' },
    title: { en: 'Arrival at Quba', de: 'Ankunft in Quba', bs: 'Dolazak u Kubu' },
    blocks: [QUBA],
    date: QUBA_DATE,
    art: 'place.masjid-nabawi-early',
    approximate: false,
    pinOffset: { dx: 24, dy: 14 },
  },
  {
    id: 'madinah',
    routeIndex: 7,
    place: { en: 'Madinah', de: 'Medina', bs: 'Medina' },
    title: { en: 'Entering Madinah', de: 'Einzug in Medina', bs: 'Ulazak u Medinu' },
    blocks: [ARRIVAL],
    date: HIJRAH_DATE,
    art: 'place.madinah-city',
    approximate: false,
    pinOffset: { dx: 22, dy: -16 },
  },
];

/** Art used by the game (checked with `hasArt` in the tests). */
export const HIJRAH_ART: readonly string[] = ['scene.map-hijaz', 'animal.camel', ...CHECKPOINTS.map((c) => c.art)];
