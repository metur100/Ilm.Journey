import type { GameFact } from '@/core/games';

import { SRC, T } from './shared';

/*
 * "You learned" facts of the History games. Texts marked (content) are copied from the History learn units
 * (src/features/learn/content/history/*.json) or the Seerah events; the others are well-established dates and names
 * with a standard reference. Every fact id is unique inside its game.
 */

const f = (fact: GameFact): GameFact => fact;

// ---- Caliphs (content: history-caliphs)
export const CALIPH_FACTS = {
  order: f({
    id: 'caliphs-order',
    text: T(
      'After the Prophet ﷺ passed away in 632 CE, the Muslims were led by four caliphs known as the Rightly Guided Caliphs (al-Khulafa ar-Rashidun): Abu Bakr (632–634), Umar ibn al-Khattab (634–644), Uthman ibn Affan (644–656) and Ali ibn Abi Talib (656–661).',
      'Nachdem der Prophet ﷺ 632 n. Chr. gestorben war, wurden die Muslime von vier Kalifen geführt, den rechtgeleiteten Kalifen (al-Chulafa ar-Raschidun): Abu Bakr (632–634), Umar ibn al-Chattab (634–644), Uthman ibn Affan (644–656) und Ali ibn Abi Talib (656–661).',
      'Nakon što je Poslanik ﷺ preselio 632. godine, muslimane su predvodile četiri halife poznate kao pravedne halife (el-hulefa er-rašidun): Ebu Bekr (632–634), Omer ibn el-Hattab (634–644), Osman ibn Affan (644–656) i Alija ibn Ebi Talib (656–661).',
    ),
    sources: [SRC.tabari],
    art: 'history.four-medallions',
    reviewKey: 'learn:history-caliphs-1',
  }),
  first: f({
    id: 'first-caliph',
    text: T('Abu Bakr was the first caliph after the Prophet ﷺ. He led the Muslims from 632 to 634 CE.', 'Abu Bakr war der erste Kalif nach dem Propheten ﷺ. Er führte die Muslime von 632 bis 634 n. Chr.', 'Ebu Bekr je bio prvi halifa nakon Poslanika ﷺ. Predvodio je muslimane od 632. do 634. godine.'),
    sources: [SRC.tabari],
    reviewKey: 'learn:history-caliphs-p',
  }),
  second: f({
    id: 'second-caliph',
    text: T('Umar ibn al-Khattab was the second caliph. He led the Muslims from 634 to 644 CE.', 'Umar ibn al-Chattab war der zweite Kalif. Er führte die Muslime von 634 bis 644 n. Chr.', 'Omer ibn el-Hattab je bio drugi halifa. Predvodio je muslimane od 634. do 644. godine.'),
    sources: [SRC.tabari],
    reviewKey: 'learn:history-caliphs-3',
  }),
  remembered: f({
    id: 'caliphs-remembered',
    text: T(
      'Under Abu Bakr the Quran was gathered into one collection. Under Umar the Hijri calendar was introduced, counting years from the Hijra. Under Uthman copies of the Quran were made and sent to different regions. Ali was the Prophet’s ﷺ cousin and son-in-law.',
      'Unter Abu Bakr wurde der Koran in einer Sammlung zusammengetragen. Unter Umar wurde der Hidschri-Kalender eingeführt, der die Jahre ab der Hidschra zählt. Unter Uthman wurden Abschriften des Korans angefertigt und in verschiedene Regionen geschickt. Ali war der Cousin und Schwiegersohn des Propheten ﷺ.',
      'Za vrijeme Ebu Bekra Kur’an je sakupljen u jednu zbirku. Za vrijeme Omera uveden je hidžretski kalendar, koji broji godine od Hidžre. Za vrijeme Osmana prepisani su primjerci Kur’ana i poslani u razne krajeve. Alija je bio Poslanikov ﷺ amidžić i zet.',
    ),
    sources: [SRC.bukhari('4986; 4987; 3934')],
    reviewKey: 'learn:history-caliphs-2',
  }),
  care: f({
    id: 'caliphs-care',
    text: T(
      'The Rightly Guided Caliphs preserved the Quran and the community after the Prophet ﷺ – much of what we have today goes back to their care.',
      'Die rechtgeleiteten Kalifen bewahrten nach dem Propheten ﷺ den Koran und die Gemeinschaft – vieles, was wir heute haben, geht auf ihre Sorgfalt zurück.',
      'Pravedne halife sačuvale su Kur’an i zajednicu nakon Poslanika ﷺ – mnogo toga što danas imamo potiče iz njihove brige.',
    ),
    sources: [SRC.bukhari('4986; 4987'), SRC.tabari],
  }),
};

