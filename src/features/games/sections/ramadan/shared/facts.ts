import type { GameFact } from '@/core/games';
import type { LocalizedText, SourceRef } from '@/core/models';

/*
 * "You learned" facts of the Ramadan games. Texts marked "content" are copied word for word from the Learn content
 * (quests/ramadan.json, ramadan/*.json) with their sources – `__tests__/content.test.ts` checks they still match.
 * Facts marked "fiqh" state the Hanafi practice as taught in the Bosnian ilmihal (docs/GAMES-V3.md §2), with the
 * Quran / hadith they rest on and a neutral note where other schools differ.
 */

export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

export const Q = (ref: string): SourceRef => ({ sourceName: 'Quran', sourceReference: ref });
export const BUKHARI = (n: string): SourceRef => ({ sourceName: 'Sahih al-Bukhari', sourceReference: n });
export const MUSLIM = (n: string): SourceRef => ({ sourceName: 'Sahih Muslim', sourceReference: n });
export const ABU_DAWUD = (n: string): SourceRef => ({ sourceName: 'Sunan Abi Dawud', sourceReference: n });
/** The Bosnian ilmihal of the Islamic Community in Bosnia and Herzegovina (Hanafi practice of fasting). */
export const ILMIHAL = (chapter: 'Post' | 'Teravih-namaz' | 'Sadekatul-fitr'): SourceRef => ({ sourceName: 'Ilmihal (IZ BiH)', sourceReference: chapter });

