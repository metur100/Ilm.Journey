import type { GameFact } from '@/core/games';

import { abuDawud, bukhari, lessonFact, muslim, quran, questFact, T } from './content';

/*
 * "You learned" facts of the akhlaq games. Lesson facts are copied from the Learn content (see content.ts); the
 * others quote a Quran passage or a hadith (Sahih al-Bukhari / Sahih Muslim / Sunan Abi Dawud with its number).
 * Truths are stated directly – never "Muslims believe …" (docs/GAMES-V3.md §2).
 */

// ---------- copied from the Learn content ----------

export const L = {
  sabr: () => lessonFact('sabr', 'akhlaq-sabr'),
  shukr: () => lessonFact('shukr', 'akhlaq-shukr', 0, { art: 'akhlaq.gratitude-jar' }),
  thankPeople: () => lessonFact('thanking-people', 'akhlaq-shukr', 1, { art: 'object.gift' }),
  sidq: () => lessonFact('sidq', 'akhlaq-sidq', 0, { art: 'object.scales' }),
  amanah: () => lessonFact('amanah', 'akhlaq-amanah', 0, { art: 'object.book' }),
  amanahExample: () => lessonFact('amanah-example', 'akhlaq-amanah', 1, { art: 'object.book' }),
  rahmah: () => lessonFact('rahmah', 'akhlaq-rahmah', 0, { art: 'animal.cat' }),
  rahmahExample: () => lessonFact('rahmah-example', 'akhlaq-rahmah', 1, { art: 'akhlaq.water-bowl' }),
  kindness: () => lessonFact('gentle-words', 'akhlaq-kindness', 0, { art: 'akhlaq.word-tree-4' }),
  smileCharity: () => lessonFact('smile-charity', 'akhlaq-kindness', 1, { art: 'ui.heart' }),
  parents: () => lessonFact('parents', 'akhlaq-parents', 0, { art: 'place.house' }),
  parentsExample: () => lessonFact('parents-help', 'akhlaq-parents', 1, { art: 'akhlaq.shopping-bags' }),
  helping: () => lessonFact('helping', 'akhlaq-helping', 0, { art: 'ui.heart' }),
  forgiveness: () => lessonFact('forgiveness', 'akhlaq-forgiveness', 0, { art: 'ui.heart' }),
  character: () => questFact('great-character', 'akhlaq-fact-character', { art: 'ui.sparkle' }),
  gentle: () => questFact('gentleness', 'akhlaq-fact-gentle', { art: 'ui.sparkle' }),
};

// ---------- Quran and hadith ----------

