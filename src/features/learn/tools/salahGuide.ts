import type { LocalizedText } from '@/core/models';

/**
 * The Salah guide of the Learn tab: the essentials every learner needs before and while praying.
 * Text is general Hanafi/Bosnian ilmihal teaching; the screen cites the Quran and Bukhari sources.
 */

export interface GuideSection {
  id: string;
  title: LocalizedText;
  body?: LocalizedText;
  bullets?: LocalizedText[];
}

const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

export const SALAH_GUIDE_TITLE = T('Salah – the complete guide', 'Das Gebet – der vollständige Leitfaden', 'Namaz – potpuni vodič');
export const SALAH_GUIDE_INTRO = T(
  'Everything you need for the five daily prayers: the conditions, wudu, how a rakat is performed, the sunnah and fard of every prayer, and what breaks it.',
  'Alles für die fünf täglichen Gebete: die Bedingungen, Wudu, wie eine Rak‘a verrichtet wird, Sunna und Fard jedes Gebets und was es bricht.',
  'Sve što ti treba za pet dnevnih namaza: šarti, abdest, kako se klanja rekat, sunnet i farz svakog namaza i šta ga kvari.',
);
export const SALAH_GUIDE_TABLE = T('The five prayers at a glance', 'Die fünf Gebete auf einen Blick', 'Pet namaza ukratko');
export const SALAH_GUIDE_PRACTICE = T('Practise in the prayer games', 'Übe in den Gebetsspielen', 'Vježbaj u igrama namaza');
export const SALAH_GUIDE_SOURCES = T('Sources', 'Quellen', 'Izvori');

