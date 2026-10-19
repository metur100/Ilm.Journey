import { LANGUAGE_SOURCES, type TopicId } from '../models';
import type { GameFact } from './types';

/**
 * The one foundational fact every game of a topic shows before the learner plays: what the topic is, the
 * essentials and the vocabulary needed for the games. Facts are general, sourced and copied from the same
 * content the Learn units use – no new religious claim is introduced by a game.
 */
const fact = (id: string, en: string, de: string, bs: string, sources: GameFact['sources'], kind?: GameFact['kind']): GameFact => ({
  id,
  text: { en, de, bs },
  sources,
  kind,
});

export const TOPIC_BASICS: Record<TopicId, GameFact> = {
  salah: fact(
    'salah-basics-before-you-pray',
    'Salah is the second pillar of Islam and is prayed five times a day. Before praying, its conditions (shurut) must be met: the time has entered, body and clothes are pure, the awrah is covered, you face the qibla and you make the intention (niyyah). Each prayer has its own sunnah and fard rakats: Sabah 2+2, Podne 4+4+2, Ikindija 4+4, Akšam 3+2, Jacija 4+4+2+3, Vitr 3.',
    'Das Gebet ist die zweite Säule des Islam und wird fünfmal täglich verrichtet. Vor dem Gebet müssen seine Bedingungen (Schurut) erfüllt sein: Die Zeit ist eingetreten, Körper und Kleidung sind rein, die Aura ist bedeckt, man steht zur Qibla und fasst die Absicht (Nijja). Jedes Gebet hat seine eigenen Sunna- und Fard-Rak‘as: Fadschr 2+2, Dhuhr 4+4+2, Asr 4+4, Maghrib 3+2, Ischa 4+4+2+3, Witr 3.',
    'Namaz je drugi temelj islama i klanja se pet puta dnevno. Prije namaza moraju biti ispunjeni njegovi šarti: nastupilo je vrijeme, tijelo i odjeća su čisti, aura je pokrivena, okrenut si kibli i donosiš nijjet. Svaki namaz ima svoje sunnete i farzove: sabah 2+2, podne 4+4+2, ikindija 4+4, akšam 3+2, jacija 4+4+2+3, vitr 3.',
    [
      { sourceName: 'Quran', sourceReference: '4:103' },
      { sourceName: 'Sahih al-Bukhari', sourceReference: '8' },
    ],
  ),
  quran: fact(
    'quran-basics-juz-amma',
    'The Quran has 114 surahs and 30 juz’. Juz ʿAmma is the last juz’ (surahs 78–114); it is learned from the end: Al-Ikhlas, Al-Falaq, An-Nas, Al-Masad and the surahs before them. A surah is learned completely, ayah by ayah – never with ayahs skipped.',
    'Der Koran hat 114 Suren und 30 Dschuz’. Dschuz ʿAmma ist der letzte Dschuz’ (Suren 78–114); er wird von hinten gelernt: Al-Ichlas, Al-Falaq, An-Nas, Al-Masad und die Suren davor. Eine Sure wird vollständig gelernt, Vers für Vers – niemals mit ausgelassenen Versen.',
    'Kur’an ima 114 sura i 30 džuzova. Džuz ʿAmma je posljednji džuz (sure 78–114); uči se od kraja: El-Ihlas, El-Felek, En-Nas, El-Mesed i sure prije njih. Sura se uči cijela, ajet po ajet – nikad s izostavljenim ajetima.',
    [{ sourceName: 'Quran', sourceReference: '78–114' }],
  ),
  prophets: fact(
    'prophets-basics',
    'Allah sent prophets to every people to call them to worship Him alone. The Quran names twenty-five prophets, from Adam to Muhammad ﷺ. Their stories are told in the Quran as lessons in patience, trust and obedience to Allah.',
    'Allah sandte zu jedem Volk Propheten, die zum Gebet an den einen Allah riefen. Der Koran nennt fünfundzwanzig Propheten, von Adam bis Muhammad ﷺ. Ihre Geschichten erzählt der Koran als Lehren von Geduld, Vertrauen und Gehorsam gegenüber Allah.',
    'Allah je svakom narodu poslao poslanike da ga pozovu da obožava samo Njega. Kur’an imenuje dvadeset pet poslanika, od Adema do Muhammeda ﷺ. Njihove priče Kur’an kazuje kao pouke o strpljenju, pouzdanju i poslušnosti Allahu.',
    [
      { sourceName: 'Quran', sourceReference: '16:36' },
      { sourceName: 'Quran', sourceReference: '4:164' },
    ],
  ),
  seerah: fact(
    'seerah-basics',
    'The Seerah is the life of the Prophet Muhammad ﷺ, from his birth in Makkah around 570 to his death in Madinah in 632. It is studied through the Quran, the hadith and the earliest biographies, such as Ibn Hisham.',
    'Die Sira ist das Leben des Propheten Muhammad ﷺ – von seiner Geburt in Mekka um 570 bis zu seinem Tod in Medina 632. Sie wird anhand des Korans, der Hadithe und der frühesten Biografien wie Ibn Hischam studiert.',
    'Sira je život Poslanika Muhammeda ﷺ – od rođenja u Mekki oko 570. do smrti u Medini 632. Proučava se kroz Kur’an, hadise i najranije biografije, poput Ibn Hišama.',
    [
      { sourceName: 'Quran', sourceReference: '33:21' },
      { sourceName: 'Ibn Hisham', sourceReference: 'Sirah' },
    ],
  ),
  akhlaq: fact(
    'akhlaq-basics',
    'Good character is part of faith. The Quran praises the Prophet ﷺ for his exalted character, and he taught that good character is what weighs heaviest on the scale of a believer on the Day of Judgement.',
    'Guter Charakter gehört zum Glauben. Der Koran lobt den Propheten ﷺ für seinen erhabenen Charakter, und er lehrte, dass guter Charakter am schwersten auf der Waage des Gläubigen am Tag des Gerichts wiegt.',
    'Lijep ahlak je dio imana. Kur’an hvali Poslanika ﷺ zbog njegovog uzvišenog ahlaka, a on je poučio da je lijep ahlak najteži na vagi vjernika na Sudnjem danu.',
    [
      { sourceName: 'Quran', sourceReference: '68:4' },
      { sourceName: 'Sunan at-Tirmidhi', sourceReference: '2003' },
    ],
  ),
  ramadan: fact(
    'ramadan-basics',
    'Ramadan is the ninth month of the Hijri calendar. Fasting from dawn to sunset is obligatory for every able adult Muslim, and the Quran was first revealed in this month. The last ten nights include Laylat al-Qadr.',
    'Ramadan ist der neunte Monat des Hidschri-Kalenders. Das Fasten von der Morgendämmerung bis zum Sonnenuntergang ist für jeden gesunden erwachsenen Muslim Pflicht, und der Koran wurde in diesem Monat erstmals offenbart. Die letzten zehn Nächte umfassen die Nacht der Bestimmung.',
    'Ramazan je deveti mjesec hidžretskog kalendara. Post od zore do zalaska sunca obavezan je za svakog zdravog odraslog muslimana, a Kur’an je prvi put objavljen u ovom mjesecu. Posljednjih deset noći uključuje Lejletul-kadr.',
    [
      { sourceName: 'Quran', sourceReference: '2:183–185' },
      { sourceName: 'Quran', sourceReference: '97:1–5' },
    ],
  ),
  history: fact(
    'history-basics',
    'Islamic history begins with the Prophet Muhammad ﷺ and continues through the caliphs, the great centres of learning and the Muslim communities of today. Learning this history helps us understand the Quran, the hadith and the scholars who preserved them.',
    'Die islamische Geschichte beginnt mit dem Propheten Muhammad ﷺ und führt über die Kalifen, die großen Zentren des Wissens bis zu den muslimischen Gemeinschaften von heute. Sie hilft, den Koran, die Hadithe und die Gelehrten zu verstehen, die sie bewahrten.',
    'Islamska historija počinje s Poslanikom Muhammedom ﷺ i teče kroz halife, velika središta znanja i muslimanske zajednice današnjice. Učenje te historije pomaže razumjeti Kur’an, hadise i učenjake koji su ih sačuvali.',
    [
      { sourceName: 'Quran', sourceReference: '33:40' },
      { sourceName: 'Ibn Kathir', sourceReference: 'Al-Bidaya wa’l-Nihaya' },
    ],
  ),
  sufara: fact(
    'sufara-basics',
    'Arabic is written from right to left. The sufara starts with elif, then the short vowels e, i and u, then the other letters. Most letters join the next one; six never do: ا د ذ ر ز و. Every new letter is practised together with the earlier letters and joined into syllables and words.',
    'Arabisch wird von rechts nach links geschrieben. Die Sufara beginnt mit Alif, dann die kurzen Vokale e, i und u, dann die übrigen Buchstaben. Die meisten Buchstaben verbinden sich mit dem nächsten; sechs nie: ا د ذ ر ز و. Jeder neue Buchstabe wird mit den früheren geübt und zu Silben und Wörtern verbunden.',
    'Arapski se piše zdesna nalijevo. Sufara počinje elifom, zatim kratkim samoglasnicima e, i i u, pa ostalim harfovima. Većina harfova se spaja sa sljedećim; šest se nikad ne spaja: ا د ذ ر ز و. Svaki novi harf vježba se s ranijim harfovima i spaja u slogove i riječi.',
    [LANGUAGE_SOURCES.alphabet],
    'language',
  ),
  arabic: fact(
    'arabic-basics',
    'Arabic is the language of the Quran. Learning its words and expressions helps you understand what you recite in salah and what you read in the Quran. Start with the words you hear every day: salah, wudu, masjid, qibla and insha’Allah.',
    'Arabisch ist die Sprache des Korans. Seine Wörter und Ausdrücke zu lernen hilft, zu verstehen, was man im Gebet rezitiert und im Koran liest. Beginne mit den Wörtern des Alltags: Salah, Wudu, Masjid, Qibla und Inscha’Allah.',
    'Arapski je jezik Kur’ana. Učenje njegovih riječi i izraza pomaže razumjeti ono što učiš u namazu i čitaš u Kur’anu. Počni s riječima koje čuješ svaki dan: namaz, abdest, mesdžid, kibla i inšaAllah.',
    [LANGUAGE_SOURCES.alphabet],
    'language',
  ),
};