export const F = {
  fullMeasure: (): GameFact => ({
    id: 'full-measure',
    art: 'object.scales',
    text: T(
      'Allah commands: give full measure when you measure, and weigh with an even, honest balance.',
      'Allah gebietet: Gebt volles Maß, wenn ihr messt, und wägt mit der richtigen Waage.',
      'Allah naređuje: dajite punu mjeru kad mjerite i vagajte ispravnim kantarom.',
    ),
    sources: [quran('17:35')],
  }),
  shortMeasure: (): GameFact => ({
    id: 'short-measure',
    art: 'akhlaq.weight',
    text: T(
      'The Quran warns those who give short measure: they take full measure from people, but give less when they measure or weigh for them.',
      'Der Koran warnt die, die zu wenig geben: Von den Leuten nehmen sie volles Maß, doch wenn sie für sie messen oder wiegen, geben sie weniger.',
      "Kur'an upozorava one koji zakidaju: od ljudi uzimaju punu mjeru, a kad njima mjere ili vagaju, daju manje.",
    ),
    sources: [quran('83:1–3')],
  }),
  noCheating: (): GameFact => ({
    id: 'no-cheating',
    art: 'akhlaq.market-stall',
    text: T('The Prophet ﷺ said: whoever cheats is not one of us.', 'Der Prophet ﷺ sagte: Wer betrügt, gehört nicht zu uns.', 'Poslanik ﷺ je rekao: Ko vara, nije od nas.'),
    sources: [muslim('102')],
  }),
  dogWater: (): GameFact => ({
    id: 'thirsty-dog',
    art: 'akhlaq.thirsty-dog',
    text: T(
      'The Prophet ﷺ told of a man who found a dog panting with thirst. He climbed down into a well, filled his shoe with water and gave the dog to drink. Allah thanked him for it and forgave him.',
      'Der Prophet ﷺ erzählte von einem Mann, der einen Hund fand, der vor Durst hechelte. Er stieg in einen Brunnen, füllte seinen Schuh mit Wasser und gab dem Hund zu trinken. Allah dankte es ihm und vergab ihm.',
      'Poslanik ﷺ je pričao o čovjeku koji je našao psa kako dahće od žeđi. Spustio se u bunar, napunio svoju obuću vodom i napojio psa. Allah mu je to nagradio i oprostio mu.',
    ),
    sources: [bukhari('2363'), muslim('2244')],
  }),
  everyLivingBeing: (): GameFact => ({
    id: 'every-living-being',
    art: 'animal.birds',
    text: T(
      'The companions asked whether there is a reward for kindness to animals. The Prophet ﷺ answered: there is a reward for kindness to every living being.',
      'Die Gefährten fragten, ob es für Güte zu Tieren Lohn gibt. Der Prophet ﷺ antwortete: Für Güte zu jedem Lebewesen gibt es Lohn.',
      'Ashabi su upitali ima li nagrade za dobročinstvo prema životinjama. Poslanik ﷺ je odgovorio: za dobro učinjeno svakom živom biću ima nagrada.',
    ),
    sources: [bukhari('2363')],
  }),
  motherFirst: (): GameFact => ({
    id: 'mother-first',
    art: 'place.house',
    text: T(
      'A man asked the Prophet ﷺ who most deserves his good company. He said: your mother – three times – and then your father.',
      'Ein Mann fragte den Propheten ﷺ, wer seine gute Gesellschaft am meisten verdient. Er sagte: deine Mutter – dreimal – und dann dein Vater.',
      'Jedan čovjek je upitao Poslanika ﷺ ko najviše zaslužuje njegovo lijepo druženje. Rekao je: tvoja majka – tri puta – a zatim tvoj otac.',
    ),
    sources: [bukhari('5971'), muslim('2548')],
  }),
  spreadSalam: (): GameFact => ({
    id: 'spread-salam',
    art: 'akhlaq.salam-bubble',
    text: T(
      'The Prophet ﷺ said: you will not enter Paradise until you believe, and you will not believe until you love one another. Shall I tell you something that makes you love one another? Spread salam among yourselves.',
      'Der Prophet ﷺ sagte: Ihr betretet das Paradies nicht, bis ihr glaubt, und ihr glaubt nicht, bis ihr einander liebt. Soll ich euch etwas sagen, wodurch ihr einander liebt? Verbreitet den Salam unter euch.',
      'Poslanik ﷺ je rekao: Nećete ući u Džennet dok ne budete vjerovali, a nećete vjerovati dok se ne budete voljeli. Hoćete li da vas uputim na nešto čime ćete se voljeti? Širite selam među sobom.',
    ),
    sources: [muslim('54')],
  }),
  salamToAll: (): GameFact => ({
    id: 'salam-to-all',
    art: 'akhlaq.village-map',
    text: T(
      'Asked which deed in Islam is best, the Prophet ﷺ said: to feed people and to greet with salam those you know and those you do not know.',
      'Gefragt, welche Tat im Islam die beste ist, sagte der Prophet ﷺ: Menschen zu essen zu geben und den Salam zu sagen – denen, die du kennst, und denen, die du nicht kennst.',
      'Upitan koje je djelo u islamu najbolje, Poslanik ﷺ je rekao: da hraniš ljude i da nazivaš selam onima koje poznaješ i onima koje ne poznaješ.',
    ),
    sources: [bukhari('12'), muslim('39')],
  }),
  returnGreeting: (): GameFact => ({
    id: 'return-greeting',
    art: 'akhlaq.salam-bubble',
    text: T(
      'When you are greeted, answer with a better greeting, or at least return it.',
      'Wenn ihr gegrüßt werdet, dann grüßt mit einem schöneren Gruß zurück oder erwidert ihn wenigstens.',
      'Kad vas neko pozdravi, otpozdravite ljepšim pozdravom ili barem istim.',
    ),
    sources: [quran('4:86')],
  }),
  foodOfTwo: (): GameFact => ({
    id: 'food-of-two',
    art: 'food.dates',
    text: T(
      'The Prophet ﷺ said: the food of two is enough for three, and the food of three is enough for four.',
      'Der Prophet ﷺ sagte: Das Essen von zweien reicht für drei, und das Essen von dreien reicht für vier.',
      'Poslanik ﷺ je rekao: Hrana dvojice dovoljna je za trojicu, a hrana trojice dovoljna je za četvoricu.',
    ),
    sources: [bukhari('5392')],
  }),
  soupForNeighbours: (): GameFact => ({
    id: 'soup-for-neighbours',
    art: 'food.soup',
    text: T(
      'The Prophet ﷺ told Abu Dharr: when you cook a broth, add more water and think of your neighbours.',
      'Der Prophet ﷺ sagte zu Abu Dharr: Wenn du eine Brühe kochst, gib mehr Wasser hinzu und denk an deine Nachbarn.',
      'Poslanik ﷺ je rekao Ebu Zerru: Kad kuhaš čorbu, dodaj više vode i sjeti se svojih komšija.',
    ),
    sources: [muslim('2625')],
  }),
  giveFood: (): GameFact => ({
    id: 'give-food',
    art: 'food.bread',
    text: T(
      'The Quran praises those who give food – although they love it themselves – to the poor, the orphan and the captive.',
      'Der Koran lobt diejenigen, die Essen geben – obwohl sie es selbst lieben – dem Armen, der Waise und dem Gefangenen.',
      "Kur'an hvali one koji daju hranu – iako je i sami vole – siromahu, siročetu i zarobljeniku.",
    ),
    sources: [quran('76:8')],
  }),
  keepTrusts: (): GameFact => ({
    id: 'keep-trusts',
    art: 'object.key',
    text: T(
      'The Quran describes the successful believers as those who look after what they are entrusted with and keep their promises.',
      'Der Koran beschreibt die erfolgreichen Gläubigen als die, die auf das ihnen Anvertraute achten und ihre Versprechen halten.',
      "Kur'an opisuje uspješne vjernike kao one koji čuvaju ono što im je povjereno i ispunjavaju svoja obećanja.",
    ),
    sources: [quran('23:8')],
  }),
  noAnger: (): GameFact => ({
    id: 'do-not-get-angry',
    art: 'akhlaq.calm-sky',
    text: T(
      'A man asked the Prophet ﷺ for advice. He said: do not get angry – and repeated it several times.',
      'Ein Mann bat den Propheten ﷺ um einen Rat. Er sagte: Werde nicht zornig – und wiederholte es mehrmals.',
      'Jedan čovjek je zamolio Poslanika ﷺ za savjet. Rekao je: Ne ljuti se – i ponovio je to više puta.',
    ),
    sources: [bukhari('6116')],
  }),
  sitDown: (): GameFact => ({
    id: 'sit-down',
    art: 'akhlaq.chair',
    text: T(
      'The Prophet ﷺ said: if one of you gets angry while standing, let him sit down. If the anger leaves him, good; if not, let him lie down.',
      'Der Prophet ﷺ sagte: Wenn einer von euch im Stehen zornig wird, soll er sich setzen. Geht der Zorn weg, ist es gut; wenn nicht, soll er sich hinlegen.',
      'Poslanik ﷺ je rekao: Kad se neko od vas naljuti dok stoji, neka sjedne. Ako ga srdžba prođe, dobro je; ako ne, neka legne.',
    ),
    sources: [abuDawud('4782')],
  }),
  strongOne: (): GameFact => ({
    id: 'the-strong-one',
    art: 'akhlaq.quiet-bubble',
    text: T(
      'The Prophet ﷺ said: the strong one is not the one who wrestles others down; the strong one is the one who controls himself when angry.',
      'Der Prophet ﷺ sagte: Stark ist nicht, wer andere niederringt; stark ist, wer sich beherrscht, wenn er zornig ist.',
      'Poslanik ﷺ je rekao: Jak nije onaj ko druge obara u hrvanju, nego je jak onaj ko se savlada kad se naljuti.',
    ),
    sources: [bukhari('6114'), muslim('2609')],
  }),
  neighbourHeir: (): GameFact => ({
    id: 'neighbour-right',
    art: 'akhlaq.street',
    text: T(
      'The Prophet ﷺ said: Jibril kept urging me to treat the neighbour well, until I thought he would make him an heir.',
      'Der Prophet ﷺ sagte: Dschibril ermahnte mich immer wieder, gut zum Nachbarn zu sein, bis ich dachte, er würde ihn zum Erben machen.',
      'Poslanik ﷺ je rekao: Džibril mi je stalno preporučivao komšiju, sve dok nisam pomislio da će ga učiniti nasljednikom.',
    ),
    sources: [bukhari('6014'), muslim('2624')],
  }),
  nearestDoor: (): GameFact => ({
    id: 'nearest-door',
    art: 'object.gift',
    text: T(
      'Aisha asked the Prophet ﷺ: I have two neighbours – to which of them should I send a gift? He said: to the one whose door is closer to you.',
      'Aischa fragte den Propheten ﷺ: Ich habe zwei Nachbarn – wem soll ich ein Geschenk schicken? Er sagte: dem, dessen Tür dir näher ist.',
      'Aiša je upitala Poslanika ﷺ: Imam dva komšije – kome da pošaljem poklon? Rekao je: onome čija su ti vrata bliža.',
    ),
    sources: [bukhari('6020')],
  }),
  goodToNeighbours: (): GameFact => ({
    id: 'near-and-far-neighbour',
    art: 'place.house',
    text: T(
      'Allah commands goodness to parents, relatives, orphans, the needy, the near neighbour and the distant neighbour.',
      'Allah gebietet Güte zu den Eltern, den Verwandten, den Waisen, den Bedürftigen, dem nahen und dem fernen Nachbarn.',
      'Allah naređuje dobročinstvo prema roditeljima, rodbini, siročadi, siromasima, bližem i daljem komšiji.',
    ),
    sources: [quran('4:36')],
  }),
  purityHalf: (): GameFact => ({
    id: 'purity-half-of-faith',
    art: 'akhlaq.toy-box',
    text: T('The Prophet ﷺ said: purity is half of faith.', 'Der Prophet ﷺ sagte: Die Reinheit ist die Hälfte des Glaubens.', 'Poslanik ﷺ je rekao: Čistoća je pola vjere.'),
    sources: [muslim('223')],
  }),
  lovesPure: (): GameFact => ({
    id: 'allah-loves-the-pure',
    art: 'food.water',
    text: T(
      'Allah loves those who turn to Him often, and He loves those who keep themselves pure.',
      'Allah liebt die, die sich Ihm oft zuwenden, und Er liebt die, die sich reinigen.',
      'Allah voli one koji se mnogo kaju i voli one koji se čiste.',
    ),
    sources: [quran('2:222')],
  }),
  removeHarm: (): GameFact => ({
    id: 'remove-harm',
    art: 'akhlaq.rubbish-bin',
    text: T(
      'The Prophet ﷺ said that faith has many branches, and the smallest of them is removing something harmful from the road.',
      'Der Prophet ﷺ sagte, dass der Glaube viele Zweige hat, und der kleinste davon ist, etwas Schädliches vom Weg zu entfernen.',
      'Poslanik ﷺ je rekao da vjera ima mnogo ogranaka, a najmanji od njih je ukloniti s puta ono što smeta.',
    ),
    sources: [muslim('35')],
  }),
  goodTree: (): GameFact => ({
    id: 'good-word-good-tree',
    art: 'akhlaq.word-tree-4',
    text: T(
      'Allah compares a good word to a good tree: its root is firm, its branches reach into the sky, and it gives its fruit at all times.',
      'Allah vergleicht ein gutes Wort mit einem guten Baum: Seine Wurzel ist fest, seine Zweige reichen in den Himmel, und er bringt zu jeder Zeit seine Früchte.',
      'Allah lijepu riječ poredi s lijepim stablom: korijen mu je čvrst, grane mu sežu do neba i plod svoj daje u svako doba.',
    ),
    sources: [quran('14:24–25')],
  }),
  goodOrSilent: (): GameFact => ({
    id: 'good-or-silent',
    art: 'akhlaq.quiet-bubble',
    text: T(
      'The Prophet ﷺ said: whoever believes in Allah and the Last Day should say something good or stay silent.',
      'Der Prophet ﷺ sagte: Wer an Allah und den Jüngsten Tag glaubt, soll Gutes sagen oder schweigen.',
      'Poslanik ﷺ je rekao: Ko vjeruje u Allaha i Sudnji dan, neka govori dobro ili neka šuti.',
    ),
    sources: [bukhari('6018'), muslim('47')],
  }),
  goodWordCharity: (): GameFact => ({
    id: 'good-word-charity',
    art: 'akhlaq.salam-bubble',
    text: T('The Prophet ﷺ said: a good word is charity.', 'Der Prophet ﷺ sagte: Ein gutes Wort ist eine Sadaqa (Spende).', 'Poslanik ﷺ je rekao: Lijepa riječ je sadaka.'),
    sources: [bukhari('2989'), muslim('1009')],
  }),
  thankPeopleHadith: (): GameFact => ({
    id: 'thank-people',
    art: 'akhlaq.note-heart',
    text: T(
      'The Prophet ﷺ said: whoever does not thank people has not thanked Allah.',
      'Der Prophet ﷺ sagte: Wer den Menschen nicht dankt, hat Allah nicht gedankt.',
      'Poslanik ﷺ je rekao: Ko ne zahvali ljudima, nije zahvalio ni Allahu.',
    ),
    sources: [abuDawud('4811')],
  }),
  countBlessings: (): GameFact => ({
    id: 'countless-blessings',
    art: 'akhlaq.gratitude-jar',
    text: T(
      'If you tried to count the blessings of Allah, you could never count them all.',
      'Wenn ihr die Gaben Allahs aufzählen wolltet, könntet ihr sie nicht erfassen.',
      'Ako biste Allahove blagodati brojali, ne biste ih mogli nabrojati.',
    ),
    sources: [quran('16:18')],
  }),
};
