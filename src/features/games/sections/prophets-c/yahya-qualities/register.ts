import { type GameDef, registerGame } from '@/core/games';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Yahya – three parts of what the Quran tells about him (3:38–39, 19:7–15), each with its lesson:
 * L1 the glad tidings of Yahya and his name (3:39, 19:7) – connect each part with its words (episode: connect);
 * L2 "Take the Scripture with strength": wisdom as a child, tenderness and purity (19:12–13) (episode: memory);
 * L3 dutiful to his parents, never arrogant, and peace upon him (19:14–15) (episode: sort).
 */

export const YAHYA_ID = 'yahya-qualities';

export type YahyaConfig = EpisodeConfig;

export const yahyaI18n = gameTexts(YAHYA_ID, {
  title: T('What Yahya Was', 'Wie Yahya war', 'Kakav je bio Jahja'),
  description: T(
    'Three parts of Yahya’s story: the glad tidings of his birth, the Scripture he took with strength and his goodness to his parents – each with its lesson.',
    'Drei Teile von Yahyas Geschichte: die frohe Botschaft seiner Geburt, die Schrift, die er mit Kraft nahm, und seine Güte zu den Eltern – jeder mit seiner Lehre.',
    'Tri dijela Jahjine priče: radosna vijest o njegovom rođenju, Knjiga koju je odlučno prihvatio i njegova dobrota prema roditeljima – svaki sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: connect the parts of the glad tidings. Level 2: find the pairs of Allah’s gifts. Level 3: drag each card into the right basket.',
    'Stufe 1: Verbinde die Teile der frohen Botschaft. Stufe 2: Finde die Paare der Gaben Allahs. Stufe 3: Zieh jede Karte in den richtigen Korb.',
    'Nivo 1: spoji dijelove radosne vijesti. Nivo 2: pronađi parove Allahovih darova. Nivo 3: prevuci svaku karticu u pravu korpu.',
  ),
});

export const YAHYA_FACTS = {
  qualities: {
    id: 'yahya-dutiful',
    text: T(
      'Yahya was mindful of Allah and dutiful to his parents, and he was not arrogant or disobedient.',
      'Yahya war gottesfürchtig und gütig zu seinen Eltern, und er war weder hochmütig noch ungehorsam.',
      'Jahja je bio bogobojazan i poslušan roditeljima svojim, i nije bio ni nasilnik ni buntovnik.',
    ),
    sources: [quran('19:13–14')],
    art: 'prophet.yahya-home-heart',
    check: {
      type: 'trueFalse',
      statement: T('Yahya was arrogant and disobedient.', 'Yahya war hochmütig und ungehorsam.', 'Jahja je bio nasilnik i buntovnik.'),
      correct: false,
    },
  },
  noble: {
    id: 'yahya-noble',
    text: T(
      'The angels gave Zakariyya the glad tidings of Yahya: he would confirm a word from Allah and be noble, chaste and a prophet among the righteous.',
      'Die Engel verkündeten Zakariyya Yahya: Er würde ein Wort von Allah bestätigen und edel, keusch und ein Prophet unter den Rechtschaffenen sein.',
      'Meleki su Zekerijji javili radosnu vijest o Jahji: on će potvrditi Riječ od Allaha i bit će ugledan, čedan i vjerovjesnik među dobrima.',
    ),
    sources: [quran('3:39')],
  },
  book: {
    id: 'take-the-book',
    text: T(
      '"O Yahya, take the Scripture with strength." And Allah gave him wisdom while he was still a child, and tenderness and purity from Him.',
      '„O Yahya, nimm die Schrift mit Kraft.“ Und Allah gab ihm Weisheit, als er noch ein Kind war, und Zärtlichkeit und Reinheit von Ihm.',
      '„O Jahja, prihvati Knjigu odlučno!“ I Allah mu je dao mudrost još dok je bio dječak, i samilost od Sebe i čistotu.',
    ),
    sources: [quran('19:12–13')],
    art: 'prophet.yahya-book',
    check: {
      type: 'choice',
      prompt: T(
        'What did Allah give Yahya while he was still a child?',
        'Was gab Allah Yahya, als er noch ein Kind war?',
        'Šta je Allah dao Jahji dok je još bio dječak?',
      ),
      options: [T('Wisdom', 'Weisheit', 'Mudrost'), T('A kingdom', 'Ein Königreich', 'Carstvo'), T('Riches', 'Reichtum', 'Bogatstvo')],
      correctIndex: 0,
    },
  },
  peace: {
    id: 'peace-on-yahya',
    text: T(
      '"Peace be upon him the day he was born, the day he dies, and the day he is raised alive."',
      '„Friede sei auf ihm am Tag, als er geboren wurde, am Tag, an dem er stirbt, und am Tag, an dem er wieder lebendig auferweckt wird.“',
      '„Neka je mir njemu na dan kad se rodio, i na dan kad bude umro, i na dan kad bude oživljen!“',
    ),
    sources: [quran('19:15')],
    art: 'prophet.yahya-peace',
  },
  childGift: lessonFact(
    'child-a-gift',
    T(
      'Every child is a gift from Allah. Yahya was the answer to his father’s dua – thank Allah for your family.',
      'Jedes Kind ist ein Geschenk Allahs. Yahya war die Antwort auf das Du’a seines Vaters – danke Allah für deine Familie.',
      'Svako dijete je Allahov dar. Jahja je bio odgovor na dovu svoga oca – zahvaljuj Allahu na svojoj porodici.',
    ),
    [quran('3:38–39'), quran('19:7')],
    { art: 'prophet.yahya-light' },
  ),
  learnYoung: lessonFact(
    'learn-when-young',
    T(
      'Take learning seriously, even when you are young. Yahya was told: "Take the Scripture with strength" – and he was given wisdom as a child.',
      'Nimm das Lernen ernst, auch wenn du jung bist. Yahya wurde gesagt: „Nimm die Schrift mit Kraft“ – und er bekam Weisheit schon als Kind.',
      'Ozbiljno shvati učenje, i kada si mlad. Jahji je rečeno: „Prihvati Knjigu odlučno“ – i dobio je mudrost još kao dijete.',
    ),
    [quran('19:12')],
    { art: 'prophet.yahya-book' },
  ),
  parents: lessonFact(
    'be-good-to-parents',
    T(
      'Be good to your parents and never arrogant. Allah praises Yahya for being dutiful to his parents.',
      'Sei gut zu deinen Eltern und niemals hochmütig. Allah lobt Yahya dafür, dass er gütig zu seinen Eltern war.',
      'Budi dobar prema roditeljima i nikad ohol. Allah hvali Jahju jer je bio poslušan roditeljima.',
    ),
    [quran('19:14'), quran('17:23')],
    { art: 'prophet.yahya-home-heart' },
  ),
} satisfies Facts;