export const SALAH_GUIDE: readonly GuideSection[] = [
  {
    id: 'what',
    title: T('What Salah is', 'Was das Gebet ist', 'Šta je namaz'),
    body: T(
      'Salah is the second pillar of Islam and the daily meeting with Allah. Five times a day the Muslim stands, bows, prostrates and sits, reciting the Quran and remembering Allah. The Prophet ﷺ called it the light of the eye and the difference between faith and disbelief.',
      'Das Gebet ist die zweite Säule des Islam und die tägliche Begegnung mit Allah. Fünfmal am Tag steht der Muslim, verbeugt sich, wirft sich nieder und sitzt, rezitiert den Koran und gedenkt Allahs. Der Prophet ﷺ nannte es das Licht der Augen und den Unterschied zwischen Glaube und Unglaube.',
      'Namaz je drugi temelj islama i svakodnevni susret s Allahom. Pet puta dnevno musliman stoji, čini ruku, sedždu i sjedi, uči Kur’an i sjeća se Allaha. Poslanik ﷺ ga je nazvao svjetlom oka i razlikom između imana i nevjerstva.',
    ),
  },
  {
    id: 'conditions',
    title: T('The conditions before prayer', 'Die Bedingungen vor dem Gebet', 'Šarti prije namaza'),
    body: T(
      'Before the prayer these conditions (shurut) must be met. If one is missing, the prayer is not valid until it is fulfilled.',
      'Vor dem Gebet müssen diese Bedingungen (Schurut) erfüllt sein. Fehlt eine, ist das Gebet nicht gültig, bis sie erfüllt ist.',
      'Prije namaza moraju biti ispunjeni ovi šarti. Ako jedan nedostaje, namaz nije valjan dok se ne ispuni.',
    ),
    bullets: [
      T('The time of the prayer has entered.', 'Die Zeit des Gebets ist eingetreten.', 'Nastupilo je vrijeme namaza.'),
      T('The body, clothes and place are pure (taharet).', 'Körper, Kleidung und Ort sind rein (Taharet).', 'Tijelo, odjeća i mjesto su čisti (taharet).'),
      T('The awrah is covered: for a man from the navel to the knees, for a woman the whole body except the face and hands.', 'Die Aura ist bedeckt: beim Mann vom Nabel bis zu den Knien, bei der Frau der ganze Körper außer Gesicht und Händen.', 'Aura je pokrivena: kod muškarca od pupka do koljena, kod žene cijelo tijelo osim lica i šaka.'),
      T('You face the qibla (the Kaaba in Makkah).', 'Du bist zur Qibla ausgerichtet (die Kaaba in Mekka).', 'Okrenut si kibli (Kabi u Mekki).'),
      T('You make the intention (niyyah) in the heart for the prayer you are about to pray.', 'Du fasst die Absicht (Nijja) im Herzen für das Gebet, das du beten willst.', 'Donosiš nijjet u srcu za namaz koji ćeš klanjati.'),
    ],
  },
  {
    id: 'wudu',
    title: T('Wudu – the ablution', 'Wudu – die Gebetswaschung', 'Abdest'),
    body: T(
      'Wudu is made with clean water in this order: intend purification, wash the hands, rinse the mouth, rinse the nose, wash the face, wash both arms to the elbows, wipe the head, wipe the ears, wash both feet to the ankles. Do not waste water; the Prophet ﷺ used little and taught that cleanliness is half of faith.',
      'Wudu wird mit reinem Wasser in dieser Reihenfolge verrichtet: die Reinigung beabsichtigen, die Hände waschen, den Mund spülen, die Nase spülen, das Gesicht waschen, beide Arme bis zu den Ellbogen waschen, den Kopf abwischen, die Ohren abwischen, beide Füße bis zu den Knöcheln waschen. Verschwende kein Wasser; der Prophet ﷺ verbrauchte wenig und lehrte, dass Reinheit die Hälfte des Glaubens ist.',
      'Abdest se uzima čistom vodom ovim redom: nijjet za taharet, pranje šaka, ispiranje usta, ispiranje nosa, pranje lica, pranje obiju ruku do laktova, mesh po glavi, mesh po ušima, pranje obiju nogu do članaka. Ne troši vodu uzalud; Poslanik ﷺ je trošio malo i poučio da je čistoća pola imana.',
    ),
  },
  {
    id: 'how',
    title: T('How a prayer is performed', 'Wie ein Gebet verrichtet wird', 'Kako se klanja namaz'),
    bullets: [
      T('Stand facing the qibla, make the niyyah and say “Allahu ekber” (takbir), raising the hands.', 'Stell dich zur Qibla, fasse die Nijja und sage „Allahu akbar“ (Takbir) mit erhobenen Händen.', 'Stani prema kibli, donesi nijjet i reci „Allahu ekber“ (tekbir), podižući ruke.'),
      T('Fold the hands and recite Subhaneke, then Al-Fatiha and a short surah.', 'Lege die Hände zusammen und rezitiere Subhaneke, dann Al-Fatiha und eine kurze Sure.', 'Složi ruke i prouči Subhaneke, zatim El-Fatihu i kratku suru.'),
      T('Say “Allahu ekber”, bow into ruku‘ and say “Subhane rabbijel-azim” three times.', 'Sage „Allahu akbar“, gehe in den Ruku‘ und sage dreimal „Subhane rabbijel-azim“.', 'Reci „Allahu ekber“, idi u ruku i tri puta reci „Subhane rabbijel-azim“.'),
      T('Stand up straight (itidal) and say “Semi’allahu limen hamideh, rabbena lekel-hamd”.', 'Richte dich auf (Itidal) und sage „Semi’allahu limen hamideh, rabbena lekel-hamd“.', 'Uspravi se (itidal) i reci „Semi’allahu limen hamideh, rabbena lekel-hamd“.'),
      T('Say “Allahu ekber”, prostrate in sajda and say “Subhane rabbijel-a‘la” three times.', 'Sage „Allahu akbar“, gehe in die Sajda und sage dreimal „Subhane rabbijel-a‘la“.', 'Reci „Allahu ekber“, idi u sedždu i tri puta reci „Subhane rabbijel-a‘la“.'),
      T('Sit up (jalsa), then make the second sajda. That completes one rakat.', 'Setz dich auf (Jalsa) und mache die zweite Sajda. Damit ist eine Rak‘a vollendet.', 'Sjedi (dželsa), pa učini drugu sedždu. Time je završen jedan rekat.'),
      T('After the second rakat sit for Ettehijjatu; after the last rakat add Salavat and Rabbena, then give selam to the right and to the left.', 'Nach der zweiten Rak‘a sitze für Ettehijjatu; nach der letzten Rak‘a füge Salavat und Rabbena hinzu, dann gib den Selam nach rechts und links.', 'Poslije drugog rekata sjedi na Ettehijjatu; poslije posljednjeg rekata dodaj Salavat i Rabbena, pa predaj selam desno i lijevo.'),
    ],
  },
  {
    id: 'five',
    title: T('The five daily prayers', 'Die fünf täglichen Gebete', 'Pet dnevnih namaza'),
    body: T(
      'Each prayer has its own time and its own sunnah and fard rakats. The fard is obligatory; the sunnah is the Prophet’s regular practice and brings great reward.',
      'Jedes Gebet hat seine Zeit und seine eigenen Sunna- und Fard-Rak‘as. Das Fard ist Pflicht; die Sunna ist die regelmäßige Praxis des Propheten und bringt großen Lohn.',
      'Svaki namaz ima svoje vrijeme i svoje sunnete i farzove. Farz je obavezan; sunnet je redovna praksa Poslanika i nosi veliku nagradu.',
    ),
  },
  {
    id: 'sunnah-fard',
    title: T('Sunnah and fard', 'Sunna und Fard', 'Sunnet i farz'),
    body: T(
      'Sabah: 2 sunnah + 2 fard. Podne: 4 sunnah + 4 fard + 2 sunnah. Ikindija: 4 sunnah + 4 fard. Akšam: 3 fard + 2 sunnah. Jacija: 4 sunnah + 4 fard + 2 sunnah + 3 vitr. Vitr is 3 rakats and is vadžib in the Hanafi school. Džuma: 4 sunnah + 2 fard with the khutbah + 4 sunnah.',
      'Fadschr: 2 Sunna + 2 Fard. Dhuhr: 4 Sunna + 4 Fard + 2 Sunna. Asr: 4 Sunna + 4 Fard. Maghrib: 3 Fard + 2 Sunna. Ischa: 4 Sunna + 4 Fard + 2 Sunna + 3 Witr. Witr hat 3 Rak‘as und ist in der hanafitischen Schule wadschib. Dschum‘a: 4 Sunna + 2 Fard mit der Chutba + 4 Sunna.',
      'Sabah: 2 sunneta + 2 farza. Podne: 4 sunneta + 4 farza + 2 sunneta. Ikindija: 4 sunneta + 4 farza. Akšam: 3 farza + 2 sunneta. Jacija: 4 sunneta + 4 farza + 2 sunneta + 3 vitra. Vitr ima 3 rekata i vadžib je u hanefijskom mezhebu. Džuma: 4 sunneta + 2 farza s hutbom + 4 sunneta.',
    ),
  },
  {
    id: 'breaks',
    title: T('What breaks or spoils the prayer', 'Was das Gebet bricht oder verdirbt', 'Šta kvari namaz'),
    bullets: [
      T('Deliberate speech, laughing aloud, eating or drinking break the prayer.', 'Absichtliches Sprechen, lautes Lachen, Essen oder Trinken brechen das Gebet.', 'Namjerni govor, glasan smijeh, jelo ili piće kvare namaz.'),
      T('Turning the whole body away from the qibla, or doing many unrelated movements, breaks it.', 'Sich mit dem ganzen Körper von der Qibla abwenden oder viele fremde Bewegungen brechen es.', 'Okretanje cijelim tijelom od kible ili mnogo stranih pokreta kvari namaz.'),
      T('Leaving out a fard or a vadžib part (such as the Fatiha or a sura) is a serious mistake; it must be corrected or the prayer repeated.', 'Das Auslassen eines Fard- oder Wadschib-Teils (wie Fatiha oder eine Sure) ist ein schwerer Fehler; es muss korrigiert oder das Gebet wiederholt werden.', 'Izostavljanje farza ili vadžiba (poput Fatiha ili sure) teška je greška; mora se ispraviti ili namaz ponoviti.'),
      T('Doubting whether you prayed a rakat is resolved by continuing from what you are certain of, then making the sajda of forgetfulness if needed.', 'Zweifel, ob du eine Rak‘a gebetet hast, löst du, indem du von dem fortsetzt, dessen du sicher bist, und bei Bedarf die Sajda der Vergesslichkeit machst.', 'Sumnju da li si klanjao rekat rješavaš nastavkom od onoga u što si siguran, uz sedždu zaborava ako je potrebno.'),
    ],
  },
  {
    id: 'more',
    title: T('Džuma, vitr and teravih', 'Dschum‘a, Witr und Tarawih', 'Džuma, vitr i teravih'),
    bullets: [
      T('Džuma is prayed on Friday at the time of Podne, in congregation, with a khutbah before the 2 fard rakats. It replaces Podne for those obliged to attend.', 'Dschum‘a wird am Freitag zur Zeit von Dhuhr in Gemeinschaft gebetet, mit einer Chutba vor den 2 Fard-Rak‘as. Sie ersetzt Dhuhr für die, die verpflichtet sind teilzunehmen.', 'Džuma se klanja petkom u vrijeme podne, u džematu, s hutbom prije 2 farza. Ona zamjenjuje podne onima koji su obavezni doći.'),
      T('Vitr is prayed after Jacija; in the Hanafi school it is vadžib and has 3 rakats, with the kunut dua in the third.', 'Witr wird nach Ischa gebetet; in der hanafitischen Schule ist er wadschib und hat 3 Rak‘as mit dem Kunut-Bittgebet in der dritten.', 'Vitr se klanja poslije jacije; u hanefijskom mezhebu je vadžib i ima 3 rekata, s kunut-dovom u trećem.'),
      T('Teravih is prayed in Ramadan after Jacija, in congregation when possible; it is a strongly recommended sunnah.', 'Tarawih wird im Ramadan nach Ischa gebetet, wenn möglich in Gemeinschaft; es ist eine nachdrücklich empfohlene Sunna.', 'Teravih se klanja u ramazanu poslije jacije, kad je moguće u džematu; to je snažno preporučeni sunnet.'),
    ],
  },
];

