/* eslint-disable */
// GENERATED – copied unchanged from src/features/seerah/content (episodes, events, people, sources).
// Do not edit by hand; the test shared/__tests__/content.test.ts compares every entry with the Seerah JSON.
import type { LocalizedText, SourceRef } from '@/core/models';

export interface SeerahBlock { kind: 'fact' | 'interpretation' | 'reflection'; text: LocalizedText; sourceIds: string[]; title?: LocalizedText }
export interface SeerahEventInfo { id: string; title: LocalizedText; date: { sortKey: number; label: LocalizedText; certainty: string; note: LocalizedText | null }; era: string; sourceIds: string[] }
export interface SeerahPersonInfo { id: string; name: LocalizedText; arabicName: string; honorific: string; kind: string; role: LocalizedText; relationship: LocalizedText; sourceIds: string[] }

/** The Seerah sources as core SourceRefs (the Seerah short label: "Quran al-Fil 105:1–5", "Sahih al-Bukhari 3"). */
export const SEERAH_SOURCE_REFS: Record<string, SourceRef> = {
 "q-105": {
  "sourceName": "Quran",
  "sourceReference": "al-Fil 105:1–5"
 },
 "q-93-6": {
  "sourceName": "Quran",
  "sourceReference": "al-Duha 93:6–8"
 },
 "q-68-4": {
  "sourceName": "Quran",
  "sourceReference": "al-Qalam 68:4"
 },
 "q-96-1": {
  "sourceName": "Quran",
  "sourceReference": "al-ʿAlaq 96:1–5"
 },
 "q-74-1": {
  "sourceName": "Quran",
  "sourceReference": "al-Muddaththir 74:1–5"
 },
 "q-26-214": {
  "sourceName": "Quran",
  "sourceReference": "al-Shuʿaraʾ 26:214"
 },
 "q-15-94": {
  "sourceName": "Quran",
  "sourceReference": "al-Hijr 15:94"
 },
 "q-111": {
  "sourceName": "Quran",
  "sourceReference": "al-Masad 111:1–5"
 },
 "q-17-1": {
  "sourceName": "Quran",
  "sourceReference": "al-Israʾ 17:1"
 },
 "q-94-5": {
  "sourceName": "Quran",
  "sourceReference": "al-Sharh 94:5–6"
 },
 "q-8-30": {
  "sourceName": "Quran",
  "sourceReference": "al-Anfal 8:30"
 },
 "q-9-40": {
  "sourceName": "Quran",
  "sourceReference": "al-Tawbah 9:40"
 },
 "q-65-3": {
  "sourceName": "Quran",
  "sourceReference": "al-Talaq 65:3"
 },
 "q-9-100": {
  "sourceName": "Quran",
  "sourceReference": "al-Tawbah 9:100"
 },
 "q-59-9": {
  "sourceName": "Quran",
  "sourceReference": "al-Hashr 59:9"
 },
 "q-49-10": {
  "sourceName": "Quran",
  "sourceReference": "al-Hujurat 49:10"
 },
 "q-2-144": {
  "sourceName": "Quran",
  "sourceReference": "al-Baqarah 2:144"
 },
 "q-3-123": {
  "sourceName": "Quran",
  "sourceReference": "Al ʿImran 3:123"
 },
 "q-8-9": {
  "sourceName": "Quran",
  "sourceReference": "al-Anfal 8:9"
 },
 "q-8-41": {
  "sourceName": "Quran",
  "sourceReference": "al-Anfal 8:41"
 },
 "q-3-152": {
  "sourceName": "Quran",
  "sourceReference": "Al ʿImran 3:152"
 },
 "q-3-159": {
  "sourceName": "Quran",
  "sourceReference": "Al ʿImran 3:159"
 },
 "q-33-9": {
  "sourceName": "Quran",
  "sourceReference": "al-Ahzab 33:9–11"
 },
 "q-48-1": {
  "sourceName": "Quran",
  "sourceReference": "al-Fath 48:1"
 },
 "q-48-18": {
  "sourceName": "Quran",
  "sourceReference": "al-Fath 48:18"
 },
 "q-48-27": {
  "sourceName": "Quran",
  "sourceReference": "al-Fath 48:27"
 },
 "q-110": {
  "sourceName": "Quran",
  "sourceReference": "al-Nasr 110:1–3"
 },
 "q-17-81": {
  "sourceName": "Quran",
  "sourceReference": "al-Israʾ 17:81"
 },
 "q-5-3": {
  "sourceName": "Quran",
  "sourceReference": "al-Maʾidah 5:3"
 },
 "q-3-144": {
  "sourceName": "Quran",
  "sourceReference": "Al ʿImran 3:144"
 },
 "q-33-21": {
  "sourceName": "Quran",
  "sourceReference": "al-Ahzab 33:21"
 },
 "q-21-107": {
  "sourceName": "Quran",
  "sourceReference": "al-Anbiyaʾ 21:107"
 },
 "bukhari-3": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "3"
 },
 "bukhari-4": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "4"
 },
 "bukhari-2262": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "2262"
 },
 "bukhari-4770": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "4770"
 },
 "bukhari-3231": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "3231"
 },
 "bukhari-1245": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "1245"
 },
 "bukhari-3905": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "3905"
 },
 "bukhari-3653": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "3653"
 },
 "bukhari-428": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "428"
 },
 "bukhari-40": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "40"
 },
 "bukhari-3039": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "3039"
 },
 "bukhari-2731": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "2731–2732"
 },
 "bukhari-4287": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "4287"
 },
 "bukhari-45": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "45"
 },
 "bukhari-1241": {
  "sourceName": "Sahih al-Bukhari",
  "sourceReference": "1241–1242"
 },
 "muslim-1162": {
  "sourceName": "Sahih Muslim",
  "sourceReference": "1162"
 },
 "muslim-1763": {
  "sourceName": "Sahih Muslim",
  "sourceReference": "1763"
 },
 "muslim-1780": {
  "sourceName": "Sahih Muslim",
  "sourceReference": "1780"
 },
 "muslim-1218": {
  "sourceName": "Sahih Muslim",
  "sourceReference": "1218"
 },
 "ibnmajah-150": {
  "sourceName": "Sunan Ibn Majah",
  "sourceReference": "150"
 },
 "ibn-hisham": {
  "sourceName": "Ibn Hisham",
  "sourceReference": ""
 },
 "guillaume": {
  "sourceName": "A. Guillaume",
  "sourceReference": ""
 },
 "ibn-sad": {
  "sourceName": "Ibn Saʿd",
  "sourceReference": ""
 },
 "tabari": {
  "sourceName": "Muhammad ibn Jarir al-Tabari",
  "sourceReference": ""
 },
 "ibn-kathir": {
  "sourceName": "Ismaʿil ibn Kathir",
  "sourceReference": ""
 },
 "zad": {
  "sourceName": "Ibn Qayyim al-Jawziyyah",
  "sourceReference": ""
 },
 "mubarakpuri": {
  "sourceName": "Safiur Rahman al-Mubarakpuri",
  "sourceReference": ""
 },
 "lings": {
  "sourceName": "Martin Lings",
  "sourceReference": ""
 },
 "salahi": {
  "sourceName": "Adil Salahi",
  "sourceReference": ""
 },
 "ramadan-footsteps": {
  "sourceName": "Tariq Ramadan",
  "sourceReference": ""
 }
};