// ---- Mushaf (Sahih al-Bukhari 4986, 4987)
export const MUSHAF_FACTS = {
  zayd: f({
    id: 'zayd-gathers',
    text: T(
      'Under Abu Bakr, Zayd ibn Thabit gathered the Quran from what was written on palm-leaf stalks and thin white stones and from the people who knew it by heart.',
      'Unter Abu Bakr sammelte Zaid ibn Thabit den Koran von dem, was auf Palmblattstielen und dünnen weißen Steinen geschrieben war, und von den Menschen, die ihn auswendig konnten.',
      'Za vrijeme Ebu Bekra Zejd ibn Sabit sakupio je Kur’an s onoga što je bilo zapisano na peteljkama palminog lišća i tankom bijelom kamenju, te od ljudi koji su ga znali napamet.',
    ),
    sources: [SRC.bukhari('4986')],
    art: 'history.suhuf',
  }),
  oneCollection: f({
    id: 'one-collection',
    text: T('Under Abu Bakr the Quran was gathered into one collection.', 'Unter Abu Bakr wurde der Koran in einer Sammlung zusammengetragen.', 'Za vrijeme Ebu Bekra Kur’an je sakupljen u jednu zbirku.'),
    sources: [SRC.bukhari('4986')],
  }),
  yamama: f({
    id: 'yamama',
    text: T(
      'After many reciters of the Quran were killed in the Battle of al-Yamama, Umar urged Abu Bakr to have the Quran collected.',
      'Nachdem in der Schlacht von al-Yamama viele Koranrezitatoren gefallen waren, drängte Umar Abu Bakr, den Koran sammeln zu lassen.',
      'Nakon što su u bici na Jemami poginuli mnogi učači Kur’ana, Omer je nagovorio Ebu Bekra da se Kur’an sakupi.',
    ),
    sources: [SRC.bukhari('4986')],
  }),
  hudhayfa: f({
    id: 'hudhayfa',
    text: T(
      'Hudhayfa ibn al-Yaman was worried about the differences in how people recited the Quran, and asked Uthman to act.',
      'Hudhaifa ibn al-Yaman war besorgt über die Unterschiede, wie die Menschen den Koran rezitierten, und bat Uthman zu handeln.',
      'Huzejfa ibn el-Jeman bio je zabrinut zbog razlika u tome kako ljudi uče Kur’an i zamolio je Osmana da nešto učini.',
    ),
    sources: [SRC.bukhari('4987')],
  }),
  hafsa: f({
    id: 'hafsa-sheets',
    text: T(
      'The sheets stayed with Abu Bakr until he died, then with Umar, and then with Hafsa, the daughter of Umar.',
      'Die Blätter blieben bei Abu Bakr bis zu seinem Tod, dann bei Umar und danach bei Hafsa, der Tochter Umars.',
      'Listovi su ostali kod Ebu Bekra do njegove smrti, zatim kod Omera, a onda kod Hafse, Omerove kćerke.',
    ),
    sources: [SRC.bukhari('4986')],
    art: 'history.chest',
  }),
  copies: f({
    id: 'uthman-copies',
    text: T(
      'Uthman had copies made from Hafsa’s sheets and sent one copy to every Muslim province.',
      'Uthman ließ von Hafsas Blättern Abschriften anfertigen und schickte in jede muslimische Provinz eine Abschrift.',
      'Osman je dao prepisati primjerke s Hafsinih listova i poslao po jedan primjerak u svaku muslimansku pokrajinu.',
    ),
    sources: [SRC.bukhari('4987')],
    art: 'history.mushaf',
  }),
};

