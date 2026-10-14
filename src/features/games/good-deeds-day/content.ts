import type { SkyTime } from '@/core/art';
import type { LocalizedText, SourceRef } from '@/core/models';

/*
 * Content of A Day of Good Deeds – copied unchanged from the Learn content (src/features/learn/content/quests:
 * akhlaq.json, ramadan.json, salah.json – lessons, scenario questions with their feedback, facts and the Ramadan
 * good-deed list). The tests compare every text and source with those files. Nothing here is a new religious claim;
 * the game only adds the little scenes and the gentle UI texts (i18n).
 */

/** A scenario question of the content: options with their feedback, the right option and the sources. */
export interface ContentChoice {
  id: string;
  prompt: LocalizedText;
  options: { text: LocalizedText; feedback: LocalizedText }[];
  correctIndex: number;
  explanation: LocalizedText;
  sources: SourceRef[];
}

// ---------- copied content ----------

/** salah-five · section 0 */
export const PRAYER_TIMES: LocalizedText = { en: "The Quran says that prayer has been prescribed for the believers at fixed times. There are five obligatory (fard) prayers every day.", de: "Der Koran sagt, dass das Gebet den Gläubigen zu festgesetzten Zeiten vorgeschrieben ist. Es gibt jeden Tag fünf Pflichtgebete (fard).", bs: "Kur'an kaže da je namaz vjernicima propisan u tačno određeno vrijeme. Svaki dan ima pet obaveznih (farz) namaza." };
export const PRAYER_TIMES_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "4:103" }];
/** salah-five · section 1 */
export const PRAYER_FAJR: LocalizedText = { en: "Fajr is prayed between dawn and sunrise. It has 2 obligatory rak'ahs.", de: "Fadschr wird zwischen Morgendämmerung und Sonnenaufgang gebetet. Es hat 2 Pflicht-Rak'as.", bs: "Sabah se klanja između zore i izlaska sunca. Ima 2 farz rekata." };
export const PRAYER_FAJR_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "4:103" }];
/** akhlaq-parents · section 0 */
export const PARENTS: LocalizedText = { en: "Right after commanding us to worship Him alone, Allah commands kindness to parents. We should not even say \"uff\" to them in annoyance; we should speak to them gently, be humble with them, and pray: \"My Lord, have mercy on them as they raised me when I was small.\"", de: "Direkt nach dem Gebot, Ihn allein anzubeten, gebietet Allah Güte zu den Eltern. Wir sollen nicht einmal genervt „uff“ zu ihnen sagen; wir sollen sanft mit ihnen sprechen, demütig sein und beten: „Mein Herr, erbarme Dich ihrer, wie sie mich aufgezogen haben, als ich klein war.“", bs: "Odmah nakon naredbe da samo Njemu robujemo, Allah naređuje dobročinstvo prema roditeljima. Ne smijemo im reći ni „uf“ iz nervoze; trebamo im se blago obraćati, biti ponizni prema njima i moliti: „Gospodaru moj, smiluj im se kao što su oni mene odgajali kad sam bio malen.“" };
export const PARENTS_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "17:23–24" }, { sourceName: "Quran", sourceReference: "31:14" }];
/** akhlaq-parents · section 1 */
export const PARENTS_EXAMPLE: LocalizedText = { en: "Your mother is carrying heavy shopping bags. You stop playing and help without being asked.", de: "Deine Mutter trägt schwere Einkaufstaschen. Du hörst auf zu spielen und hilfst, ohne gefragt zu werden.", bs: "Tvoja majka nosi teške kese iz prodavnice. Prestaneš se igrati i pomogneš bez da te je zamolila." };
export const PARENTS_EXAMPLE_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "17:23–24" }, { sourceName: "Quran", sourceReference: "31:14" }];
/** fact akhlaq-fact-smile */
export const SMILE: LocalizedText = { en: "The Prophet ﷺ said that even smiling at your brother is a charity.", de: "Der Prophet ﷺ sagte, dass schon ein Lächeln gegenüber deinem Bruder eine Spende ist.", bs: "Poslanik ﷺ je rekao da je i osmijeh tvom bratu sadaka." };
export const SMILE_SOURCES: SourceRef[] = [{ sourceName: "Jami' at-Tirmidhi", sourceReference: "1956" }];
/** akhlaq-helping · section 0 */
export const HELPING: LocalizedText = { en: "The Prophet ﷺ said that none of us truly believes until he loves for his brother what he loves for himself. Helping neighbours, classmates and people in need is part of faith.", de: "Der Prophet ﷺ sagte, dass keiner von uns wirklich glaubt, bis er für seinen Bruder liebt, was er für sich selbst liebt. Nachbarn, Mitschülern und Bedürftigen zu helfen ist Teil des Glaubens.", bs: "Poslanik ﷺ je rekao da niko od nas istinski ne vjeruje dok ne bude volio svom bratu ono što voli sebi. Pomaganje komšijama, drugovima iz razreda i potrebnima dio je vjere." };
export const HELPING_SOURCES: SourceRef[] = [{ sourceName: "Sahih al-Bukhari", sourceReference: "13" }, { sourceName: "Sahih Muslim", sourceReference: "45" }];
/** akhlaq-amanah · section 0 */
export const AMANAH: LocalizedText = { en: "An amanah is something entrusted to you: a borrowed book, a secret, a promise, or a task. Allah commands us to return trusts to their owners and to keep our promises.", de: "Eine Amana ist etwas, das dir anvertraut wurde: ein geliehenes Buch, ein Geheimnis, ein Versprechen oder eine Aufgabe. Allah gebietet uns, anvertraute Dinge ihren Besitzern zurückzugeben und Versprechen zu halten.", bs: "Emanet je nešto što ti je povjereno: posuđena knjiga, tajna, obećanje ili zadatak. Allah nam naređuje da emanete vraćamo vlasnicima i da ispunjavamo obećanja." };
export const AMANAH_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "4:58" }, { sourceName: "Quran", sourceReference: "17:34" }];
/** akhlaq-amanah · section 1 */
export const AMANAH_EXAMPLE: LocalizedText = { en: "A friend lends you a game. You look after it and give it back on time, in good condition.", de: "Ein Freund leiht dir ein Spiel. Du passt darauf auf und gibst es pünktlich und in gutem Zustand zurück.", bs: "Prijatelj ti posudi igricu. Paziš na nju i vratiš je na vrijeme, u dobrom stanju." };
export const AMANAH_EXAMPLE_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "4:58" }, { sourceName: "Quran", sourceReference: "17:34" }];
/** akhlaq-shukr · section 0 */
export const SHUKR: LocalizedText = { en: "Shukr means being grateful. We thank Allah with our words (\"Alhamdulillah\"), with our hearts and by using His gifts in good ways. Allah says in the Quran: if you are grateful, He will give you more.", de: "Schukr bedeutet Dankbarkeit. Wir danken Allah mit unseren Worten („Alhamdulillah“), mit dem Herzen und indem wir Seine Gaben gut nutzen. Allah sagt im Koran: Wenn ihr dankbar seid, wird Er euch noch mehr geben.", bs: "Šukr znači zahvalnost. Allahu zahvaljujemo riječima („Elhamdulillah“), srcem i korištenjem Njegovih darova na dobar način. Allah u Kur'anu kaže: ako budete zahvalni, On će vam još više dati." };
export const SHUKR_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "14:7" }];
/** akhlaq-sidq · section 0 */
export const SIDQ: LocalizedText = { en: "Sidq means truthfulness. The Prophet ﷺ taught that truthfulness leads to goodness, and goodness leads to Paradise. Allah tells the believers to be with those who are truthful.", de: "Sidq bedeutet Wahrhaftigkeit. Der Prophet ﷺ lehrte, dass Wahrhaftigkeit zum Guten führt und das Gute ins Paradies. Allah fordert die Gläubigen auf, mit den Wahrhaftigen zu sein.", bs: "Sidk znači iskrenost, istinoljubivost. Poslanik ﷺ je poučio da iskrenost vodi dobročinstvu, a dobročinstvo vodi u Džennet. Allah naređuje vjernicima da budu s iskrenima." };
export const SIDQ_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "9:119" }, { sourceName: "Sahih al-Bukhari", sourceReference: "6094" }, { sourceName: "Sahih Muslim", sourceReference: "2607" }];
/** akhlaq-kindness · section 0 */
export const KINDNESS: LocalizedText = { en: "The Prophet ﷺ taught that gentleness makes everything beautiful. The Quran tells us not to mock others and not to call people by hurtful nicknames.", de: "Der Prophet ﷺ lehrte, dass Sanftheit alles verschönert. Der Koran sagt uns, dass wir andere nicht verspotten und niemanden mit verletzenden Spitznamen rufen sollen.", bs: "Poslanik ﷺ je poučio da blagost uljepšava sve. Kur'an nam kaže da se ne rugamo drugima i da ne nazivamo ljude pogrdnim nadimcima." };
export const KINDNESS_SOURCES: SourceRef[] = [{ sourceName: "Sahih Muslim", sourceReference: "2594" }, { sourceName: "Quran", sourceReference: "49:11" }, { sourceName: "Jami' at-Tirmidhi", sourceReference: "1956" }];
/** akhlaq-rahmah · section 0 */
export const RAHMAH: LocalizedText = { en: "Rahmah means mercy and compassion. Allah is Ar-Rahman and Ar-Rahim, and He sent the Prophet ﷺ as a mercy to the worlds. The Prophet ﷺ taught that those who are merciful will be shown mercy by the Most Merciful.", de: "Rahma bedeutet Barmherzigkeit und Mitgefühl. Allah ist Ar-Rahman und Ar-Rahim, und Er sandte den Propheten ﷺ als Barmherzigkeit für die Welten. Der Prophet ﷺ lehrte, dass sich der Allerbarmer derer erbarmt, die barmherzig sind.", bs: "Rahma znači milost i samilost. Allah je Er-Rahman i Er-Rahim, i poslao je Poslanika ﷺ kao milost svjetovima. Poslanik ﷺ je poučio da se Milostivi smiluje onima koji su milostivi." };
export const RAHMAH_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "21:107" }, { sourceName: "Sunan Abi Dawud", sourceReference: "4941" }, { sourceName: "Jami' at-Tirmidhi", sourceReference: "1924" }];
/** akhlaq-rahmah · section 1 */
export const RAHMAH_EXAMPLE: LocalizedText = { en: "On a hot day you put out a bowl of water for birds and cats, and you are gentle with younger children.", de: "An einem heißen Tag stellst du eine Schale Wasser für Vögel und Katzen hin und bist sanft zu jüngeren Kindern.", bs: "Po vrućem danu ostaviš posudu vode za ptice i mačke i nježan si prema mlađoj djeci." };
export const RAHMAH_EXAMPLE_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "21:107" }, { sourceName: "Sunan Abi Dawud", sourceReference: "4941" }, { sourceName: "Jami' at-Tirmidhi", sourceReference: "1924" }];
/** akhlaq-forgiveness · section 0 */
export const FORGIVENESS: LocalizedText = { en: "The Quran praises those who control their anger and pardon people. It also asks: would you not love for Allah to forgive you? So let us forgive others too.", de: "Der Koran lobt diejenigen, die ihren Zorn beherrschen und den Menschen verzeihen. Er fragt auch: Möchtet ihr nicht, dass Allah euch vergibt? Also lasst uns auch anderen vergeben.", bs: "Kur'an hvali one koji obuzdavaju srdžbu i ljudima opraštaju. Također pita: zar ne želite da vam Allah oprosti? Zato i mi oprostimo drugima." };
export const FORGIVENESS_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "3:134" }, { sourceName: "Quran", sourceReference: "24:22" }];
/** question akhlaq-shukr-scenario */
export const Q_PRESENT: ContentChoice = {
  id: 'akhlaq-shukr-scenario',
  prompt: { en: "You get a present, but it's not exactly what you wanted. What do you do?", de: "Du bekommst ein Geschenk, aber es ist nicht genau das, was du wolltest. Was tust du?", bs: "Dobiješ poklon, ali nije baš ono što si želio. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Complain that it's boring", de: "Mich beschweren, dass es langweilig ist", bs: "Žaliti se da je dosadan" }, feedback: { en: "That could hurt the giver's feelings.", de: "Das könnte den Schenkenden verletzen.", bs: "To bi moglo povrijediti onoga ko je dao poklon." } },
    { text: { en: "Say thank you and appreciate the thought", de: "Danke sagen und die Geste schätzen", bs: "Reći hvala i cijeniti pažnju" }, feedback: { en: "Wonderful – that is shukr.", de: "Wunderbar – das ist Schukr.", bs: "Divno – to je šukr." } },
    { text: { en: "Ignore the present", de: "Das Geschenk ignorieren", bs: "Ignorisati poklon" }, feedback: { en: "A gift deserves thanks.", de: "Ein Geschenk verdient Dank.", bs: "Poklon zaslužuje zahvalnost." } },
  ],
  correctIndex: 1,
  explanation: { en: "Gratitude means valuing what we receive. Allah promises to increase those who are grateful.", de: "Dankbarkeit bedeutet, das Erhaltene wertzuschätzen. Allah verspricht, den Dankbaren mehr zu geben.", bs: "Zahvalnost znači cijeniti ono što dobijemo. Allah obećava da će zahvalnima dati više." },
  sources: [{ sourceName: "Quran", sourceReference: "14:7" }],
};
/** question akhlaq-vase */
export const Q_VASE: ContentChoice = {
  id: 'akhlaq-vase',
  prompt: { en: "You accidentally break your mum's favourite cup. Nobody saw it. What do you do?", de: "Du zerbrichst aus Versehen die Lieblingstasse deiner Mutter. Niemand hat es gesehen. Was tust du?", bs: "Slučajno razbiješ maminu omiljenu šoljicu. Niko nije vidio. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Hide the pieces", de: "Die Scherben verstecken", bs: "Sakriti komadiće" }, feedback: { en: "Hiding it is not honest – and Allah sees everything.", de: "Verstecken ist nicht ehrlich – und Allah sieht alles.", bs: "Skrivanje nije iskreno – a Allah sve vidi." } },
    { text: { en: "Blame my little sister", de: "Meiner kleinen Schwester die Schuld geben", bs: "Okriviti mlađu sestru" }, feedback: { en: "Blaming someone else adds a second wrong.", de: "Jemand anderem die Schuld zu geben ist ein zweites Unrecht.", bs: "Okrivljavanje drugoga je druga nepravda." } },
    { text: { en: "Tell her the truth and say sorry", de: "Ihr die Wahrheit sagen und mich entschuldigen", bs: "Reći joj istinu i izviniti se" }, feedback: { en: "Brave and honest – that is sidq.", de: "Mutig und ehrlich – das ist Sidq.", bs: "Hrabro i iskreno – to je sidk." } },
  ],
  correctIndex: 2,
  explanation: { en: "The Prophet ﷺ taught that truthfulness leads to goodness. Honesty builds trust in your family.", de: "Der Prophet ﷺ lehrte, dass Wahrhaftigkeit zum Guten führt. Ehrlichkeit schafft Vertrauen in der Familie.", bs: "Poslanik ﷺ je poučio da iskrenost vodi dobru. Iskrenost gradi povjerenje u porodici." },
  sources: [{ sourceName: "Sahih al-Bukhari", sourceReference: "6094" }],
};
/** question akhlaq-mocking */
export const Q_MOCKING: ContentChoice = {
  id: 'akhlaq-mocking',
  prompt: { en: "Your classmates are laughing at a new student's accent. What do you do?", de: "Deine Mitschüler lachen über den Akzent eines neuen Schülers. Was tust du?", bs: "Tvoji drugovi iz razreda smiju se naglasku novog učenika. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Laugh along so I fit in", de: "Mitlachen, um dazuzugehören", bs: "Smijati se s njima da bih se uklopio" }, feedback: { en: "Mocking hurts – the Quran forbids it.", de: "Spott verletzt – der Koran verbietet ihn.", bs: "Ruganje boli – Kur'an ga zabranjuje." } },
    { text: { en: "Say hello and invite them to play", de: "Hallo sagen und zum Spielen einladen", bs: "Pozdraviti ga i pozvati da se igra" }, feedback: { en: "Beautiful – you made someone feel welcome.", de: "Wunderschön – du hast jemandem das Gefühl gegeben, willkommen zu sein.", bs: "Prelijepo – pomogao si da se neko osjeća dobrodošlo." } },
    { text: { en: "Give them a funny nickname", de: "Ihm einen lustigen Spitznamen geben", bs: "Dati mu smiješan nadimak" }, feedback: { en: "Hurtful nicknames are forbidden in the Quran.", de: "Verletzende Spitznamen sind im Koran verboten.", bs: "Pogrdni nadimci zabranjeni su u Kur'anu." } },
  ],
  correctIndex: 1,
  explanation: { en: "Allah tells us not to mock one another or call each other by offensive nicknames. Kindness makes everything beautiful.", de: "Allah sagt uns, dass wir einander nicht verspotten und uns nicht mit beleidigenden Spitznamen rufen sollen. Freundlichkeit macht alles schön.", bs: "Allah nam kaže da se ne rugamo jedni drugima i da se ne nazivamo pogrdnim nadimcima. Ljubaznost sve uljepšava." },
  sources: [{ sourceName: "Quran", sourceReference: "49:11" }],
};
/** question akhlaq-found-money */
export const Q_WALLET: ContentChoice = {
  id: 'akhlaq-found-money',
  prompt: { en: "You find a wallet with money on the school playground. What do you do?", de: "Du findest auf dem Schulhof ein Portemonnaie mit Geld. Was tust du?", bs: "Na školskom igralištu pronađeš novčanik s novcem. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Keep the money", de: "Das Geld behalten", bs: "Zadržati novac" }, feedback: { en: "It belongs to someone else – keeping it would be wrong.", de: "Es gehört jemand anderem – es zu behalten wäre falsch.", bs: "Pripada nekom drugom – zadržati ga bilo bi pogrešno." } },
    { text: { en: "Give it to a teacher so it reaches its owner", de: "Es einer Lehrkraft geben, damit es den Besitzer erreicht", bs: "Dati ga učitelju da stigne do vlasnika" }, feedback: { en: "Excellent – you returned the amanah.", de: "Ausgezeichnet – du hast die Amana zurückgegeben.", bs: "Odlično – vratio si emanet." } },
    { text: { en: "Leave it lying there", de: "Es liegen lassen", bs: "Ostaviti ga da leži" }, feedback: { en: "Someone else might take it – it's better to help it get back.", de: "Jemand anderes könnte es nehmen – besser, du hilfst, dass es zurückkommt.", bs: "Neko drugi bi ga mogao uzeti – bolje je pomoći da se vrati." } },
  ],
  correctIndex: 1,
  explanation: { en: "Allah commands us to return trusts to their owners. Lost things should go back to the people they belong to.", de: "Allah gebietet uns, anvertraute Dinge ihren Besitzern zurückzugeben. Verlorenes soll zu seinen Eigentümern zurück.", bs: "Allah nam naređuje da emanete vraćamo vlasnicima. Izgubljene stvari trebaju se vratiti onima kojima pripadaju." },
  sources: [{ sourceName: "Quran", sourceReference: "4:58" }],
};
/** question akhlaq-animal */
export const Q_ANIMAL: ContentChoice = {
  id: 'akhlaq-animal',
  prompt: { en: "Some kids are throwing stones at a stray cat. What do you do?", de: "Ein paar Kinder werfen Steine nach einer streunenden Katze. Was tust du?", bs: "Neka djeca bacaju kamenje na mačku lutalicu. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Join in", de: "Mitmachen", bs: "Pridružiti se" }, feedback: { en: "Hurting animals is cruel – Islam forbids it.", de: "Tieren wehzutun ist grausam – der Islam verbietet es.", bs: "Povređivanje životinja je okrutno – islam to zabranjuje." } },
    { text: { en: "Ask them to stop, and get an adult if needed", de: "Sie bitten aufzuhören und notfalls einen Erwachsenen holen", bs: "Zamoliti ih da prestanu i pozvati odraslu osobu ako treba" }, feedback: { en: "That is rahmah in action!", de: "Das ist gelebte Rahma!", bs: "To je rahma na djelu!" } },
    { text: { en: "Laugh and walk away", de: "Lachen und weggehen", bs: "Nasmijati se i otići" }, feedback: { en: "The cat needs help – mercy means caring.", de: "Die Katze braucht Hilfe – Barmherzigkeit heißt, sich zu kümmern.", bs: "Mački treba pomoć – milost znači brinuti se." } },
  ],
  correctIndex: 1,
  explanation: { en: "Mercy includes animals. The Prophet ﷺ taught that the merciful will be shown mercy by the Most Merciful.", de: "Barmherzigkeit gilt auch Tieren. Der Prophet ﷺ lehrte, dass sich der Allerbarmer der Barmherzigen erbarmt.", bs: "Milost obuhvata i životinje. Poslanik ﷺ je poučio da se Milostivi smiluje milostivima." },
  sources: [{ sourceName: "Sunan Abi Dawud", sourceReference: "4941" }],
};
/** question akhlaq-parents-scenario */
export const Q_PARENTS: ContentChoice = {
  id: 'akhlaq-parents-scenario',
  prompt: { en: "Your dad asks you to help clear the table, but you are in the middle of a game. What do you do?", de: "Dein Vater bittet dich, beim Abräumen zu helfen, aber du bist mitten in einem Spiel. Was tust du?", bs: "Tvoj otac te zamoli da pomogneš pospremiti sto, a ti si usred igre. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Say \"uff!\" and keep playing", de: "„Uff!“ sagen und weiterspielen", bs: "Reći „uf!“ i nastaviti igrati" }, feedback: { en: "The Quran tells us not even to say \"uff\" to parents.", de: "Der Koran sagt, wir sollen nicht einmal „uff“ zu den Eltern sagen.", bs: "Kur'an kaže da roditeljima ne kažemo ni „uf“." } },
    { text: { en: "Pause the game and help with a smile", de: "Das Spiel pausieren und lächelnd helfen", bs: "Pauzirati igru i pomoći s osmijehom" }, feedback: { en: "That is birr – goodness to parents!", de: "Das ist Birr – Güte zu den Eltern!", bs: "To je birr – dobročinstvo prema roditeljima!" } },
    { text: { en: "Pretend I didn't hear", de: "So tun, als hätte ich nichts gehört", bs: "Praviti se da nisam čuo" }, feedback: { en: "Ignoring parents is not kind.", de: "Eltern zu ignorieren ist nicht freundlich.", bs: "Ignorisanje roditelja nije lijepo." } },
  ],
  correctIndex: 1,
  explanation: { en: "Allah commands kindness to parents and tells us to speak to them with gentle, respectful words.", de: "Allah gebietet Güte zu den Eltern und sagt uns, mit ihnen sanft und respektvoll zu sprechen.", bs: "Allah naređuje dobročinstvo prema roditeljima i da im se obraćamo blagim riječima punim poštovanja." },
  sources: [{ sourceName: "Quran", sourceReference: "17:23–24" }],
};
/** question akhlaq-forgive-scenario */
export const Q_FORGIVE: ContentChoice = {
  id: 'akhlaq-forgive-scenario',
  prompt: { en: "A friend said something mean yesterday. Today they come and say sorry. What do you do?", de: "Ein Freund hat gestern etwas Gemeines gesagt. Heute kommt er und entschuldigt sich. Was tust du?", bs: "Prijatelj je jučer rekao nešto ružno. Danas dolazi i izvinjava se. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Forgive them and move on", de: "Ihm vergeben und weitermachen", bs: "Oprostiti mu i ići dalje" }, feedback: { en: "That is beautiful forgiveness.", de: "Das ist schöne Vergebung.", bs: "To je lijep oprost." } },
    { text: { en: "Say something mean back", de: "Etwas Gemeines zurücksagen", bs: "Uzvratiti nečim ružnim" }, feedback: { en: "Revenge keeps the hurt going.", de: "Rache hält den Schmerz am Leben.", bs: "Osveta produžava bol." } },
    { text: { en: "Never speak to them again", de: "Nie wieder mit ihm sprechen", bs: "Nikad više ne razgovarati s njim" }, feedback: { en: "Islam encourages us to reconcile, not cut off.", de: "Der Islam ermutigt zur Versöhnung, nicht zum Abbruch.", bs: "Islam podstiče pomirenje, a ne prekidanje odnosa." } },
  ],
  correctIndex: 0,
  explanation: { en: "The Quran asks: would you not love for Allah to forgive you? Forgiving others is noble.", de: "Der Koran fragt: Möchtet ihr nicht, dass Allah euch vergibt? Anderen zu vergeben ist edel.", bs: "Kur'an pita: zar ne želite da vam Allah oprosti? Opraštati drugima je plemenito." },
  sources: [{ sourceName: "Quran", sourceReference: "24:22" }],
};
/** ramadan-fasting · section 0 */
export const FASTING: LocalizedText = { en: "Fasting (sawm) means not eating or drinking from dawn (Fajr) until sunset (Maghrib). The Quran says fasting was prescribed so that we may become mindful of Allah (taqwa). Fasting is also about guarding our tongue and behaving well.", de: "Fasten (Saum) bedeutet, von der Morgendämmerung (Fadschr) bis Sonnenuntergang (Maghrib) nicht zu essen und nicht zu trinken. Der Koran sagt, das Fasten wurde vorgeschrieben, damit wir gottesbewusst werden (Taqwa). Beim Fasten geht es auch darum, die Zunge zu hüten und sich gut zu benehmen.", bs: "Post (savm) znači ne jesti i ne piti od zore (sabaha) do zalaska sunca (akšama). Kur'an kaže da je post propisan kako bismo postali bogobojazni (takva). Post znači i čuvati jezik i lijepo se ponašati." };
export const FASTING_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "2:183–185" }, { sourceName: "Quran", sourceReference: "2:187" }];
/** ramadan-fasting · section 1 */
export const WHO_FASTS: LocalizedText = { en: "Fasting in Ramadan is an obligation for adult Muslims who are able to fast. Children are not obliged to fast before they reach puberty. Many families let children practise little by little – for example half a day – but only with their parents' guidance. People who are ill, travelling, or for whom fasting would be harmful are excused, as the Quran explains.", de: "Das Fasten im Ramadan ist Pflicht für erwachsene Muslime, die fasten können. Kinder sind vor der Pubertät nicht zum Fasten verpflichtet. Viele Familien lassen Kinder Schritt für Schritt üben – zum Beispiel einen halben Tag –, aber nur unter Anleitung der Eltern. Kranke, Reisende und Menschen, denen das Fasten schaden würde, sind befreit, wie der Koran erklärt.", bs: "Post u ramazanu je obaveza za odrasle muslimane koji mogu postiti. Djeca nisu obavezna postiti prije puberteta. Mnoge porodice puštaju djecu da vježbaju malo po malo – npr. pola dana – ali samo uz vodstvo roditelja. Bolesni, putnici i oni kojima bi post naškodio oslobođeni su, kako Kur'an objašnjava." };
export const WHO_FASTS_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "2:183–185" }, { sourceName: "Quran", sourceReference: "2:187" }];
/** ramadan-fasting · section 2 */
export const STAY_SAFE: LocalizedText = { en: "Never try to fast on your own in a way that makes you feel dizzy or unwell. If you feel ill, tell an adult – Islam does not want harm for you. Allah wants ease for us, not hardship.", de: "Versuche niemals allein so zu fasten, dass dir schwindlig wird oder es dir schlecht geht. Wenn du dich krank fühlst, sag es einem Erwachsenen – der Islam will dir nicht schaden. Allah will es uns leicht machen, nicht schwer.", bs: "Nikad ne pokušavaj sam postiti na način da ti se vrti u glavi ili da ti je loše. Ako se osjećaš bolesno, reci odrasloj osobi – islam ne želi da ti se naškodi. Allah želi da nam olakša, a ne da nam oteža." };
export const STAY_SAFE_SOURCES: SourceRef[] = [{ sourceName: "Quran", sourceReference: "2:183–185" }, { sourceName: "Quran", sourceReference: "2:187" }];
/** ramadan-fasting · differenceNote */
export const FASTING_NOTE: LocalizedText = { en: "Parents and scholars have different views on when and how children should start practising fasting. Your family will decide what is right for you.", de: "Eltern und Gelehrte haben unterschiedliche Ansichten darüber, wann und wie Kinder mit dem Fastenüben beginnen sollen. Deine Familie entscheidet, was für dich richtig ist.", bs: "Roditelji i učenjaci imaju različita mišljenja o tome kada i kako djeca trebaju početi vježbati post. Tvoja porodica će odlučiti šta je ispravno za tebe." };
/** ramadan-suhoor-iftar · section 0 */
export const SUHOOR: LocalizedText = { en: "Suhoor is the meal eaten before dawn. The Prophet ﷺ said: take suhoor, for in suhoor there is blessing.", de: "Suhur ist die Mahlzeit vor der Morgendämmerung. Der Prophet ﷺ sagte: Nehmt den Suhur ein, denn im Suhur liegt Segen.", bs: "Sehur je obrok prije zore. Poslanik ﷺ je rekao: ručajte sehur, jer u sehuru je bereket." };
export const SUHOOR_SOURCES: SourceRef[] = [{ sourceName: "Sahih al-Bukhari", sourceReference: "1923" }, { sourceName: "Sahih Muslim", sourceReference: "1095" }, { sourceName: "Sahih al-Bukhari", sourceReference: "1957" }, { sourceName: "Sunan Abi Dawud", sourceReference: "2356" }];
/** ramadan-suhoor-iftar · section 1 */
export const IFTAR: LocalizedText = { en: "Iftar is the meal at sunset that breaks the fast. The Prophet ﷺ taught that people remain in goodness as long as they hurry to break the fast. He used to break his fast with fresh dates; if there were none, then dry dates; and if there were none, with a few sips of water.", de: "Iftar ist die Mahlzeit bei Sonnenuntergang, mit der das Fasten gebrochen wird. Der Prophet ﷺ lehrte, dass die Menschen im Guten bleiben, solange sie sich beeilen, das Fasten zu brechen. Er brach sein Fasten mit frischen Datteln; gab es keine, mit getrockneten; und gab es auch die nicht, mit ein paar Schlucken Wasser.", bs: "Iftar je obrok o zalasku sunca kojim se prekida post. Poslanik ﷺ je poučio da će ljudi biti u dobru sve dok žure s iftarom. Iftario je svježim hurmama; ako ih nije bilo, onda suhim; a ako ni njih nije bilo, s nekoliko gutljaja vode." };
export const IFTAR_SOURCES: SourceRef[] = [{ sourceName: "Sahih al-Bukhari", sourceReference: "1923" }, { sourceName: "Sahih Muslim", sourceReference: "1095" }, { sourceName: "Sahih al-Bukhari", sourceReference: "1957" }, { sourceName: "Sunan Abi Dawud", sourceReference: "2356" }];
/** ramadan-nights · section 0 */
export const TARAWEEH: LocalizedText = { en: "Taraweeh is the special night prayer in Ramadan, prayed after Isha. The Prophet ﷺ said that whoever stands in prayer in Ramadan with faith and hoping for reward, his past sins will be forgiven.", de: "Tarawih ist das besondere Nachtgebet im Ramadan, das nach Ischa gebetet wird. Der Prophet ﷺ sagte: Wer im Ramadan im Glauben und in Hoffnung auf Lohn im Gebet steht, dem werden seine vergangenen Sünden vergeben.", bs: "Teravija je poseban noćni namaz u ramazanu, koji se klanja nakon jacije. Poslanik ﷺ je rekao da će onome ko u ramazanu noću klanja s vjerom i nadajući se nagradi biti oprošteni prethodni grijesi." };
export const TARAWEEH_SOURCES: SourceRef[] = [{ sourceName: "Sahih al-Bukhari", sourceReference: "37" }, { sourceName: "Sahih al-Bukhari", sourceReference: "6" }, { sourceName: "Quran", sourceReference: "97:1–5" }, { sourceName: "Sahih al-Bukhari", sourceReference: "2017" }];
/** ramadan-nights · differenceNote */
export const TARAWEEH_NOTE: LocalizedText = { en: "The number of rak'ahs in Taraweeh differs between communities (for example 8 or 20). Both are practised by Muslims following scholarly evidence.", de: "Die Zahl der Rak'as im Tarawih unterscheidet sich zwischen Gemeinden (zum Beispiel 8 oder 20). Beides wird von Muslimen nach gelehrten Belegen praktiziert.", bs: "Broj rekata teravije razlikuje se među zajednicama (npr. 8 ili 20). Oba načina muslimani prakticiraju slijedeći učenjačke dokaze." };
/** ramadan-charity-eid · section 0 */
export const GENEROSITY: LocalizedText = { en: "The Prophet ﷺ was the most generous of people, and he was even more generous in Ramadan. Muslims give sadaqah (voluntary charity) and share iftar with others.", de: "Der Prophet ﷺ war der großzügigste Mensch, und im Ramadan war er noch großzügiger. Muslime geben Sadaqa (freiwillige Spenden) und teilen den Iftar mit anderen.", bs: "Poslanik ﷺ je bio najdarežljiviji čovjek, a u ramazanu je bio još darežljiviji. Muslimani dijele sadaku i iftar s drugima." };
export const GENEROSITY_SOURCES: SourceRef[] = [{ sourceName: "Sahih al-Bukhari", sourceReference: "6" }, { sourceName: "Sahih al-Bukhari", sourceReference: "1503" }, { sourceName: "Sahih al-Bukhari", sourceReference: "1990" }, { sourceName: "Sahih Muslim", sourceReference: "1137" }];
/** question ramadan-dizzy */
export const Q_DIZZY: ContentChoice = {
  id: 'ramadan-dizzy',
  prompt: { en: "You are practising fasting and start to feel dizzy and weak. What do you do?", de: "Du übst das Fasten und fühlst dich plötzlich schwindlig und schwach. Was tust du?", bs: "Vježbaš post i počne ti se vrtjeti u glavi i osjećaš se slabo. Šta ćeš uraditi?" },
  options: [
    { text: { en: "Keep going no matter what", de: "Durchhalten, egal was passiert", bs: "Izdržati bez obzira na sve" }, feedback: { en: "Your health comes first – Islam does not want harm for you.", de: "Deine Gesundheit geht vor – der Islam will dir nicht schaden.", bs: "Zdravlje je na prvom mjestu – islam ne želi da ti se naškodi." } },
    { text: { en: "Tell a parent or adult right away", de: "Sofort einem Elternteil oder Erwachsenen Bescheid sagen", bs: "Odmah reći roditelju ili odrasloj osobi" }, feedback: { en: "Exactly right – Allah wants ease for us.", de: "Genau richtig – Allah will es uns leicht machen.", bs: "Upravo tako – Allah želi da nam olakša." } },
    { text: { en: "Hide it so nobody worries", de: "Es verstecken, damit sich niemand Sorgen macht", bs: "Sakriti to da se niko ne brine" }, feedback: { en: "Adults need to know so they can help you.", de: "Erwachsene müssen es wissen, damit sie dir helfen können.", bs: "Odrasli trebaju znati da bi ti mogli pomoći." } },
  ],
  correctIndex: 1,
  explanation: { en: "The Quran says Allah wants ease for you, not hardship. If fasting makes you unwell, stop and tell an adult.", de: "Der Koran sagt, Allah will es euch leicht machen, nicht schwer. Wenn dir das Fasten schadet, hör auf und sag es einem Erwachsenen.", bs: "Kur'an kaže da Allah želi olakšanje, a ne poteškoću. Ako ti post škodi, prestani i reci odrasloj osobi." },
  sources: [{ sourceName: "Quran", sourceReference: "2:185" }],
};
/** question ramadan-charity-scenario */
export const Q_SHARE_IFTAR: ContentChoice = {
  id: 'ramadan-charity-scenario',
  prompt: { en: "Your family is making iftar. You notice a neighbour who lives alone. What could you do?", de: "Deine Familie bereitet den Iftar vor. Du denkst an einen Nachbarn, der allein lebt. Was könntest du tun?", bs: "Tvoja porodica sprema iftar. Sjetiš se komšije koji živi sam. Šta bi mogao uraditi?" },
  options: [
    { text: { en: "Ask my parents if we can share iftar with him", de: "Meine Eltern fragen, ob wir den Iftar mit ihm teilen können", bs: "Pitati roditelje možemo li s njim podijeliti iftar" }, feedback: { en: "Beautiful – sharing iftar is a great good deed.", de: "Wunderschön – den Iftar zu teilen ist eine große gute Tat.", bs: "Prelijepo – dijeljenje iftara je veliko dobro djelo." } },
    { text: { en: "Nothing – it's not my business", de: "Nichts – das geht mich nichts an", bs: "Ništa – to nije moja briga" }, feedback: { en: "Ramadan is a month of caring for others.", de: "Ramadan ist ein Monat der Fürsorge für andere.", bs: "Ramazan je mjesec brige o drugima." } },
    { text: { en: "Eat extra so nothing is left", de: "Extra viel essen, damit nichts übrig bleibt", bs: "Pojesti više da ništa ne ostane" }, feedback: { en: "Sharing is better than overeating.", de: "Teilen ist besser als zu viel essen.", bs: "Dijeljenje je bolje od prejedanja." } },
  ],
  correctIndex: 0,
  explanation: { en: "The Prophet ﷺ was most generous in Ramadan. Sharing food and caring for neighbours brings people together.", de: "Der Prophet ﷺ war im Ramadan am großzügigsten. Essen zu teilen und sich um Nachbarn zu kümmern bringt Menschen zusammen.", bs: "Poslanik ﷺ je u ramazanu bio najdarežljiviji. Dijeljenje hrane i briga o komšijama zbližava ljude." },
  sources: [{ sourceName: "Sahih al-Bukhari", sourceReference: "6" }],
};
/** ramadan.json goodDeeds (the Ramadan good-deed tracker) */
export const GOOD_DEEDS: readonly { id: GoodDeedId; label: LocalizedText }[] = [
  { id: 'prayed', label: { en: "Prayed on time", de: "Pünktlich gebetet", bs: "Klanjao na vrijeme" } },
  { id: 'quran', label: { en: "Read or listened to Quran", de: "Koran gelesen oder gehört", bs: "Učio ili slušao Kur'an" } },
  { id: 'helped', label: { en: "Helped at home", de: "Zu Hause geholfen", bs: "Pomogao kod kuće" } },
  { id: 'charity', label: { en: "Gave charity or shared food", de: "Gespendet oder Essen geteilt", bs: "Dao sadaku ili podijelio hranu" } },
  { id: 'kind', label: { en: "Said kind words", de: "Freundliche Worte gesagt", bs: "Rekao lijepe riječi" } },
  { id: 'dua', label: { en: "Made dua for others", de: "Du'a für andere gemacht", bs: "Uputio dovu za druge" } },
  { id: 'learned', label: { en: "Learned something new about Islam", de: "Etwas Neues über den Islam gelernt", bs: "Naučio nešto novo o islamu" } },
];
export type GoodDeedId = 'prayed' | 'quran' | 'helped' | 'charity' | 'kind' | 'dua' | 'learned';


