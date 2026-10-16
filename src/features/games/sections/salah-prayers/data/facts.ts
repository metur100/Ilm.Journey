import type { GameFact } from '@/core/games';
import type { LocalizedText, SourceRef } from '@/core/models';
import salahQuest from '@/features/learn/content/quests/salah.json';

import type { PrayerId } from './prayers';

/*
 * "You learned" facts of the salah-prayers games. Practical details follow the Hanafi school as taught in the Bosnian
 * ilmihal; where other schools differ visibly there is a short neutral note. Texts marked "content" are copied from
 * the Learn content (quests/salah.json) and must stay identical.
 */

const Q = (ref: string): SourceRef => ({ sourceName: 'Quran', sourceReference: ref });
const BUKHARI = (n: string): SourceRef => ({ sourceName: 'Sahih al-Bukhari', sourceReference: n });
const MUSLIM = (n: string): SourceRef => ({ sourceName: 'Sahih Muslim', sourceReference: n });
const ABU_DAWUD = (n: string): SourceRef => ({ sourceName: 'Sunan Abi Dawud', sourceReference: n });
const TIRMIDHI = (n: string): SourceRef => ({ sourceName: "Jami' at-Tirmidhi", sourceReference: n });
/** The Bosnian ilmihal of the Islamic Community in Bosnia and Herzegovina (Hanafi practice of the prayer). */
export const ILMIHAL: SourceRef = { sourceName: 'Ilmihal (IZ BiH)', sourceReference: 'Namaz' };

type Lesson = { id: string; sections: { body: LocalizedText; arabic?: string; transliteration?: string }[]; differenceNote?: LocalizedText; sources?: SourceRef[] };
const lessons = salahQuest.lessons as unknown as Lesson[];
const lesson = (id: string) => {
  const found = lessons.find((l) => l.id === id);
  if (!found) throw new Error(`salah-prayers: missing lesson ${id}`);
  return found;
};
const TIMES = lesson('salah-five');
const POSITIONS = lesson('salah-positions');

/** content: quests/salah.json › salah-five › sections[1..5] (time + fard rakats of each prayer). */
export const TIME_TEXT: Record<'sabah' | 'podne' | 'ikindija' | 'aksam' | 'jacija', LocalizedText> = {
  sabah: TIMES.sections[1].body,
  podne: TIMES.sections[2].body,
  ikindija: TIMES.sections[3].body,
  aksam: TIMES.sections[4].body,
  jacija: TIMES.sections[5].body,
};
/** content: quests/salah.json › salah-positions › differenceNote (hands differ between the schools). */
export const HANDS_DIFFER: LocalizedText = POSITIONS.differenceNote!;
/** content: quests/salah.json › salah-positions › sections (Takbir, Qiyam, Ruku, Sujud, Julus and Taslim). */
export const POSITION_TEXT = {
  takbir: POSITIONS.sections[0].body,
  qiyam: POSITIONS.sections[1].body,
  ruku: POSITIONS.sections[2].body,
  sajda: POSITIONS.sections[3].body,
  selam: POSITIONS.sections[4].body,
};
/** content: the takbir as written in the lesson (Arabic + transliteration). */
export const TAKBIR_WORDS = { arabic: POSITIONS.sections[0].arabic ?? '', transliteration: POSITIONS.sections[0].transliteration ?? '' };
/** content: the words of the selam as written in the lesson body. */
export const SELAM_WORDS: LocalizedText = { en: 'As-salamu alaykum wa rahmatullah', de: 'As-salamu alaikum wa rahmatullah', bs: 'Es-selamu alejkum ve rahmetullah' };
export const POSITION_SOURCES: SourceRef[] = POSITIONS.sources ?? [];

const fact = (id: string, text: LocalizedText, sources: SourceRef[], art: string, check?: GameFact['check']): GameFact => ({ id, text, sources, art, ...(check ? { check } : {}) });

const choice = (prompt: LocalizedText, options: LocalizedText[], correctIndex: number): GameFact['check'] => ({ type: 'choice', prompt, options, correctIndex });

const n = (v: number): LocalizedText => ({ en: String(v), de: String(v), bs: String(v) });