// ---- Hijri calendar
export const HIJRI_FACTS = {
  twelve: f({
    id: 'twelve-months',
    text: T('The number of months with Allah is twelve; four of them are sacred.', 'Die Zahl der Monate bei Allah ist zwölf; vier davon sind heilig.', 'Broj mjeseci kod Allaha je dvanaest; četiri od njih su sveta.'),
    sources: [SRC.quran('9:36')],
    art: 'history.hijri-moons',
  }),
  crescent: f({
    id: 'new-moons',
    text: T('The new moons are signs to mark times for people and for the Hajj.', 'Die Neumonde sind Zeitbestimmungen für die Menschen und für den Hadsch.', 'Mlađaci su ljudima oznake za vrijeme i za hadž.'),
    sources: [SRC.quran('2:189')],
    art: 'history.moon-month',
  }),
  fromHijra: f({
    id: 'counted-from-hijra',
    text: T('Under Umar the Hijri calendar was introduced, counting years from the Hijra.', 'Unter Umar wurde der Hidschri-Kalender eingeführt, der die Jahre ab der Hidschra zählt.', 'Za vrijeme Omera uveden je hidžretski kalendar, koji broji godine od Hidžre.'),
    sources: [SRC.bukhari('3934')],
    reviewKey: 'learn:history-caliphs-4',
  }),
  year1: f({
    id: 'year-one',
    text: T('The Hijra to Madinah was in 622 CE – year 1 of the Hijri calendar.', 'Die Hidschra nach Medina war 622 n. Chr. – das Jahr 1 des Hidschri-Kalenders.', 'Hidžra u Medinu bila je 622. godine – to je 1. godina hidžretskog kalendara.'),
    sources: [SRC.bukhari('3905'), SRC.tabari],
  }),
  sacred: f({
    id: 'sacred-months',
    text: T(
      'The four sacred months are Dhu al-Qaʿda, Dhu al-Hijja and Muharram, which follow each other, and Rajab.',
      'Die vier heiligen Monate sind Dhu l-Qaʿda, Dhu l-Hiddscha und Muharram, die aufeinander folgen, sowie Radschab.',
      'Četiri sveta mjeseca su zul-ka’de, zul-hidždže i muharrem, koji dolaze jedan za drugim, te redžeb.',
    ),
    sources: [SRC.bukhari('3197'), SRC.muslim('1679')],
  }),
  ramadan: f({
    id: 'month-of-ramadan',
    text: T('Ramadan is the month in which the Quran was revealed.', 'Ramadan ist der Monat, in dem der Koran herabgesandt wurde.', 'Ramazan je mjesec u kojem je objavljen Kur’an.'),
    sources: [SRC.quran('2:185')],
  }),
};

// ---- House of Wisdom
export const WISDOM_FACTS = {
  house: f({
    id: 'bayt-al-hikma',
    text: T(
      'Encouraged by the Quran’s call to seek knowledge, Muslim scholars made great contributions to science. In Baghdad, the House of Wisdom (Bayt al-Hikma) became a centre of translation and research.',
      'Ermutigt durch den Aufruf des Korans, Wissen zu suchen, leisteten muslimische Gelehrte große Beiträge zur Wissenschaft. In Bagdad wurde das Haus der Weisheit (Bait al-Hikma) zu einem Zentrum der Übersetzung und Forschung.',
      'Podstaknuti kur’anskim pozivom na traženje znanja, muslimanski učenjaci dali su veliki doprinos nauci. U Bagdadu je Kuća mudrosti (Bejtul-hikme) postala središte prevođenja i istraživanja.',
    ),
    sources: [SRC.quran('20:114; 96:1–5'), SRC.ei2('Bayt al-Ḥikma')],
    art: 'history.house-of-wisdom',
    reviewKey: 'learn:history-golden-age-2',
  }),
  increase: f({
    id: 'increase-in-knowledge',
    text: T('The Quran teaches the dua “My Lord, increase me in knowledge.”', 'Der Koran lehrt das Bittgebet: „Mein Herr, mehre mir Wissen.“', 'Kur’an uči dovu: „Gospodaru moj, povećaj mi znanje!“'),
    sources: [SRC.quran('20:114')],
  }),
  khwarizmi: f({
    id: 'khwarizmi-baghdad',
    text: T(
      'Al-Khwarizmi worked in Baghdad in the time of the House of Wisdom. His book on al-jabr gave its name to algebra.',
      'Al-Chwarizmi arbeitete in Bagdad zur Zeit des Hauses der Weisheit. Sein Buch über al-dschabr gab der Algebra ihren Namen.',
      'El-Havarizmi je radio u Bagdadu u vrijeme Kuće mudrosti. Njegova knjiga o el-džebru dala je ime algebri.',
    ),
    sources: [SRC.khwarizmi, SRC.ei2('al-Khwārazmī')],
    art: 'history.numerals',
  }),
  read: f({
    id: 'read-and-the-pen',
    text: T('The first revealed verses call to read and mention the pen: “Read … who taught by the pen.”', 'Die ersten offenbarten Verse rufen zum Lesen auf und nennen das Schreibrohr: „Lies … der durch das Schreibrohr gelehrt hat.“', 'Prvi objavljeni ajeti pozivaju na čitanje i spominju pero: „Čitaj … koji poučava peru.“'),
    sources: [SRC.quran('96:1–5')],
  }),
  canon: f({
    id: 'canon-of-medicine',
    text: T('Ibn Sina wrote the Canon of Medicine, used for centuries.', 'Ibn Sina schrieb den Kanon der Medizin, der jahrhundertelang benutzt wurde.', 'Ibn Sina je napisao Kanon medicine, korišten stoljećima.'),
    sources: [SRC.ibnSina],
    art: 'history.book-red',
  }),
  optics: f({
    id: 'book-of-optics',
    text: T('Ibn al-Haytham studied light and vision in his Book of Optics.', 'Ibn al-Haitham erforschte Licht und Sehen in seinem Buch der Optik.', 'Ibn el-Hejsem je proučavao svjetlost i vid u Knjizi o optici.'),
    sources: [SRC.haytham],
    art: 'history.lens',
  }),
};

