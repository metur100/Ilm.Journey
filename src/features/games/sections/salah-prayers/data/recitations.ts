import type { LocalizedText } from '@/core/models';

/*
 * What is recited in each position of the prayer – Arabic, transliteration and meaning – for the recite card of the
 * salah-prayers games. Wording of the Hanafi practice as taught in the Bosnian ilmihal (IZ BiH); the Bosnian
 * transliteration follows the ilmihal, English and German share an international one. The Quran parts (Al-Fatiha,
 * the surahs, Rabbena = 2:201) are not here: they come from the generated Quran data (see captions.ts).
 */

export type RecitationId = 'subhaneke' | 'euzu' | 'moveTakbir' | 'ruku' | 'itidal' | 'tahmid' | 'sajda' | 'jalsa' | 'tashahhud' | 'salavat' | 'kunut' | 'selam';

export interface Recitation {
  arabic: string;
  translit: LocalizedText;
  meaning: LocalizedText;
  /** How many times it is said (shown as "3×"). */
  times?: number;
  /** Hadith / book reference. */
  ref: string;
}

const tr = (international: string, bs: string): LocalizedText => ({ en: international, de: international, bs });
const L = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

export const RECITATIONS: Record<RecitationId, Recitation> = {
  subhaneke: {
    arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ',
    translit: tr(
      "Subhanakallahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruk.",
      'Subhanekellahumme ve bi hamdike, ve tebarekesmuke, ve teala džedduke, ve la ilahe gajruk.',
    ),
    meaning: L(
      'Glory and praise be to You, O Allah. Blessed is Your name, exalted is Your majesty, and there is no god but You.',
      'Gepriesen und gelobt seist Du, o Allah. Gesegnet ist Dein Name, erhaben ist Deine Majestät, und es gibt keinen Gott außer Dir.',
      'Slavljen i hvaljen neka si, Allahu! Blagoslovljeno je ime Tvoje, uzvišena je veličina Tvoja i nema boga osim Tebe.',
    ),
    ref: 'Abu Dawud 775',
  },
  euzu: {
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    translit: tr("A'udhu billahi minash-shaytanir-rajim.", "E'uzu billahi mineš-šejtanir-radžim."),
    meaning: L('I seek refuge with Allah from Satan, the accursed.', 'Ich suche Zuflucht bei Allah vor dem verfluchten Satan.', 'Utječem se Allahu od prokletog šejtana.'),
    ref: 'Quran 16:98',
  },
  moveTakbir: {
    arabic: 'اللَّهُ أَكْبَرُ',
    translit: tr('Allahu akbar', 'Allahu ekber'),
    meaning: L('Said while moving into the position: Allah is the Greatest.', 'Beim Übergang in die Haltung: Allah ist der Größte.', 'Izgovara se pri prelasku u ovaj položaj: Allah je najveći.'),
    ref: 'Bukhari 789',
  },
  ruku: {
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    translit: tr("Subhana rabbiyal-'azim", 'Subhane rabbijel-azim'),
    meaning: L('Glory be to my Lord, the Magnificent.', 'Gepriesen sei mein Herr, der Gewaltige.', 'Slavljen neka je moj Gospodar, Veličanstveni.'),
    times: 3,
    ref: 'Muslim 772',
  },
  itidal: {
    arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ',
    translit: tr("Sami'allahu liman hamidah", "Semi'allahu limen hamideh"),
    meaning: L('Said while rising: Allah hears the one who praises Him.', 'Beim Aufrichten: Allah hört den, der Ihn lobt.', 'Izgovara se pri uspravljanju: Allah čuje onoga ko Ga hvali.'),
    ref: 'Bukhari 789',
  },
  tahmid: {
    arabic: 'رَبَّنَا لَكَ الْحَمْدُ',
    translit: tr('Rabbana lakal-hamd', 'Rabbena lekel-hamd'),
    meaning: L('Standing straight: Our Lord, to You belongs all praise.', 'Aufrecht stehend: Unser Herr, Dir gebührt das Lob.', 'Kad se uspraviš: Gospodaru naš, Tebi pripada hvala.'),
    ref: 'Bukhari 796',
  },
  sajda: {
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    translit: tr("Subhana rabbiyal-a'la", "Subhane rabbijel-a'la"),
    meaning: L('Glory be to my Lord, the Most High.', 'Gepriesen sei mein Herr, der Höchste.', 'Slavljen neka je moj Gospodar, Svevišnji.'),
    times: 3,
    ref: 'Muslim 772',
  },
  jalsa: {
    arabic: 'رَبِّ اغْفِرْ لِي',
    translit: tr('Rabbighfir li', 'Rabbigfirli'),
    meaning: L('Sit still for a moment; you may say: My Lord, forgive me.', 'Kurz ruhig sitzen; du kannst sagen: Mein Herr, vergib mir.', 'Smiri se na trenutak; možeš proučiti: Gospodaru moj, oprosti mi.'),
    ref: 'Abu Dawud 874',
  },
  tashahhud: {
    arabic:
      'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    translit: tr(
      "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ashhadu an la ilaha illallah, wa ashhadu anna Muhammadan 'abduhu wa rasuluh.",
      'Ettehijjatu lillahi ves-salavatu vet-tajjibatu. Es-selamu alejke ejjuhen-nebijju ve rahmetullahi ve berekatuhu. Es-selamu alejna ve ala ibadillahis-salihin. Ešhedu en la ilahe illallah, ve ešhedu enne Muhammeden abduhu ve resuluhu.',
    ),
    meaning: L(
      'All greetings, prayers and good words belong to Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.',
      'Alle Grüße, Gebete und guten Worte gebühren Allah. Friede sei mit dir, o Prophet, und die Barmherzigkeit Allahs und Sein Segen. Friede sei mit uns und mit den rechtschaffenen Dienern Allahs. Ich bezeuge, dass es keinen Gott gibt außer Allah, und ich bezeuge, dass Muhammad Sein Diener und Gesandter ist.',
      'Svi pozdravi, molitve i lijepe riječi pripadaju Allahu. Selam tebi, o Vjerovjesniče, i Allahova milost i Njegovi blagoslovi. Selam nama i Allahovim dobrim robovima. Svjedočim da nema boga osim Allaha i svjedočim da je Muhammed Njegov rob i Poslanik.',
    ),
    ref: 'Bukhari 831',
  },
  salavat: {
    arabic:
      'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    translit: tr(
      "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka hamidun majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka hamidun majid.",
      'Allahumme salli ala Muhammedin ve ala ali Muhammed, kema sallejte ala Ibrahime ve ala ali Ibrahim, inneke hamidun medžid. Allahumme barik ala Muhammedin ve ala ali Muhammed, kema barekte ala Ibrahime ve ala ali Ibrahim, inneke hamidun medžid.',
    ),
    meaning: L(
      'O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.',
      'O Allah, segne Muhammad und die Familie Muhammads, wie Du Ibrahim und die Familie Ibrahims gesegnet hast; Du bist lobenswert und ruhmreich. O Allah, gib Muhammad und der Familie Muhammads Segensfülle, wie Du sie Ibrahim und der Familie Ibrahims gegeben hast; Du bist lobenswert und ruhmreich.',
      'Allahu moj, blagoslovi Muhammeda i porodicu Muhammedovu, kao što si blagoslovio Ibrahima i porodicu Ibrahimovu, Ti si zaista hvaljen i slavljen. Allahu moj, daj berićet Muhammedu i porodici Muhammedovoj, kao što si dao berićet Ibrahimu i porodici Ibrahimovoj, Ti si zaista hvaljen i slavljen.',
    ),
    ref: 'Bukhari 3370',
  },
  kunut: {
    arabic:
      'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْدِيكَ، وَنُؤْمِنُ بِكَ وَنَتُوبُ إِلَيْكَ، وَنَتَوَكَّلُ عَلَيْكَ، وَنُثْنِي عَلَيْكَ الْخَيْرَ كُلَّهُ، نَشْكُرُكَ وَلَا نَكْفُرُكَ، وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ. اللَّهُمَّ إِيَّاكَ نَعْبُدُ، وَلَكَ نُصَلِّي وَنَسْجُدُ، وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ، نَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ، إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
    translit: tr(
      "Allahumma inna nasta'inuka wa nastaghfiruka wa nastahdik, wa nu'minu bika wa natubu ilayk, wa natawakkalu 'alayk, wa nuthni 'alaykal-khayra kullah, nashkuruka wa la nakfuruk, wa nakhla'u wa natruku man yafjuruk. Allahumma iyyaka na'budu, wa laka nusalli wa nasjud, wa ilayka nas'a wa nahfid, narju rahmataka wa nakhsha 'adhabak, inna 'adhabaka bil-kuffari mulhiq.",
      "Allahumme inna nesteinuke ve nestagfiruke ve nestehdike, ve nu'minu bike ve netubu ilejke, ve netevekkelu alejke, ve nusni alejkel-hajre kullehu, neškuruke ve la nekfuruke, ve nahleu ve netruku men jefdžuruk. Allahumme ijjake na'budu, ve leke nusalli ve nesdžudu, ve ilejke nes'a ve nahfidu, nerdžu rahmeteke ve nahša azabeke, inne azabeke bil-kuffari mulhik.",
    ),
    meaning: L(
      'O Allah, we ask You for help, forgiveness and guidance. We believe in You, turn to You in repentance and rely on You. We praise You with all good, we thank You and are not ungrateful, and we turn away from whoever disobeys You. O Allah, You alone we worship, to You we pray and prostrate, to You we hasten and serve. We hope for Your mercy and fear Your punishment; Your punishment will surely reach the disbelievers.',
      'O Allah, wir bitten Dich um Hilfe, Vergebung und Rechtleitung. Wir glauben an Dich, kehren reuig zu Dir um und vertrauen auf Dich. Wir loben Dich mit allem Guten, danken Dir und sind nicht undankbar, und wir wenden uns ab von dem, der Dir ungehorsam ist. O Allah, Dir allein dienen wir, zu Dir beten wir und vor Dir werfen wir uns nieder, zu Dir eilen wir. Wir hoffen auf Deine Barmherzigkeit und fürchten Deine Strafe; Deine Strafe trifft gewiss die Ungläubigen.',
      'Allahu naš, od Tebe pomoć, oprost i uputu tražimo. U Tebe vjerujemo, Tebi se kajemo i na Tebe se oslanjamo. Hvalimo Te svakim dobrom, zahvaljujemo Ti i nismo nezahvalni, i ostavljamo onoga ko Ti se suprotstavlja. Allahu naš, samo Tebi robujemo, Tebi klanjamo i na sedždu padamo, Tebi hitamo i Tebi služimo. Nadamo se Tvojoj milosti i bojimo se Tvoje kazne, jer Tvoja kazna sigurno stiže nevjernike.',
    ),
    ref: 'Ilmihal (IZ BiH)',
  },
  selam: {
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
    translit: tr("As-salamu 'alaykum wa rahmatullah", 'Es-selamu alejkum ve rahmetullah'),
    meaning: L('Peace be upon you and the mercy of Allah.', 'Friede sei mit euch und die Barmherzigkeit Allahs.', 'Mir neka je s vama i Allahova milost.'),
    ref: 'Muslim 582',
  },
};

/** Rabbena (Quran 2:201) – transliteration and meaning of the words from "Rabbana" on (the Arabic comes from the Quran data). */
export const RABBENA = {
  translit: tr("Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.", 'Rabbena atina fid-dunja haseneten ve fil-ahireti haseneten ve kina azaben-nar.'),
  meaning: L(
    'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    'Unser Herr, gib uns im Diesseits Gutes und im Jenseits Gutes und bewahre uns vor der Strafe des Feuers.',
    'Gospodaru naš, podaj nam dobro i na ovome i na onome svijetu, i sačuvaj nas patnje u ognju!',
  ),
};