// ---------------------------------------------------------------------------------------------------------------
// Positions (shared by every game)

export const POSITION_FACTS = {
  takbirHands: fact(
    'takbir-hands',
    {
      en: 'For the opening takbir men raise their hands until the thumbs touch the earlobes; women raise them to the shoulders. The palms face the qibla.',
      de: 'Beim Eröffnungs-Takbir heben Männer die Hände, bis die Daumen die Ohrläppchen berühren; Frauen heben sie bis zu den Schultern. Die Handflächen zeigen zur Qibla.',
      bs: 'Na početnom tekbiru muškarci dižu ruke dok palčevima ne dotaknu resice ušiju, a žene do ramena. Dlanovi su okrenuti prema kibli.',
    },
    [MUSLIM('391'), ILMIHAL],
    'salah.prayer-takbir',
  ),
  hands: fact(
    'hands-folded',
    {
      en: 'In the Hanafi school men place the right hand over the left below the navel; women place their hands on the chest. Scholars of other schools differ on where the hands are placed.',
      de: 'In der hanafitischen Rechtsschule legen Männer die rechte Hand unterhalb des Nabels auf die linke; Frauen legen die Hände auf die Brust. Gelehrte anderer Rechtsschulen sind sich uneinig, wo die Hände liegen.',
      bs: 'U hanefijskom mezhebu muškarci stavljaju desnu ruku preko lijeve ispod pupka, a žene ruke stavljaju na prsa. Učenjaci drugih mezheba se razilaze o tome gdje se drže ruke.',
    },
    [MUSLIM('401'), ILMIHAL],
    'salah.prayer-folded',
  ),
  ruku: fact(
    'ruku-level-back',
    {
      en: "In ruku' the back is straight and level, the head in line with it, and the hands hold the knees.",
      de: 'Beim Ruku‘ ist der Rücken gerade und waagerecht, der Kopf in einer Linie mit ihm, und die Hände umfassen die Knie.',
      bs: "Na ruku'u su leđa ravna i vodoravna, glava je u liniji s njima, a rukama se drže koljena.",
    },
    [MUSLIM('498'), BUKHARI('828')],
    'salah.prayer-ruku',
  ),
  sajda: fact(
    'sajda-seven',
    {
      en: 'The Prophet ﷺ was commanded to prostrate on seven parts: the forehead together with the nose, both hands, both knees and the toes of both feet.',
      de: 'Dem Propheten ﷺ wurde befohlen, sich auf sieben Körperteilen niederzuwerfen: der Stirn zusammen mit der Nase, beiden Händen, beiden Knien und den Zehen beider Füße.',
      bs: 'Poslaniku ﷺ je naređeno da čini sedždu na sedam dijelova tijela: čelo zajedno s nosom, obje ruke, oba koljena i prsti obje noge.',
    },
    [BUKHARI('812'), MUSLIM('490')],
    'salah.prayer-sajda-points',
    choice({ en: 'On how many parts of the body is the sajda made?', de: 'Auf wie vielen Körperteilen wird die Niederwerfung verrichtet?', bs: 'Na koliko dijelova tijela se čini sedžda?' }, [n(5), n(7), n(9)], 1),
  ),
  calm: fact(
    'calm-positions',
    {
      en: 'Every position is held calmly until the body is at rest – the Prophet ﷺ told a man who prayed in a hurry to pray again with calm.',
      de: 'Jede Haltung wird ruhig gehalten, bis der Körper zur Ruhe kommt – der Prophet ﷺ sagte einem Mann, der hastig betete, er solle mit Ruhe erneut beten.',
      bs: 'Svaki položaj se drži smireno dok se tijelo ne smiri – Poslanik ﷺ je čovjeku koji je klanjao na brzinu rekao da ponovo klanja smireno.',
    },
    [BUKHARI('757')],
    'salah.prayer-itidal',
  ),
  sitting: fact(
    'sitting-hanafi',
    {
      en: 'In the sittings men sit on the left foot with the right foot upright and its toes towards the qibla; women sit on the floor with both feet out to the right side. Scholars of other schools differ on how to sit, especially in the last sitting.',
      de: 'In den Sitzhaltungen sitzen Männer auf dem linken Fuß, der rechte Fuß steht aufrecht mit den Zehen zur Qibla; Frauen sitzen auf dem Boden, beide Füße nach rechts gelegt. Gelehrte anderer Rechtsschulen sind sich über das Sitzen uneinig, besonders im letzten Sitzen.',
      bs: 'U sjedenju muškarci sjede na lijevoj nozi, a desno stopalo je uspravno s prstima prema kibli; žene sjede na podu s obje noge izvučene na desnu stranu. Učenjaci drugih mezheba se razilaze o načinu sjedenja, posebno u posljednjem sjedenju.',
    },
    [BUKHARI('828'), ILMIHAL],
    'salah.prayer-jalsa',
  ),
  finger: fact(
    'tashahhud-finger',
    {
      en: 'In the sitting, while saying the shahada of the Ettehijjatu, the index finger of the right hand is raised.',
      de: 'Im Sitzen wird beim Glaubensbekenntnis im Ettehijjatu der Zeigefinger der rechten Hand erhoben.',
      bs: 'U sjedenju se pri izgovaranju šehadeta u Ettehijjatu podiže kažiprst desne ruke.',
    },
    [MUSLIM('580'), ILMIHAL],
    'salah.prayer-tashahhud',
  ),
  selam: fact('selam-sides', POSITION_TEXT.selam, [MUSLIM('582'), ABU_DAWUD('996')], 'salah.prayer-selam-right'),
  twoSittings: fact(
    'two-sittings',
    {
      en: 'A prayer of 3 or 4 rakats has two sittings: the first after the 2nd rakat with Ettehijjatu, and the last at the end with Ettehijjatu, Salavat and Rabbena before the selam.',
      de: 'Ein Gebet mit 3 oder 4 Rak‘as hat zwei Sitzhaltungen: die erste nach der 2. Rak‘a mit dem Ettehijjatu und die letzte am Ende mit Ettehijjatu, Salavat und Rabbena vor dem Salam.',
      bs: 'Namaz od 3 ili 4 rekata ima dva sjedenja: prvo nakon 2. rekata s Ettehijjatu, i posljednje na kraju s Ettehijjatu, salavatima i Rabbena prije selama.',
    },
    [BUKHARI('828'), ILMIHAL],
    'salah.prayer-tashahhud',
  ),
  fatihaOnly: fact(
    'fard-fatiha-only',
    {
      en: 'In the 3rd and 4th rakats of a fard prayer only the Fatiha is recited; in sunnah prayers and in vitr a surah follows the Fatiha in every rakat.',
      de: 'In der 3. und 4. Rak‘a eines Pflichtgebets wird nur die Fatiha rezitiert; in Sunna-Gebeten und im Witr folgt in jeder Rak‘a eine Sure auf die Fatiha.',
      bs: 'U 3. i 4. rekatu farza uči se samo Fatiha; u sunnetima i vitru u svakom rekatu nakon Fatihe se uči i sura.',
    },
    [ILMIHAL],
    'salah.prayer-folded',
  ),
};