// ---- Golden Age scholars (content: history-golden-age)
export const SCHOLAR_FACTS = {
  fields: f({
    id: 'scholar-fields',
    text: T('Al-Khwarizmi – algebra, Ibn Sina – medicine, Ibn al-Haytham – optics.', 'Al-Chwarizmi – Algebra, Ibn Sina – Medizin, Ibn al-Haitham – Optik.', 'El-Havarizmi – algebra, Ibn Sina – medicina, Ibn el-Hejsem – optika.'),
    sources: [SRC.khwarizmi, SRC.ibnSina, SRC.haytham],
    reviewKey: 'learn:history-golden-age-1',
  }),
  algebraWord: f({
    id: 'algebra-word',
    text: T(
      'Al-Khwarizmi wrote a book on al-jabr – the origin of the word “algebra” – and the word “algorithm” comes from his name.',
      'Al-Chwarizmi schrieb ein Buch über al-dschabr – den Ursprung des Wortes „Algebra“ –, und das Wort „Algorithmus“ kommt von seinem Namen.',
      'El-Havarizmi je napisao knjigu o el-džebru – odakle potiče riječ „algebra“ –, a riječ „algoritam“ dolazi od njegovog imena.',
    ),
    sources: [SRC.khwarizmi],
    reviewKey: 'learn:history-golden-age-4',
  }),
  zahrawi: f({
    id: 'zahrawi-surgery',
    text: T(
      'Al-Zahrawi, a doctor in Córdoba, wrote al-Tasrif, a medical book famous for its part on surgery and its drawings of surgical instruments.',
      'Al-Zahrawi, ein Arzt in Córdoba, schrieb at-Tasrif, ein medizinisches Buch, das für seinen Teil über die Chirurgie und seine Zeichnungen chirurgischer Instrumente berühmt ist.',
      'Ez-Zehravi, ljekar u Kordobi, napisao je et-Tasrif, medicinsku knjigu poznatu po dijelu o hirurgiji i crtežima hirurških instrumenata.',
    ),
    sources: [SRC.zahrawi],
    art: 'history.surgical-tools',
  }),
  qarawiyyin: f({
    id: 'qarawiyyin',
    text: T(
      'Fatima al-Fihri founded al-Qarawiyyin in Fez, one of the oldest places of learning still active today.',
      'Fatima al-Fihri gründete al-Qarawiyyin in Fès, eine der ältesten noch aktiven Lehrstätten.',
      'Fatima el-Fihri osnovala je el-Karavijjin u Fesu, jedno od najstarijih mjesta učenja koje i danas radi.',
    ),
    sources: [SRC.ei2('al-Ḳarawiyyīn')],
    art: 'history.qarawiyyin',
    reviewKey: 'learn:history-golden-age-3',
  }),
  canon: WISDOM_FACTS.canon,
  optics: WISDOM_FACTS.optics,
};