// ---------- the scenes ----------

/** What the learner does in a scene, step by step. */
export type Step =
  /** A dilemma from the content: the good option continues, the others show the content's gentle feedback. */
  | { kind: 'choice'; choice: ContentChoice }
  /** Ramadan: how the learner fasts today – every answer is fine (age framing from the content first). */
  | { kind: 'mode' }
  /** Drag each item onto the target (`hero` = the learner's own avatar). */
  | { kind: 'drag'; items: string[]; target: string; hint: string }
  /** Tap the item `count` times (e.g. share dates one by one onto a plate). */
  | { kind: 'tap'; item: string; target: string; count: number; hint: string }
  /** Drag the sun down to sunset (Maghrib) – then the fast may be broken. */
  | { kind: 'sun' }
  /** The Ramadan good-deed tracker (ramadan.json goodDeeds). */
  | { kind: 'tracker' };

/** The card after a scene: content texts, their sources and an optional "scholars differ" note. */
export interface SceneCard {
  texts: LocalizedText[];
  sources: SourceRef[];
  note?: LocalizedText;
}

export interface Scene {
  id: string;
  /** Sky piece of the scene (dawn → night). */
  time: SkyTime;
  steps: Step[];
  card: SceneCard;
  /** What grows in the garden strip for this good deed. */
  plant: string;
  /** Extra illustration in the scene. */
  decor?: string;
  /** Entry of the Ramadan good-deed list this scene fulfils. */
  deed?: GoodDeedId;
  /** Game fact reported for review when the learner's first choice in this scene was not the good one. */
  factId?: string;
}