export interface PrayerRow {
  id: string;
  name: LocalizedText;
  time: LocalizedText;
  parts: string;
  note: LocalizedText;
}

export const PRAYER_ROWS: readonly PrayerRow[] = [
  {
    id: 'sabah',
    name: T('Sabah', 'Fadschr', 'Sabah'),
    time: T('Dawn until sunrise', 'Morgendämmerung bis Sonnenaufgang', 'Zora do izlaska sunca'),
    parts: '2 + 2',
    note: T('2 sunnah, 2 fard – recited aloud', '2 Sunna, 2 Fard – laut rezitiert', '2 sunneta, 2 farza – uči se naglas'),
  },
  {
    id: 'podne',
    name: T('Podne', 'Dhuhr', 'Podne'),
    time: T('After the sun passes its highest point until Asr', 'Nach dem höchsten Stand der Sonne bis Asr', 'Poslije najviše tačke sunca do ikindije'),
    parts: '4 + 4 + 2',
    note: T('4 sunnah, 4 fard, 2 sunnah – quiet', '4 Sunna, 4 Fard, 2 Sunna – leise', '4 sunneta, 4 farza, 2 sunneta – tiho'),
  },
  {
    id: 'ikindija',
    name: T('Ikindija', 'Asr', 'Ikindija'),
    time: T('Afternoon until sunset', 'Nachmittag bis Sonnenuntergang', 'Poslijepodne do zalaska sunca'),
    parts: '4 + 4',
    note: T('4 sunnah, 4 fard – the middle prayer', '4 Sunna, 4 Fard – das mittlere Gebet', '4 sunneta, 4 farza – srednji namaz'),
  },
  {
    id: 'aksam',
    name: T('Akšam', 'Maghrib', 'Akšam'),
    time: T('Just after sunset until the red glow fades', 'Kurz nach Sonnenuntergang bis zum Verschwinden des roten Lichts', 'Odmah poslije zalaska sunca do nestanka crvenila'),
    parts: '3 + 2',
    note: T('3 fard, 2 sunnah – the fard is aloud', '3 Fard, 2 Sunna – das Fard ist laut', '3 farza, 2 sunneta – farz se uči naglas'),
  },
  {
    id: 'jacija',
    name: T('Jacija', 'Ischa', 'Jacija'),
    time: T('After the red glow fades until dawn', 'Nach dem Verschwinden des roten Lichts bis zur Morgendämmerung', 'Poslije nestanka crvenila do zore'),
    parts: '4 + 4 + 2 + 3',
    note: T('4 sunnah, 4 fard, 2 sunnah, 3 vitr', '4 Sunna, 4 Fard, 2 Sunna, 3 Witr', '4 sunneta, 4 farza, 2 sunneta, 3 vitra'),
  },
];