// ---- Scholars and their books (content: history-scholars)
export const BOOK_FACTS = {
  sahihs: f({
    id: 'two-sahihs',
    text: T(
      'Imam al-Bukhari (died 256 AH) compiled the Sahih al-Bukhari and Imam Muslim (died 261 AH) the Sahih Muslim – two of the most trusted hadith collections.',
      'Imam al-Buchari (gest. 256 n. H.) stellte den Sahih al-Buchari zusammen und Imam Muslim (gest. 261 n. H.) den Sahih Muslim – zwei der vertrauenswürdigsten Hadith-Sammlungen.',
      'Imam el-Buhari (umro 256. h.) sastavio je Sahih el-Buhari, a imam Muslim (umro 261. h.) Sahih Muslim – dvije najpouzdanije zbirke hadisa.',
    ),
    sources: [{ sourceName: 'Sahih al-Bukhari', sourceReference: '—' }, { sourceName: 'Sahih Muslim', sourceReference: '—' }, SRC.dhahabi],
    art: 'history.book-green',
    reviewKey: 'learn:history-scholars-p',
  }),
  travel: f({
    id: 'scholars-travelled',
    text: T('Scholars travelled far to collect and check the sayings of the Prophet ﷺ.', 'Gelehrte reisten weit, um die Aussprüche des Propheten ﷺ zu sammeln und zu prüfen.', 'Učenjaci su daleko putovali da sakupe i provjere izreke Poslanika ﷺ.'),
    sources: [SRC.dhahabi],
  }),
  imams: f({
    id: 'four-imams',
    text: T(
      'Four great scholars gave their names to the four Sunni schools of Islamic law (madhhabs): Abu Hanifa (died 150 AH), Malik (died 179 AH), al-Shafi’i (died 204 AH) and Ahmad ibn Hanbal (died 241 AH).',
      'Vier große Gelehrte gaben den vier sunnitischen Rechtsschulen (Madhhabs) ihre Namen: Abu Hanifa (gest. 150 n. H.), Malik (gest. 179 n. H.), asch-Schafi’i (gest. 204 n. H.) und Ahmad ibn Hanbal (gest. 241 n. H.).',
      'Četiri velika učenjaka dala su imena četirima sunnijskim pravnim školama (mezhebima): Ebu Hanifa (umro 150. h.), Malik (umro 179. h.), eš-Šafi’i (umro 204. h.) i Ahmed ibn Hanbel (umro 241. h.).',
    ),
    sources: [SRC.dhahabi],
    reviewKey: 'learn:history-scholars-2',
  }),
  hanafi: f({
    id: 'bosnia-hanafi',
    text: T('Most Muslims in Bosnia and Herzegovina traditionally follow the Hanafi school.', 'Die meisten Muslime in Bosnien und Herzegowina folgen traditionell der hanafitischen Schule.', 'Većina muslimana u Bosni i Hercegovini tradicionalno slijedi hanefijski mezheb.'),
    sources: [SRC.dhahabi],
    reviewKey: 'learn:history-scholars-3',
  }),
  respect: f({
    id: 'imams-respect',
    text: T('The four imams respected each other even where they reached different conclusions.', 'Die vier Imame achteten einander, auch wo sie zu unterschiedlichen Ergebnissen kamen.', 'Četiri imama poštovala su jedni druge i tamo gdje su došli do različitih zaključaka.'),
    sources: [SRC.dhahabi],
    reviewKey: 'learn:history-scholars-4',
  }),
  sixBooks: f({
    id: 'six-books',
    text: T(
      'The collections of al-Bukhari, Muslim, Abu Dawud, al-Tirmidhi, al-Nasa’i and Ibn Majah are known together as the Six Books (al-Kutub al-Sitta).',
      'Die Sammlungen von al-Buchari, Muslim, Abu Dawud, at-Tirmidhi, an-Nasa’i und Ibn Madscha sind zusammen als die Sechs Bücher (al-Kutub as-Sitta) bekannt.',
      'Zbirke el-Buharija, Muslima, Ebu Davuda, et-Tirmizija, en-Nesaija i Ibn Madže zajedno su poznate kao Šest knjiga (el-Kutubus-sitte).',
    ),
    sources: [SRC.ei2('Ḥadīth'), SRC.dhahabi],
    art: 'history.shelf',
  }),
};