/** Content texts (copied; checked against the JSON by the content test). */
export const CONTENT = {
  /** quests/ramadan.json · ramadan-what · section 0 */
  ninthMonth: T(
    'Ramadan is the ninth month of the Islamic calendar, which follows the moon. The Quran tells us that in this month the Quran was sent down as guidance for people. Fasting in Ramadan is one of the five pillars of Islam.',
    'Ramadan ist der neunte Monat des islamischen Kalenders, der sich nach dem Mond richtet. Der Koran berichtet, dass in diesem Monat der Koran als Rechtleitung für die Menschen herabgesandt wurde. Das Fasten im Ramadan ist eine der fünf Säulen des Islam.',
    "Ramazan je deveti mjesec islamskog kalendara, koji se ravna po mjesecu. Kur'an nas obavještava da je u ovom mjesecu objavljen Kur'an kao uputa ljudima. Post u ramazanu je jedan od pet temelja islama.",
  ),
  /** quests/ramadan.json · ramadan-what · differenceNote */
  moonNote: T(
    'Communities begin Ramadan in different ways: some by sighting the new moon locally, others by astronomical calculation or by following another country. Follow your local community.',
    'Gemeinden beginnen den Ramadan auf unterschiedliche Weise: manche durch lokale Sichtung des Neumonds, andere durch astronomische Berechnung oder indem sie einem anderen Land folgen. Folge deiner örtlichen Gemeinde.',
    'Zajednice počinju ramazan na različite načine: neke lokalnim viđenjem mlađaka, druge astronomskim proračunom ili slijedeći drugu zemlju. Slijedi svoju lokalnu zajednicu.',
  ),
  /** quests/ramadan.json · ramadan-fasting · section 0 */
  sawm: T(
    'Fasting (sawm) means not eating or drinking from dawn (Fajr) until sunset (Maghrib). The Quran says fasting was prescribed so that we may become mindful of Allah (taqwa). Fasting is also about guarding our tongue and behaving well.',
    'Fasten (Saum) bedeutet, von der Morgendämmerung (Fadschr) bis Sonnenuntergang (Maghrib) nicht zu essen und nicht zu trinken. Der Koran sagt, das Fasten wurde vorgeschrieben, damit wir gottesbewusst werden (Taqwa). Beim Fasten geht es auch darum, die Zunge zu hüten und sich gut zu benehmen.',
    "Post (savm) znači ne jesti i ne piti od zore (sabaha) do zalaska sunca (akšama). Kur'an kaže da je post propisan kako bismo postali bogobojazni (takva). Post znači i čuvati jezik i lijepo se ponašati.",
  ),
  /** quests/ramadan.json · ramadan-fasting · section 1 */
  whoFasts: T(
    "Fasting in Ramadan is obligatory for every adult who is able to fast. Children are not obliged to fast before they reach puberty. Many families let children practise little by little – for example half a day – but only with their parents' guidance. People who are ill, travelling, or for whom fasting would be harmful are excused, as the Quran explains.",
    'Das Fasten im Ramadan ist Pflicht für jeden Erwachsenen, der fasten kann. Kinder sind vor der Pubertät nicht zum Fasten verpflichtet. Viele Familien lassen Kinder Schritt für Schritt üben – zum Beispiel einen halben Tag –, aber nur unter Anleitung der Eltern. Kranke, Reisende und Menschen, denen das Fasten schaden würde, sind befreit, wie der Koran erklärt.',
    "Post u ramazanu je obaveza za svaku odraslu osobu koja može postiti. Djeca nisu obavezna postiti prije puberteta. Mnoge porodice puštaju djecu da vježbaju malo po malo – npr. pola dana – ali samo uz vodstvo roditelja. Bolesni, putnici i oni kojima bi post naškodio oslobođeni su, kako Kur'an objašnjava.",
  ),
  /** quests/ramadan.json · ramadan-fasting · section 2 */
  staySafe: T(
    'Never try to fast on your own in a way that makes you feel dizzy or unwell. If you feel ill, tell an adult – Islam does not want harm for you. Allah wants ease for us, not hardship.',
    'Versuche niemals allein so zu fasten, dass dir schwindlig wird oder es dir schlecht geht. Wenn du dich krank fühlst, sag es einem Erwachsenen – der Islam will dir nicht schaden. Allah will es uns leicht machen, nicht schwer.',
    'Nikad ne pokušavaj sam postiti na način da ti se vrti u glavi ili da ti je loše. Ako se osjećaš bolesno, reci odrasloj osobi – islam ne želi da ti se naškodi. Allah želi da nam olakša, a ne da nam oteža.',
  ),
  /** quests/ramadan.json · ramadan-suhoor-iftar · section 0 */
  suhoor: T(
    'Suhoor is the meal eaten before dawn. The Prophet ﷺ said: take suhoor, for in suhoor there is blessing.',
    'Suhur ist die Mahlzeit vor der Morgendämmerung. Der Prophet ﷺ sagte: Nehmt den Suhur ein, denn im Suhur liegt Segen.',
    'Sehur je obrok prije zore. Poslanik ﷺ je rekao: ručajte sehur, jer u sehuru je bereket.',
  ),
  /** quests/ramadan.json · ramadan-suhoor-iftar · section 1 */
  iftar: T(
    'Iftar is the meal at sunset that breaks the fast. The Prophet ﷺ taught that people remain in goodness as long as they hurry to break the fast. He used to break his fast with fresh dates; if there were none, then dry dates; and if there were none, with a few sips of water.',
    'Iftar ist die Mahlzeit bei Sonnenuntergang, mit der das Fasten gebrochen wird. Der Prophet ﷺ lehrte, dass die Menschen im Guten bleiben, solange sie sich beeilen, das Fasten zu brechen. Er brach sein Fasten mit frischen Datteln; gab es keine, mit getrockneten; und gab es auch die nicht, mit ein paar Schlucken Wasser.',
    'Iftar je obrok o zalasku sunca kojim se prekida post. Poslanik ﷺ je poučio da će ljudi biti u dobru sve dok žure s iftarom. Iftario je svježim hurmama; ako ih nije bilo, onda suhim; a ako ni njih nije bilo, s nekoliko gutljaja vode.',
  ),
  /** quests/ramadan.json · question ramadan-fast-time · explanation */
  fastTime: T(
    'The fast lasts from dawn (Fajr) until sunset (Maghrib). At night, eating and drinking are allowed.',
    'Das Fasten dauert von der Morgendämmerung (Fadschr) bis Sonnenuntergang (Maghrib). Nachts darf man essen und trinken.',
    'Post traje od zore (sabaha) do zalaska sunca (akšama). Noću je dozvoljeno jesti i piti.',
  ),
  /** quests/ramadan.json · ramadan-nights · section 0 */
  taraweeh: T(
    'Taraweeh is the special night prayer in Ramadan, prayed after Isha. The Prophet ﷺ said that whoever stands in prayer in Ramadan with faith and hoping for reward, his past sins will be forgiven.',
    'Tarawih ist das besondere Nachtgebet im Ramadan, das nach Ischa gebetet wird. Der Prophet ﷺ sagte: Wer im Ramadan im Glauben und in Hoffnung auf Lohn im Gebet steht, dem werden seine vergangenen Sünden vergeben.',
    'Teravija je poseban noćni namaz u ramazanu, koji se klanja nakon jacije. Poslanik ﷺ je rekao da će onome ko u ramazanu noću klanja s vjerom i nadajući se nagradi biti oprošteni prethodni grijesi.',
  ),
  /** quests/ramadan.json · ramadan-nights · section 1 */
  quranMonth: T(
    'Every Ramadan, the angel Jibril met the Prophet ﷺ and they went through the Quran together. Many of us try to read or listen to the whole Quran during Ramadan.',
    'In jedem Ramadan traf der Engel Dschibril den Propheten ﷺ, und sie gingen den Koran gemeinsam durch. Viele von uns versuchen, im Ramadan den ganzen Koran zu lesen oder zu hören.',
    "Svakog ramazana melek Džibril se sastajao s Poslanikom ﷺ i zajedno su prolazili kroz Kur'an. Mnogi od nas nastoje tokom ramazana proučiti ili preslušati cijeli Kur'an.",
  ),
  /** quests/ramadan.json · ramadan-nights · section 2 */
  qadr: T(
    'Laylat al-Qadr – the Night of Decree – is better than a thousand months. The Prophet ﷺ told us to look for it in the odd nights of the last ten nights of Ramadan.',
    'Laylat al-Qadr – die Nacht der Bestimmung – ist besser als tausend Monate. Der Prophet ﷺ sagte uns, wir sollen sie in den ungeraden Nächten der letzten zehn Nächte des Ramadan suchen.',
    'Lejletul-kadr – Noć kadra – bolja je od hiljadu mjeseci. Poslanik ﷺ nam je rekao da je tražimo u neparnim noćima posljednjih deset noći ramazana.',
  ),
  /** quests/ramadan.json · fact ramadan-fact-generous */
  generous: T(
    'The Prophet ﷺ was the most generous of people – and he was even more generous in Ramadan.',
    'Der Prophet ﷺ war der großzügigste Mensch – und im Ramadan war er noch großzügiger.',
    'Poslanik ﷺ je bio najdarežljiviji čovjek – a u ramazanu je bio još darežljiviji.',
  ),
  /** quests/ramadan.json · ramadan-charity-eid · section 1 */
  zakatFitr: T(
    'Before the Eid prayer we give Zakat al-Fitr, a small charity for every family member, so that people in need can also celebrate Eid.',
    'Vor dem Eid-Gebet geben wir die Zakat al-Fitr, eine kleine Abgabe für jedes Familienmitglied, damit auch Bedürftige Eid feiern können.',
    'Prije bajram-namaza dajemo sadekatul-fitr, malu obaveznu sadaku za svakog člana porodice, kako bi i siromašni mogli proslaviti Bajram.',
  ),
  /** quests/ramadan.json · ramadan-charity-eid · section 2 */
  eid: T(
    'Eid al-Fitr is the celebration on the first day of Shawwal, after Ramadan ends. We pray the Eid prayer together, say takbir, wear nice clothes, visit family and give gifts. Fasting on the day of Eid is not allowed – it is a day of joy.',
    'Eid al-Fitr ist das Fest am ersten Tag des Schawwal, nach dem Ende des Ramadan. Wir beten gemeinsam das Eid-Gebet, sprechen den Takbir, tragen schöne Kleidung, besuchen die Familie und beschenken einander. Am Tag des Eid zu fasten ist nicht erlaubt – es ist ein Tag der Freude.',
    'Ramazanski bajram je praznik prvog dana mjeseca ševvala, nakon završetka ramazana. Zajedno klanjamo bajram-namaz, učimo tekbire, oblačimo lijepu odjeću, posjećujemo porodicu i darujemo se. Postiti na dan Bajrama nije dozvoljeno – to je dan radosti.',
  ),
  /** ramadan/ramadan-month.json · question ramadan-month-4 · explanation */
  makeUp: T(
    'Quran 2:184–185 excuses the ill and travellers; they make up the days later if they can.',
    'Koran 2:184–185 befreit Kranke und Reisende; sie holen die Tage später nach, wenn sie können.',
    "Kur'an 2:184–185 oslobađa bolesne i putnike; oni naknade dane kasnije ako mogu.",
  ),
} satisfies Record<string, LocalizedText>;