/** Sources narrowed to the hadith of one lesson section (all of them are listed in that lesson's sources). */
const pick = (sources: readonly SourceRef[], refs: string[]) => sources.filter((s) => refs.includes(`${s.sourceName} ${s.sourceReference}`));

export const SUHOOR_FACT_SOURCES = pick(SUHOOR_SOURCES, ['Sahih al-Bukhari 1923', 'Sahih Muslim 1095']);
export const IFTAR_FACT_SOURCES = pick(IFTAR_SOURCES, ['Sahih al-Bukhari 1957', 'Sunan Abi Dawud 2356']);
export const TARAWEEH_FACT_SOURCES = pick(TARAWEEH_SOURCES, ['Sahih al-Bukhari 37']);
export const GENEROSITY_FACT_SOURCES = pick(GENEROSITY_SOURCES, ['Sahih al-Bukhari 6']);

/** Level 1 – an everyday day from dawn to night. */
export const EVERYDAY: readonly Scene[] = [
  {
    id: 'fajr',
    time: 'dawn',
    steps: [{ kind: 'drag', items: ['object.prayer-mat'], target: 'hero', hint: 'hint.mat' }],
    card: { texts: [PRAYER_TIMES, PRAYER_FAJR], sources: PRAYER_TIMES_SOURCES },
    plant: 'garden.flower-tulip',
    decor: 'object.lantern',
    deed: 'prayed',
  },
  {
    id: 'help-home',
    time: 'morning',
    steps: [{ kind: 'drag', items: ['object.basket'], target: 'place.house', hint: 'hint.basket' }],
    card: { texts: [PARENTS_EXAMPLE, PARENTS], sources: PARENTS_SOURCES },
    plant: 'garden.flower-jasmine',
    deed: 'helped',
  },
  {
    id: 'sadaqah',
    time: 'noon',
    steps: [{ kind: 'drag', items: ['object.coins', 'object.coins'], target: 'object.coin-jar', hint: 'hint.coins' }],
    card: { texts: [SMILE], sources: SMILE_SOURCES },
    plant: 'garden.flower-rose',
    deed: 'charity',
    factId: 'smile-charity',
  },
  {
    id: 'share-dates',
    time: 'afternoon',
    steps: [{ kind: 'tap', item: 'food.dates', target: 'object.plate', count: 3, hint: 'hint.dates' }],
    card: { texts: [HELPING], sources: HELPING_SOURCES },
    plant: 'garden.date-palm-young',
    deed: 'charity',
  },
  {
    id: 'promise',
    time: 'sunset',
    steps: [{ kind: 'drag', items: ['object.book'], target: 'place.house', hint: 'hint.book' }],
    card: { texts: [AMANAH_EXAMPLE, AMANAH], sources: AMANAH_SOURCES },
    plant: 'garden.olive',
    factId: 'amanah',
  },
  {
    id: 'thanks',
    time: 'night',
    steps: [{ kind: 'choice', choice: Q_PRESENT }],
    card: { texts: [SHUKR], sources: SHUKR_SOURCES },
    plant: 'garden.flower-lily',
    decor: 'object.gift',
    deed: 'kind',
    factId: 'shukr',
  },
];