// ---- Timeline
export const TIMELINE_FACTS = {
  revelation: f({
    id: 'first-revelation',
    text: T(
      'The first revelation came in about 610 CE, when the Prophet ﷺ was about forty years old.',
      'Die erste Offenbarung kam um 610 n. Chr., als der Prophet ﷺ etwa vierzig Jahre alt war.',
      'Prva Objava došla je oko 610. godine, kada je Poslanik ﷺ imao oko četrdeset godina.',
    ),
    sources: [SRC.bukhari('3'), SRC.ibnHisham],
    art: 'place.cave-hira',
  }),
  hijrah: f({
    id: 'hijrah-622',
    text: T('The Hijra to Madinah was in 622 CE – year 1 of the Hijri calendar.', 'Die Hidschra nach Medina war 622 n. Chr. – das Jahr 1 des Hidschri-Kalenders.', 'Hidžra u Medinu bila je 622. godine – to je 1. godina hidžretskog kalendara.'),
    sources: [SRC.bukhari('3905'), SRC.tabari],
  }),
  cordoba: f({
    id: 'cordoba-785',
    text: T('The Great Mosque of Córdoba was begun in 785 CE under ʿAbd al-Rahman I.', 'Die Große Moschee von Córdoba wurde 785 n. Chr. unter ʿAbd ar-Rahman I. begonnen.', 'Velika džamija u Kordobi počela se graditi 785. godine za vrijeme Abdurrahmana I.'),
    sources: [SRC.unesco('Historic Centre of Cordoba (no. 313)')],
    art: 'history.cordoba-mosque',
  }),
  qarawiyyin: f({
    id: 'qarawiyyin-859',
    text: T('Al-Qarawiyyin in Fez was founded in 859 CE by Fatima al-Fihri.', 'Al-Qarawiyyin in Fès wurde 859 n. Chr. von Fatima al-Fihri gegründet.', 'El-Karavijjin u Fesu osnovala je Fatima el-Fihri 859. godine.'),
    sources: [SRC.ei2('al-Ḳarawiyyīn')],
    art: 'history.qarawiyyin',
  }),
  sarajevo: f({
    id: 'sarajevo-1462',
    text: T(
      'Sarajevo grew around the endowment (vakuf) of Isa-beg Ishaković, whose endowment charter dates from 1462.',
      'Sarajevo wuchs um die Stiftung (Vakuf) von Isa-beg Ishaković, deren Stiftungsurkunde aus dem Jahr 1462 stammt.',
      'Sarajevo je izraslo oko vakufa Isa-bega Ishakovića, čija vakufnama potiče iz 1462. godine.',
    ),
    sources: [SRC.vakufnama('Isa-beg Ishaković, 1462')],
  }),
  stariMost: f({
    id: 'stari-most-1566',
    text: T('The Old Bridge (Stari Most) in Mostar was completed in 1566.', 'Die Alte Brücke (Stari Most) in Mostar wurde 1566 fertiggestellt.', 'Stari most u Mostaru završen je 1566. godine.'),
    sources: [SRC.unesco('Old Bridge Area of the Old City of Mostar (no. 946)')],
    art: 'history.stari-most',
  }),
};

// ---- Great mosques
export const MOSQUE_FACTS = {
  three: f({
    id: 'three-mosques',
    text: T(
      'Journeys are made especially to three mosques: al-Masjid al-Haram, the Prophet’s Mosque and al-Masjid al-Aqsa.',
      'Besondere Reisen werden zu drei Moscheen unternommen: al-Masdschid al-Haram, der Moschee des Propheten und al-Masdschid al-Aqsa.',
      'Posebno se putuje u tri mesdžida: Mesdžidul-haram, Poslanikov mesdžid i Mesdžidul-aksa.',
    ),
    sources: [SRC.bukhari('1189')],
    art: 'place.masjid-haram',
  }),
  firstHouse: f({
    id: 'first-house',
    text: T('The first house of worship set up for people is the one at Makkah (Bakkah).', 'Das erste Haus der Anbetung, das für die Menschen errichtet wurde, ist das in Mekka (Bakka).', 'Prva kuća sagrađena za ljude jeste ona u Mekki (Bekki).'),
    sources: [SRC.quran('3:96')],
    art: 'place.kaaba',
  }),
  umayyad: f({
    id: 'umayyad-mosque',
    text: T(
      'The Umayyad Mosque in Damascus was built under the caliph al-Walid ibn ʿAbd al-Malik at the beginning of the 8th century.',
      'Die Umayyaden-Moschee in Damaskus wurde unter dem Kalifen al-Walid ibn ʿAbd al-Malik zu Beginn des 8. Jahrhunderts gebaut.',
      'Emevijska džamija u Damasku sagrađena je za vrijeme halife el-Velida ibn Abdul-Melika početkom 8. stoljeća.',
    ),
    sources: [SRC.ibnKathir('years 86–96 AH')],
    art: 'history.umayyad',
  }),
  suleymaniye: f({
    id: 'suleymaniye',
    text: T(
      'The Süleymaniye Mosque in Istanbul was built by the architect Mimar Sinan between 1550 and 1557.',
      'Die Süleymaniye-Moschee in Istanbul wurde vom Baumeister Mimar Sinan zwischen 1550 und 1557 errichtet.',
      'Sulejmanija džamiju u Istanbulu sagradio je graditelj Mimar Sinan između 1550. i 1557. godine.',
    ),
    sources: [SRC.unesco('Historic Areas of Istanbul (no. 356)')],
    art: 'history.suleymaniye',
  }),
  forty: f({
    id: 'haram-then-aqsa',
    text: T(
      'Al-Masjid al-Haram was the first mosque set up on earth, then al-Masjid al-Aqsa – forty years lay between them.',
      'Al-Masdschid al-Haram war die erste Moschee auf der Erde, danach al-Masdschid al-Aqsa – vierzig Jahre lagen dazwischen.',
      'Mesdžidul-haram je prvi mesdžid podignut na Zemlji, a zatim Mesdžidul-aksa – između njih je bilo četrdeset godina.',
    ),
    sources: [SRC.bukhari('3366')],
    art: 'place.masjid-aqsa',
  }),
  gaziHusrevBeg: f({
    id: 'gazi-husrev-beg-1531',
    text: T('The Gazi Husrev-beg Mosque in Sarajevo was built in 1530–1531.', 'Die Gazi-Husrev-beg-Moschee in Sarajevo wurde 1530–1531 erbaut.', 'Gazi Husrev-begova džamija u Sarajevu sagrađena je 1530–1531. godine.'),
    sources: [SRC.vakufnama('Gazi Husrev-beg, 1531'), SRC.kons('Gazi Husrev-beg Mosque')],
    art: 'history.gazi-husrev-beg',
  }),
};