/** All facts of the section, by key. */
export const FACTS = {
  ninthMonth: { id: 'ninth-month', text: CONTENT.ninthMonth, sources: [Q('2:185'), BUKHARI('8')], art: 'ramadan.crescent-dusk', reviewKey: 'quest:ramadan-month' },
  sawm: { id: 'sawm-taqwa', text: CONTENT.sawm, sources: [Q('2:183–185'), Q('2:187')], art: 'object.lantern-ramadan', reviewKey: 'quest:ramadan-taqwa' },
  whoFasts: { id: 'who-fasts', text: CONTENT.whoFasts, sources: [Q('2:183–185')], art: 'ramadan.suitcase', reviewKey: 'quest:ramadan-children' },
  staySafe: { id: 'stay-safe', text: CONTENT.staySafe, sources: [Q('2:185')], art: 'food.water', reviewKey: 'quest:ramadan-dizzy' },
  suhoor: { id: 'suhoor-blessing', text: CONTENT.suhoor, sources: [BUKHARI('1923'), MUSLIM('1095')], art: 'food.dates', reviewKey: 'quest:ramadan-suhoor-blessing' },
  iftar: { id: 'iftar-sunset', text: CONTENT.iftar, sources: [BUKHARI('1957'), ABU_DAWUD('2356')], art: 'ramadan.fresh-dates', reviewKey: 'quest:ramadan-iftar-dates' },
  fastTime: { id: 'dawn-to-sunset', text: CONTENT.fastTime, sources: [Q('2:187')], art: 'ramadan.sky-arc', reviewKey: 'quest:ramadan-fast-time' },
  taraweeh: { id: 'taraweeh', text: CONTENT.taraweeh, sources: [BUKHARI('37')], art: 'ramadan.night-mosque' },
  quranMonth: { id: 'month-of-quran', text: CONTENT.quranMonth, sources: [BUKHARI('6')], art: 'object.quran-stand' },
  qadr: { id: 'qadr-odd-nights', text: CONTENT.qadr, sources: [Q('97:1–5'), BUKHARI('2017')], art: 'ramadan.qadr-sky', reviewKey: 'quest:ramadan-qadr-when' },
  generous: { id: 'most-generous', text: CONTENT.generous, sources: [BUKHARI('6')], art: 'object.coin-jar', reviewKey: 'quest:ramadan-charity-scenario' },
  zakatFitr: { id: 'zakat-al-fitr', text: CONTENT.zakatFitr, sources: [BUKHARI('1503')], art: 'ramadan.charity-bag', reviewKey: 'quest:ramadan-zakat-fitr' },
  eid: { id: 'eid-al-fitr', text: CONTENT.eid, sources: [BUKHARI('1990'), MUSLIM('1137')], art: 'ramadan.eid-gift', reviewKey: 'quest:ramadan-eid-fast' },
  makeUp: { id: 'make-up-days', text: CONTENT.makeUp, sources: [Q('2:184–185')], art: 'ramadan.calendar', reviewKey: 'learn:ramadan-month-4' },
  moonNote: { id: 'moon-sighting', text: CONTENT.moonNote, sources: [Q('2:185'), BUKHARI('1909')], art: 'ramadan.crescent-dusk' },

  // ---- Facts written for the games (Quran / hadith stated directly; fiqh per the Hanafi ilmihal) ----
  newMoons: {
    id: 'new-moons-time',
    text: T(
      'The new crescent moons are signs to measure time for people. The Prophet ﷺ said: fast when you see the crescent and end the fast when you see it; if it is hidden by clouds, complete thirty days.',
      'Die Neumonde sind Zeichen, mit denen die Menschen die Zeit messen. Der Prophet ﷺ sagte: Fastet, wenn ihr die Mondsichel seht, und beendet das Fasten, wenn ihr sie seht; ist sie von Wolken verdeckt, vervollständigt dreißig Tage.',
      'Mlađaci su znakovi po kojima ljudi mjere vrijeme. Poslanik ﷺ je rekao: postite kad vidite mlađak i prestanite postiti kad ga vidite; ako je zaklonjen oblacima, upotpunite trideset dana.',
    ),
    sources: [Q('2:189'), BUKHARI('1909')],
    art: 'ramadan.crescent-dusk',
  },
  qadrSurah: {
    id: 'qadr-surah',
    text: T(
      'Surah al-Qadr: the Quran was sent down in Laylat al-Qadr. It is better than a thousand months, the angels and the Spirit descend in it, and it is peace until the rise of dawn.',
      'Sure al-Qadr: Der Koran wurde in Laylat al-Qadr herabgesandt. Sie ist besser als tausend Monate, die Engel und der Geist steigen in ihr herab, und sie ist Frieden bis zum Anbruch der Morgendämmerung.',
      "Sura El-Kadr: Kur'an je objavljen u Lejletul-kadru. Ona je bolja od hiljadu mjeseci, u njoj silaze meleki i Džibril, i ona je mir sve do pojave zore.",
    ),
    sources: [Q('97:1–5')],
    art: 'ramadan.qadr-sky',
    reviewKey: 'quest:ramadan-qadr',
  },
  forgot: {
    id: 'eating-forgetfully',
    text: T(
      'Eating or drinking because you forgot that you are fasting does not break the fast. The Prophet ﷺ said: let him complete his fast, for Allah fed him and gave him drink.',
      'Wer isst oder trinkt, weil er vergessen hat, dass er fastet, bricht sein Fasten nicht. Der Prophet ﷺ sagte: Er soll sein Fasten vollenden, denn Allah hat ihm zu essen und zu trinken gegeben.',
      'Ko jede ili pije zato što je zaboravio da posti, ne kvari post. Poslanik ﷺ je rekao: neka upotpuni svoj post, jer ga je Allah nahranio i napojio.',
    ),
    sources: [BUKHARI('1933'), ILMIHAL('Post')],
    art: 'ramadan.thought',
    check: {
      type: 'trueFalse',
      statement: T('Someone who eats because he forgot he is fasting must stop fasting for that day.', 'Wer isst, weil er das Fasten vergessen hat, muss das Fasten an diesem Tag abbrechen.', 'Ko jede jer je zaboravio da posti, mora tog dana prekinuti post.'),
      correct: false,
    },
  },
  breaks: {
    id: 'what-breaks',
    text: T(
      'Eating or drinking on purpose between dawn and sunset breaks the fast. Showering, swallowing your own saliva, using a miswak, rinsing the mouth carefully in wudu and smelling a flower do not break it.',
      'Absichtliches Essen oder Trinken zwischen Morgendämmerung und Sonnenuntergang bricht das Fasten. Duschen, den eigenen Speichel schlucken, den Miswak benutzen, den Mund bei der Gebetswaschung vorsichtig ausspülen und an einer Blume riechen brechen es nicht.',
      'Namjerno jelo ili piće između zore i zalaska sunca kvari post. Tuširanje, gutanje vlastite pljuvačke, misvak, pažljivo ispiranje usta pri abdestu i mirisanje cvijeta ne kvare ga.',
    ),
    sources: [Q('2:187'), ILMIHAL('Post')],
    art: 'food.water',
    check: {
      type: 'choice',
      prompt: T('Which of these breaks the fast?', 'Was davon bricht das Fasten?', 'Šta od ovoga kvari post?'),
      options: [T('Drinking juice on purpose', 'Absichtlich Saft trinken', 'Namjerno piti sok'), T('Taking a shower', 'Duschen', 'Tuširanje'), T('Smelling a flower', 'An einer Blume riechen', 'Mirisanje cvijeta')],
      correctIndex: 0,
    },
  },
  fidya: {
    id: 'fidya',
    text: T(
      'Someone who can fast only with great hardship, such as a very old person who cannot make up the days, feeds a poor person for each day instead (fidya).',
      'Wer nur mit großer Mühe fasten kann, etwa ein sehr alter Mensch, der die Tage nicht nachholen kann, speist stattdessen für jeden Tag einen Armen (Fidya).',
      'Ko može postiti samo uz veliku poteškoću, npr. vrlo stara osoba koja ne može naknaditi dane, umjesto toga nahrani siromaha za svaki dan (fidja).',
    ),
    sources: [Q('2:184'), ILMIHAL('Post')],
    art: 'object.bowl',
  },
  taraweehCount: {
    id: 'taraweeh-twenty',
    text: T(
      'In the Hanafi school taraweeh has 20 rakats, prayed two by two with a selam, with a short rest after every four rakats; then vitr follows. Communities pray taraweeh with different numbers of rakats (for example 8 or 20), both based on scholarly evidence.',
      'In der hanafitischen Schule hat das Tarawih 20 Rakʿas, je zwei mit einem Salam, mit einer kurzen Pause nach je vier Rakʿas; danach folgt das Witr. Gemeinden beten Tarawih mit unterschiedlich vielen Rakʿas (zum Beispiel 8 oder 20), beides auf gelehrte Belege gestützt.',
      'Po hanefijskom mezhebu teravija ima 20 rekata, klanja se po dva rekata sa selamom, s kratkim odmorom nakon svaka četiri rekata; zatim se klanja vitr. Zajednice klanjaju teraviju s različitim brojem rekata (npr. 8 ili 20), oboje na osnovu učenjačkih dokaza.',
    ),
    sources: [ILMIHAL('Teravih-namaz'), BUKHARI('37')],
    art: 'ramadan.night-mosque',
    reviewKey: 'quest:ramadan-taraweeh-tf',
  },
  zakatMeasure: {
    id: 'zakat-measure',
    text: T(
      'The Prophet ﷺ made Zakat al-Fitr one measure (sa‘) of dates or of barley for every person, young or old, and ordered it to be given before the people go out to the Eid prayer. Scholars differ on whether it may also be given as money.',
      'Der Prophet ﷺ legte die Zakat al-Fitr als ein Maß (Sa‘) Datteln oder Gerste für jeden Menschen fest, ob jung oder alt, und befahl, sie zu geben, bevor die Leute zum Eid-Gebet hinausgehen. Gelehrte sind sich uneinig, ob sie auch als Geld gegeben werden darf.',
      'Poslanik ﷺ je propisao sadekatul-fitr kao jednu mjeru (sa‘) hurmi ili ječma za svaku osobu, malu ili veliku, i naredio da se da prije nego što ljudi izađu na bajram-namaz. Učenjaci se razilaze da li se može dati i u novcu.',
    ),
    sources: [BUKHARI('1503'), ILMIHAL('Sadekatul-fitr')],
    art: 'object.grain-sack',
  },
  eidDates: {
    id: 'eid-dates',
    text: T(
      'On the morning of Eid al-Fitr the Prophet ﷺ did not go out to the prayer until he had eaten some dates.',
      'Am Morgen von Eid al-Fitr ging der Prophet ﷺ nicht zum Gebet hinaus, bevor er einige Datteln gegessen hatte.',
      'Ujutro na Ramazanski bajram Poslanik ﷺ nije izlazio na namaz dok ne bi pojeo nekoliko hurmi.',
    ),
    sources: [BUKHARI('953')],
    art: 'food.dates',
  },
} satisfies Record<string, GameFact>;