// ---------------------------------------------------------------------------------------------------------------
// Prayers

const partsCheck = (prompt: LocalizedText, options: LocalizedText[], correctIndex: number) => choice(prompt, options, correctIndex);
const L = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

export const PRAYER_FACTS: Record<PrayerId, Record<string, GameFact>> = {
  sabah: {
    time: fact('sabah-time', TIME_TEXT.sabah, [Q('11:114'), Q('17:78')], 'sky.dawn'),
    parts: fact(
      'sabah-parts',
      L(
        'Sabah has 2 rakats of sunnah and then 2 rakats of fard. In the fard the imam recites the Fatiha and the surah aloud in both rakats.',
        'Fadschr hat 2 Rak‘as Sunna und danach 2 Rak‘as Fard. Im Fard rezitiert der Imam die Fatiha und die Sure in beiden Rak‘as laut.',
        'Sabah ima 2 rekata sunneta i zatim 2 rekata farza. U farzu imam naglas uči Fatihu i suru u oba rekata.',
      ),
      [Q('17:78'), ILMIHAL],
      'salah.prayer-folded',
      partsCheck(L('How many fard rakats does Sabah have?', 'Wie viele Fard-Rak‘as hat Fadschr?', 'Koliko farz rekata ima sabah?'), [n(2), n(3), n(4)], 0),
    ),
    sunnah: fact(
      'sabah-sunnah-best',
      L(
        'The Prophet ﷺ said that the two rakats before the Fajr prayer are better than the world and everything in it.',
        'Der Prophet ﷺ sagte, dass die zwei Rak‘as vor dem Fadschr-Gebet besser sind als die Welt und alles, was darin ist.',
        'Poslanik ﷺ je rekao da su dva rekata prije sabahskog namaza bolja od dunjaluka i svega što je na njemu.',
      ),
      [MUSLIM('725'), BUKHARI('1169')],
      'sky.dawn',
    ),
  },
  podne: {
    time: fact('podne-time', TIME_TEXT.podne, [Q('17:78')], 'sky.noon'),
    parts: fact(
      'podne-parts',
      L(
        'Podne has 4 rakats of sunnah, 4 rakats of fard and then 2 rakats of sunnah. All of them are recited quietly.',
        'Dhuhr hat 4 Rak‘as Sunna, 4 Rak‘as Fard und danach 2 Rak‘as Sunna. Alle werden leise rezitiert.',
        'Podne ima 4 rekata sunneta, 4 rekata farza i zatim 2 rekata sunneta. Sve se uči u sebi.',
      ),
      [BUKHARI('1182'), TIRMIDHI('414'), ILMIHAL],
      'sky.noon',
      partsCheck(L('Which sunnah comes after the fard of Podne?', 'Welche Sunna folgt auf das Fard von Dhuhr?', 'Koji sunnet dolazi nakon podnevskog farza?'), [L('2 rakats', '2 Rak‘as', '2 rekata'), L('4 rakats', '4 Rak‘as', '4 rekata'), L('None', 'Keine', 'Nijedan')], 0),
    ),
    twelve: fact(
      'twelve-sunnah',
      L(
        'Whoever keeps to twelve rakats of sunnah a day – 4 before podne and 2 after it, 2 after akšam, 2 after jacija and 2 before sabah – Allah builds for him a house in Paradise.',
        'Wer täglich zwölf Rak‘as Sunna beibehält – 4 vor Dhuhr und 2 danach, 2 nach Maghrib, 2 nach Ischa und 2 vor Fadschr –, dem baut Allah ein Haus im Paradies.',
        'Ko redovno klanja dvanaest rekata sunneta dnevno – 4 prije podne i 2 poslije, 2 poslije akšama, 2 poslije jacije i 2 prije sabaha – Allah mu gradi kuću u Džennetu.',
      ),
      [TIRMIDHI('414'), MUSLIM('728')],
      'place.masjid-nabawi',
    ),
  },
  ikindija: {
    time: fact('ikindija-time', TIME_TEXT.ikindija, [Q('2:238')], 'sky.afternoon'),
    parts: fact(
      'ikindija-parts',
      L(
        'Ikindija has 4 rakats of sunnah (gajri muekkede) and 4 rakats of fard, both recited quietly.',
        'Asr hat 4 Rak‘as Sunna (nicht betonte Sunna) und 4 Rak‘as Fard, beide leise rezitiert.',
        'Ikindija ima 4 rekata sunneta (gajri muekkede) i 4 rekata farza, oba se uče u sebi.',
      ),
      [ABU_DAWUD('1271'), ILMIHAL],
      'sky.afternoon',
      partsCheck(L('How many rakats of sunnah are prayed before the fard of Ikindija?', 'Wie viele Rak‘as Sunna betet man vor dem Fard von Asr?', 'Koliko rekata sunneta se klanja prije ikindijskog farza?'), [n(2), n(4), n(0)], 1),
    ),
    ghayr: fact(
      'ghayr-muakkada',
      L(
        'In the 4 rakats of sunnah before ikindija and jacija the first sitting has Ettehijjatu, Salavat and the dua, and the 3rd rakat begins again with Subhaneke.',
        'In den 4 Rak‘as Sunna vor Asr und Ischa enthält das erste Sitzen Ettehijjatu, Salavat und das Bittgebet, und die 3. Rak‘a beginnt wieder mit Subhaneke.',
        'U 4 rekata sunneta prije ikindije i jacije u prvom sjedenju se uči Ettehijjatu, salavati i dova, a 3. rekat ponovo počinje sa Subhaneke.',
      ),
      [ILMIHAL],
      'salah.prayer-tashahhud',
    ),
    middle: fact(
      'middle-prayer',
      L(
        'Allah says: "Guard strictly the prayers, and the middle prayer." The Prophet ﷺ called the Asr prayer the middle prayer.',
        'Allah sagt: „Haltet die Gebete ein, und (besonders) das mittlere Gebet.“ Der Prophet ﷺ nannte das Asr-Gebet das mittlere Gebet.',
        'Allah kaže: „Redovno obavljajte namaze, a naročito srednji namaz.“ Poslanik ﷺ je ikindiju nazvao srednjim namazom.',
      ),
      [Q('2:238'), MUSLIM('627')],
      'sky.afternoon',
    ),
  },
  aksam: {
    time: fact('aksam-time', TIME_TEXT.aksam, [Q('11:114')], 'sky.sunset'),
    parts: fact(
      'aksam-parts',
      L(
        'Akšam has 3 rakats of fard and then 2 rakats of sunnah. The imam recites aloud in the first two rakats and quietly in the third.',
        'Maghrib hat 3 Rak‘as Fard und danach 2 Rak‘as Sunna. Der Imam rezitiert in den ersten beiden Rak‘as laut und in der dritten leise.',
        'Akšam ima 3 rekata farza i zatim 2 rekata sunneta. Imam uči naglas u prva dva rekata, a u trećem u sebi.',
      ),
      [BUKHARI('765'), ILMIHAL],
      'sky.sunset',
      partsCheck(L('How many fard rakats does Akšam have?', 'Wie viele Fard-Rak‘as hat Maghrib?', 'Koliko farz rekata ima akšam?'), [n(2), n(3), n(4)], 1),
    ),
    fatihaOnly: POSITION_FACTS.fatihaOnly,
  },
  jacija: {
    time: fact('jacija-time', TIME_TEXT.jacija, [Q('17:78')], 'sky.night'),
    parts: fact(
      'jacija-parts',
      L(
        'Jacija has 4 rakats of sunnah, 4 rakats of fard, 2 rakats of sunnah and then the 3 rakats of vitr.',
        'Ischa hat 4 Rak‘as Sunna, 4 Rak‘as Fard, 2 Rak‘as Sunna und danach die 3 Rak‘as Witr.',
        'Jacija ima 4 rekata sunneta, 4 rekata farza, 2 rekata sunneta i zatim 3 rekata vitra.',
      ),
      [TIRMIDHI('414'), ILMIHAL],
      'sky.night',
      partsCheck(L('Which prayer comes at the end of Jacija?', 'Welches Gebet kommt am Ende von Ischa?', 'Koji namaz dolazi na kraju jacije?'), [L('Vitr', 'Witr', 'Vitr'), L('4 rakats of fard', '4 Rak‘as Fard', '4 rekata farza'), L('2 rakats of sunnah', '2 Rak‘as Sunna', '2 rekata sunneta')], 0),
    ),
    aloud: fact(
      'jacija-aloud',
      L(
        'In the fard of jacija the imam recites aloud in the first two rakats and quietly in the 3rd and 4th.',
        'Im Fard von Ischa rezitiert der Imam in den ersten beiden Rak‘as laut und in der 3. und 4. leise.',
        'U farzu jacije imam uči naglas u prva dva rekata, a u 3. i 4. u sebi.',
      ),
      [BUKHARI('769'), ILMIHAL],
      'salah.prayer-folded',
    ),
  },
  vitr: {
    parts: fact(
      'vitr-three',
      L(
        'Vitr has 3 rakats with one selam at the end and a first sitting after the 2nd rakat. In the Hanafi school it is vadžib (necessary).',
        'Witr hat 3 Rak‘as mit einem Salam am Ende und einem ersten Sitzen nach der 2. Rak‘a. In der hanafitischen Rechtsschule ist es wadschib (notwendig).',
        'Vitr ima 3 rekata s jednim selamom na kraju i prvim sjedenjem nakon 2. rekata. U hanefijskom mezhebu je vadžib.',
      ),
      [BUKHARI('1147'), ABU_DAWUD('1419'), ILMIHAL],
      'sky.night',
      partsCheck(L('How many rakats does vitr have in the Hanafi school?', 'Wie viele Rak‘as hat Witr in der hanafitischen Rechtsschule?', 'Koliko rekata ima vitr u hanefijskom mezhebu?'), [n(1), n(3), n(4)], 1),
    ),
    kunut: fact(
      'vitr-kunut',
      L(
        "In the 3rd rakat of vitr, after the Fatiha and a surah, the takbir is said with raised hands and the kunut dua is recited before the ruku'.",
        'In der 3. Rak‘a des Witr wird nach der Fatiha und einer Sure der Takbir mit erhobenen Händen gesprochen und vor dem Ruku‘ das Kunut-Bittgebet rezitiert.',
        "U 3. rekatu vitra, nakon Fatihe i sure, donosi se tekbir s podignutim rukama i uči kunut-dova prije ruku'a.",
      ),
      [ABU_DAWUD('1425'), ILMIHAL],
      'salah.prayer-takbir',
    ),
    differ: fact(
      'vitr-differ',
      L(
        'Scholars of other schools differ on vitr: for them it is an emphasised sunnah, and it may also be prayed as a single rakat.',
        'Gelehrte anderer Rechtsschulen sind sich beim Witr uneinig: Für sie ist es eine betonte Sunna, und es kann auch als eine einzige Rak‘a gebetet werden.',
        'Učenjaci drugih mezheba se razilaze o vitru: za njih je to pritvrđeni sunnet, a može se klanjati i kao jedan rekat.',
      ),
      [MUSLIM('749')],
      'sky.night',
    ),
  },
  dzuma: {
    command: fact(
      'dzuma-command',
      L(
        'Allah says: when the call to prayer is made on Friday, hasten to the remembrance of Allah and leave trade.',
        'Allah sagt: Wenn am Freitag zum Gebet gerufen wird, eilt zum Gedenken Allahs und lasst den Handel.',
        'Allah kaže: kada se u petak pozove na namaz, požurite na spominjanje Allaha i ostavite trgovinu.',
      ),
      [Q('62:9')],
      'place.masjid-nabawi',
    ),
    parts: fact(
      'dzuma-parts',
      L(
        'Džuma: 4 rakats of sunnah, then the khutbah, 2 rakats of fard prayed in congregation in place of podne, and 4 rakats of sunnah after it.',
        'Dschumu‘a: 4 Rak‘as Sunna, dann die Chutba, 2 Rak‘as Fard in Gemeinschaft anstelle von Dhuhr und danach 4 Rak‘as Sunna.',
        'Džuma: 4 rekata sunneta, zatim hutba, 2 rekata farza u džematu umjesto podne i nakon toga 4 rekata sunneta.',
      ),
      [Q('62:9'), MUSLIM('881'), ILMIHAL],
      'place.masjid-nabawi',
      partsCheck(L('How many fard rakats does Džuma have?', 'Wie viele Fard-Rak‘as hat das Freitagsgebet?', 'Koliko farz rekata ima džuma?'), [n(2), n(4), n(3)], 0),
    ),
    aloud: fact(
      'dzuma-aloud',
      L(
        'The imam recites aloud in both rakats of the džuma fard; the Prophet ﷺ used to recite Surah al-Jumu‘a and al-Munafiqun in it.',
        'Der Imam rezitiert in beiden Rak‘as des Freitags-Fard laut; der Prophet ﷺ pflegte darin die Suren al-Dschumu‘a und al-Munafiqun zu rezitieren.',
        'Imam uči naglas u oba rekata džuma-farza; Poslanik ﷺ je u njemu učio sure El-Džumu‘a i El-Munafikun.',
      ),
      [MUSLIM('877')],
      'salah.prayer-folded',
    ),
  },
};