// ---- Bosnia
export const BOSNIA_FACTS = {
  gaziHusrevBeg: MOSQUE_FACTS.gaziHusrevBeg,
  learning: f({
    id: 'sarajevo-learning',
    text: T(
      'In Sarajevo, the Gazi Husrev-beg Mosque and its library and madrasa were founded in the 16th century and remain centres of learning today.',
      'In Sarajevo wurden die Gazi-Husrev-beg-Moschee mit ihrer Bibliothek und Medresse im 16. Jahrhundert gegründet und sind bis heute Orte des Lernens.',
      'U Sarajevu su Gazi Husrev-begova džamija s bibliotekom i medresom osnovane u 16. stoljeću i do danas su središta učenja.',
    ),
    sources: [SRC.vakufnama('Gazi Husrev-beg, 1531; 1537')],
  }),
  stariMost: f({
    id: 'stari-most',
    text: T(
      'The Old Bridge (Stari Most) in Mostar was completed in 1566. It was destroyed in 1993 and rebuilt in 2004.',
      'Die Alte Brücke (Stari Most) in Mostar wurde 1566 fertiggestellt. Sie wurde 1993 zerstört und 2004 wieder aufgebaut.',
      'Stari most u Mostaru završen je 1566. godine. Srušen je 1993., a obnovljen 2004. godine.',
    ),
    sources: [SRC.unesco('Old Bridge Area of the Old City of Mostar (no. 946)')],
    art: 'history.stari-most',
  }),
  ferhadija: f({
    id: 'ferhadija',
    text: T(
      'The Ferhadija Mosque in Banja Luka was built in 1579. It was destroyed in 1993 and opened again in 2016 after it was rebuilt.',
      'Die Ferhadija-Moschee in Banja Luka wurde 1579 erbaut. Sie wurde 1993 zerstört und 2016 nach dem Wiederaufbau wieder eröffnet.',
      'Ferhadija džamija u Banjoj Luci sagrađena je 1579. godine. Srušena je 1993., a nakon obnove ponovo je otvorena 2016. godine.',
    ),
    sources: [SRC.kons('Ferhadija Mosque in Banja Luka')],
    art: 'history.ferhadija',
  }),
};

// ---- Córdoba
export const CORDOBA_FACTS = {
  begun: f({
    id: 'cordoba-begun',
    text: T(
      'The Great Mosque of Córdoba was begun in 785 CE under ʿAbd al-Rahman I and enlarged several times in the following two centuries.',
      'Die Große Moschee von Córdoba wurde 785 n. Chr. unter ʿAbd ar-Rahman I. begonnen und in den folgenden zwei Jahrhunderten mehrmals erweitert.',
      'Velika džamija u Kordobi počela se graditi 785. godine za vrijeme Abdurrahmana I. i proširivana je više puta u naredna dva stoljeća.',
    ),
    sources: [SRC.unesco('Historic Centre of Cordoba (no. 313)')],
    art: 'history.cordoba-mosque',
  }),
  arches: f({
    id: 'double-arches',
    text: T(
      'Its prayer hall is famous for its forest of columns carrying double arches of red brick and white stone.',
      'Ihr Gebetssaal ist berühmt für seinen Wald aus Säulen, die doppelte Bögen aus rotem Ziegel und weißem Stein tragen.',
      'Njena molitvena dvorana poznata je po šumi stubova koji nose dvostruke lukove od crvene cigle i bijelog kamena.',
    ),
    sources: [SRC.unesco('Historic Centre of Cordoba (no. 313)')],
    art: 'history.cordoba-arches',
  }),
  capital: f({
    id: 'andalus-capital',
    text: T(
      'Córdoba was the capital of al-Andalus, the Muslim lands of the Iberian Peninsula.',
      'Córdoba war die Hauptstadt von al-Andalus, den muslimischen Gebieten der Iberischen Halbinsel.',
      'Kordoba je bila glavni grad el-Andalusa, muslimanskih zemalja na Pirinejskom poluostrvu.',
    ),
    sources: [SRC.unesco('Historic Centre of Cordoba (no. 313)')],
  }),
  zahrawi: SCHOLAR_FACTS.zahrawi,
};