/** L1 – the glad tidings of Yahya (3:39, 19:7). */
const TIDINGS: Episode = {
  kind: 'connect',
  prompt: T('The angels brought Zakariyya glad tidings. Connect each part with its words.', 'Die Engel brachten Zakariyya eine frohe Botschaft. Verbinde jeden Teil mit seinen Worten.', 'Meleki su Zekerijji donijeli radosnu vijest. Spoji svaki dio s njegovim riječima.'),
  hints: true,
  pairs: [
    { id: 'a-son', left: { art: 'prophet.yahya-light', label: T('A son for Zakariyya', 'Ein Sohn für Zakariyya', 'Sin za Zekerijju') }, right: { label: T('named Yahya (19:7)', 'namens Yahya (19:7)', 'po imenu Jahja (19:7)') } },
    { id: 'his-name', left: { art: 'object.star8', label: T('His name', 'Sein Name', 'Njegovo ime') }, right: { label: T('given to no one before him (19:7)', 'vor ihm niemandem gegeben (19:7)', 'nikome prije njega dato (19:7)') } },
    { id: 'confirms', left: { art: 'object.scroll', label: T('He will confirm', 'Er wird bestätigen', 'On će potvrditi') }, right: { label: T('a word from Allah (3:39)', 'ein Wort von Allah (3:39)', 'Riječ od Allaha (3:39)') } },
    { id: 'noble-chaste', left: { art: 'garden.flower-lily', label: T('Noble and chaste', 'Edel und keusch', 'Ugledan i čedan') }, right: { label: T('as Allah describes him (3:39)', 'wie Allah ihn beschreibt (3:39)', 'kako ga Allah opisuje (3:39)') } },
    { id: 'a-prophet', left: { art: 'garden.olive', label: T('A prophet', 'Ein Prophet', 'Vjerovjesnik') }, right: { label: T('among the righteous (3:39)', 'unter den Rechtschaffenen (3:39)', 'među dobrima (3:39)') } },
  ],
  factMap: { 'a-son': 'lesson-child-a-gift', 'his-name': 'lesson-child-a-gift', confirms: 'yahya-noble', 'noble-chaste': 'yahya-noble', 'a-prophet': 'yahya-noble' },
};