/** Level 2 – harder dilemmas from the content's scenarios. */
export const DILEMMAS: readonly Scene[] = [
  {
    id: 'cup',
    time: 'morning',
    steps: [{ kind: 'choice', choice: Q_VASE }],
    card: { texts: [SIDQ], sources: SIDQ_SOURCES },
    plant: 'garden.flower-tulip',
    decor: 'object.cup',
    factId: 'sidq',
  },
  {
    id: 'new-student',
    time: 'noon',
    steps: [{ kind: 'choice', choice: Q_MOCKING }],
    card: { texts: [KINDNESS], sources: KINDNESS_SOURCES },
    plant: 'garden.flower-jasmine',
    decor: 'object.book',
    deed: 'kind',
  },
  {
    id: 'wallet',
    time: 'afternoon',
    steps: [{ kind: 'choice', choice: Q_WALLET }],
    card: { texts: [AMANAH], sources: AMANAH_SOURCES },
    plant: 'garden.olive',
    decor: 'object.coins',
    factId: 'amanah',
  },
  {
    id: 'cat',
    time: 'afternoon',
    steps: [
      { kind: 'choice', choice: Q_ANIMAL },
      { kind: 'drag', items: ['object.bowl'], target: 'animal.cat', hint: 'hint.bowl' },
    ],
    card: { texts: [RAHMAH, RAHMAH_EXAMPLE], sources: RAHMAH_SOURCES },
    plant: 'garden.flower-rose',
    factId: 'rahmah',
  },
  {
    id: 'table',
    time: 'sunset',
    steps: [
      { kind: 'choice', choice: Q_PARENTS },
      { kind: 'drag', items: ['object.plate', 'object.cup'], target: 'place.house', hint: 'hint.table' },
    ],
    card: { texts: [PARENTS], sources: PARENTS_SOURCES },
    plant: 'garden.fig',
    deed: 'helped',
  },
  {
    id: 'forgive',
    time: 'night',
    steps: [{ kind: 'choice', choice: Q_FORGIVE }],
    card: { texts: [FORGIVENESS], sources: FORGIVENESS_SOURCES },
    plant: 'garden.flower-lily',
    decor: 'ui.heart',
    factId: 'forgiveness',
  },
];