export const SEERAH_BLOCKS: Record<string, SeerahBlock> = {
 "e01.ctx0": {
  "kind": "fact",
  "text": {
   "en": "Makkah was a trading town in a dry valley of the Hijaz, built around the Kaʿbah. The tribe of Quraysh guarded the sanctuary and organised caravans to Yemen and Syria. Most Arabs worshipped idols, although some remembered the faith of Ibrahim.",
   "de": "Mekka war eine Handelsstadt in einem trockenen Tal des Hidschas, um die Kaaba herum gebaut. Der Stamm der Quraisch hütete das Heiligtum und organisierte Karawanen nach Jemen und Syrien. Die meisten Araber beteten Götzen an, doch einige erinnerten sich an den Glauben Abrahams.",
   "bs": "Mekka je bila trgovački grad u sušnoj dolini Hidžaza, izgrađen oko Kabe. Pleme Kurejš čuvalo je svetište i organizovalo karavane prema Jemenu i Šamu. Većina Arapa obožavala je kipove, iako su se neki sjećali vjere Ibrahima."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e01.ctx1": {
  "kind": "fact",
  "text": {
   "en": "Surah al-Fil recalls how an army with an elephant came to destroy the Kaʿbah and was turned back – the event that gave the \"Year of the Elephant\" its name.",
   "de": "Sure al-Fil erinnert daran, wie ein Heer mit einem Elefanten kam, um die Kaaba zu zerstören, und zurückgeschlagen wurde – das Ereignis, das dem „Jahr des Elefanten“ seinen Namen gab.",
   "bs": "Sura el-Fil podsjeća kako je vojska sa slonom došla da uništi Kabu i bila odbijena – događaj po kojem je „Godina slona“ dobila ime."
  },
  "sourceIds": [
   "q-105"
  ]
 },
 "e01.main0": {
  "kind": "fact",
  "text": {
   "en": "Muhammad ﷺ was born in Makkah into the clan of Hashim. His father ʿAbdullah had died before he was born. He himself said that he was born on a Monday.",
   "de": "Muhammad ﷺ wurde in Mekka im Clan Haschim geboren. Sein Vater Abdullah war vor seiner Geburt gestorben. Er selbst sagte, dass er an einem Montag geboren wurde.",
   "bs": "Muhammed ﷺ je rođen u Mekki u rodu Hašim. Njegov otac Abdullah umro je prije njegovog rođenja. On sam je rekao da je rođen u ponedjeljak."
  },
  "sourceIds": [
   "muslim-1162",
   "ibn-hisham"
  ]
 },
 "e01.main1": {
  "kind": "interpretation",
  "text": {
   "en": "The year is commonly given as about 570 CE, the Year of the Elephant. The exact day of the month is disputed among scholars.",
   "de": "Als Jahr wird meist etwa 570 n. Chr. angegeben, das Jahr des Elefanten. Der genaue Tag des Monats ist unter Gelehrten umstritten.",
   "bs": "Kao godina obično se navodi oko 570. godina, Godina slona. Tačan dan u mjesecu sporan je među učenjacima."
  },
  "sourceIds": [
   "ibn-hisham",
   "ibn-kathir"
  ]
 },
 "e01.main2": {
  "kind": "fact",
  "text": {
   "en": "He spent his first years with Halimah in the desert of Banu Saʿd. He lost his mother at about six and his grandfather ʿAbd al-Muttalib about two years later. His uncle Abu Talib then raised him.",
   "de": "Seine ersten Jahre verbrachte er bei Halima in der Wüste der Banu Saʿd. Mit etwa sechs verlor er seine Mutter, etwa zwei Jahre später seinen Großvater Abd al-Muttalib. Danach zog ihn sein Onkel Abu Talib auf.",
   "bs": "Prve godine proveo je kod Halime u pustinji Benu Sa'da. S oko šest godina izgubio je majku, a oko dvije godine kasnije djeda Abdul-Muttaliba. Zatim ga je odgojio amidža Ebu Talib."
  },
  "sourceIds": [
   "ibn-hisham",
   "q-93-6"
  ]
 },
 "e01.main3": {
  "kind": "fact",
  "text": {
   "en": "As a young man he tended sheep for the people of Makkah and later worked in trade, among others for Khadijah, whom he married.",
   "de": "Als junger Mann hütete er Schafe für die Leute Mekkas und arbeitete später im Handel, unter anderem für Chadidscha, die er heiratete.",
   "bs": "Kao mladić čuvao je ovce za stanovnike Mekke, a kasnije radio u trgovini, između ostalog za Hatidžu, s kojom se oženio."
  },
  "sourceIds": [
   "bukhari-2262",
   "ibn-hisham"
  ]
 },
 "e01.main4": {
  "kind": "interpretation",
  "text": {
   "en": "The Seerah reports describe how, when the Kaʿbah was rebuilt, he settled a dispute over the Black Stone by letting every clan carry it together on a cloak. People already called him al-Amin, \"the trustworthy\".",
   "de": "Die Sira-Berichte schildern, wie er beim Wiederaufbau der Kaaba einen Streit um den Schwarzen Stein schlichtete, indem er alle Clans ihn gemeinsam auf einem Tuch tragen ließ. Die Menschen nannten ihn schon al-Amin, „den Vertrauenswürdigen“.",
   "bs": "Predaje sire opisuju kako je pri obnovi Kabe riješio spor oko Crnog kamena tako što je dao da ga svi rodovi zajedno nose na ogrtaču. Ljudi su ga već nazivali el-Emin, „povjerljivi“."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e01.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "Long before the revelation, Muhammad ﷺ was known for honesty. The Quran later praised his \"great character\". Trust is built through years of small, honest actions.",
   "de": "Lange vor der Offenbarung war Muhammad ﷺ für seine Ehrlichkeit bekannt. Der Koran lobte später seinen „großartigen Charakter“. Vertrauen entsteht durch Jahre kleiner, ehrlicher Taten.",
   "bs": "Mnogo prije Objave Muhammed ﷺ bio je poznat po poštenju. Kur'an je kasnije pohvalio njegov „uzvišeni karakter“. Povjerenje se gradi godinama malih, poštenih djela."
  },
  "title": {
   "en": "Character comes first",
   "de": "Charakter zuerst",
   "bs": "Karakter na prvom mjestu"
  },
  "sourceIds": []
 },
 "e01.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "He lost his father, his mother and his grandfather as a child. The Quran reminds him that Allah found him an orphan and gave him shelter.",
   "de": "Als Kind verlor er Vater, Mutter und Großvater. Der Koran erinnert ihn daran, dass Allah ihn als Waise fand und ihm Zuflucht gab.",
   "bs": "Kao dijete izgubio je oca, majku i djeda. Kur'an ga podsjeća da ga je Allah našao siročetom i dao mu utočište."
  },
  "title": {
   "en": "Hardship is not the end",
   "de": "Not ist nicht das Ende",
   "bs": "Teškoća nije kraj"
  },
  "sourceIds": []
 },
 "e02.ctx0": {
  "kind": "fact",
  "text": {
   "en": "ʿAʾishah reported that the revelation began with true dreams, and that solitude was made beloved to him. He would spend several nights in worship in the Cave of Hiraʾ, then return to Khadijah for provisions.",
   "de": "Aischa berichtete, dass die Offenbarung mit wahren Träumen begann und ihm die Zurückgezogenheit lieb wurde. Er verbrachte mehrere Nächte in Andacht in der Höhle Hira und kehrte dann zu Chadidscha zurück, um sich Vorräte zu holen.",
   "bs": "Aiša je prenijela da je Objava počela istinitim snovima i da mu je osamljivanje postalo drago. Provodio bi po nekoliko noći u ibadetu u pećini Hira, a zatim se vraćao Hatidži po opskrbu."
  },
  "sourceIds": [
   "bukhari-3"
  ]
 },
 "e02.main0": {
  "kind": "fact",
  "text": {
   "en": "The angel came to him in the cave and said: \"Read!\" He answered that he could not read. After this was repeated three times, the angel recited the first verses of Surah al-ʿAlaq: \"Read in the name of your Lord who created – created man from a clinging substance. Read, and your Lord is the Most Generous, who taught by the pen, taught man what he did not know.\"",
   "de": "Der Engel kam in der Höhle zu ihm und sagte: „Lies!“ Er antwortete, dass er nicht lesen könne. Nachdem sich dies dreimal wiederholt hatte, trug der Engel die ersten Verse der Sure al-Alaq vor: „Lies im Namen deines Herrn, der erschaffen hat – den Menschen erschaffen hat aus einem Anhängsel. Lies, und dein Herr ist der Edelste, der mit dem Schreibrohr gelehrt hat, den Menschen gelehrt hat, was er nicht wusste.“",
   "bs": "Melek mu je došao u pećinu i rekao: „Čitaj!“ Odgovorio je da ne zna čitati. Nakon što se to ponovilo tri puta, melek je proučio prve ajete sure el-Alek: „Čitaj, u ime Gospodara tvoga koji stvara – stvara čovjeka od ugruška. Čitaj, a Gospodar tvoj je najplemenitiji, koji poučava peru, koji čovjeka poučava onome što ne zna.“"
  },
  "sourceIds": [
   "bukhari-3",
   "q-96-1"
  ]
 },
 "e02.main1": {
  "kind": "fact",
  "text": {
   "en": "He returned home with his heart trembling and said: \"Cover me.\" When he told Khadijah what had happened, she reassured him: Allah would never disgrace him, because he kept the ties of kinship, helped the weak, honoured guests and supported people in hardship.",
   "de": "Mit zitterndem Herzen kehrte er nach Hause zurück und sagte: „Bedeckt mich.“ Als er Chadidscha erzählte, was geschehen war, beruhigte sie ihn: Allah werde ihn niemals zuschanden machen, denn er pflege die Verwandtschaftsbande, helfe den Schwachen, ehre Gäste und stehe Menschen in Not bei.",
   "bs": "Vratio se kući drhtavog srca i rekao: „Pokrijte me.“ Kada je Hatidži ispričao šta se desilo, umirila ga je: Allah ga nikada neće poniziti, jer on održava rodbinske veze, pomaže slabima, časti goste i pomaže ljudima u nevolji."
  },
  "sourceIds": [
   "bukhari-3"
  ]
 },
 "e02.main2": {
  "kind": "fact",
  "text": {
   "en": "Khadijah took him to her cousin Waraqah ibn Nawfal, who said it was the same angel who had come to Moses and that his people would drive him out.",
   "de": "Chadidscha brachte ihn zu ihrem Cousin Waraqa ibn Naufal, der sagte, es sei derselbe Engel, der zu Moses gekommen war, und dass sein Volk ihn vertreiben werde.",
   "bs": "Hatidža ga je odvela svom rođaku Varaki ibn Nevfelu, koji je rekao da je to isti melek koji je dolazio Musau i da će ga njegov narod protjerati."
  },
  "sourceIds": [
   "bukhari-3"
  ]
 },
 "e02.main3": {
  "kind": "fact",
  "text": {
   "en": "After a pause in the revelation, the angel appeared again, and the first verses of Surah al-Muddaththir were revealed: \"O you who covers himself, arise and warn.\"",
   "de": "Nach einer Pause der Offenbarung erschien der Engel erneut, und die ersten Verse der Sure al-Muddaththir wurden offenbart: „O du Zugedeckter, steh auf und warne.“",
   "bs": "Nakon prekida Objave melek se ponovo pojavio i objavljeni su prvi ajeti sure el-Muddessir: „O ti, pokriveni, ustani i opominji.“"
  },
  "sourceIds": [
   "bukhari-4",
   "q-74-1"
  ]
 },
 "e02.main4": {
  "kind": "interpretation",
  "text": {
   "en": "Most scholars hold that the revelation began in Ramadan; which night exactly is not certain, and the length of the pause is reported differently.",
   "de": "Die meisten Gelehrten sind der Ansicht, dass die Offenbarung im Ramadan begann; welche Nacht genau, ist nicht sicher, und die Dauer der Pause wird unterschiedlich angegeben.",
   "bs": "Većina učenjaka smatra da je Objava počela u ramazanu; koja tačno noć, nije sigurno, a dužina prekida navodi se različito."
  },
  "sourceIds": [
   "ibn-kathir",
   "ibn-hisham"
  ]
 },
 "e02.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "The first revelation speaks of reading, the pen and learning. Seeking knowledge is part of the message from its very first moment.",
   "de": "Die erste Offenbarung spricht vom Lesen, vom Schreibrohr und vom Lernen. Das Streben nach Wissen gehört von Anfang an zur Botschaft.",
   "bs": "Prva Objava govori o čitanju, peru i učenju. Traženje znanja dio je poruke od njenog prvog trenutka."
  },
  "title": {
   "en": "The first word was \"Read\"",
   "de": "Das erste Wort war „Lies“",
   "bs": "Prva riječ bila je „Čitaj“"
  },
  "sourceIds": []
 },
 "e02.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "Khadijah's answer was based on what she had seen of his character for years. Good deeds are a source of strength in difficult moments.",
   "de": "Chadidschas Antwort beruhte auf dem, was sie jahrelang von seinem Charakter gesehen hatte. Gute Taten sind in schweren Momenten eine Quelle der Kraft.",
   "bs": "Hatidžin odgovor zasnivao se na onome što je godinama vidjela od njegovog karaktera. Dobra djela su izvor snage u teškim trenucima."
  },
  "title": {
   "en": "Support from those who know us",
   "de": "Beistand von denen, die uns kennen",
   "bs": "Podrška onih koji nas poznaju"
  },
  "sourceIds": []
 },
 "e03.ctx0": {
  "kind": "fact",
  "text": {
   "en": "The message called people to worship Allah alone, to reject idols, to believe in the Day of Judgement and to treat the weak with justice and kindness – a challenge to the religious and social order of Makkah.",
   "de": "Die Botschaft rief dazu auf, Allah allein anzubeten, die Götzen abzulehnen, an den Tag des Gerichts zu glauben und die Schwachen gerecht und gütig zu behandeln – eine Herausforderung für die religiöse und soziale Ordnung Mekkas.",
   "bs": "Poruka je pozivala da se obožava samo Allah, da se odbace kipovi, da se vjeruje u Sudnji dan i da se prema slabima postupa pravedno i dobro – izazov vjerskom i društvenom poretku Mekke."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e03.main0": {
  "kind": "fact",
  "text": {
   "en": "Khadijah was the first to believe. Abu Bakr, ʿAli – then a boy in the Prophet's household – and Zayd ibn Harithah were among the very first as well. Through Abu Bakr, others such as ʿUthman ibn ʿAffan accepted Islam.",
   "de": "Chadidscha glaubte als Erste. Abu Bakr, Ali – damals ein Junge im Haushalt des Propheten – und Zaid ibn Haritha gehörten ebenfalls zu den Allerersten. Durch Abu Bakr nahmen weitere wie Uthman ibn Affan den Islam an.",
   "bs": "Hatidža je prva povjerovala. Ebu Bekr, Alija – tada dječak u Poslanikovoj kući – i Zejd ibn Harisa također su bili među prvima. Preko Ebu Bekra islam su primili i drugi, poput Osmana ibn Affana."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e03.main1": {
  "kind": "interpretation",
  "text": {
   "en": "Who was the very first is discussed by scholars. A common way to reconcile the reports: Khadijah among women, Abu Bakr among free men, ʿAli among children, Zayd among freed men.",
   "de": "Wer der Allererste war, wird unter Gelehrten diskutiert. Eine verbreitete Art, die Berichte zu vereinen: Chadidscha unter den Frauen, Abu Bakr unter den freien Männern, Ali unter den Kindern, Zaid unter den Freigelassenen.",
   "bs": "Ko je bio prvi, pitanje je o kojem učenjaci raspravljaju. Uobičajen način usklađivanja predaja: Hatidža među ženama, Ebu Bekr među slobodnim muškarcima, Alija među djecom, Zejd među oslobođenicima."
  },
  "sourceIds": [
   "ibn-kathir"
  ]
 },
 "e03.main2": {
  "kind": "fact",
  "text": {
   "en": "After about three years came the command to proclaim openly. When \"And warn your closest kinsmen\" was revealed, the Prophet ﷺ climbed Mount al-Safa and called out to the clans of Quraysh. He asked whether they would believe him if he told them an army was behind the hill; they said they had never known him to lie. Then he warned them.",
   "de": "Nach etwa drei Jahren kam das Gebot, offen zu verkünden. Als „Und warne deine nächsten Verwandten“ offenbart wurde, stieg der Prophet ﷺ auf den Hügel as-Safa und rief die Clans der Quraisch. Er fragte, ob sie ihm glauben würden, wenn er ihnen sagte, dass hinter dem Hügel ein Heer stehe; sie sagten, sie hätten ihn nie lügen erlebt. Dann warnte er sie.",
   "bs": "Nakon oko tri godine došla je naredba da se poziva javno. Kada je objavljeno „I opominji rodbinu svoju najbližu“, Poslanik ﷺ se popeo na brdo Safa i pozvao kurejšijske rodove. Upitao ih je bi li mu povjerovali kada bi im rekao da je iza brda vojska; rekli su da ga nikada nisu čuli da laže. Tada ih je opomenuo."
  },
  "sourceIds": [
   "bukhari-4770",
   "q-26-214",
   "q-15-94"
  ]
 },
 "e03.main3": {
  "kind": "fact",
  "text": {
   "en": "His uncle Abu Lahab rejected him publicly, and Surah al-Masad was revealed about him.",
   "de": "Sein Onkel Abu Lahab wies ihn öffentlich zurück, und über ihn wurde Sure al-Masad offenbart.",
   "bs": "Njegov amidža Ebu Leheb javno ga je odbio, i o njemu je objavljena sura el-Mesed."
  },
  "sourceIds": [
   "bukhari-4770",
   "q-111"
  ]
 },
 "e03.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "The message first reached family and friends who knew the Prophet's character best. Change often begins in our own homes.",
   "de": "Die Botschaft erreichte zuerst Familie und Freunde, die den Charakter des Propheten am besten kannten. Veränderung beginnt oft im eigenen Zuhause.",
   "bs": "Poruka je najprije stigla do porodice i prijatelja koji su najbolje poznavali Poslanikov karakter. Promjena često počinje u našim domovima."
  },
  "title": {
   "en": "Begin with those closest",
   "de": "Beginne bei den Nächsten",
   "bs": "Počni od najbližih"
  },
  "sourceIds": []
 },
 "e03.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "At al-Safa, Quraysh admitted they had never heard him lie. His words had weight because his life matched them.",
   "de": "Auf as-Safa gaben die Quraisch zu, ihn nie lügen gehört zu haben. Seine Worte hatten Gewicht, weil sein Leben ihnen entsprach.",
   "bs": "Na Safi su Kurejšije priznali da ga nikada nisu čuli da laže. Njegove riječi imale su težinu jer je njegov život bio u skladu s njima."
  },
  "title": {
   "en": "A reputation for truth",
   "de": "Ein Ruf der Wahrhaftigkeit",
   "bs": "Glas istinoljubivosti"
  },
  "sourceIds": []
 },
 "e04.ctx0": {
  "kind": "fact",
  "text": {
   "en": "In Makkah, a person's safety depended on their clan. Muslims with powerful protectors were insulted and pressured; those without protection – especially the enslaved and the poor – were tortured.",
   "de": "In Mekka hing die Sicherheit eines Menschen von seinem Clan ab. Muslime mit mächtigen Beschützern wurden beschimpft und unter Druck gesetzt; Schutzlose – besonders Versklavte und Arme – wurden gefoltert.",
   "bs": "U Mekki je sigurnost čovjeka zavisila od njegovog roda. Muslimani s moćnim zaštitnicima bili su vrijeđani i pritiskani; oni bez zaštite – posebno robovi i siromasi – bili su mučeni."
  },
  "sourceIds": [
   "ibn-hisham",
   "ibnmajah-150"
  ]
 },
 "e04.main0": {
  "kind": "fact",
  "text": {
   "en": "Bilal ibn Rabah and the family of Yasir – Yasir, Sumayyah and their son ʿAmmar – were among the first to declare Islam openly and suffered terribly for it. Abu Bakr bought and freed Bilal and other enslaved believers.",
   "de": "Bilal ibn Rabah und die Familie von Yasir – Yasir, Sumayya und ihr Sohn Ammar – gehörten zu den Ersten, die den Islam offen bekannten, und litten schrecklich dafür. Abu Bakr kaufte Bilal und andere versklavte Gläubige frei.",
   "bs": "Bilal ibn Rebah i porodica Jasira – Jasir, Sumejja i njihov sin Ammar – bili su među prvima koji su javno ispovijedili islam i strašno su zbog toga patili. Ebu Bekr je otkupio i oslobodio Bilala i druge robove vjernike."
  },
  "sourceIds": [
   "ibnmajah-150",
   "ibn-hisham"
  ]
 },
 "e04.main1": {
  "kind": "interpretation",
  "text": {
   "en": "The biographical works report that Sumayyah was killed for her faith – the first martyr of Islam.",
   "de": "Die biografischen Werke berichten, dass Sumayya wegen ihres Glaubens getötet wurde – die erste Märtyrerin des Islam.",
   "bs": "Biografska djela prenose da je Sumejja ubijena zbog vjere – prvi šehid islama."
  },
  "sourceIds": [
   "ibn-sad"
  ]
 },
 "e04.main2": {
  "kind": "fact",
  "text": {
   "en": "Around 615 CE a group of Muslims migrated to Abyssinia, where the Christian king al-Najashi gave them protection and refused to hand them back to Quraysh.",
   "de": "Um 615 n. Chr. wanderte eine Gruppe von Muslimen nach Abessinien aus, wo der christliche König an-Nadschaschi ihnen Schutz gewährte und sich weigerte, sie an die Quraisch auszuliefern.",
   "bs": "Oko 615. godine skupina muslimana iselila je u Abesiniju, gdje im je kršćanski kralj Nedžaši pružio zaštitu i odbio ih izručiti Kurejšijama."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e04.main3": {
  "kind": "fact",
  "text": {
   "en": "Quraysh then boycotted the clans of Hashim and al-Muttalib for about three years. Soon after it ended, Abu Talib and Khadijah died. Seeking support, the Prophet ﷺ went to Taʾif and was rejected harshly – yet when offered the destruction of its people, he hoped instead that their descendants would worship Allah.",
   "de": "Danach boykottierten die Quraisch die Clans Haschim und al-Muttalib etwa drei Jahre lang. Kurz nach dem Ende starben Abu Talib und Chadidscha. Auf der Suche nach Unterstützung ging der Prophet ﷺ nach Taif und wurde hart abgewiesen – doch als man ihm die Vernichtung der Leute anbot, hoffte er stattdessen, dass ihre Nachkommen Allah anbeten würden.",
   "bs": "Kurejšije su zatim oko tri godine bojkotovali rodove Hašim i el-Muttalib. Ubrzo nakon kraja bojkota umrli su Ebu Talib i Hatidža. Tražeći podršku, Poslanik ﷺ je otišao u Taif i bio grubo odbijen – a kada mu je ponuđeno uništenje tih ljudi, nadao se da će njihovi potomci obožavati Allaha."
  },
  "sourceIds": [
   "ibn-hisham",
   "bukhari-3231"
  ]
 },
 "e04.main4": {
  "kind": "fact",
  "text": {
   "en": "In this difficult period took place the Night Journey (al-Israʾ), mentioned in the Quran, and the Ascension, in which the five daily prayers were prescribed.",
   "de": "In diese schwere Zeit fiel die Nachtreise (al-Isra), die im Koran erwähnt wird, und die Himmelfahrt, bei der die fünf täglichen Gebete vorgeschrieben wurden.",
   "bs": "U ovom teškom periodu desilo se Noćno putovanje (Isra), spomenuto u Kur'anu, i Uzašašće, na kojem je propisano pet dnevnih namaza."
  },
  "sourceIds": [
   "q-17-1",
   "ibn-hisham"
  ]
 },
 "e04.main5": {
  "kind": "interpretation",
  "text": {
   "en": "The exact date of al-Israʾ and al-Miʿraj is disputed; the sources place it before the Hijrah but give different years.",
   "de": "Das genaue Datum von al-Isra und al-Miʿradsch ist umstritten; die Quellen setzen es vor die Hidschra, nennen aber unterschiedliche Jahre.",
   "bs": "Tačan datum Isra i Miradža je sporan; izvori ga smještaju prije Hidžre, ali navode različite godine."
  },
  "sourceIds": [
   "ibn-kathir"
  ]
 },
 "e04.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "Bilal, Sumayyah and others held on to their faith when they had nothing else. The Quran promises: with hardship comes ease.",
   "de": "Bilal, Sumayya und andere hielten an ihrem Glauben fest, als sie nichts anderes hatten. Der Koran verspricht: Mit der Erschwernis kommt Erleichterung.",
   "bs": "Bilal, Sumejja i drugi ustrajali su u vjeri kada nisu imali ništa drugo. Kur'an obećava: s teškoćom dolazi olakšanje."
  },
  "title": {
   "en": "Steadfastness under pressure",
   "de": "Standhaftigkeit unter Druck",
   "bs": "Postojanost pod pritiskom"
  },
  "sourceIds": []
 },
 "e04.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "A Christian king protected the persecuted Muslims because he was just. Fairness deserves recognition wherever it is found.",
   "de": "Ein christlicher König schützte die verfolgten Muslime, weil er gerecht war. Gerechtigkeit verdient Anerkennung, wo immer man sie findet.",
   "bs": "Kršćanski kralj zaštitio je progonjene muslimane jer je bio pravedan. Pravednost zaslužuje priznanje gdje god se nađe."
  },
  "title": {
   "en": "Justice can come from unexpected places",
   "de": "Gerechtigkeit kann von unerwarteter Seite kommen",
   "bs": "Pravda može doći s neočekivane strane"
  },
  "sourceIds": []
 },
 "e04.lesson2": {
  "kind": "reflection",
  "text": {
   "en": "At Taʾif the Prophet ﷺ chose hope and mercy over revenge.",
   "de": "In Taif wählte der Prophet ﷺ Hoffnung und Barmherzigkeit statt Rache.",
   "bs": "U Taifu je Poslanik ﷺ izabrao nadu i milost umjesto osvete."
  },
  "title": {
   "en": "Mercy after rejection",
   "de": "Barmherzigkeit nach Ablehnung",
   "bs": "Milost nakon odbacivanja"
  },
  "sourceIds": []
 },
 "e05.ctx0": {
  "kind": "fact",
  "text": {
   "en": "At two pilgrimage seasons, people from Yathrib accepted Islam and pledged at al-ʿAqabah to protect the Prophet ﷺ. Musʿab ibn ʿUmayr was sent to teach them, and Islam spread among the Aws and Khazraj.",
   "de": "In zwei Pilgerzeiten nahmen Menschen aus Yathrib den Islam an und leisteten in al-Aqaba den Eid, den Propheten ﷺ zu schützen. Musʿab ibn Umair wurde geschickt, um sie zu unterrichten, und der Islam verbreitete sich unter den Aus und Chazradsch.",
   "bs": "Tokom dvije hadžske sezone ljudi iz Jesriba primili su islam i na Akabi se zakleli da će štititi Poslanika ﷺ. Mus'ab ibn Umejr poslan je da ih podučava, i islam se proširio među Evsom i Hazredžom."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e05.ctx1": {
  "kind": "fact",
  "text": {
   "en": "The Muslims of Makkah then left for Yathrib in small groups. The Quran mentions that Quraysh plotted to imprison, kill or expel the Prophet ﷺ.",
   "de": "Die Muslime Mekkas zogen daraufhin in kleinen Gruppen nach Yathrib. Der Koran erwähnt, dass die Quraisch planten, den Propheten ﷺ einzusperren, zu töten oder zu vertreiben.",
   "bs": "Mekanski muslimani su potom u malim skupinama odlazili u Jesrib. Kur'an spominje da su Kurejšije kovali zavjeru da Poslanika ﷺ zatvore, ubiju ili protjeraju."
  },
  "sourceIds": [
   "q-8-30",
   "ibn-hisham"
  ]
 },
 "e05.main0": {
  "kind": "fact",
  "text": {
   "en": "ʿAʾishah reported that the Prophet ﷺ came to Abu Bakr's house at an unusual hour to tell him that permission to emigrate had come. Abu Bakr had prepared two camels. They hired a guide who knew the routes, and left Makkah secretly.",
   "de": "Aischa berichtete, dass der Prophet ﷺ zu ungewöhnlicher Stunde zu Abu Bakrs Haus kam, um ihm mitzuteilen, dass die Erlaubnis zur Auswanderung gekommen sei. Abu Bakr hatte zwei Kamele vorbereitet. Sie heuerten einen ortskundigen Führer an und verließen Mekka heimlich.",
   "bs": "Aiša je prenijela da je Poslanik ﷺ došao u Ebu Bekrovu kuću u neuobičajeno vrijeme da mu kaže da je stigla dozvola za iseljenje. Ebu Bekr je bio pripremio dvije deve. Unajmili su vodiča koji je poznavao puteve i tajno napustili Mekku."
  },
  "sourceIds": [
   "bukhari-3905"
  ]
 },
 "e05.main1": {
  "kind": "fact",
  "text": {
   "en": "They hid for three nights in the Cave of Thawr, south of Makkah. When the searchers came close, Abu Bakr was afraid, and the Prophet ﷺ reassured him: \"Do not grieve; Allah is with us.\" The Quran mentions this moment.",
   "de": "Sie versteckten sich drei Nächte in der Höhle Thaur südlich von Mekka. Als die Verfolger nahe kamen, hatte Abu Bakr Angst, und der Prophet ﷺ beruhigte ihn: „Sei nicht traurig; Allah ist mit uns.“ Der Koran erwähnt diesen Moment.",
   "bs": "Tri noći su se skrivali u pećini Sevr, južno od Mekke. Kada su se tragači približili, Ebu Bekr se uplašio, a Poslanik ﷺ ga je umirio: „Ne brini, Allah je s nama.“ Kur'an spominje taj trenutak."
  },
  "sourceIds": [
   "q-9-40",
   "bukhari-3653"
  ]
 },
 "e05.main2": {
  "kind": "fact",
  "text": {
   "en": "Abu Bakr's son ʿAbdullah brought them news from Makkah each night, and his freed man ʿAmir ibn Fuhayrah grazed sheep nearby and brought them milk. Then they travelled with their guide towards Madinah.",
   "de": "Abu Bakrs Sohn Abdullah brachte ihnen jede Nacht Neuigkeiten aus Mekka, und sein Freigelassener Amir ibn Fuhaira weidete in der Nähe Schafe und brachte ihnen Milch. Dann reisten sie mit ihrem Führer Richtung Medina.",
   "bs": "Ebu Bekrov sin Abdullah donosio im je svake noći vijesti iz Mekke, a njegov oslobođenik Amir ibn Fuhejra napasao je ovce u blizini i donosio im mlijeko. Zatim su s vodičem putovali prema Medini."
  },
  "sourceIds": [
   "bukhari-3905"
  ]
 },
 "e05.main3": {
  "kind": "fact",
  "text": {
   "en": "The Muslims of Madinah had gone out every morning to wait for him. He arrived at Quba, stayed there some days, and then entered the city. Yathrib became al-Madinah.",
   "de": "Die Muslime Medinas waren jeden Morgen hinausgegangen, um auf ihn zu warten. Er kam in Quba an, blieb dort einige Tage und zog dann in die Stadt ein. Aus Yathrib wurde al-Madina.",
   "bs": "Muslimani Medine izlazili su svako jutro da ga čekaju. Stigao je u Kubu, ostao tu nekoliko dana, a zatim ušao u grad. Jesrib je postao el-Medina."
  },
  "sourceIds": [
   "bukhari-3905"
  ]
 },
 "e05.main4": {
  "kind": "interpretation",
  "text": {
   "en": "The exact route is not fully known. The sources describe an unusual path towards the coast; any line on a map is an approximation.",
   "de": "Der genaue Weg ist nicht vollständig bekannt. Die Quellen beschreiben einen ungewöhnlichen Weg Richtung Küste; jede Linie auf einer Karte ist eine Annäherung.",
   "bs": "Tačan put nije u potpunosti poznat. Izvori opisuju neuobičajen put prema obali; svaka linija na mapi samo je približna."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e05.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "Camels, a guide, a hiding place, news and provisions: the Hijrah was carefully prepared – and in the cave, the Prophet ﷺ placed his trust in Allah.",
   "de": "Kamele, ein Führer, ein Versteck, Nachrichten und Verpflegung: Die Hidschra war sorgfältig vorbereitet – und in der Höhle setzte der Prophet ﷺ sein Vertrauen auf Allah.",
   "bs": "Deve, vodič, skrovište, vijesti i opskrba: Hidžra je bila pažljivo pripremljena – a u pećini se Poslanik ﷺ oslonio na Allaha."
  },
  "title": {
   "en": "Plan carefully, then trust Allah",
   "de": "Sorgfältig planen, dann Allah vertrauen",
   "bs": "Pažljivo planiraj, a zatim se osloni na Allaha"
  },
  "sourceIds": []
 },
 "e05.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "ʿAli, Abu Bakr's children, a freed man and a hired guide all contributed. Great events are carried by many people.",
   "de": "Ali, Abu Bakrs Kinder, ein Freigelassener und ein angeheuerter Führer trugen alle bei. Große Ereignisse werden von vielen Menschen getragen.",
   "bs": "Alija, Ebu Bekrova djeca, oslobođenik i unajmljeni vodič – svi su doprinijeli. Velike događaje nose mnogi ljudi."
  },
  "title": {
   "en": "Everyone had a role",
   "de": "Jeder hatte eine Aufgabe",
   "bs": "Svako je imao ulogu"
  },
  "sourceIds": []
 },
 "e06.ctx0": {
  "kind": "fact",
  "text": {
   "en": "Madinah was an oasis of farms and palm groves. Its Arab tribes, the Aws and Khazraj, had a history of conflict, and several Jewish tribes lived there as well.",
   "de": "Medina war eine Oase mit Feldern und Palmenhainen. Ihre arabischen Stämme, die Aus und Chazradsch, hatten eine Geschichte von Konflikten, und auch mehrere jüdische Stämme lebten dort.",
   "bs": "Medina je bila oaza njiva i palminih gajeva. Njena arapska plemena, Evs i Hazredž, imala su historiju sukoba, a tu je živjelo i nekoliko jevrejskih plemena."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e06.main0": {
  "kind": "fact",
  "text": {
   "en": "The first project was a mosque. The land was bought from two orphans, and the Prophet ﷺ carried bricks alongside his companions. The mosque became the place of prayer, teaching, consultation and care for the poor.",
   "de": "Das erste Vorhaben war eine Moschee. Das Land wurde von zwei Waisen gekauft, und der Prophet ﷺ trug zusammen mit seinen Gefährten Lehmziegel. Die Moschee wurde zum Ort des Gebets, des Unterrichts, der Beratung und der Fürsorge für die Armen.",
   "bs": "Prvi projekat bio je mesdžid. Zemljište je kupljeno od dvoje siročadi, a Poslanik ﷺ je zajedno s ashabima nosio cigle. Mesdžid je postao mjesto namaza, poučavanja, dogovaranja i brige o siromašnima."
  },
  "sourceIds": [
   "bukhari-428"
  ]
 },
 "e06.main1": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ joined emigrants and helpers in pairs of brotherhood. The Ansar shared their homes and wealth; the Quran praises them for giving preference to others even when they themselves were in need.",
   "de": "Der Prophet ﷺ verband Auswanderer und Helfer paarweise zu Brüdern. Die Ansar teilten ihre Häuser und ihren Besitz; der Koran lobt sie dafür, andere zu bevorzugen, selbst wenn sie selbst bedürftig waren.",
   "bs": "Poslanik ﷺ je muhadžire i ensarije povezao u parove bratstva. Ensarije su dijelili domove i imetak; Kur'an ih hvali što su druge pretpostavljali sebi čak i kada su sami bili u potrebi."
  },
  "sourceIds": [
   "q-59-9",
   "ibn-hisham"
  ]
 },
 "e06.main2": {
  "kind": "fact",
  "text": {
   "en": "A written agreement regulated relations between the emigrants, the Ansar and the Jewish tribes, including the joint defence of Madinah.",
   "de": "Eine schriftliche Vereinbarung regelte die Beziehungen zwischen Auswanderern, Ansar und jüdischen Stämmen, einschließlich der gemeinsamen Verteidigung Medinas.",
   "bs": "Pisani sporazum uredio je odnose između muhadžira, ensarija i jevrejskih plemena, uključujući zajedničku odbranu Medine."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e06.main3": {
  "kind": "interpretation",
  "text": {
   "en": "This text is often called the \"Constitution of Madinah\". Historians discuss whether it was one document or several agreements over time.",
   "de": "Dieser Text wird oft „Verfassung von Medina“ genannt. Historiker diskutieren, ob es ein Dokument oder mehrere Vereinbarungen über die Zeit war.",
   "bs": "Ovaj tekst se često naziva „Medinski ustav“. Historičari raspravljaju je li to bio jedan dokument ili više sporazuma tokom vremena."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e06.main4": {
  "kind": "fact",
  "text": {
   "en": "Sixteen or seventeen months after the Hijrah, the qiblah was changed from Jerusalem to the Kaʿbah in Makkah.",
   "de": "Sechzehn oder siebzehn Monate nach der Hidschra wurde die Gebetsrichtung von Jerusalem zur Kaaba in Mekka geändert.",
   "bs": "Šesnaest ili sedamnaest mjeseci nakon Hidžre kibla je promijenjena s Jerusalema na Kabu u Mekki."
  },
  "sourceIds": [
   "bukhari-40",
   "q-2-144"
  ]
 },
 "e06.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "The mosque came first – a shared place for worship, learning and caring for one another.",
   "de": "Zuerst kam die Moschee – ein gemeinsamer Ort für Gebet, Lernen und Fürsorge füreinander.",
   "bs": "Najprije je došao mesdžid – zajedničko mjesto za ibadet, učenje i brigu jednih o drugima."
  },
  "title": {
   "en": "A community needs a centre",
   "de": "Eine Gemeinschaft braucht ein Zentrum",
   "bs": "Zajednici je potrebno središte"
  },
  "sourceIds": []
 },
 "e06.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "The Ansar did not only welcome the emigrants with words; they shared homes, work and wealth. The Quran calls the believers brothers.",
   "de": "Die Ansar begrüßten die Auswanderer nicht nur mit Worten; sie teilten Häuser, Arbeit und Besitz. Der Koran nennt die Gläubigen Brüder.",
   "bs": "Ensarije nisu muhadžire dočekali samo riječima; dijelili su domove, posao i imetak. Kur'an vjernike naziva braćom."
  },
  "title": {
   "en": "Brotherhood is practical",
   "de": "Geschwisterlichkeit ist praktisch",
   "bs": "Bratstvo je praktično"
  },
  "sourceIds": []
 },
 "e06.lesson2": {
  "kind": "reflection",
  "text": {
   "en": "A written agreement gave different groups clear rights and duties in one city.",
   "de": "Eine schriftliche Vereinbarung gab verschiedenen Gruppen in einer Stadt klare Rechte und Pflichten.",
   "bs": "Pisani sporazum dao je različitim skupinama u jednom gradu jasna prava i obaveze."
  },
  "title": {
   "en": "Agreements create trust",
   "de": "Vereinbarungen schaffen Vertrauen",
   "bs": "Sporazumi grade povjerenje"
  },
  "sourceIds": []
 },
 "e07.ctx0": {
  "kind": "fact",
  "text": {
   "en": "The emigrants had lost their homes and property in Makkah, and Quraysh remained hostile. In Ramadan 2 AH, news came of a large Quraysh caravan returning from Syria under Abu Sufyan.",
   "de": "Die Auswanderer hatten ihre Häuser und ihren Besitz in Mekka verloren, und die Quraisch blieben feindlich. Im Ramadan 2 n. H. kam die Nachricht von einer großen Karawane der Quraisch, die unter Abu Sufyan aus Syrien zurückkehrte.",
   "bs": "Muhadžiri su u Mekki izgubili domove i imetak, a Kurejšije su ostali neprijateljski raspoloženi. U ramazanu 2. godine po H. stigla je vijest o velikom kurejšijskom karavanu koji se pod vodstvom Ebu Sufjana vraćao iz Šama."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e07.main0": {
  "kind": "fact",
  "text": {
   "en": "The caravan escaped along the coast, but Quraysh had already sent out an army. At the wells of Badr, about a thousand Quraysh fighters faced a little over three hundred Muslims.",
   "de": "Die Karawane entkam entlang der Küste, doch die Quraisch hatten bereits ein Heer ausgesandt. An den Brunnen von Badr standen etwa tausend Kämpfer der Quraisch etwas über dreihundert Muslimen gegenüber.",
   "bs": "Karavan je umakao uz obalu, ali Kurejšije su već bili poslali vojsku. Kod bunara Bedra oko hiljadu kurejšijskih boraca stajalo je naspram nešto više od tri stotine muslimana."
  },
  "sourceIds": [
   "muslim-1763",
   "ibn-hisham"
  ]
 },
 "e07.main1": {
  "kind": "interpretation",
  "text": {
   "en": "The Seerah works report that the Prophet ﷺ consulted his companions before the battle, and that the Ansar declared they would stand with him.",
   "de": "Die Sira-Werke berichten, dass der Prophet ﷺ sich vor der Schlacht mit seinen Gefährten beriet und die Ansar erklärten, an seiner Seite zu stehen.",
   "bs": "Djela sire prenose da se Poslanik ﷺ prije bitke savjetovao s ashabima i da su ensarije izjavili da će stati uz njega."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e07.main2": {
  "kind": "fact",
  "text": {
   "en": "ʿUmar reported that the Prophet ﷺ faced the qiblah and called on his Lord at length, asking Him to fulfil His promise. The Quran mentions that Allah answered by sending the angels in support.",
   "de": "Umar berichtete, dass der Prophet ﷺ sich zur Qibla wandte und lange zu seinem Herrn flehte, Er möge Sein Versprechen erfüllen. Der Koran erwähnt, dass Allah darauf antwortete, indem Er die Engel zur Unterstützung sandte.",
   "bs": "Omer je prenio da se Poslanik ﷺ okrenuo prema kibli i dugo molio Gospodara da ispuni Svoje obećanje. Kur'an spominje da mu je Allah odgovorio poslavši meleke u pomoć."
  },
  "sourceIds": [
   "muslim-1763",
   "q-8-9"
  ]
 },
 "e07.main3": {
  "kind": "fact",
  "text": {
   "en": "The Muslims won. Among the Quraysh leaders killed was Abu Jahl. The Quran calls the day the \"Day of the Criterion\" and reminds the believers that they were few when Allah gave them victory.",
   "de": "Die Muslime siegten. Unter den getöteten Anführern der Quraisch war Abu Dschahl. Der Koran nennt den Tag „Tag der Unterscheidung“ und erinnert die Gläubigen daran, dass sie wenige waren, als Allah ihnen den Sieg gab.",
   "bs": "Muslimani su pobijedili. Među ubijenim kurejšijskim prvacima bio je Ebu Džehl. Kur'an taj dan naziva „Danom razlučivanja“ i podsjeća vjernike da ih je bilo malo kada im je Allah dao pobjedu."
  },
  "sourceIds": [
   "q-8-41",
   "q-3-123",
   "ibn-hisham"
  ]
 },
 "e07.main4": {
  "kind": "fact",
  "text": {
   "en": "A year later, at Uhud, Quraysh returned with a larger army. Archers left the hill they had been ordered to hold, and the Muslims suffered heavy losses, among them Hamzah. The Quran reflects on that day as a test.",
   "de": "Ein Jahr später, bei Uhud, kehrten die Quraisch mit einem größeren Heer zurück. Bogenschützen verließen den Hügel, den sie halten sollten, und die Muslime erlitten schwere Verluste, darunter Hamza. Der Koran deutet jenen Tag als Prüfung.",
   "bs": "Godinu kasnije, na Uhudu, Kurejšije su se vratili s većom vojskom. Strijelci su napustili brežuljak koji su trebali čuvati, a muslimani su pretrpjeli teške gubitke, među njima i Hamzu. Kur'an o tom danu govori kao o iskušenju."
  },
  "sourceIds": [
   "bukhari-3039",
   "q-3-152"
  ]
 },
 "e07.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "The Quran reminds the believers that they were few at Badr. Sincerity, unity and reliance on Allah mattered more than size.",
   "de": "Der Koran erinnert die Gläubigen daran, dass sie bei Badr wenige waren. Aufrichtigkeit, Einheit und Vertrauen auf Allah zählten mehr als Größe.",
   "bs": "Kur'an podsjeća vjernike da ih je na Bedru bilo malo. Iskrenost, jedinstvo i oslanjanje na Allaha značili su više od brojnosti."
  },
  "title": {
   "en": "Numbers are not everything",
   "de": "Zahlen sind nicht alles",
   "bs": "Brojevi nisu sve"
  },
  "sourceIds": []
 },
 "e07.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "Before the battle there was both consultation with the companions and long prayer to Allah – planning and trust side by side.",
   "de": "Vor der Schlacht gab es sowohl Beratung mit den Gefährten als auch langes Gebet zu Allah – Planung und Vertrauen Seite an Seite.",
   "bs": "Prije bitke bilo je i dogovaranja s ashabima i duge dove Allahu – planiranje i oslanjanje jedno uz drugo."
  },
  "title": {
   "en": "Consultation and duʿaʾ together",
   "de": "Beratung und Bittgebet zusammen",
   "bs": "Dogovor i dova zajedno"
  },
  "sourceIds": []
 },
 "e07.lesson2": {
  "kind": "reflection",
  "text": {
   "en": "Uhud showed that disobeying a clear instruction can turn success into loss. Discipline matters most when things seem to be going well.",
   "de": "Uhud zeigte, dass das Missachten einer klaren Anweisung Erfolg in Verlust verwandeln kann. Disziplin zählt am meisten, wenn alles gut zu laufen scheint.",
   "bs": "Uhud je pokazao da neposlušnost jasnoj uputi može uspjeh pretvoriti u gubitak. Disciplina je najvažnija kada se čini da sve ide dobro."
  },
  "title": {
   "en": "Victory is a responsibility",
   "de": "Sieg ist eine Verantwortung",
   "bs": "Pobjeda je odgovornost"
  },
  "sourceIds": []
 },
 "e08.ctx0": {
  "kind": "fact",
  "text": {
   "en": "After years of war, including the siege of Madinah at the Battle of the Trench, the Prophet ﷺ set out in 6 AH with around fourteen hundred companions in the clothing of pilgrims, bringing sacrificial animals, to visit the Kaʿbah.",
   "de": "Nach Jahren des Krieges, darunter die Belagerung Medinas in der Grabenschlacht, brach der Prophet ﷺ im Jahr 6 n. H. mit rund vierzehnhundert Gefährten im Pilgergewand und mit Opfertieren auf, um die Kaaba zu besuchen.",
   "bs": "Nakon godina rata, uključujući opsadu Medine u Bitki na Hendeku, Poslanik ﷺ je 6. godine po H. krenuo s oko hiljadu i četiri stotine ashaba u hodočasničkoj odjeći, s kurbanima, da posjeti Kabu."
  },
  "sourceIds": [
   "bukhari-2731",
   "ibn-hisham",
   "q-33-9"
  ]
 },
 "e08.main0": {
  "kind": "fact",
  "text": {
   "en": "Quraysh would not let them enter Makkah. The Muslims camped at al-Hudaybiyyah. ʿUthman ibn ʿAffan was sent as an envoy, and when a rumour spread that he had been killed, the companions pledged themselves to the Prophet ﷺ under a tree. The Quran says that Allah was pleased with the believers when they pledged under the tree.",
   "de": "Die Quraisch ließen sie nicht nach Mekka. Die Muslime lagerten in al-Hudaibiya. Uthman ibn Affan wurde als Gesandter geschickt, und als das Gerücht aufkam, er sei getötet worden, leisteten die Gefährten dem Propheten ﷺ unter einem Baum den Treueeid. Der Koran sagt, dass Allah mit den Gläubigen zufrieden war, als sie unter dem Baum den Eid leisteten.",
   "bs": "Kurejšije ih nisu htjeli pustiti u Mekku. Muslimani su se utaborili na Hudejbiji. Osman ibn Affan poslan je kao izaslanik, a kada se pronijela glasina da je ubijen, ashabi su Poslaniku ﷺ dali prisegu ispod drveta. Kur'an kaže da je Allah bio zadovoljan vjernicima kada su se zakleli ispod drveta."
  },
  "sourceIds": [
   "q-48-18",
   "ibn-hisham"
  ]
 },
 "e08.main1": {
  "kind": "fact",
  "text": {
   "en": "Suhayl ibn ʿAmr came to negotiate for Quraysh. He objected to opening with \"In the name of Allah, the Most Merciful\" and to \"Muhammad, the Messenger of Allah\"; the Prophet ﷺ agreed to \"In Your name, O Allah\" and \"Muhammad ibn ʿAbdullah\".",
   "de": "Suhail ibn Amr kam, um für die Quraisch zu verhandeln. Er widersprach der Einleitung „Im Namen Allahs, des Allerbarmers“ und den Worten „Muhammad, der Gesandte Allahs“; der Prophet ﷺ stimmte „In Deinem Namen, o Allah“ und „Muhammad ibn Abdullah“ zu.",
   "bs": "Suhejl ibn Amr došao je da pregovara u ime Kurejšija. Usprotivio se uvodu „U ime Allaha, Milostivog“ i riječima „Muhammed, Allahov Poslanik“; Poslanik ﷺ je pristao na „U Tvoje ime, Allahu“ i „Muhammed ibn Abdullah“."
  },
  "sourceIds": [
   "bukhari-2731"
  ]
 },
 "e08.main2": {
  "kind": "fact",
  "text": {
   "en": "The terms: a truce of ten years; the Muslims would return that year and come for ʿUmrah the next; anyone from Quraysh who came to the Muslims without permission would be returned, but not the other way round. Many companions, including ʿUmar, found the terms very hard.",
   "de": "Die Bedingungen: ein Waffenstillstand von zehn Jahren; die Muslime kehren dieses Jahr zurück und kommen im nächsten zur Umra; wer von den Quraisch ohne Erlaubnis zu den Muslimen kommt, wird zurückgeschickt, aber nicht umgekehrt. Viele Gefährten, darunter Umar, empfanden die Bedingungen als sehr hart.",
   "bs": "Uslovi: primirje od deset godina; muslimani se te godine vraćaju i dolaze na umru sljedeće; ko od Kurejšija dođe muslimanima bez dozvole, biva vraćen, ali ne i obrnuto. Mnogim ashabima, među njima i Omeru, uslovi su bili veoma teški."
  },
  "sourceIds": [
   "bukhari-2731",
   "ibn-hisham"
  ]
 },
 "e08.main3": {
  "kind": "fact",
  "text": {
   "en": "When the Prophet ﷺ told the companions to sacrifice their animals and shave their heads, they hesitated. On the advice of Umm Salamah, he did it himself first – and they all followed.",
   "de": "Als der Prophet ﷺ die Gefährten aufforderte, ihre Tiere zu opfern und sich die Köpfe zu scheren, zögerten sie. Auf den Rat von Umm Salama tat er es selbst zuerst – und alle folgten.",
   "bs": "Kada je Poslanik ﷺ rekao ashabima da zakolju kurbane i obriju glave, oklijevali su. Po savjetu Ummu Seleme on je to prvi učinio – i svi su ga slijedili."
  },
  "sourceIds": [
   "bukhari-2731"
  ]
 },
 "e08.main4": {
  "kind": "fact",
  "text": {
   "en": "On the way back, Surah al-Fath was revealed: \"Indeed, We have given you a clear victory.\"",
   "de": "Auf dem Rückweg wurde Sure al-Fath offenbart: „Wir haben dir einen deutlichen Sieg gegeben.“",
   "bs": "Na povratku je objavljena sura el-Feth: „Mi smo ti, zaista, jasnu pobjedu dali.“"
  },
  "sourceIds": [
   "q-48-1"
  ]
 },
 "e08.main5": {
  "kind": "interpretation",
  "text": {
   "en": "Historians point out that during the truce many more people accepted Islam than before, as people could travel and meet freely – one reason the treaty is seen as an opening.",
   "de": "Historiker weisen darauf hin, dass während des Waffenstillstands viel mehr Menschen den Islam annahmen als zuvor, weil man frei reisen und sich begegnen konnte – ein Grund, warum der Vertrag als Öffnung gilt.",
   "bs": "Historičari ističu da je tokom primirja islam primilo mnogo više ljudi nego ranije, jer su ljudi mogli slobodno putovati i susretati se – jedan od razloga zašto se ugovor smatra otvaranjem."
  },
  "sourceIds": [
   "zad",
   "ibn-kathir"
  ]
 },
 "e08.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "What seemed like giving in was called a clear victory. Patience allows us to see further than the moment.",
   "de": "Was wie Nachgeben aussah, wurde ein deutlicher Sieg genannt. Geduld lässt uns weiter sehen als den Augenblick.",
   "bs": "Ono što je izgledalo kao popuštanje nazvano je jasnom pobjedom. Strpljenje nam omogućava da vidimo dalje od trenutka."
  },
  "title": {
   "en": "Not every victory looks like one",
   "de": "Nicht jeder Sieg sieht wie einer aus",
   "bs": "Svaka pobjeda ne izgleda kao pobjeda"
  },
  "sourceIds": []
 },
 "e08.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "The Muslims kept the terms of the treaty even when they were painful.",
   "de": "Die Muslime hielten die Bedingungen des Vertrags ein, auch als sie schmerzhaft waren.",
   "bs": "Muslimani su poštovali uslove ugovora čak i kada su bili bolni."
  },
  "title": {
   "en": "Keep your agreements",
   "de": "Halte deine Vereinbarungen",
   "bs": "Drži se dogovora"
  },
  "sourceIds": []
 },
 "e08.lesson2": {
  "kind": "reflection",
  "text": {
   "en": "When words were not enough, the Prophet ﷺ acted first – and wise advice from Umm Salamah showed the way.",
   "de": "Als Worte nicht genügten, handelte der Prophet ﷺ zuerst – und ein weiser Rat von Umm Salama wies den Weg.",
   "bs": "Kada riječi nisu bile dovoljne, Poslanik ﷺ je prvi djelovao – a mudar savjet Ummu Seleme pokazao je put."
  },
  "title": {
   "en": "Lead by example",
   "de": "Mit gutem Beispiel vorangehen",
   "bs": "Predvodi primjerom"
  },
  "sourceIds": []
 },
 "e09.ctx0": {
  "kind": "fact",
  "text": {
   "en": "The truce of al-Hudaybiyyah was broken when allies of Quraysh attacked a tribe allied with the Muslims. The Prophet ﷺ then set out for Makkah with a large army in Ramadan 8 AH.",
   "de": "Der Waffenstillstand von al-Hudaibiya wurde gebrochen, als Verbündete der Quraisch einen mit den Muslimen verbündeten Stamm angriffen. Daraufhin brach der Prophet ﷺ im Ramadan 8 n. H. mit einem großen Heer nach Mekka auf.",
   "bs": "Primirje s Hudejbije prekršeno je kada su saveznici Kurejšija napali pleme savezničko muslimanima. Poslanik ﷺ je tada u ramazanu 8. godine po H. krenuo na Mekku s velikom vojskom."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e09.main0": {
  "kind": "fact",
  "text": {
   "en": "Abu Sufyan, the leader of Quraysh, came out, met the Prophet ﷺ and accepted Islam. It was announced that whoever entered Abu Sufyan's house would be safe, whoever laid down their weapons would be safe, and whoever closed their door would be safe.",
   "de": "Abu Sufyan, der Anführer der Quraisch, kam heraus, traf den Propheten ﷺ und nahm den Islam an. Es wurde verkündet: Wer das Haus von Abu Sufyan betritt, ist sicher; wer seine Waffen niederlegt, ist sicher; und wer seine Tür schließt, ist sicher.",
   "bs": "Ebu Sufjan, vođa Kurejšija, izašao je, sreo Poslanika ﷺ i primio islam. Objavljeno je: ko uđe u kuću Ebu Sufjana – siguran je; ko odloži oružje – siguran je; i ko zatvori svoja vrata – siguran je."
  },
  "sourceIds": [
   "muslim-1780",
   "ibn-hisham"
  ]
 },
 "e09.main1": {
  "kind": "fact",
  "text": {
   "en": "The city was entered with very little fighting. At the Kaʿbah, the Prophet ﷺ struck down the idols around it while reciting: \"Truth has come and falsehood has vanished.\"",
   "de": "Die Stadt wurde fast ohne Kampf betreten. An der Kaaba stieß der Prophet ﷺ die Götzen um sie herum um und rezitierte dabei: „Die Wahrheit ist gekommen, und das Falsche ist vergangen.“",
   "bs": "U grad se ušlo gotovo bez borbe. Kod Kabe je Poslanik ﷺ obarao kipove oko nje učeći: „Došla je Istina, a nestala je laž.“"
  },
  "sourceIds": [
   "bukhari-4287",
   "q-17-81"
  ]
 },
 "e09.main2": {
  "kind": "interpretation",
  "text": {
   "en": "The Seerah works report that he pardoned the people of Makkah in general, including many who had fought and harmed him. The often-quoted wording of this amnesty comes from Seerah collections, and scholars discuss the strength of its chains – while the forgiveness itself is widely accepted.",
   "de": "Die Sira-Werke berichten, dass er den Menschen Mekkas allgemein vergab, auch vielen, die ihn bekämpft und ihm geschadet hatten. Der oft zitierte Wortlaut dieser Amnestie stammt aus Sira-Sammlungen, und Gelehrte diskutieren die Stärke seiner Überlieferungsketten – die Vergebung selbst ist weithin anerkannt.",
   "bs": "Djela sire prenose da je općenito oprostio stanovnicima Mekke, uključujući mnoge koji su se borili protiv njega i nanosili mu zlo. Često citirana formulacija ove amnestije potječe iz zbirki sire, a učenjaci raspravljaju o jačini njenih lanaca – dok je sam oprost široko prihvaćen."
  },
  "sourceIds": [
   "ibn-hisham",
   "zad"
  ]
 },
 "e09.main3": {
  "kind": "interpretation",
  "text": {
   "en": "The Seerah sources also report that Bilal called the adhan from the roof of the Kaʿbah.",
   "de": "Die Sira-Quellen berichten auch, dass Bilal den Gebetsruf vom Dach der Kaaba rief.",
   "bs": "Izvori sire također prenose da je Bilal proučio ezan s krova Kabe."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "e09.main4": {
  "kind": "fact",
  "text": {
   "en": "Surah al-Nasr speaks of the help of Allah and the victory, and of people entering the religion of Allah in crowds – and commands glorification and seeking forgiveness.",
   "de": "Sure an-Nasr spricht von der Hilfe Allahs und dem Sieg und davon, dass die Menschen scharenweise in die Religion Allahs eintreten – und gebietet Lobpreis und Bitte um Vergebung.",
   "bs": "Sura en-Nasr govori o Allahovoj pomoći i pobjedi te o ljudima koji u skupinama ulaze u Allahovu vjeru – i naređuje veličanje i traženje oprosta."
  },
  "sourceIds": [
   "q-110"
  ]
 },
 "e09.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "He returned to the city that persecuted him and chose to forgive rather than take revenge.",
   "de": "Er kehrte in die Stadt zurück, die ihn verfolgt hatte, und entschied sich für Vergebung statt Rache.",
   "bs": "Vratio se u grad koji ga je progonio i izabrao oprost umjesto osvete."
  },
  "title": {
   "en": "Forgiveness in strength",
   "de": "Vergebung in der Stärke",
   "bs": "Oprost iz pozicije snage"
  },
  "sourceIds": []
 },
 "e09.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "Surah al-Nasr answers victory with glorifying Allah and seeking His forgiveness – not with pride.",
   "de": "Sure an-Nasr antwortet auf den Sieg mit Lobpreis Allahs und der Bitte um Seine Vergebung – nicht mit Stolz.",
   "bs": "Sura en-Nasr na pobjedu odgovara veličanjem Allaha i traženjem Njegovog oprosta – a ne ohološću."
  },
  "title": {
   "en": "Humility in victory",
   "de": "Demut im Sieg",
   "bs": "Poniznost u pobjedi"
  },
  "sourceIds": []
 },
 "e09.lesson2": {
  "kind": "reflection",
  "text": {
   "en": "Safety was offered even in the house of the former leader of the opposition – leaving room for people to change.",
   "de": "Sicherheit wurde sogar im Haus des früheren Anführers der Gegner angeboten – so blieb Raum, sich zu ändern.",
   "bs": "Sigurnost je ponuđena čak i u kući bivšeg vođe protivnika – ostavljajući ljudima prostor da se promijene."
  },
  "title": {
   "en": "Safety for everyone",
   "de": "Sicherheit für alle",
   "bs": "Sigurnost za sve"
  },
  "sourceIds": []
 },
 "e10.ctx0": {
  "kind": "fact",
  "text": {
   "en": "By 10 AH, most of Arabia had accepted Islam and delegations had come to Madinah from many tribes. The Prophet ﷺ announced that he would perform the Hajj, and people gathered from everywhere to accompany him.",
   "de": "Bis zum Jahr 10 n. H. hatte der größte Teil Arabiens den Islam angenommen, und Abordnungen vieler Stämme waren nach Medina gekommen. Der Prophet ﷺ kündigte an, den Haddsch zu vollziehen, und Menschen kamen von überall, um ihn zu begleiten.",
   "bs": "Do 10. godine po H. veći dio Arabije primio je islam, a u Medinu su dolazila izaslanstva mnogih plemena. Poslanik ﷺ je najavio da će obaviti hadž, i ljudi su se sa svih strana okupili da ga prate."
  },
  "sourceIds": [
   "muslim-1218",
   "ibn-hisham"
  ]
 },
 "e10.main0": {
  "kind": "fact",
  "text": {
   "en": "Jabir ibn ʿAbdillah described the Hajj step by step. At ʿArafat the Prophet ﷺ addressed the people: their blood and their property were sacred to one another; the blood feuds and usury of the time of ignorance were abolished; they should fear Allah regarding women; and he had left among them the Book of Allah – if they held fast to it, they would not go astray. He asked them to bear witness that he had conveyed the message.",
   "de": "Dschabir ibn Abdillah beschrieb den Haddsch Schritt für Schritt. In Arafat sprach der Prophet ﷺ zu den Menschen: Ihr Blut und ihr Besitz seien einander heilig; Blutrache und Wucher der Zeit der Unwissenheit seien abgeschafft; sie sollten Allah in Bezug auf die Frauen fürchten; und er habe ihnen das Buch Allahs hinterlassen – wenn sie daran festhielten, würden sie nicht in die Irre gehen. Er bat sie zu bezeugen, dass er die Botschaft übermittelt habe.",
   "bs": "Džabir ibn Abdullah opisao je hadž korak po korak. Na Arefatu se Poslanik ﷺ obratio ljudima: njihova krv i imetak su im međusobno sveti; krvna osveta i kamata iz doba neznanja su ukinuti; neka se boje Allaha kada je riječ o ženama; i ostavio im je Allahovu Knjigu – ako je se budu čvrsto držali, neće zalutati. Zamolio ih je da posvjedoče da je prenio poruku."
  },
  "sourceIds": [
   "muslim-1218"
  ]
 },
 "e10.main1": {
  "kind": "fact",
  "text": {
   "en": "On the day of ʿArafah, the verse was revealed: \"This day I have perfected for you your religion, completed My favour upon you and approved for you Islam as religion.\"",
   "de": "Am Tag von Arafa wurde der Vers offenbart: „Heute habe Ich euch eure Religion vervollkommnet, Meine Gnade an euch vollendet und euch den Islam als Religion erwählt.“",
   "bs": "Na Dan Arefata objavljen je ajet: „Danas sam vam vjeru vašu usavršio, blagodat Svoju prema vama upotpunio i zadovoljan sam da vam islam bude vjera.“"
  },
  "sourceIds": [
   "bukhari-45",
   "q-5-3"
  ]
 },
 "e10.main2": {
  "kind": "fact",
  "text": {
   "en": "A few months later, back in Madinah, he fell ill. He spent his last days in the room of ʿAʾishah and died there in Rabiʿ al-Awwal 11 AH, at about sixty-three years of age.",
   "de": "Einige Monate später erkrankte er in Medina. Seine letzten Tage verbrachte er im Zimmer von Aischa und starb dort im Rabiʿ al-Awwal 11 n. H., im Alter von etwa dreiundsechzig Jahren.",
   "bs": "Nekoliko mjeseci kasnije, nazad u Medini, razbolio se. Posljednje dane proveo je u Aišinoj sobi i tu umro u rebiul-evvelu 11. godine po H., u dobi od oko šezdeset i tri godine."
  },
  "sourceIds": [
   "bukhari-1241",
   "ibn-hisham"
  ]
 },
 "e10.main3": {
  "kind": "fact",
  "text": {
   "en": "Many could not believe the news. Abu Bakr spoke to the people: whoever worshipped Muhammad, Muhammad has died; whoever worships Allah, Allah is Ever-Living and does not die. Then he recited: \"Muhammad is no more than a messenger; messengers have passed away before him…\"",
   "de": "Viele konnten die Nachricht nicht glauben. Abu Bakr sprach zu den Menschen: Wer Muhammad anbetete – Muhammad ist gestorben; wer Allah anbetet – Allah ist lebendig und stirbt nicht. Dann rezitierte er: „Muhammad ist nur ein Gesandter; vor ihm sind schon Gesandte dahingegangen …“",
   "bs": "Mnogi nisu mogli povjerovati u vijest. Ebu Bekr se obratio ljudima: ko je obožavao Muhammeda – Muhammed je umro; a ko obožava Allaha – Allah je Živ i ne umire. Zatim je proučio: „Muhammed je samo poslanik, a i prije njega bilo je poslanika…“"
  },
  "sourceIds": [
   "bukhari-1241",
   "q-3-144"
  ]
 },
 "e10.main4": {
  "kind": "interpretation",
  "text": {
   "en": "The month, year and day of the week (Monday) of his death are established; the exact date within Rabiʿ al-Awwal differs between reports.",
   "de": "Monat, Jahr und Wochentag (Montag) seines Todes sind gesichert; das genaue Datum im Rabiʿ al-Awwal unterscheidet sich in den Berichten.",
   "bs": "Mjesec, godina i dan u sedmici (ponedjeljak) njegove smrti su potvrđeni; tačan datum u rebiul-evvelu razlikuje se u predajama."
  },
  "sourceIds": [
   "ibn-kathir"
  ]
 },
 "e10.lesson0": {
  "kind": "reflection",
  "text": {
   "en": "The Farewell Sermon emphasised life, property and honour, justice in dealings and kindness in the family.",
   "de": "Die Abschiedspredigt betonte Leben, Besitz und Ehre, Gerechtigkeit im Umgang und Güte in der Familie.",
   "bs": "Oprosna hutba naglasila je život, imetak i čast, pravednost u odnosima i dobrotu u porodici."
  },
  "title": {
   "en": "The sanctity of every person",
   "de": "Die Unantastbarkeit jedes Menschen",
   "bs": "Svetost svakog čovjeka"
  },
  "sourceIds": []
 },
 "e10.lesson1": {
  "kind": "reflection",
  "text": {
   "en": "Abu Bakr's words reminded the believers that the message continues after the messenger. The Quran and the example of the Prophet ﷺ remain.",
   "de": "Abu Bakrs Worte erinnerten die Gläubigen daran, dass die Botschaft über den Gesandten hinaus besteht. Der Koran und das Vorbild des Propheten ﷺ bleiben.",
   "bs": "Ebu Bekrove riječi podsjetile su vjernike da poruka traje i nakon poslanika. Kur'an i primjer Poslanika ﷺ ostaju."
  },
  "title": {
   "en": "Faith is in Allah, the Ever-Living",
   "de": "Der Glaube gilt Allah, dem Lebendigen",
   "bs": "Vjera je u Allaha, Živog"
  },
  "sourceIds": []
 },
 "ev.elephant.0": {
  "kind": "fact",
  "text": {
   "en": "An army with an elephant marched on Makkah to destroy the Kaʿbah and was turned back. Surah al-Fil recalls the event.",
   "de": "Ein Heer mit einem Elefanten zog gegen Mekka, um die Kaaba zu zerstören, und wurde zurückgeschlagen. Sure al-Fil erinnert an das Ereignis.",
   "bs": "Vojska sa slonom krenula je na Mekku da uništi Kabu i bila je odbijena. Sura el-Fil podsjeća na taj događaj."
  },
  "sourceIds": [
   "q-105"
  ]
 },
 "ev.elephant.1": {
  "kind": "interpretation",
  "text": {
   "en": "The Seerah sources name the leader as Abrahah, the Abyssinian ruler of Yemen, and place the Prophet's birth in the same year.",
   "de": "Die Sira-Quellen nennen als Anführer Abraha, den abessinischen Herrscher des Jemen, und setzen die Geburt des Propheten in dasselbe Jahr.",
   "bs": "Izvori sire navode da je vođa bio Ebreha, abesinijski vladar Jemena, i smještaju rođenje Poslanika u istu godinu."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.birth.0": {
  "kind": "fact",
  "text": {
   "en": "Muhammad ﷺ was born in Makkah into the clan of Hashim of Quraysh. His father ʿAbdullah had died before his birth.",
   "de": "Muhammad ﷺ wurde in Mekka im Clan Haschim der Quraisch geboren. Sein Vater Abdullah war vor seiner Geburt gestorben.",
   "bs": "Muhammed ﷺ je rođen u Mekki, u rodu Hašim plemena Kurejš. Njegov otac Abdullah umro je prije njegovog rođenja."
  },
  "sourceIds": [
   "ibn-hisham",
   "muslim-1162"
  ]
 },
 "ev.childhood.0": {
  "kind": "fact",
  "text": {
   "en": "He spent his early years with Halimah of Banu Saʿd in the desert. His mother Aminah died when he was about six, and his grandfather ʿAbd al-Muttalib about two years later; his uncle Abu Talib then took care of him.",
   "de": "Seine ersten Jahre verbrachte er bei Halima von den Banu Saʿd in der Wüste. Seine Mutter Amina starb, als er etwa sechs war, sein Großvater Abd al-Muttalib etwa zwei Jahre später; danach sorgte sein Onkel Abu Talib für ihn.",
   "bs": "Prve godine proveo je kod Halime iz Benu Sa'da u pustinji. Majka Amina umrla je kada je imao oko šest godina, a djed Abdul-Muttalib oko dvije godine kasnije; nakon toga brinuo se o njemu amidža Ebu Talib."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.childhood.1": {
  "kind": "fact",
  "text": {
   "en": "The Quran recalls: \"Did He not find you an orphan and give you shelter?\"",
   "de": "Der Koran erinnert: „Hat Er dich nicht als Waise gefunden und dir Zuflucht gegeben?“",
   "bs": "Kur'an podsjeća: „Zar te nije siročetom našao, pa ti utočište dao?“"
  },
  "sourceIds": [
   "q-93-6"
  ]
 },
 "ev.marriage.0": {
  "kind": "fact",
  "text": {
   "en": "Known in Makkah for his honesty, he worked as a trader – including on behalf of Khadijah – and then married her.",
   "de": "In Mekka für seine Ehrlichkeit bekannt, arbeitete er als Händler – auch im Auftrag von Chadidscha – und heiratete sie dann.",
   "bs": "Poznat u Mekki po poštenju, radio je kao trgovac – između ostalog za Hatidžu – a zatim se njome oženio."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.kaaba-rebuild.0": {
  "kind": "interpretation",
  "text": {
   "en": "According to the Seerah reports, the clans of Quraysh disputed who should put the Black Stone back in place. They agreed to accept the judgement of the next man to enter – who was Muhammad ﷺ. He placed the stone on a cloak, had a representative of each clan lift it together, and set it in place himself.",
   "de": "Nach den Sira-Berichten stritten die Clans der Quraisch darüber, wer den Schwarzen Stein wieder einsetzen dürfe. Sie einigten sich, das Urteil des nächsten Eintretenden anzunehmen – das war Muhammad ﷺ. Er legte den Stein auf ein Tuch, ließ es von Vertretern aller Clans gemeinsam anheben und setzte den Stein selbst ein.",
   "bs": "Prema predajama sire, kurejšijski rodovi su se sporili ko će vratiti Crni kamen na mjesto. Dogovorili su se da prihvate presudu prvog čovjeka koji uđe – a to je bio Muhammed ﷺ. Stavio je kamen na ogrtač, dao da ga predstavnici svih rodova zajedno podignu i sam ga postavio na mjesto."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.first-revelation.0": {
  "kind": "fact",
  "text": {
   "en": "While he was worshipping in the Cave of Hiraʾ, the angel Jibril came to him and the first verses of Surah al-ʿAlaq were revealed: \"Read in the name of your Lord who created…\"",
   "de": "Während er in der Höhle Hira betete, kam der Engel Dschibril zu ihm, und die ersten Verse der Sure al-Alaq wurden offenbart: „Lies im Namen deines Herrn, der erschaffen hat …“",
   "bs": "Dok je bio u ibadetu u pećini Hira, došao mu je melek Džibril i objavljeni su prvi ajeti sure el-Alek: „Čitaj, u ime Gospodara tvoga koji stvara…“"
  },
  "sourceIds": [
   "bukhari-3",
   "q-96-1"
  ]
 },
 "ev.first-revelation.1": {
  "kind": "fact",
  "text": {
   "en": "He returned home trembling. Khadijah comforted him and took him to Waraqah ibn Nawfal.",
   "de": "Zitternd kehrte er nach Hause zurück. Chadidscha tröstete ihn und brachte ihn zu Waraqa ibn Naufal.",
   "bs": "Vratio se kući drhteći. Hatidža ga je utješila i odvela Varaki ibn Nevfelu."
  },
  "sourceIds": [
   "bukhari-3"
  ]
 },
 "ev.first-muslims.0": {
  "kind": "fact",
  "text": {
   "en": "For about three years the call was made quietly, to family and trusted friends. A small group of believers formed around the Prophet ﷺ.",
   "de": "Etwa drei Jahre lang wurde der Ruf im Stillen verbreitet, an Familie und vertraute Freunde. Um den Propheten ﷺ bildete sich eine kleine Gruppe von Gläubigen.",
   "bs": "Oko tri godine poziv se širio tiho, među porodicom i povjerljivim prijateljima. Oko Poslanika ﷺ formirala se mala skupina vjernika."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.public-call.0": {
  "kind": "fact",
  "text": {
   "en": "When the verse \"And warn your closest kinsmen\" was revealed, the Prophet ﷺ climbed Mount al-Safa and called the clans of Quraysh. Abu Lahab rejected him, and Surah al-Masad was revealed about him.",
   "de": "Als der Vers „Und warne deine nächsten Verwandten“ offenbart wurde, stieg der Prophet ﷺ auf den Hügel as-Safa und rief die Clans der Quraisch. Abu Lahab wies ihn zurück, und über ihn wurde Sure al-Masad offenbart.",
   "bs": "Kada je objavljen ajet „I opominji rodbinu svoju najbližu“, Poslanik ﷺ se popeo na brdo Safa i pozvao kurejšijske rodove. Ebu Leheb ga je odbio, i o njemu je objavljena sura el-Mesed."
  },
  "sourceIds": [
   "bukhari-4770",
   "q-26-214",
   "q-111"
  ]
 },
 "ev.persecution.0": {
  "kind": "fact",
  "text": {
   "en": "Muslims without tribal protection – among them Bilal and the family of Yasir – were tortured for their faith. Abu Bakr freed several enslaved believers.",
   "de": "Muslime ohne Stammesschutz – darunter Bilal und die Familie von Yasir – wurden wegen ihres Glaubens gefoltert. Abu Bakr kaufte mehrere versklavte Gläubige frei.",
   "bs": "Muslimani bez plemenske zaštite – među njima Bilal i porodica Jasira – mučeni su zbog vjere. Ebu Bekr je otkupio i oslobodio nekoliko robova vjernika."
  },
  "sourceIds": [
   "ibnmajah-150",
   "ibn-hisham"
  ]
 },
 "ev.abyssinia.0": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ allowed a group of Muslims to seek refuge with al-Najashi, the Christian king of Abyssinia. When Quraysh sent envoys to bring them back, the king refused to hand them over.",
   "de": "Der Prophet ﷺ erlaubte einer Gruppe von Muslimen, bei an-Nadschaschi, dem christlichen König von Abessinien, Zuflucht zu suchen. Als die Quraisch Gesandte schickten, um sie zurückzuholen, weigerte sich der König, sie auszuliefern.",
   "bs": "Poslanik ﷺ je dozvolio skupini muslimana da potraže utočište kod Nedžašija, kršćanskog kralja Abesinije. Kada su Kurejšije poslali izaslanike da ih vrate, kralj ih je odbio izručiti."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.abyssinia.1": {
  "kind": "interpretation",
  "text": {
   "en": "According to the narration of Umm Salamah, Jaʿfar ibn Abi Talib spoke for the Muslims and recited from Surah Maryam before the king.",
   "de": "Nach dem Bericht von Umm Salama sprach Dschafar ibn Abi Talib für die Muslime und rezitierte vor dem König aus Sure Maryam.",
   "bs": "Prema predaji Ummu Seleme, Džafer ibn Ebi Talib govorio je u ime muslimana i učio pred kraljem iz sure Merjem."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.boycott.0": {
  "kind": "fact",
  "text": {
   "en": "Quraysh agreed not to trade or intermarry with the clans of Hashim and al-Muttalib, who were confined to a valley of Makkah (the Shiʿb of Abu Talib) and suffered hunger until the boycott was lifted.",
   "de": "Die Quraisch beschlossen, mit den Clans Haschim und al-Muttalib weder Handel zu treiben noch Ehen zu schließen. Diese lebten eingeschlossen in einem Tal Mekkas (dem Schiʿb Abi Talib) und litten Hunger, bis der Boykott aufgehoben wurde.",
   "bs": "Kurejšije su se dogovorili da s rodovima Hašim i el-Muttalib ne trguju niti se s njima žene. Oni su bili zatvoreni u jednoj mekanskoj dolini (Ši'b Ebi Taliba) i gladovali dok bojkot nije ukinut."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.year-of-sorrow.0": {
  "kind": "fact",
  "text": {
   "en": "Shortly after the end of the boycott, both Abu Talib, his protector, and Khadijah, his wife and first supporter, died.",
   "de": "Kurz nach dem Ende des Boykotts starben sowohl Abu Talib, sein Beschützer, als auch Chadidscha, seine Frau und erste Unterstützerin.",
   "bs": "Ubrzo nakon kraja bojkota umrli su i Ebu Talib, njegov zaštitnik, i Hatidža, njegova supruga i prva podrška."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.taif.0": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ went to Taʾif to call its people and was rejected harshly. ʿAʾishah reported that he described this as one of the hardest days of his life; when the angel of the mountains offered to destroy the people, he refused and hoped that their descendants would worship Allah alone.",
   "de": "Der Prophet ﷺ ging nach Taif, um die Menschen dort einzuladen, und wurde hart abgewiesen. Aischa berichtete, dass er dies als einen der schwersten Tage seines Lebens beschrieb; als der Engel der Berge anbot, die Leute zu vernichten, lehnte er ab und hoffte, dass ihre Nachkommen Allah allein anbeten würden.",
   "bs": "Poslanik ﷺ je otišao u Taif da pozove njegove stanovnike i bio je grubo odbijen. Aiša je prenijela da je to opisao kao jedan od najtežih dana u životu; kada mu je melek planina ponudio da uništi te ljude, odbio je i nadao se da će njihovi potomci obožavati samo Allaha."
  },
  "sourceIds": [
   "bukhari-3231"
  ]
 },
 "ev.isra-miraj.0": {
  "kind": "fact",
  "text": {
   "en": "The Quran mentions the night journey from al-Masjid al-Haram to al-Masjid al-Aqsa. In the ascension that followed, the five daily prayers were prescribed.",
   "de": "Der Koran erwähnt die nächtliche Reise von al-Masdschid al-Haram zu al-Masdschid al-Aqsa. Bei der folgenden Himmelfahrt wurden die fünf täglichen Gebete vorgeschrieben.",
   "bs": "Kur'an spominje noćno putovanje od Mesdžidul-harama do Mesdžidul-aksaa. Na uzašašću koje je uslijedilo propisano je pet dnevnih namaza."
  },
  "sourceIds": [
   "q-17-1",
   "ibn-hisham"
  ]
 },
 "ev.aqabah.0": {
  "kind": "fact",
  "text": {
   "en": "During two pilgrimage seasons, Muslims from Yathrib met the Prophet ﷺ at al-ʿAqabah near Mina and pledged allegiance – the second time promising to protect him as they would protect their own families. Musʿab ibn ʿUmayr was sent to teach them.",
   "de": "In zwei Pilgerzeiten trafen Muslime aus Yathrib den Propheten ﷺ in al-Aqaba bei Mina und leisteten den Treueeid – beim zweiten Mal mit dem Versprechen, ihn wie ihre eigenen Familien zu schützen. Musʿab ibn Umair wurde geschickt, um sie zu unterrichten.",
   "bs": "Tokom dvije hadžske sezone muslimani iz Jesriba sreli su Poslanika ﷺ na Akabi kod Mine i dali mu prisegu – drugi put obećavši da će ga štititi kao svoje porodice. Mus'ab ibn Umejr poslan je da ih podučava."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.hijrah.0": {
  "kind": "fact",
  "text": {
   "en": "After the Muslims had gradually left for Yathrib, and Quraysh plotted against him, the Prophet ﷺ left Makkah secretly with Abu Bakr. They hid for three nights in the Cave of Thawr and then travelled with a hired guide to Madinah.",
   "de": "Nachdem die Muslime nach und nach nach Yathrib gezogen waren und die Quraisch gegen ihn planten, verließ der Prophet ﷺ Mekka heimlich mit Abu Bakr. Sie versteckten sich drei Nächte in der Höhle Thaur und reisten dann mit einem angeheuerten Führer nach Medina.",
   "bs": "Nakon što su muslimani postepeno otišli u Jesrib, a Kurejšije kovali zavjeru protiv njega, Poslanik ﷺ je tajno napustio Mekku s Ebu Bekrom. Tri noći su se skrivali u pećini Sevr, a zatim s unajmljenim vodičem putovali u Medinu."
  },
  "sourceIds": [
   "bukhari-3905",
   "q-8-30",
   "q-9-40"
  ]
 },
 "ev.quba.0": {
  "kind": "fact",
  "text": {
   "en": "The people of Madinah had been waiting each morning. The Prophet ﷺ stayed some days in Quba, where a mosque was founded, before continuing into the town.",
   "de": "Die Menschen in Medina hatten jeden Morgen gewartet. Der Prophet ﷺ blieb einige Tage in Quba, wo eine Moschee gegründet wurde, bevor er in die Stadt weiterzog.",
   "bs": "Stanovnici Medine su ga svako jutro čekali. Poslanik ﷺ je ostao nekoliko dana u Kubi, gdje je osnovan mesdžid, a zatim je nastavio u grad."
  },
  "sourceIds": [
   "bukhari-3905"
  ]
 },
 "ev.mosque.0": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ bought the land where his camel knelt from two orphans and built the mosque with his companions, working alongside them. It became the centre of prayer, learning and community life.",
   "de": "Der Prophet ﷺ kaufte das Land, auf dem sein Kamel niederkniete, von zwei Waisen und baute die Moschee mit seinen Gefährten, wobei er selbst mitarbeitete. Sie wurde zum Zentrum von Gebet, Lernen und Gemeinschaftsleben.",
   "bs": "Poslanik ﷺ je od dvoje siročadi kupio zemlju na kojoj je kleknula njegova deva i s ashabima izgradio mesdžid, radeći zajedno s njima. Postao je središte namaza, učenja i života zajednice."
  },
  "sourceIds": [
   "bukhari-428",
   "bukhari-3905"
  ]
 },
 "ev.brotherhood.0": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ paired each emigrant with a helper from Madinah as brothers. The Ansar shared their homes and property; the Quran praises them for preferring others over themselves.",
   "de": "Der Prophet ﷺ verband jeden Auswanderer mit einem Helfer aus Medina als Bruder. Die Ansar teilten ihre Häuser und ihren Besitz; der Koran lobt sie dafür, andere sich selbst vorzuziehen.",
   "bs": "Poslanik ﷺ je svakog muhadžira pobratimio s jednim ensarijom iz Medine. Ensarije su dijelili domove i imetak; Kur'an ih hvali što su druge pretpostavljali sebi."
  },
  "sourceIds": [
   "q-59-9",
   "ibn-hisham"
  ]
 },
 "ev.brotherhood.1": {
  "kind": "interpretation",
  "text": {
   "en": "The hadith collections report that Saʿd ibn al-Rabiʿ offered half his wealth to ʿAbd al-Rahman ibn ʿAwf, who thanked him and asked only to be shown the market.",
   "de": "Die Hadithsammlungen berichten, dass Saʿd ibn ar-Rabiʿ Abd ar-Rahman ibn Auf die Hälfte seines Vermögens anbot; dieser dankte ihm und bat nur darum, ihm den Markt zu zeigen.",
   "bs": "Hadiske zbirke prenose da je Sa'd ibn er-Rebi' ponudio pola imetka Abdurrahmanu ibn Avfu, a on mu se zahvalio i zamolio samo da mu pokaže pijacu."
  },
  "sourceIds": [
   "ibn-kathir"
  ]
 },
 "ev.charter.0": {
  "kind": "fact",
  "text": {
   "en": "A written agreement set out the rights and duties of the emigrants, the Ansar and the Jewish tribes of Madinah, including mutual defence of the city.",
   "de": "Eine schriftliche Vereinbarung legte die Rechte und Pflichten der Auswanderer, der Ansar und der jüdischen Stämme Medinas fest, einschließlich der gemeinsamen Verteidigung der Stadt.",
   "bs": "Pisani sporazum utvrdio je prava i obaveze muhadžira, ensarija i jevrejskih plemena Medine, uključujući zajedničku odbranu grada."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "ev.charter.1": {
  "kind": "interpretation",
  "text": {
   "en": "The name \"Constitution of Madinah\" is a modern description.",
   "de": "Die Bezeichnung „Verfassung von Medina“ ist eine moderne Beschreibung.",
   "bs": "Naziv „Medinski ustav“ savremeni je opis."
  },
  "sourceIds": []
 },
 "ev.qibla.0": {
  "kind": "fact",
  "text": {
   "en": "The Muslims had prayed towards Jerusalem. Then the command came to turn towards al-Masjid al-Haram in Makkah.",
   "de": "Die Muslime hatten in Richtung Jerusalem gebetet. Dann kam das Gebot, sich zu al-Masdschid al-Haram in Mekka zu wenden.",
   "bs": "Muslimani su klanjali prema Jerusalemu. Zatim je došla naredba da se okrenu prema Mesdžidul-haramu u Mekki."
  },
  "sourceIds": [
   "bukhari-40",
   "q-2-144"
  ]
 },
 "ev.badr.0": {
  "kind": "fact",
  "text": {
   "en": "The Muslims went out to meet a Quraysh caravan led by Abu Sufyan. The caravan escaped, and a Quraysh army of about a thousand met a Muslim force of a little over three hundred at the wells of Badr. The Muslims won; the Quraysh leader Abu Jahl was among those killed.",
   "de": "Die Muslime zogen einer Karawane der Quraisch unter Abu Sufyan entgegen. Die Karawane entkam, und ein Heer der Quraisch von etwa tausend Mann traf an den Brunnen von Badr auf eine muslimische Truppe von etwas über dreihundert. Die Muslime siegten; der Anführer der Quraisch, Abu Dschahl, war unter den Getöteten.",
   "bs": "Muslimani su izašli pred kurejšijski karavan koji je predvodio Ebu Sufjan. Karavan je umakao, a kurejšijska vojska od oko hiljadu ljudi susrela je muslimansku skupinu od nešto više od tri stotine kod bunara Bedra. Muslimani su pobijedili; među ubijenima bio je i kurejšijski vođa Ebu Džehl."
  },
  "sourceIds": [
   "muslim-1763",
   "ibn-hisham"
  ]
 },
 "ev.badr.1": {
  "kind": "fact",
  "text": {
   "en": "The Quran recalls that Allah gave the believers victory at Badr when they were few, and calls the battle the Day of the Criterion.",
   "de": "Der Koran erinnert daran, dass Allah den Gläubigen bei Badr den Sieg gab, als sie wenige waren, und nennt die Schlacht den Tag der Unterscheidung.",
   "bs": "Kur'an podsjeća da je Allah vjernicima dao pobjedu na Bedru kada ih je bilo malo i bitku naziva Danom razlučivanja."
  },
  "sourceIds": [
   "q-3-123",
   "q-8-41"
  ]
 },
 "ev.uhud.0": {
  "kind": "fact",
  "text": {
   "en": "Quraysh returned with a larger army. The Prophet ﷺ posted archers on a hill and ordered them not to leave. When most of them left their position, the Muslims were attacked from behind and suffered heavy losses, including Hamzah.",
   "de": "Die Quraisch kehrten mit einem größeren Heer zurück. Der Prophet ﷺ stellte Bogenschützen auf einen Hügel und befahl ihnen, nicht zu weichen. Als die meisten ihre Stellung verließen, wurden die Muslime von hinten angegriffen und erlitten schwere Verluste, darunter Hamza.",
   "bs": "Kurejšije su se vratili s većom vojskom. Poslanik ﷺ je postavio strijelce na brežuljak i naredio im da ne napuštaju položaj. Kada je većina napustila položaj, muslimani su napadnuti s leđa i pretrpjeli teške gubitke, među njima i Hamzu."
  },
  "sourceIds": [
   "bukhari-3039",
   "q-3-152",
   "ibn-hisham"
  ]
 },
 "ev.trench.0": {
  "kind": "fact",
  "text": {
   "en": "A large confederate army besieged Madinah. The Muslims dug a trench to defend the city, and after weeks of siege the confederates withdrew. Surah al-Ahzab describes the fear and the steadfastness of those days.",
   "de": "Ein großes verbündetes Heer belagerte Medina. Die Muslime hoben einen Graben zur Verteidigung der Stadt aus, und nach wochenlanger Belagerung zogen die Verbündeten ab. Sure al-Ahzab beschreibt die Angst und die Standhaftigkeit jener Tage.",
   "bs": "Velika saveznička vojska opsjela je Medinu. Muslimani su iskopali hendek (rov) za odbranu grada, i nakon sedmica opsade saveznici su se povukli. Sura el-Ahzab opisuje strah i postojanost tih dana."
  },
  "sourceIds": [
   "q-33-9",
   "ibn-hisham"
  ]
 },
 "ev.hudaybiyyah.0": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ set out with his companions to perform ʿUmrah but was stopped by Quraysh at al-Hudaybiyyah. After negotiations, a treaty was agreed: a ten-year truce, the Muslims would return home that year and come for ʿUmrah the following year.",
   "de": "Der Prophet ﷺ brach mit seinen Gefährten zur Umra auf, wurde aber von den Quraisch in al-Hudaibiya aufgehalten. Nach Verhandlungen wurde ein Vertrag geschlossen: ein zehnjähriger Waffenstillstand; die Muslime sollten in diesem Jahr heimkehren und im folgenden Jahr zur Umra kommen.",
   "bs": "Poslanik ﷺ je s ashabima krenuo na umru, ali su ih Kurejšije zaustavili na Hudejbiji. Nakon pregovora sklopljen je ugovor: desetogodišnje primirje; muslimani će se te godine vratiti kući i doći na umru sljedeće godine."
  },
  "sourceIds": [
   "bukhari-2731",
   "ibn-hisham"
  ]
 },
 "ev.hudaybiyyah.1": {
  "kind": "fact",
  "text": {
   "en": "Before the treaty, the companions pledged themselves under a tree – the Pledge of Ridwan, mentioned in Surah al-Fath. On the way back, the surah was revealed calling the treaty a clear victory.",
   "de": "Vor dem Vertrag leisteten die Gefährten unter einem Baum den Treueeid – den Eid von Ridwan, erwähnt in Sure al-Fath. Auf dem Rückweg wurde die Sure offenbart, die den Vertrag einen deutlichen Sieg nennt.",
   "bs": "Prije ugovora ashabi su dali prisegu ispod drveta – Prisegu Ridvan, spomenutu u suri el-Feth. Na povratku je objavljena sura koja ugovor naziva jasnom pobjedom."
  },
  "sourceIds": [
   "q-48-18",
   "q-48-1"
  ]
 },
 "ev.conquest.0": {
  "kind": "fact",
  "text": {
   "en": "After allies of Quraysh broke the truce, the Prophet ﷺ marched on Makkah with a large army. The city was taken with very little fighting. Abu Sufyan had accepted Islam, and whoever entered his house, laid down their weapons or closed their door was declared safe.",
   "de": "Nachdem Verbündete der Quraisch den Waffenstillstand gebrochen hatten, zog der Prophet ﷺ mit einem großen Heer nach Mekka. Die Stadt wurde fast ohne Kampf eingenommen. Abu Sufyan hatte den Islam angenommen, und wer sein Haus betrat, die Waffen niederlegte oder seine Tür schloss, wurde für sicher erklärt.",
   "bs": "Nakon što su saveznici Kurejšija prekršili primirje, Poslanik ﷺ je s velikom vojskom krenuo na Mekku. Grad je zauzet gotovo bez borbe. Ebu Sufjan je primio islam, a sigurnim je proglašen svako ko uđe u njegovu kuću, odloži oružje ili zatvori svoja vrata."
  },
  "sourceIds": [
   "muslim-1780",
   "ibn-hisham"
  ]
 },
 "ev.conquest.1": {
  "kind": "fact",
  "text": {
   "en": "The idols around the Kaʿbah were removed while the Prophet ﷺ recited: \"Truth has come and falsehood has vanished.\"",
   "de": "Die Götzen um die Kaaba wurden entfernt, während der Prophet ﷺ rezitierte: „Die Wahrheit ist gekommen, und das Falsche ist vergangen.“",
   "bs": "Kipovi oko Kabe su uklonjeni dok je Poslanik ﷺ učio: „Došla je Istina, a nestala je laž.“"
  },
  "sourceIds": [
   "bukhari-4287",
   "q-17-81"
  ]
 },
 "ev.conquest.2": {
  "kind": "interpretation",
  "text": {
   "en": "The Seerah works report a general amnesty for the people of Makkah who had fought him for years. The exact wording often quoted is found in Seerah collections, and scholars discuss the strength of its chains.",
   "de": "Die Sira-Werke berichten von einer allgemeinen Amnestie für die Menschen Mekkas, die ihn jahrelang bekämpft hatten. Der oft zitierte genaue Wortlaut findet sich in Sira-Sammlungen, und Gelehrte diskutieren die Stärke seiner Überlieferungsketten.",
   "bs": "Djela sire prenose opću amnestiju za stanovnike Mekke koji su se godinama borili protiv njega. Tačna formulacija koja se često citira nalazi se u zbirkama sire, a učenjaci raspravljaju o jačini njenih lanaca prenosilaca."
  },
  "sourceIds": [
   "ibn-hisham",
   "zad"
  ]
 },
 "ev.farewell.0": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ performed his only Hajj after the Hijrah with a great number of Muslims. At ʿArafat he gave a sermon: the sanctity of life, property and honour, the end of the blood feuds and usury of the Days of Ignorance, kindness to women, and holding fast to the Book of Allah.",
   "de": "Der Prophet ﷺ vollzog mit einer großen Zahl von Muslimen seinen einzigen Haddsch nach der Hidschra. In Arafat hielt er eine Ansprache: die Unantastbarkeit von Leben, Besitz und Ehre, das Ende der Blutrache und des Wuchers der Zeit der Unwissenheit, Güte gegenüber den Frauen und das Festhalten am Buch Allahs.",
   "bs": "Poslanik ﷺ je s velikim brojem muslimana obavio svoj jedini hadž nakon Hidžre. Na Arefatu je održao hutbu: svetost života, imetka i časti, kraj krvne osvete i kamate iz doba neznanja, dobrota prema ženama i čvrsto držanje Allahove Knjige."
  },
  "sourceIds": [
   "muslim-1218"
  ]
 },
 "ev.farewell.1": {
  "kind": "fact",
  "text": {
   "en": "On the day of ʿArafah the verse \"This day I have perfected your religion for you\" was revealed.",
   "de": "Am Tag von Arafa wurde der Vers „Heute habe Ich euch eure Religion vervollkommnet“ offenbart.",
   "bs": "Na Dan Arefata objavljen je ajet „Danas sam vam vjeru vašu usavršio“."
  },
  "sourceIds": [
   "bukhari-45",
   "q-5-3"
  ]
 },
 "ev.death.0": {
  "kind": "fact",
  "text": {
   "en": "The Prophet ﷺ fell ill in Madinah and died in the room of ʿAʾishah, at about sixty-three years of age. When people could not accept it, Abu Bakr addressed them and recited: \"Muhammad is no more than a messenger; messengers have passed away before him…\"",
   "de": "Der Prophet ﷺ erkrankte in Medina und starb im Zimmer von Aischa, im Alter von etwa dreiundsechzig Jahren. Als die Menschen es nicht fassen konnten, sprach Abu Bakr zu ihnen und rezitierte: „Muhammad ist nur ein Gesandter; vor ihm sind schon Gesandte dahingegangen …“",
   "bs": "Poslanik ﷺ se razbolio u Medini i umro u Aišinoj sobi, u dobi od oko šezdeset i tri godine. Kada ljudi to nisu mogli prihvatiti, Ebu Bekr im se obratio i proučio: „Muhammed je samo poslanik, a i prije njega bilo je poslanika…“"
  },
  "sourceIds": [
   "bukhari-1241",
   "q-3-144"
  ]
 },
 "pl.makkah.0": {
  "kind": "fact",
  "text": {
   "en": "Makkah lies in a dry valley of the Hijaz. The Kaʿbah stood at its centre, and the tribe of Quraysh, to which the Prophet ﷺ belonged, held authority over the city and its sanctuary.",
   "de": "Mekka liegt in einem trockenen Tal des Hidschas. Im Zentrum stand die Kaaba, und der Stamm der Quraisch, dem der Prophet ﷺ angehörte, hatte die Führung über die Stadt und ihr Heiligtum.",
   "bs": "Mekka leži u sušnoj dolini Hidžaza. U njenom središtu nalazila se Kaba, a pleme Kurejš, kojem je pripadao Poslanik ﷺ, imalo je vlast nad gradom i svetištem."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "pl.hira.0": {
  "kind": "fact",
  "text": {
   "en": "A small cave near the top of the mountain known today as Jabal al-Nur, north-east of the Kaʿbah. Before the revelation, the Prophet ﷺ used to spend nights there in worship.",
   "de": "Eine kleine Höhle nahe dem Gipfel des Berges, der heute Dschabal an-Nur heißt, nordöstlich der Kaaba. Vor der Offenbarung verbrachte der Prophet ﷺ dort Nächte in Andacht.",
   "bs": "Mala pećina blizu vrha brda koje se danas zove Džebel en-Nur, sjeveroistočno od Kabe. Prije Objave Poslanik ﷺ je tu provodio noći u ibadetu."
  },
  "sourceIds": [
   "bukhari-3"
  ]
 },
 "pl.thawr.0": {
  "kind": "fact",
  "text": {
   "en": "A cave in a mountain south of Makkah – in the opposite direction from Madinah. The Quran refers to the two in the cave in Surah al-Tawbah 9:40.",
   "de": "Eine Höhle in einem Berg südlich von Mekka – in der Gegenrichtung zu Medina. Der Koran erwähnt die zwei in der Höhle in Sure at-Tauba 9:40.",
   "bs": "Pećina u brdu južno od Mekke – u suprotnom smjeru od Medine. Kur'an spominje dvojicu u pećini u suri et-Tevbe 9:40."
  },
  "sourceIds": [
   "q-9-40",
   "bukhari-3905"
  ]
 },
 "pl.taif.0": {
  "kind": "fact",
  "text": {
   "en": "A town in the mountains south-east of Makkah, home of the tribe of Thaqif.",
   "de": "Eine Stadt in den Bergen südöstlich von Mekka, Heimat des Stammes Thaqif.",
   "bs": "Grad u planinama jugoistočno od Mekke, dom plemena Sekif."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "pl.abyssinia.0": {
  "kind": "fact",
  "text": {
   "en": "The kingdom of Aksum across the Red Sea, in the region of present-day Ethiopia and Eritrea.",
   "de": "Das Königreich Aksum jenseits des Roten Meeres, in der Region des heutigen Äthiopien und Eritrea.",
   "bs": "Kraljevstvo Aksum preko Crvenog mora, na području današnje Etiopije i Eritreje."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "pl.quba.0": {
  "kind": "fact",
  "text": {
   "en": "A settlement on the southern outskirts of Madinah. The Prophet ﷺ stayed there for some days before entering the town itself.",
   "de": "Eine Siedlung am südlichen Stadtrand von Medina. Der Prophet ﷺ blieb dort einige Tage, bevor er in die Stadt selbst einzog.",
   "bs": "Naselje na južnoj periferiji Medine. Poslanik ﷺ je tu ostao nekoliko dana prije nego što je ušao u sam grad."
  },
  "sourceIds": [
   "bukhari-3905",
   "ibn-hisham"
  ]
 },
 "pl.madinah.0": {
  "kind": "fact",
  "text": {
   "en": "An oasis town about 400 km north of Makkah, home of the Aws and Khazraj and of several Jewish tribes. After the Hijrah it became known as al-Madinah, \"the City\".",
   "de": "Eine Oasenstadt etwa 400 km nördlich von Mekka, Heimat der Aus und Chazradsch sowie mehrerer jüdischer Stämme. Nach der Hidschra wurde sie als al-Madina, „die Stadt“, bekannt.",
   "bs": "Oazni grad oko 400 km sjeverno od Mekke, dom Evsa i Hazredža te nekoliko jevrejskih plemena. Nakon Hidžre postao je poznat kao el-Medina, „Grad“."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "pl.badr.0": {
  "kind": "fact",
  "text": {
   "en": "Wells on the caravan route between Syria and Makkah, south-west of Madinah near the Red Sea coast.",
   "de": "Brunnen an der Karawanenroute zwischen Syrien und Mekka, südwestlich von Medina nahe der Küste des Roten Meeres.",
   "bs": "Bunari na karavanskom putu između Šama i Mekke, jugozapadno od Medine, blizu obale Crvenog mora."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "pl.uhud.0": {
  "kind": "fact",
  "text": {
   "en": "A mountain just north of Madinah. The martyrs of the battle, including Hamzah, were buried at its foot.",
   "de": "Ein Berg direkt nördlich von Medina. Die Märtyrer der Schlacht, darunter Hamza, wurden an seinem Fuß begraben.",
   "bs": "Brdo neposredno sjeverno od Medine. Šehidi bitke, među njima i Hamza, ukopani su u njegovom podnožju."
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 "pl.hudaybiyyah.0": {
  "kind": "fact",
  "text": {
   "en": "A place at the edge of the sacred area on the road from Madinah, west of Makkah.",
   "de": "Ein Ort am Rand des heiligen Bezirks an der Straße von Medina, westlich von Mekka.",
   "bs": "Mjesto na rubu harema na putu iz Medine, zapadno od Mekke."
  },
  "sourceIds": [
   "bukhari-2731"
  ]
 },
 "pl.arafat.0": {
  "kind": "fact",
  "text": {
   "en": "A plain east of Makkah. Standing at ʿArafat on the 9th of Dhu al-Hijjah is the central rite of the Hajj.",
   "de": "Eine Ebene östlich von Mekka. Das Stehen auf Arafat am 9. Dhu al-Hiddscha ist der zentrale Ritus des Haddsch.",
   "bs": "Ravnica istočno od Mekke. Stajanje na Arefatu 9. zul-hidžeta središnji je obred hadža."
  },
  "sourceIds": [
   "muslim-1218"
  ]
 },
 "pl.jeddah.0": {
  "kind": "fact",
  "text": {
   "en": "A modern reference point; it plays no role in the episodes of this app.",
   "de": "Ein moderner Bezugspunkt; in den Episoden dieser App spielt die Stadt keine Rolle.",
   "bs": "Savremena orijentacijska tačka; u epizodama ove aplikacije nema ulogu."
  },
  "sourceIds": []
 }
};

export const SEERAH_EVENTS: SeerahEventInfo[] = [
 {
  "id": "elephant",
  "title": {
   "en": "The Year of the Elephant",
   "de": "Das Jahr des Elefanten",
   "bs": "Godina slona"
  },
  "date": {
   "sortKey": 570,
   "label": {
    "en": "c. 570 CE",
    "de": "um 570 n. Chr.",
    "bs": "oko 570. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "Commonly dated to around 570 CE; modern estimates vary by a few years.",
    "de": "Meist um 570 n. Chr. datiert; moderne Schätzungen weichen um einige Jahre ab.",
    "bs": "Najčešće se datira oko 570. godine; savremene procjene razlikuju se za nekoliko godina."
   }
  },
  "era": "before",
  "sourceIds": [
   "q-105",
   "ibn-hisham"
  ]
 },
 {
  "id": "birth",
  "title": {
   "en": "Birth of Muhammad ﷺ",
   "de": "Geburt Muhammads ﷺ",
   "bs": "Rođenje Muhammeda ﷺ"
  },
  "date": {
   "sortKey": 570.5,
   "label": {
    "en": "c. 570 CE",
    "de": "um 570 n. Chr.",
    "bs": "oko 570. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "That he was born on a Monday is established in Sahih Muslim. The month is usually given as Rabiʿ al-Awwal; the exact day is disputed – the 12th is the most widely known view.",
    "de": "Dass er an einem Montag geboren wurde, ist in Sahih Muslim belegt. Als Monat wird meist Rabiʿ al-Awwal genannt; der genaue Tag ist umstritten – der 12. ist die bekannteste Ansicht.",
    "bs": "Da je rođen u ponedjeljak potvrđeno je u Sahihu Muslima. Kao mjesec se obično navodi rebiul-evvel; tačan dan je sporan – 12. je najpoznatije mišljenje."
   }
  },
  "era": "before",
  "sourceIds": [
   "muslim-1162",
   "ibn-hisham"
  ]
 },
 {
  "id": "childhood",
  "title": {
   "en": "Childhood and orphanhood",
   "de": "Kindheit und Verwaisung",
   "bs": "Djetinjstvo i siročad"
  },
  "date": {
   "sortKey": 571,
   "label": {
    "en": "c. 570–578 CE",
    "de": "um 570–578 n. Chr.",
    "bs": "oko 570–578. g."
   },
   "certainty": "approximate",
   "note": null
  },
  "era": "before",
  "sourceIds": [
   "q-93-6",
   "ibn-hisham"
  ]
 },
 {
  "id": "marriage",
  "title": {
   "en": "Marriage to Khadijah",
   "de": "Heirat mit Chadidscha",
   "bs": "Brak s Hatidžom"
  },
  "date": {
   "sortKey": 595,
   "label": {
    "en": "c. 595 CE",
    "de": "um 595 n. Chr.",
    "bs": "oko 595. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "He is commonly reported to have been 25 years old.",
    "de": "Meist wird berichtet, dass er 25 Jahre alt war.",
    "bs": "Najčešće se prenosi da je imao 25 godina."
   }
  },
  "era": "before",
  "sourceIds": [
   "ibn-hisham",
   "ibn-sad"
  ]
 },
 {
  "id": "kaaba-rebuild",
  "title": {
   "en": "Rebuilding the Kaʿbah",
   "de": "Wiederaufbau der Kaaba",
   "bs": "Obnova Kabe"
  },
  "date": {
   "sortKey": 605,
   "label": {
    "en": "c. 605 CE",
    "de": "um 605 n. Chr.",
    "bs": "oko 605. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "Commonly placed about five years before the first revelation.",
    "de": "Meist etwa fünf Jahre vor der ersten Offenbarung angesetzt.",
    "bs": "Najčešće se smješta oko pet godina prije prve Objave."
   }
  },
  "era": "before",
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "first-revelation",
  "title": {
   "en": "The first revelation",
   "de": "Die erste Offenbarung",
   "bs": "Prva Objava"
  },
  "date": {
   "sortKey": 610,
   "label": {
    "en": "c. 610 CE",
    "de": "um 610 n. Chr.",
    "bs": "oko 610. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "He was about forty years old. The revelation began in Ramadan according to most scholars; the exact night is not certain.",
    "de": "Er war etwa vierzig Jahre alt. Nach den meisten Gelehrten begann die Offenbarung im Ramadan; die genaue Nacht ist nicht sicher.",
    "bs": "Imao je oko četrdeset godina. Prema većini učenjaka Objava je počela u ramazanu; tačna noć nije sigurna."
   }
  },
  "era": "makkah",
  "sourceIds": [
   "bukhari-3",
   "bukhari-4",
   "q-96-1"
  ]
 },
 {
  "id": "first-muslims",
  "title": {
   "en": "The first Muslims",
   "de": "Die ersten Muslime",
   "bs": "Prvi muslimani"
  },
  "date": {
   "sortKey": 611,
   "label": {
    "en": "c. 610–613 CE",
    "de": "um 610–613 n. Chr.",
    "bs": "oko 610–613. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "Who accepted Islam first is discussed by scholars. A common answer: Khadijah among women, Abu Bakr among free men, ʿAli among children and Zayd among freed men.",
    "de": "Wer zuerst den Islam annahm, wird unter Gelehrten diskutiert. Eine verbreitete Antwort: Chadidscha unter den Frauen, Abu Bakr unter den freien Männern, Ali unter den Kindern und Zaid unter den Freigelassenen.",
    "bs": "Ko je prvi primio islam pitanje je o kojem učenjaci raspravljaju. Uobičajen odgovor: Hatidža među ženama, Ebu Bekr među slobodnim muškarcima, Alija među djecom i Zejd među oslobođenicima."
   }
  },
  "era": "makkah",
  "sourceIds": [
   "ibn-hisham",
   "ibnmajah-150"
  ]
 },
 {
  "id": "public-call",
  "title": {
   "en": "The public call",
   "de": "Der öffentliche Ruf",
   "bs": "Javni poziv"
  },
  "date": {
   "sortKey": 613,
   "label": {
    "en": "c. 613 CE",
    "de": "um 613 n. Chr.",
    "bs": "oko 613. g."
   },
   "certainty": "approximate",
   "note": null
  },
  "era": "makkah",
  "sourceIds": [
   "bukhari-4770",
   "q-26-214",
   "q-15-94",
   "q-111"
  ]
 },
 {
  "id": "persecution",
  "title": {
   "en": "Persecution of the believers",
   "de": "Verfolgung der Gläubigen",
   "bs": "Progon vjernika"
  },
  "date": {
   "sortKey": 614,
   "label": {
    "en": "c. 613–622 CE",
    "de": "um 613–622 n. Chr.",
    "bs": "oko 613–622. g."
   },
   "certainty": "approximate",
   "note": null
  },
  "era": "makkah",
  "sourceIds": [
   "ibnmajah-150",
   "ibn-hisham",
   "ibn-sad"
  ]
 },
 {
  "id": "abyssinia",
  "title": {
   "en": "Migration to Abyssinia",
   "de": "Auswanderung nach Abessinien",
   "bs": "Hidžra u Abesiniju"
  },
  "date": {
   "sortKey": 615,
   "label": {
    "en": "c. 615 CE",
    "de": "um 615 n. Chr.",
    "bs": "oko 615. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "Placed in the fifth year of prophethood.",
    "de": "Im fünften Jahr des Prophetentums angesetzt.",
    "bs": "Smješta se u petu godinu poslanstva."
   }
  },
  "era": "makkah",
  "sourceIds": [
   "ibn-hisham",
   "bukhari-1245"
  ]
 },
 {
  "id": "boycott",
  "title": {
   "en": "The boycott of Banu Hashim",
   "de": "Der Boykott der Banu Haschim",
   "bs": "Bojkot Benu Hašima"
  },
  "date": {
   "sortKey": 616,
   "label": {
    "en": "c. 616–619 CE",
    "de": "um 616–619 n. Chr.",
    "bs": "oko 616–619. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "Reported to have lasted about three years.",
    "de": "Er soll etwa drei Jahre gedauert haben.",
    "bs": "Prenosi se da je trajao oko tri godine."
   }
  },
  "era": "makkah",
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "year-of-sorrow",
  "title": {
   "en": "The Year of Sorrow",
   "de": "Das Jahr der Trauer",
   "bs": "Godina tuge"
  },
  "date": {
   "sortKey": 619,
   "label": {
    "en": "c. 619 CE",
    "de": "um 619 n. Chr.",
    "bs": "oko 619. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "The tenth year of prophethood. The name \"Year of Sorrow\" was given by later authors.",
    "de": "Das zehnte Jahr des Prophetentums. Der Name „Jahr der Trauer“ stammt von späteren Autoren.",
    "bs": "Deseta godina poslanstva. Naziv „Godina tuge“ dali su kasniji autori."
   }
  },
  "era": "makkah",
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "taif",
  "title": {
   "en": "The journey to Taʾif",
   "de": "Die Reise nach Taif",
   "bs": "Putovanje u Taif"
  },
  "date": {
   "sortKey": 619.5,
   "label": {
    "en": "c. 619 CE",
    "de": "um 619 n. Chr.",
    "bs": "oko 619. g."
   },
   "certainty": "approximate",
   "note": null
  },
  "era": "makkah",
  "sourceIds": [
   "bukhari-3231",
   "ibn-hisham"
  ]
 },
 {
  "id": "isra-miraj",
  "title": {
   "en": "al-Israʾ and al-Miʿraj",
   "de": "al-Isra und al-Miʿradsch",
   "bs": "Isra i Miradž"
  },
  "date": {
   "sortKey": 620.5,
   "label": {
    "en": "Before the Hijrah (date disputed)",
    "de": "Vor der Hidschra (Datum umstritten)",
    "bs": "Prije Hidžre (datum sporan)"
   },
   "certainty": "disputed",
   "note": {
    "en": "The Night Journey took place in Makkah before the Hijrah. Scholars give different years and months; the 27th of Rajab is a widely known view but not established.",
    "de": "Die Nachtreise fand in Mekka vor der Hidschra statt. Die Gelehrten nennen unterschiedliche Jahre und Monate; der 27. Radschab ist eine verbreitete, aber nicht gesicherte Ansicht.",
    "bs": "Noćno putovanje desilo se u Mekki prije Hidžre. Učenjaci navode različite godine i mjesece; 27. redžeb je raširen, ali ne i potvrđen stav."
   }
  },
  "era": "makkah",
  "sourceIds": [
   "q-17-1",
   "ibn-hisham"
  ]
 },
 {
  "id": "aqabah",
  "title": {
   "en": "The pledges of al-ʿAqabah",
   "de": "Die Treueeide von al-Aqaba",
   "bs": "Prisege na Akabi"
  },
  "date": {
   "sortKey": 621,
   "label": {
    "en": "621–622 CE",
    "de": "621–622 n. Chr.",
    "bs": "621–622. g."
   },
   "certainty": "approximate",
   "note": null
  },
  "era": "makkah",
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "hijrah",
  "title": {
   "en": "The Hijrah",
   "de": "Die Hidschra",
   "bs": "Hidžra"
  },
  "date": {
   "sortKey": 622,
   "label": {
    "en": "622 CE (1 AH)",
    "de": "622 n. Chr. (1 n. H.)",
    "bs": "622. g. (1. g. po H.)"
   },
   "certainty": "established",
   "note": {
    "en": "The year is established. Later, under ʿUmar, the Islamic calendar was counted from this year.",
    "de": "Das Jahr ist gesichert. Später, unter Umar, wurde der islamische Kalender ab diesem Jahr gezählt.",
    "bs": "Godina je potvrđena. Kasnije, za vrijeme Omera, islamski kalendar počeo se računati od te godine."
   }
  },
  "era": "madinah",
  "sourceIds": [
   "bukhari-3905",
   "bukhari-3653",
   "q-9-40",
   "q-8-30",
   "tabari"
  ]
 },
 {
  "id": "quba",
  "title": {
   "en": "Arrival at Quba",
   "de": "Ankunft in Quba",
   "bs": "Dolazak u Kubu"
  },
  "date": {
   "sortKey": 622.2,
   "label": {
    "en": "622 CE (Rabiʿ al-Awwal, 1 AH)",
    "de": "622 n. Chr. (Rabiʿ al-Awwal, 1 n. H.)",
    "bs": "622. g. (rebiul-evvel, 1. g. po H.)"
   },
   "certainty": "established",
   "note": {
    "en": "The month is established; the exact day differs slightly between reports.",
    "de": "Der Monat ist gesichert; der genaue Tag weicht in den Berichten leicht ab.",
    "bs": "Mjesec je potvrđen; tačan dan se u predajama malo razlikuje."
   }
  },
  "era": "madinah",
  "sourceIds": [
   "bukhari-3905",
   "ibn-hisham"
  ]
 },
 {
  "id": "mosque",
  "title": {
   "en": "Building the Prophet's Mosque",
   "de": "Bau der Prophetenmoschee",
   "bs": "Gradnja Poslanikovog mesdžida"
  },
  "date": {
   "sortKey": 622.4,
   "label": {
    "en": "1 AH / 622 CE",
    "de": "1 n. H. / 622 n. Chr.",
    "bs": "1. g. po H. / 622. g."
   },
   "certainty": "established",
   "note": null
  },
  "era": "madinah",
  "sourceIds": [
   "bukhari-428",
   "bukhari-3905"
  ]
 },
 {
  "id": "brotherhood",
  "title": {
   "en": "Brotherhood of the Muhajirun and Ansar",
   "de": "Verbrüderung von Muhadschirun und Ansar",
   "bs": "Bratimljenje muhadžira i ensarija"
  },
  "date": {
   "sortKey": 622.5,
   "label": {
    "en": "1 AH / 622–623 CE",
    "de": "1 n. H. / 622–623 n. Chr.",
    "bs": "1. g. po H. / 622–623. g."
   },
   "certainty": "approximate",
   "note": null
  },
  "era": "madinah",
  "sourceIds": [
   "q-59-9",
   "q-49-10",
   "ibn-hisham"
  ]
 },
 {
  "id": "charter",
  "title": {
   "en": "The Charter of Madinah",
   "de": "Die Charta von Medina",
   "bs": "Medinska povelja"
  },
  "date": {
   "sortKey": 622.6,
   "label": {
    "en": "c. 1 AH / 622–623 CE",
    "de": "um 1 n. H. / 622–623 n. Chr.",
    "bs": "oko 1. g. po H. / 622–623. g."
   },
   "certainty": "approximate",
   "note": {
    "en": "Historians discuss whether the text preserved by Ibn Ishaq is one document or several agreements made at different times.",
    "de": "Historiker diskutieren, ob der von Ibn Ishaq überlieferte Text ein Dokument ist oder mehrere zu verschiedenen Zeiten geschlossene Vereinbarungen.",
    "bs": "Historičari raspravljaju je li tekst koji je sačuvao Ibn Ishak jedan dokument ili više sporazuma sklopljenih u različito vrijeme."
   }
  },
  "era": "madinah",
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "qibla",
  "title": {
   "en": "Change of the qiblah",
   "de": "Änderung der Gebetsrichtung",
   "bs": "Promjena kible"
  },
  "date": {
   "sortKey": 623.9,
   "label": {
    "en": "2 AH / 624 CE",
    "de": "2 n. H. / 624 n. Chr.",
    "bs": "2. g. po H. / 624. g."
   },
   "certainty": "established",
   "note": {
    "en": "Sixteen or seventeen months after the Hijrah, according to Sahih al-Bukhari.",
    "de": "Sechzehn oder siebzehn Monate nach der Hidschra, nach Sahih al-Bukhari.",
    "bs": "Šesnaest ili sedamnaest mjeseci nakon Hidžre, prema Sahihu el-Buharija."
   }
  },
  "era": "madinah",
  "sourceIds": [
   "bukhari-40",
   "q-2-144"
  ]
 },
 {
  "id": "badr",
  "title": {
   "en": "The Battle of Badr",
   "de": "Die Schlacht von Badr",
   "bs": "Bitka na Bedru"
  },
  "date": {
   "sortKey": 624.2,
   "label": {
    "en": "Ramadan 2 AH / 624 CE",
    "de": "Ramadan 2 n. H. / 624 n. Chr.",
    "bs": "ramazan 2. g. po H. / 624. g."
   },
   "certainty": "established",
   "note": {
    "en": "The month and year are established; the 17th of Ramadan is the most commonly reported day.",
    "de": "Monat und Jahr sind gesichert; der 17. Ramadan ist der am häufigsten genannte Tag.",
    "bs": "Mjesec i godina su potvrđeni; 17. ramazan je najčešće navođeni dan."
   }
  },
  "era": "madinah",
  "sourceIds": [
   "muslim-1763",
   "q-3-123",
   "q-8-9",
   "q-8-41",
   "ibn-hisham"
  ]
 },
 {
  "id": "uhud",
  "title": {
   "en": "The Battle of Uhud",
   "de": "Die Schlacht von Uhud",
   "bs": "Bitka na Uhudu"
  },
  "date": {
   "sortKey": 625.2,
   "label": {
    "en": "Shawwal 3 AH / 625 CE",
    "de": "Schawwal 3 n. H. / 625 n. Chr.",
    "bs": "ševval 3. g. po H. / 625. g."
   },
   "certainty": "established",
   "note": null
  },
  "era": "madinah",
  "sourceIds": [
   "bukhari-3039",
   "q-3-152",
   "ibn-hisham"
  ]
 },
 {
  "id": "trench",
  "title": {
   "en": "The Battle of the Trench",
   "de": "Die Grabenschlacht",
   "bs": "Bitka na Hendeku"
  },
  "date": {
   "sortKey": 627,
   "label": {
    "en": "5 AH / 627 CE",
    "de": "5 n. H. / 627 n. Chr.",
    "bs": "5. g. po H. / 627. g."
   },
   "certainty": "disputed",
   "note": {
    "en": "Most historians date it to 5 AH; some early authorities give 4 AH.",
    "de": "Die meisten Historiker datieren sie auf 5 n. H.; einige frühe Autoritäten nennen 4 n. H.",
    "bs": "Većina historičara datira je u 5. godinu po H.; neki rani autoriteti navode 4. godinu."
   }
  },
  "era": "madinah",
  "sourceIds": [
   "q-33-9",
   "ibn-hisham"
  ]
 },
 {
  "id": "hudaybiyyah",
  "title": {
   "en": "The Treaty of al-Hudaybiyyah",
   "de": "Der Vertrag von al-Hudaibiya",
   "bs": "Ugovor na Hudejbiji"
  },
  "date": {
   "sortKey": 628.1,
   "label": {
    "en": "Dhu al-Qaʿdah 6 AH / 628 CE",
    "de": "Dhu al-Qaʿda 6 n. H. / 628 n. Chr.",
    "bs": "zul-ka'de 6. g. po H. / 628. g."
   },
   "certainty": "established",
   "note": null
  },
  "era": "madinah",
  "sourceIds": [
   "bukhari-2731",
   "q-48-1",
   "q-48-18",
   "q-48-27",
   "ibn-hisham"
  ]
 },
 {
  "id": "conquest",
  "title": {
   "en": "The conquest of Makkah",
   "de": "Die Einnahme Mekkas",
   "bs": "Oslobođenje Mekke"
  },
  "date": {
   "sortKey": 630,
   "label": {
    "en": "Ramadan 8 AH / 630 CE",
    "de": "Ramadan 8 n. H. / 630 n. Chr.",
    "bs": "ramazan 8. g. po H. / 630. g."
   },
   "certainty": "established",
   "note": null
  },
  "era": "madinah",
  "sourceIds": [
   "muslim-1780",
   "bukhari-4287",
   "q-17-81",
   "q-110",
   "ibn-hisham"
  ]
 },
 {
  "id": "farewell",
  "title": {
   "en": "The Farewell Pilgrimage",
   "de": "Die Abschiedspilgerfahrt",
   "bs": "Oprosni hadž"
  },
  "date": {
   "sortKey": 632,
   "label": {
    "en": "Dhu al-Hijjah 10 AH / 632 CE",
    "de": "Dhu al-Hiddscha 10 n. H. / 632 n. Chr.",
    "bs": "zul-hidže 10. g. po H. / 632. g."
   },
   "certainty": "established",
   "note": null
  },
  "era": "madinah",
  "sourceIds": [
   "muslim-1218",
   "bukhari-45",
   "q-5-3"
  ]
 },
 {
  "id": "death",
  "title": {
   "en": "Death of the Prophet ﷺ",
   "de": "Tod des Propheten ﷺ",
   "bs": "Smrt Poslanika ﷺ"
  },
  "date": {
   "sortKey": 632.5,
   "label": {
    "en": "Rabiʿ al-Awwal 11 AH / 632 CE",
    "de": "Rabiʿ al-Awwal 11 n. H. / 632 n. Chr.",
    "bs": "rebiul-evvel 11. g. po H. / 632. g."
   },
   "certainty": "established",
   "note": {
    "en": "Month and year are established, and it was a Monday; the exact date differs between reports.",
    "de": "Monat und Jahr sind gesichert, und es war ein Montag; das genaue Datum unterscheidet sich in den Berichten.",
    "bs": "Mjesec i godina su potvrđeni, i bio je ponedjeljak; tačan datum se razlikuje u predajama."
   }
  },
  "era": "madinah",
  "sourceIds": [
   "bukhari-1241",
   "q-3-144"
  ]
 }
];

export const SEERAH_PEOPLE: SeerahPersonInfo[] = [
 {
  "id": "muhammad",
  "name": {
   "en": "Muhammad",
   "de": "Muhammad",
   "bs": "Muhammed"
  },
  "arabicName": "محمد",
  "honorific": "saw",
  "kind": "prophet",
  "role": {
   "en": "The final Messenger of Allah",
   "de": "Der letzte Gesandte Allahs",
   "bs": "Posljednji Allahov Poslanik"
  },
  "relationship": {
   "en": "Son of ʿAbdullah and Aminah, of the clan of Hashim of Quraysh",
   "de": "Sohn von Abdullah und Amina, aus dem Clan Haschim der Quraisch",
   "bs": "Sin Abdullaha i Amine, iz roda Hašim plemena Kurejš"
  },
  "sourceIds": [
   "q-33-21",
   "q-21-107",
   "ibn-hisham"
  ]
 },
 {
  "id": "khadijah",
  "name": {
   "en": "Khadijah bint Khuwaylid",
   "de": "Chadidscha bint Chuwailid",
   "bs": "Hatidža bint Huvejlid"
  },
  "arabicName": "خديجة بنت خويلد",
  "honorific": "raha",
  "kind": "family",
  "role": {
   "en": "First wife of the Prophet ﷺ and the first to believe in him",
   "de": "Erste Ehefrau des Propheten ﷺ und die Erste, die an ihn glaubte",
   "bs": "Prva supruga Poslanika ﷺ i prva koja je povjerovala u njega"
  },
  "relationship": {
   "en": "Wife",
   "de": "Ehefrau",
   "bs": "Supruga"
  },
  "sourceIds": [
   "bukhari-3",
   "ibn-hisham",
   "ibn-sad"
  ]
 },
 {
  "id": "abu-bakr",
  "name": {
   "en": "Abu Bakr al-Siddiq",
   "de": "Abu Bakr as-Siddiq",
   "bs": "Ebu Bekr es-Sidik"
  },
  "arabicName": "أبو بكر الصديق",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Closest companion, companion of the Hijrah, first caliph",
   "de": "Engster Gefährte, Begleiter der Hidschra, erster Kalif",
   "bs": "Najbliži ashab, saputnik u Hidžri, prvi halifa"
  },
  "relationship": {
   "en": "Friend; father of ʿAʾishah",
   "de": "Freund; Vater von Aischa",
   "bs": "Prijatelj; otac Aiše"
  },
  "sourceIds": [
   "bukhari-3905",
   "bukhari-1241",
   "ibn-hisham"
  ]
 },
 {
  "id": "ali",
  "name": {
   "en": "ʿAli ibn Abi Talib",
   "de": "Ali ibn Abi Talib",
   "bs": "Alija ibn Ebi Talib"
  },
  "arabicName": "علي بن أبي طالب",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Among the first to believe; fourth caliph",
   "de": "Unter den ersten Gläubigen; vierter Kalif",
   "bs": "Među prvim vjernicima; četvrti halifa"
  },
  "relationship": {
   "en": "Cousin, raised in his household; husband of Fatimah",
   "de": "Cousin, in seinem Haushalt aufgewachsen; Ehemann von Fatima",
   "bs": "Amidžić, odrastao u njegovoj kući; muž Fatime"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "umar",
  "name": {
   "en": "ʿUmar ibn al-Khattab",
   "de": "Umar ibn al-Chattab",
   "bs": "Omer ibn el-Hattab"
  },
  "arabicName": "عمر بن الخطاب",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Senior companion; second caliph",
   "de": "Bedeutender Gefährte; zweiter Kalif",
   "bs": "Istaknuti ashab; drugi halifa"
  },
  "relationship": {
   "en": "Companion; father of Hafsah",
   "de": "Gefährte; Vater von Hafsa",
   "bs": "Ashab; otac Hafse"
  },
  "sourceIds": [
   "bukhari-2731",
   "bukhari-45",
   "ibn-hisham"
  ]
 },
 {
  "id": "uthman",
  "name": {
   "en": "ʿUthman ibn ʿAffan",
   "de": "Uthman ibn Affan",
   "bs": "Osman ibn Affan"
  },
  "arabicName": "عثمان بن عفان",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Early Muslim; third caliph",
   "de": "Früher Muslim; dritter Kalif",
   "bs": "Rani musliman; treći halifa"
  },
  "relationship": {
   "en": "Son-in-law of the Prophet ﷺ",
   "de": "Schwiegersohn des Propheten ﷺ",
   "bs": "Zet Poslanika ﷺ"
  },
  "sourceIds": [
   "ibn-hisham",
   "q-48-18"
  ]
 },
 {
  "id": "bilal",
  "name": {
   "en": "Bilal ibn Rabah",
   "de": "Bilal ibn Rabah",
   "bs": "Bilal ibn Rebah"
  },
  "arabicName": "بلال بن رباح",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Early Muslim, persecuted for his faith; the first muʾadhdhin",
   "de": "Früher Muslim, wegen seines Glaubens verfolgt; der erste Muezzin",
   "bs": "Rani musliman, progonjen zbog vjere; prvi mujezin"
  },
  "relationship": {
   "en": "Companion, freed by Abu Bakr",
   "de": "Gefährte, von Abu Bakr freigekauft",
   "bs": "Ashab, kojeg je oslobodio Ebu Bekr"
  },
  "sourceIds": [
   "ibnmajah-150",
   "ibn-hisham"
  ]
 },
 {
  "id": "aishah",
  "name": {
   "en": "ʿAʾishah bint Abi Bakr",
   "de": "Aischa bint Abi Bakr",
   "bs": "Aiša bint Ebi Bekr"
  },
  "arabicName": "عائشة بنت أبي بكر",
  "honorific": "raha",
  "kind": "family",
  "role": {
   "en": "Wife of the Prophet ﷺ and one of the greatest transmitters of hadith",
   "de": "Ehefrau des Propheten ﷺ und eine der bedeutendsten Überliefererinnen von Hadithen",
   "bs": "Supruga Poslanika ﷺ i jedna od najvećih prenositeljica hadisa"
  },
  "relationship": {
   "en": "Wife; daughter of Abu Bakr",
   "de": "Ehefrau; Tochter Abu Bakrs",
   "bs": "Supruga; kćerka Ebu Bekra"
  },
  "sourceIds": [
   "bukhari-3",
   "bukhari-3905"
  ]
 },
 {
  "id": "abu-talib",
  "name": {
   "en": "Abu Talib",
   "de": "Abu Talib",
   "bs": "Ebu Talib"
  },
  "arabicName": "أبو طالب",
  "honorific": "none",
  "kind": "family",
  "role": {
   "en": "Uncle and protector of the Prophet ﷺ in Makkah",
   "de": "Onkel und Beschützer des Propheten ﷺ in Mekka",
   "bs": "Amidža i zaštitnik Poslanika ﷺ u Mekki"
  },
  "relationship": {
   "en": "Paternal uncle; father of ʿAli and Jaʿfar",
   "de": "Onkel väterlicherseits; Vater von Ali und Dschafar",
   "bs": "Amidža; otac Alije i Džafera"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "abu-sufyan",
  "name": {
   "en": "Abu Sufyan ibn Harb",
   "de": "Abu Sufyan ibn Harb",
   "bs": "Ebu Sufjan ibn Harb"
  },
  "arabicName": "أبو سفيان بن حرب",
  "honorific": "ra",
  "kind": "quraysh",
  "role": {
   "en": "Leader of Quraysh who later accepted Islam",
   "de": "Anführer der Quraisch, der später den Islam annahm",
   "bs": "Vođa Kurejšija koji je kasnije primio islam"
  },
  "relationship": {
   "en": "Opponent, then companion; father of Umm Habibah",
   "de": "Gegner, dann Gefährte; Vater von Umm Habiba",
   "bs": "Protivnik, zatim ashab; otac Ummu Habibe"
  },
  "sourceIds": [
   "muslim-1780",
   "ibn-hisham"
  ]
 },
 {
  "id": "abd-al-muttalib",
  "name": {
   "en": "ʿAbd al-Muttalib",
   "de": "Abd al-Muttalib",
   "bs": "Abdul-Muttalib"
  },
  "arabicName": "عبد المطلب",
  "honorific": "none",
  "kind": "family",
  "role": {
   "en": "Grandfather and guardian of the young Muhammad ﷺ",
   "de": "Großvater und Vormund des jungen Muhammad ﷺ",
   "bs": "Djed i staratelj mladog Muhammeda ﷺ"
  },
  "relationship": {
   "en": "Paternal grandfather",
   "de": "Großvater väterlicherseits",
   "bs": "Djed po ocu"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "aminah",
  "name": {
   "en": "Aminah bint Wahb",
   "de": "Amina bint Wahb",
   "bs": "Amina bint Vehb"
  },
  "arabicName": "آمنة بنت وهب",
  "honorific": "none",
  "kind": "family",
  "role": {
   "en": "Mother of the Prophet ﷺ",
   "de": "Mutter des Propheten ﷺ",
   "bs": "Majka Poslanika ﷺ"
  },
  "relationship": {
   "en": "Mother",
   "de": "Mutter",
   "bs": "Majka"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "halimah",
  "name": {
   "en": "Halimah al-Saʿdiyyah",
   "de": "Halima as-Saʿdiyya",
   "bs": "Halima es-Sa'dijja"
  },
  "arabicName": "حليمة السعدية",
  "honorific": "none",
  "kind": "other",
  "role": {
   "en": "Wet-nurse of the infant Muhammad ﷺ",
   "de": "Amme des kleinen Muhammad ﷺ",
   "bs": "Dojilja malog Muhammeda ﷺ"
  },
  "relationship": {
   "en": "Foster mother from the tribe of Banu Saʿd",
   "de": "Pflegemutter aus dem Stamm Banu Saʿd",
   "bs": "Pomajka iz plemena Benu Sa'd"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "waraqah",
  "name": {
   "en": "Waraqah ibn Nawfal",
   "de": "Waraqa ibn Naufal",
   "bs": "Varaka ibn Nevfel"
  },
  "arabicName": "ورقة بن نوفل",
  "honorific": "none",
  "kind": "other",
  "role": {
   "en": "Christian scholar who recognised the revelation",
   "de": "Christlicher Gelehrter, der die Offenbarung erkannte",
   "bs": "Kršćanski učenjak koji je prepoznao Objavu"
  },
  "relationship": {
   "en": "Cousin of Khadijah",
   "de": "Cousin von Chadidscha",
   "bs": "Rođak Hatidže"
  },
  "sourceIds": [
   "bukhari-3"
  ]
 },
 {
  "id": "zayd",
  "name": {
   "en": "Zayd ibn Harithah",
   "de": "Zaid ibn Haritha",
   "bs": "Zejd ibn Harisa"
  },
  "arabicName": "زيد بن حارثة",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Among the first Muslims; accompanied the Prophet ﷺ to Taʾif",
   "de": "Unter den ersten Muslimen; begleitete den Propheten ﷺ nach Taif",
   "bs": "Među prvim muslimanima; pratio Poslanika ﷺ u Taif"
  },
  "relationship": {
   "en": "Freed man raised in the Prophet's household",
   "de": "Freigelassener, im Haushalt des Propheten aufgewachsen",
   "bs": "Oslobođenik odrastao u Poslanikovoj kući"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "sumayyah",
  "name": {
   "en": "Sumayyah bint Khayyat",
   "de": "Sumayya bint Chayyat",
   "bs": "Sumejja bint Hajjat"
  },
  "arabicName": "سمية بنت خياط",
  "honorific": "raha",
  "kind": "companion",
  "role": {
   "en": "Early Muslim; reported as the first martyr of Islam",
   "de": "Frühe Muslimin; gilt als erste Märtyrerin des Islam",
   "bs": "Rana muslimanka; prenosi se da je prvi šehid islama"
  },
  "relationship": {
   "en": "Mother of ʿAmmar ibn Yasir",
   "de": "Mutter von Ammar ibn Yasir",
   "bs": "Majka Ammara ibn Jasira"
  },
  "sourceIds": [
   "ibnmajah-150",
   "ibn-sad"
  ]
 },
 {
  "id": "jafar",
  "name": {
   "en": "Jaʿfar ibn Abi Talib",
   "de": "Dschafar ibn Abi Talib",
   "bs": "Džafer ibn Ebi Talib"
  },
  "arabicName": "جعفر بن أبي طالب",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Spokesman of the Muslims in Abyssinia",
   "de": "Sprecher der Muslime in Abessinien",
   "bs": "Govornik muslimana u Abesiniji"
  },
  "relationship": {
   "en": "Cousin; brother of ʿAli",
   "de": "Cousin; Bruder von Ali",
   "bs": "Amidžić; brat Alije"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "najashi",
  "name": {
   "en": "al-Najashi (Ashamah)",
   "de": "an-Nadschaschi (Ashama)",
   "bs": "Nedžaši (Ashama)"
  },
  "arabicName": "النجاشي",
  "honorific": "rh",
  "kind": "other",
  "role": {
   "en": "King of Abyssinia who protected the Muslim emigrants",
   "de": "König von Abessinien, der die muslimischen Auswanderer schützte",
   "bs": "Kralj Abesinije koji je zaštitio muslimanske iseljenike"
  },
  "relationship": {
   "en": "Protector of the emigrants",
   "de": "Beschützer der Auswanderer",
   "bs": "Zaštitnik iseljenika"
  },
  "sourceIds": [
   "bukhari-1245",
   "ibn-hisham"
  ]
 },
 {
  "id": "hamzah",
  "name": {
   "en": "Hamzah ibn ʿAbd al-Muttalib",
   "de": "Hamza ibn Abd al-Muttalib",
   "bs": "Hamza ibn Abdul-Muttalib"
  },
  "arabicName": "حمزة بن عبد المطلب",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Uncle of the Prophet ﷺ, martyr of Uhud",
   "de": "Onkel des Propheten ﷺ, Märtyrer von Uhud",
   "bs": "Amidža Poslanika ﷺ, šehid Uhuda"
  },
  "relationship": {
   "en": "Paternal uncle",
   "de": "Onkel väterlicherseits",
   "bs": "Amidža"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "musab",
  "name": {
   "en": "Musʿab ibn ʿUmayr",
   "de": "Musʿab ibn Umair",
   "bs": "Mus'ab ibn Umejr"
  },
  "arabicName": "مصعب بن عمير",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "First teacher sent to Yathrib before the Hijrah",
   "de": "Erster Lehrer, der vor der Hidschra nach Yathrib geschickt wurde",
   "bs": "Prvi učitelj poslan u Jesrib prije Hidžre"
  },
  "relationship": {
   "en": "Companion",
   "de": "Gefährte",
   "bs": "Ashab"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "suhayl",
  "name": {
   "en": "Suhayl ibn ʿAmr",
   "de": "Suhail ibn Amr",
   "bs": "Suhejl ibn Amr"
  },
  "arabicName": "سهيل بن عمرو",
  "honorific": "ra",
  "kind": "quraysh",
  "role": {
   "en": "Negotiator of Quraysh at al-Hudaybiyyah; later accepted Islam",
   "de": "Unterhändler der Quraisch in al-Hudaibiya; nahm später den Islam an",
   "bs": "Pregovarač Kurejšija na Hudejbiji; kasnije primio islam"
  },
  "relationship": {
   "en": "Opponent, then companion",
   "de": "Gegner, dann Gefährte",
   "bs": "Protivnik, zatim ashab"
  },
  "sourceIds": [
   "bukhari-2731"
  ]
 },
 {
  "id": "abdullah-ibn-jubayr",
  "name": {
   "en": "ʿAbdullah ibn Jubayr",
   "de": "Abdullah ibn Dschubair",
   "bs": "Abdullah ibn Džubejr"
  },
  "arabicName": "عبد الله بن جبير",
  "honorific": "ra",
  "kind": "companion",
  "role": {
   "en": "Commander of the archers at Uhud",
   "de": "Befehlshaber der Bogenschützen bei Uhud",
   "bs": "Zapovjednik strijelaca na Uhudu"
  },
  "relationship": {
   "en": "Companion from the Ansar",
   "de": "Gefährte von den Ansar",
   "bs": "Ashab od ensarija"
  },
  "sourceIds": [
   "bukhari-3039"
  ]
 },
 {
  "id": "abu-jahl",
  "name": {
   "en": "Abu Jahl (ʿAmr ibn Hisham)",
   "de": "Abu Dschahl (Amr ibn Hischam)",
   "bs": "Ebu Džehl (Amr ibn Hišam)"
  },
  "arabicName": "أبو جهل",
  "honorific": "none",
  "kind": "quraysh",
  "role": {
   "en": "Leading opponent of Islam in Makkah",
   "de": "Führender Gegner des Islam in Mekka",
   "bs": "Vodeći protivnik islama u Mekki"
  },
  "relationship": {
   "en": "Opponent from Quraysh",
   "de": "Gegner aus den Quraisch",
   "bs": "Protivnik iz Kurejša"
  },
  "sourceIds": [
   "ibn-hisham"
  ]
 },
 {
  "id": "ansar",
  "name": {
   "en": "The Ansar",
   "de": "Die Ansar",
   "bs": "Ensarije"
  },
  "arabicName": "الأنصار",
  "honorific": "none",
  "kind": "group",
  "role": {
   "en": "\"The Helpers\": the Muslims of Madinah (Aws and Khazraj)",
   "de": "„Die Helfer“: die Muslime Medinas (Aus und Chazradsch)",
   "bs": "„Pomagači“: muslimani Medine (Evs i Hazredž)"
  },
  "relationship": {
   "en": "Hosts of the Prophet ﷺ and the emigrants",
   "de": "Gastgeber des Propheten ﷺ und der Auswanderer",
   "bs": "Domaćini Poslanika ﷺ i muhadžira"
  },
  "sourceIds": [
   "q-59-9",
   "q-9-100"
  ]
 },
 {
  "id": "muhajirun",
  "name": {
   "en": "The Muhajirun",
   "de": "Die Muhadschirun",
   "bs": "Muhadžiri"
  },
  "arabicName": "المهاجرون",
  "honorific": "none",
  "kind": "group",
  "role": {
   "en": "\"The Emigrants\": Muslims who left Makkah for Madinah",
   "de": "„Die Auswanderer“: Muslime, die Mekka nach Medina verließen",
   "bs": "„Iseljenici“: muslimani koji su iz Mekke otišli u Medinu"
  },
  "relationship": {
   "en": "Fellow emigrants of the Prophet ﷺ",
   "de": "Mitauswanderer des Propheten ﷺ",
   "bs": "Saputnici Poslanika ﷺ u iseljenju"
  },
  "sourceIds": [
   "q-9-100"
  ]
 }
];