/** L2 – what Allah gave Yahya (19:12–13): picture ↔ word. */
const GIFTS: Episode = {
  kind: 'memory',
  prompt: T('"O Yahya, take the Scripture with strength" (19:12). Find each gift of Allah with its picture.', '„O Yahya, nimm die Schrift mit Kraft“ (19:12). Finde jede Gabe Allahs mit ihrem Bild.', '„O Jahja, prihvati Knjigu odlučno“ (19:12). Pronađi svaki Allahov dar s njegovom slikom.'),
  hints: false,
  pairs: [
    { id: 'gift-book', a: { art: 'prophet.yahya-book' }, b: { label: T('The Scripture, with strength', 'Die Schrift, mit Kraft', 'Knjiga, odlučno'), sub: '19:12' }, caption: T('"Take the Scripture with strength." (19:12)', '„Nimm die Schrift mit Kraft.“ (19:12)', '„Prihvati Knjigu odlučno.“ (19:12)') },
    { id: 'gift-wisdom', a: { art: 'prophet.yahya-sapling' }, b: { label: T('Wisdom as a child', 'Weisheit als Kind', 'Mudrost u djetinjstvu'), sub: '19:12' }, caption: T('Wisdom while still a child. (19:12)', 'Weisheit schon als Kind. (19:12)', 'Mudrost još u djetinjstvu. (19:12)') },
    { id: 'gift-tender', a: { art: 'ui.heart' }, b: { label: T('Tenderness from Allah', 'Zärtlichkeit von Allah', 'Samilost od Allaha'), sub: '19:13' }, caption: T('Tenderness from Him. (19:13)', 'Zärtlichkeit von Ihm. (19:13)', 'Samilost od Njega. (19:13)') },
    { id: 'gift-purity', a: { art: 'object.water-jug' }, b: { label: T('Purity', 'Reinheit', 'Čistota'), sub: '19:13' }, caption: T('And purity. (19:13)', 'Und Reinheit. (19:13)', 'I čistota. (19:13)') },
    { id: 'gift-taqwa', a: { art: 'object.prayer-mat' }, b: { label: T('Mindful of Allah', 'Gottesfürchtig', 'Bogobojazan'), sub: '19:13' }, caption: T('He was mindful of Allah. (19:13)', 'Er war gottesfürchtig. (19:13)', 'Bio je bogobojazan. (19:13)') },
  ],
  factMap: { 'gift-book': 'lesson-learn-when-young', 'gift-wisdom': 'lesson-learn-when-young', 'gift-tender': 'take-the-book', 'gift-purity': 'take-the-book', 'gift-taqwa': 'take-the-book' },
};

/** L3 – Yahya and his parents, and peace upon him (19:14–15). */
const PARENTS: Episode = {
  kind: 'sort',
  prompt: T('Sort the words of 19:14–15: what Yahya was, what he was not – and when peace is upon him.', 'Sortiere die Worte aus 19:14–15: wie Yahya war, wie er nicht war – und wann Friede auf ihm ist.', 'Razvrstaj riječi iz 19:14–15: kakav je Jahja bio, kakav nije bio – i kada je mir na njemu.'),
  hints: false,
  bins: [
    { id: 'bin-was', label: T('Yahya was…', 'Yahya war…', 'Jahja je bio…'), art: 'prophet.yahya-home-heart' },
    { id: 'bin-not', label: T('He was not…', 'Er war nicht…', 'Nije bio…'), art: 'kit.crate' },
    { id: 'bin-peace', label: T('Peace upon him…', 'Friede auf ihm…', 'Mir njemu…'), art: 'prophet.yahya-peace' },
  ],
  items: [
    { id: 'kind-to-parents', bin: 'bin-was', label: T('Dutiful to his parents', 'Gütig zu den Eltern', 'Poslušan roditeljima'), sub: '19:14' },
    { id: 'arrogant', bin: 'bin-not', label: T('Arrogant', 'Hochmütig', 'Nasilnik'), sub: '19:14' },
    { id: 'disobedient', bin: 'bin-not', label: T('Disobedient', 'Ungehorsam', 'Buntovnik'), sub: '19:14' },
    { id: 'day-born', bin: 'bin-peace', label: T('the day he was born', 'am Tag seiner Geburt', 'na dan rođenja'), sub: '19:15' },
    { id: 'day-dies', bin: 'bin-peace', label: T('the day he dies', 'am Tag seines Todes', 'na dan smrti'), sub: '19:15' },
    { id: 'day-raised', bin: 'bin-peace', label: T('the day he is raised alive', 'am Tag seiner Auferweckung', 'na dan proživljenja'), sub: '19:15' },
  ],
  factMap: { 'kind-to-parents': 'lesson-be-good-to-parents', arrogant: 'yahya-dutiful', disobedient: 'yahya-dutiful', 'day-born': 'peace-on-yahya', 'day-dies': 'peace-on-yahya', 'day-raised': 'peace-on-yahya' },
};

export const yahyaGame: GameDef<YahyaConfig> = {
  id: YAHYA_ID,
  topicId: 'prophets',
  i18n: yahyaI18n,
  coverArt: 'prophet.yahya-book',
  hintArt: 'prophet.yahya-sapling',
  component: lazyGame(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    () => (require('../../prophets-story/EpisodeBoard') as typeof import('../../prophets-story/EpisodeBoard')).EpisodeGame,
  ),
  levels: [
    { level: 1, config: { mode: 'episode', episode: TIDINGS }, facts: [YAHYA_FACTS.noble, YAHYA_FACTS.childGift] },
    { level: 2, config: { mode: 'episode', episode: GIFTS }, facts: [YAHYA_FACTS.book, YAHYA_FACTS.learnYoung] },
    { level: 3, config: { mode: 'episode', episode: PARENTS }, facts: [YAHYA_FACTS.qualities, YAHYA_FACTS.peace, YAHYA_FACTS.parents] },
  ],
  order: 23,
};

export const YAHYA_ART: string[] = [...episodeArt(TIDINGS), ...episodeArt(GIFTS), ...episodeArt(PARENTS)];

export function registerYahyaGame(): void {
  registerGame(yahyaGame);
}