/** Level 3 – a Ramadan day: suhoor before dawn, the fasting day, iftar at sunset, the night prayer and the tracker. */
export const RAMADAN_DAY: readonly Scene[] = [
  {
    id: 'suhoor',
    time: 'night',
    steps: [{ kind: 'mode' }, { kind: 'drag', items: ['food.dates', 'food.water'], target: 'object.plate', hint: 'hint.suhoor' }],
    card: { texts: [SUHOOR], sources: SUHOOR_FACT_SOURCES },
    plant: 'garden.sapling',
    decor: 'object.lantern-ramadan',
  },
  {
    id: 'fajr-fast',
    time: 'dawn',
    steps: [{ kind: 'drag', items: ['object.prayer-mat'], target: 'hero', hint: 'hint.mat' }],
    card: { texts: [FASTING], sources: FASTING_SOURCES },
    plant: 'garden.flower-tulip',
    decor: 'object.crescent',
    deed: 'prayed',
  },
  {
    id: 'dizzy',
    time: 'noon',
    steps: [{ kind: 'choice', choice: Q_DIZZY }],
    card: { texts: [STAY_SAFE], sources: Q_DIZZY.sources },
    plant: 'garden.flower-jasmine',
    decor: 'food.water',
    factId: 'fast-safely',
  },
  {
    id: 'neighbour',
    time: 'afternoon',
    steps: [
      { kind: 'choice', choice: Q_SHARE_IFTAR },
      { kind: 'drag', items: ['food.soup'], target: 'place.house', hint: 'hint.soup' },
    ],
    card: { texts: [GENEROSITY], sources: GENEROSITY_FACT_SOURCES },
    plant: 'garden.flower-rose',
    deed: 'charity',
  },
  {
    id: 'iftar',
    time: 'sunset',
    steps: [{ kind: 'sun' }, { kind: 'drag', items: ['food.dates', 'food.water'], target: 'hero', hint: 'hint.iftar' }],
    card: { texts: [IFTAR], sources: IFTAR_FACT_SOURCES },
    plant: 'garden.date-palm-young',
  },
  {
    id: 'taraweeh',
    time: 'night',
    steps: [{ kind: 'tap', item: 'object.lantern-ramadan', target: 'garden.masjid-small', count: 1, hint: 'hint.lantern' }, { kind: 'tracker' }],
    card: { texts: [TARAWEEH], sources: TARAWEEH_FACT_SOURCES, note: TARAWEEH_NOTE },
    plant: 'garden.olive',
  },
];

export type DayId = 'everyday' | 'dilemmas' | 'ramadan';

export const DAYS: Record<DayId, readonly Scene[]> = { everyday: EVERYDAY, dilemmas: DILEMMAS, ramadan: RAMADAN_DAY };

const SCENE_ART = Object.values(DAYS).flatMap((scenes) =>
  scenes.flatMap((s) => [
    `sky.${s.time}`,
    s.plant,
    ...(s.decor ? [s.decor] : []),
    ...s.steps.flatMap((st) => (st.kind === 'drag' ? [...st.items, st.target] : st.kind === 'tap' ? [st.item, st.target] : [])),
  ]),
);

/** Art used by the game (checked with `hasArt` in the tests; `hero` is the learner's own avatar). */
export const DEEDS_ART: readonly string[] = [...new Set([...SCENE_ART, 'sky.afternoon', 'garden.sprout'])].filter((a) => a !== 'hero');