// ---- Patterns
export const PATTERN_FACTS = {
  ornament: f({
    id: 'mosque-ornament',
    text: T(
      'Geometric patterns, plant scrolls (arabesques) and calligraphy are the main ornaments of mosques.',
      'Geometrische Muster, Pflanzenranken (Arabesken) und Kalligrafie sind der wichtigste Schmuck von Moscheen.',
      'Geometrijski uzorci, biljne vitice (arabeske) i kaligrafija glavni su ukrasi džamija.',
    ),
    sources: [SRC.britannica('Islamic arts')],
    art: 'history.pattern-cover',
  }),
  compass: f({
    id: 'compass-and-ruler',
    text: T(
      'Star patterns like these are drawn with a compass and a straight edge, starting from circles that are divided into equal parts.',
      'Sternmuster wie diese werden mit Zirkel und Lineal gezeichnet, ausgehend von Kreisen, die in gleiche Teile geteilt werden.',
      'Ovakvi zvjezdasti uzorci crtaju se šestarom i ravnalom, polazeći od krugova podijeljenih na jednake dijelove.',
    ),
    sources: [SRC.britannica('Islamic arts')],
    art: 'history.dividers',
  }),
  alhambra: f({
    id: 'alhambra',
    text: T(
      'The Alhambra in Granada, built by the Nasrid rulers of al-Andalus in the 13th and 14th centuries, is famous for its geometric tilework.',
      'Die Alhambra in Granada, im 13. und 14. Jahrhundert von den Nasriden-Herrschern von al-Andalus erbaut, ist berühmt für ihre geometrischen Fliesen.',
      'Alhambra u Granadi, koju su u 13. i 14. stoljeću sagradili nasridski vladari el-Andalusa, poznata je po geometrijskim pločicama.',
    ),
    sources: [SRC.unesco('Alhambra, Generalife and Albayzín, Granada (no. 314)')],
  }),
};

// ---- Ibn Battuta
export const BATTUTA_FACTS = {
  set: f({
    id: 'battuta-1325',
    text: T(
      'Ibn Battuta set out from his home town Tangier in 1325 to make the Hajj.',
      'Ibn Battuta brach 1325 von seiner Heimatstadt Tanger auf, um die Hadsch zu vollziehen.',
      'Ibn Battuta je 1325. godine krenuo iz svog rodnog Tangera da obavi hadž.',
    ),
    sources: [SRC.ibnBattuta],
    art: 'history.journey-cover',
  }),
  route: f({
    id: 'battuta-route',
    text: T(
      'On his way he travelled along North Africa to Egypt, then to Damascus, and from there with the pilgrims’ caravan to Madinah and Makkah.',
      'Unterwegs reiste er durch Nordafrika nach Ägypten, dann nach Damaskus und von dort mit der Pilgerkarawane nach Medina und Mekka.',
      'Na putu je prošao sjevernu Afriku do Egipta, zatim otišao u Damask, a odatle s hadžijskom karavanom u Medinu i Mekku.',
    ),
    sources: [SRC.ibnBattuta],
  }),
  rihla: f({
    id: 'battuta-rihla',
    text: T(
      'He travelled for almost thirty years. Back in Morocco, his journeys were written down by Ibn Juzayy in the book known as the Rihla.',
      'Er reiste fast dreißig Jahre lang. Zurück in Marokko wurden seine Reisen von Ibn Dschuzaiy in dem Buch aufgeschrieben, das als Rihla bekannt ist.',
      'Putovao je skoro trideset godina. Po povratku u Maroko njegova putovanja zapisao je Ibn Džuzejj u knjizi poznatoj kao Rihla.',
    ),
    sources: [SRC.ibnBattuta],
    art: 'history.book-gold',
  }),
};
