import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SourceList } from '@/core/components/ui/SourceList';
import { defineNamespace } from '@/core/i18n';
import { LANGUAGE_SOURCES, type LocalizedText, type Question, type TopicId } from '@/core/models';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { UNITS } from '@/features/learn/content';
import { QUEST_QUESTIONS } from '@/features/learn/content/quests';

import { registerGame, listGames, type GameApi, type GameDef, type GameFact } from '@/core/games';
import { HARAKAT, HARAKA_NAMES, LETTERS, SYLLABLE_LETTERS, letterInfo, lookAlikes, type Haraka } from './letter-lanterns/letters';
import { letterChoices, vowelChoices } from '../learn/sufara/logic';
import { syllable } from './letter-lanterns/logic';

type SupportedQuestion = Extract<Question, { type: 'multipleChoice' | 'lessonChoice' | 'trueFalse' | 'scenario' | 'ordering' | 'matching' | 'memory' | 'fillBlank' | 'categorize' }>;

type PuzzleOption = { id: string; text: LocalizedText };
type PickTask = { kind: 'pick'; prompt: LocalizedText; display?: LocalizedText; options: PuzzleOption[]; correctId: string };
type OrderTask = { kind: 'order'; prompt: LocalizedText; options: PuzzleOption[]; correctIds: string[] };
type PuzzleTask = PickTask | OrderTask;

interface TopicGameConfig {
  kind: 'topic';
  tasks: PuzzleTask[];
}

type SufaraMode = 'letter' | 'letter-name' | 'name-letter' | 'dots' | 'fatha' | 'kasra' | 'damma' | 'vowel-mark' | 'vowel-sound' | 'mixed';

interface SufaraGameConfig {
  kind: 'sufara';
  mode: SufaraMode;
  positions: number[];
}

export const SUFARA_LETTER_ORDER = [1, 8, 10, 27, 23, 24, 25, 22, 12, 20, 2, 3, 5, 6, 9, 11, 18, 26, 28, 4, 7, 13, 14, 15, 16, 17, 19, 21] as const;
const SUFARA_LEVEL_LETTERS = [SUFARA_LETTER_ORDER.slice(0, 10), SUFARA_LETTER_ORDER.slice(10, 19), SUFARA_LETTER_ORDER.slice(19)];

type ActivityConfig = TopicGameConfig | SufaraGameConfig;

interface ActivityTitle {
  id: string;
  title: LocalizedText;
}

const ACTIVITY_ART: Partial<Record<TopicId, readonly string[]>> = {
  salah: ['object.prayer-mat', 'object.sundial', 'object.compass', 'place.masjid-nabawi-early', 'object.kaaba-icon', 'object.quran-stand'],
  quran: ['object.quran-stand', 'object.book', 'object.pen', 'object.inkwell', 'garden.flower-rose', 'object.scroll', 'garden.stars', 'object.lantern-ramadan'],
  prophets: ['object.ark', 'garden.stars', 'object.grain-sack', 'place.cave-thawr', 'animal.camel', 'place.makkah-city', 'object.scroll', 'place.madinah-city'],
  seerah: ['scene.map-hijaz', 'place.masjid-nabawi-early', 'object.compass', 'place.makkah-city', 'place.madinah-city', 'animal.camel', 'object.scroll', 'object.book'],
  akhlaq: ['object.coin-jar', 'object.gift', 'animal.cat', 'object.book', 'ui.heart', 'food.dates', 'garden.sprout', 'object.basket', 'object.water-jug'],
  ramadan: ['object.lantern-ramadan', 'food.dates', 'food.water', 'garden.moon', 'object.prayer-mat', 'object.coin-jar', 'garden.stars', 'food.soup', 'garden.olive'],
  history: ['object.book', 'object.scroll', 'object.pen', 'place.madinah-city', 'place.makkah-city', 'object.inkwell', 'scene.map-hijaz', 'object.compass', 'garden.stars', 'place.masjid-nabawi-early'],
  arabic: ['object.pen', 'object.inkwell', 'object.lantern-ramadan', 'object.book', 'object.quran-stand', 'object.scroll', 'object.pen', 'object.inkwell'],
};

const SUFARA_ART = ['object.book', 'object.pen', 'object.inkwell', 'object.lantern-ramadan', 'object.scroll'] as const;

const ADDITIONAL_GAMES: Partial<Record<TopicId, ActivityTitle[]>> = {
  salah: [
    { id: 'prayer-order', title: { en: 'Order the Daily Prayers', de: 'Die täglichen Gebete ordnen', bs: 'Poredaj dnevne namaze' } },
    { id: 'prayer-times', title: { en: 'Prayer Time Trail', de: 'Der Gebetszeiten-Pfad', bs: 'Staza namaskih vremena' } },
    { id: 'rakah-match', title: { en: 'Match the Rak‘ahs', de: 'Die Rak‘as zuordnen', bs: 'Spoji broj rekata' } },
    { id: 'salah-words', title: { en: 'Words of Salah', de: 'Wörter des Gebets', bs: 'Riječi namaza' } },
    { id: 'mosque-manners', title: { en: 'Good Mosque Manners', de: 'Gutes Verhalten in der Moschee', bs: 'Lijepo ponašanje u džamiji' } },
    { id: 'salah-memory', title: { en: 'Salah Memory Pairs', de: 'Gebets-Memory', bs: 'Memorija namaza' } },
  ],
  quran: [
    { id: 'revelation-path', title: { en: 'The Revelation Path', de: 'Der Weg der Offenbarung', bs: 'Put objave Kur’ana' } },
    { id: 'surah-structure', title: { en: 'Surah Structure', de: 'Aufbau einer Sure', bs: 'Građa sure' } },
    { id: 'quran-etiquette', title: { en: 'Quran Etiquette', de: 'Der Umgang mit dem Koran', bs: 'Adab prema Kur’anu' } },
    { id: 'ayah-order', title: { en: 'Put the Ayahs in Order', de: 'Verse ordnen', bs: 'Poredaj ajete' } },
    { id: 'surah-match', title: { en: 'Surah Match', de: 'Suren zuordnen', bs: 'Spoji sure' } },
    { id: 'quran-words', title: { en: 'Quran Words', de: 'Koran-Wörter', bs: 'Kur’anske riječi' } },
    { id: 'short-surah-memory', title: { en: 'Short Surah Memory', de: 'Kurze Suren merken', bs: 'Pamćenje kratkih sura' } },
    { id: 'quran-facts', title: { en: 'Quran Facts', de: 'Koran-Wissen', bs: 'Znanje o Kur’anu' } },
  ],
  prophets: [
    { id: 'adam-story', title: { en: 'Adam’s Story', de: 'Die Geschichte Adams', bs: 'Priča o Ademu' } },
    { id: 'ibrahim-story', title: { en: 'Ibrahim’s Story', de: 'Die Geschichte Ibrahims', bs: 'Priča o Ibrahimu' } },
    { id: 'musa-story', title: { en: 'Musa’s Story', de: 'Die Geschichte Musas', bs: 'Priča o Musau' } },
    { id: 'yunus-story', title: { en: 'Yunus’s Story', de: 'Die Geschichte Yunus’', bs: 'Priča o Junusu' } },
    { id: 'isa-story', title: { en: 'Isa’s Story', de: 'Die Geschichte Isas', bs: 'Priča o Isau' } },
    { id: 'prophet-timeline', title: { en: 'Prophet Timeline', de: 'Propheten-Zeitleiste', bs: 'Vremenska linija poslanika' } },
    { id: 'prophet-lessons', title: { en: 'Lessons from the Prophets', de: 'Lehren der Propheten', bs: 'Pouke iz života poslanika' } },
    { id: 'prophet-memory', title: { en: 'Prophet Memory Pairs', de: 'Propheten-Memory', bs: 'Memorija poslanika' } },
  ],
  seerah: [
    { id: 'early-makkah', title: { en: 'Early Makkah', de: 'Das frühe Mekka', bs: 'Početak u Mekki' } },
    { id: 'first-revelation', title: { en: 'The First Revelation', de: 'Die erste Offenbarung', bs: 'Prva objava' } },
    { id: 'makkah-timeline', title: { en: 'Makkah Timeline', de: 'Zeitleiste Mekkas', bs: 'Vremenska linija Mekke' } },
    { id: 'companions', title: { en: 'People of the Seerah', de: 'Menschen der Sira', bs: 'Ljudi iz sire' } },
    { id: 'madinah-life', title: { en: 'Life in Madinah', de: 'Leben in Medina', bs: 'Život u Medini' } },
    { id: 'seerah-places', title: { en: 'Places of the Seerah', de: 'Orte der Sira', bs: 'Mjesta iz sire' } },
    { id: 'seerah-events', title: { en: 'Seerah Events', de: 'Ereignisse der Sira', bs: 'Događaji iz sire' } },
    { id: 'seerah-memory', title: { en: 'Seerah Memory Pairs', de: 'Sira-Memory', bs: 'Memorija sire' } },
  ],
  akhlaq: [
    { id: 'honesty', title: { en: 'Choose Honesty', de: 'Ehrlich handeln', bs: 'Izaberi iskrenost' } },
    { id: 'trust', title: { en: 'Keep the Trust', de: 'Vertrauen bewahren', bs: 'Čuvaj emanet' } },
    { id: 'gratitude', title: { en: 'A Grateful Heart', de: 'Ein dankbares Herz', bs: 'Zahvalno srce' } },
    { id: 'kindness', title: { en: 'Kind Words', de: 'Freundliche Worte', bs: 'Lijepe riječi' } },
    { id: 'mercy', title: { en: 'Show Mercy', de: 'Barmherzig handeln', bs: 'Pokaži milost' } },
    { id: 'forgiveness', title: { en: 'The Forgiveness Path', de: 'Der Weg der Vergebung', bs: 'Put oprosta' } },
    { id: 'patience', title: { en: 'Practice Patience', de: 'Geduld üben', bs: 'Vježbaj sabur' } },
    { id: 'parents', title: { en: 'Kindness to Parents', de: 'Güte zu den Eltern', bs: 'Dobročinstvo roditeljima' } },
    { id: 'akhlaq-memory', title: { en: 'Akhlaq Memory Pairs', de: 'Akhlaq-Memory', bs: 'Memorija ahlaka' } },
  ],
  ramadan: [
    { id: 'fasting-hours', title: { en: 'When Do We Fast?', de: 'Wann wird gefastet?', bs: 'Kada se posti?' } },
    { id: 'suhoor-iftar', title: { en: 'Suhoor and Iftar', de: 'Suhur und Iftar', bs: 'Sehur i iftar' } },
    { id: 'fasting-safety', title: { en: 'Fasting Safely', de: 'Sicher fasten', bs: 'Sigurno vježbanje posta' } },
    { id: 'laylat-al-qadr', title: { en: 'Laylat al-Qadr', de: 'Laylat al-Qadr', bs: 'Lejletul-kadr' } },
    { id: 'ramadan-nights', title: { en: 'Ramadan Nights', de: 'Ramadannächte', bs: 'Ramazanske noći' } },
    { id: 'ramadan-charity', title: { en: 'Generosity in Ramadan', de: 'Großzügigkeit im Ramadan', bs: 'Darežljivost u ramazanu' } },
    { id: 'eid-preparation', title: { en: 'Getting Ready for Eid', de: 'Vorbereitung auf Eid', bs: 'Priprema za Bajram' } },
    { id: 'ramadan-order', title: { en: 'Ramadan in Order', de: 'Ramadan in Reihenfolge', bs: 'Ramazan po redu' } },
    { id: 'ramadan-memory', title: { en: 'Ramadan Memory Pairs', de: 'Ramadan-Memory', bs: 'Ramazanska memorija' } },
  ],
  history: [
    { id: 'caliph-timeline', title: { en: 'Caliph Timeline', de: 'Zeitleiste der Kalifen', bs: 'Vremenska linija halifa' } },
    { id: 'early-leaders', title: { en: 'Early Muslim Leaders', de: 'Frühe muslimische Herrscher', bs: 'Rani muslimanski vođe' } },
    { id: 'scholars', title: { en: 'Meet the Scholars', de: 'Lerne die Gelehrten kennen', bs: 'Upoznaj učenjake' } },
    { id: 'centres-of-learning', title: { en: 'Centres of Learning', de: 'Orte des Lernens', bs: 'Centri znanja' } },
    { id: 'history-order', title: { en: 'Put History in Order', de: 'Geschichte ordnen', bs: 'Poredaj historijske događaje' } },
    { id: 'history-match', title: { en: 'People and Events', de: 'Menschen und Ereignisse', bs: 'Ljudi i događaji' } },
    { id: 'history-places', title: { en: 'Historic Places', de: 'Historische Orte', bs: 'Historijska mjesta' } },
    { id: 'history-ideas', title: { en: 'Ideas that Travelled', de: 'Wissen auf Reisen', bs: 'Znanje koje se širilo' } },
    { id: 'history-memory', title: { en: 'History Memory Pairs', de: 'Geschichts-Memory', bs: 'Historijska memorija' } },
    { id: 'history-review', title: { en: 'History Review', de: 'Geschichts-Rückblick', bs: 'Historijski pregled' } },
  ],
  arabic: [
    { id: 'arabic-dots', title: { en: 'Letter Dot Detective', de: 'Punkte-Detektive', bs: 'Detektivi harfovskih tačaka' } },
    { id: 'arabic-sounds', title: { en: 'Arabic Letter Sounds', de: 'Laute arabischer Buchstaben', bs: 'Glasovi arapskih harfova' } },
    { id: 'arabic-word-match', title: { en: 'Word and Picture Match', de: 'Wort und Bild zuordnen', bs: 'Spoji riječ i sliku' } },
    { id: 'arabic-word-build', title: { en: 'Build an Arabic Word', de: 'Ein arabisches Wort bauen', bs: 'Sastavi arapsku riječ' } },
    { id: 'arabic-letter-order', title: { en: 'Alphabet Trail', de: 'Alphabet-Pfad', bs: 'Staza arapskog alfabeta' } },
    { id: 'arabic-vowel-match', title: { en: 'Short Vowel Match', de: 'Kurze Vokale zuordnen', bs: 'Spoji kratke vokale' } },
    { id: 'arabic-letter-memory', title: { en: 'Letter Memory Pairs', de: 'Buchstaben-Memory', bs: 'Memorija harfova' } },
    { id: 'arabic-script', title: { en: 'Read the Arabic Script', de: 'Arabische Schrift lesen', bs: 'Čitaj arapsko pismo' } },
  ],
};

const SUFARA_GAMES: { id: string; mode: SufaraMode; title: LocalizedText; description: LocalizedText }[] = [
  { id: 'letters', mode: 'letter', title: { en: 'Sufara: Find the Letter', de: 'Sufara: Buchstaben finden', bs: 'Sufara: Pronađi harf' }, description: { en: 'Match a letter name to its Arabic shape.', de: 'Ordne einen Buchstabennamen seiner arabischen Form zu.', bs: 'Spoji ime harfa s njegovim arapskim oblikom.' } },
  { id: 'letter-names', mode: 'letter-name', title: { en: 'Sufara: Letter Names', de: 'Sufara: Buchstabennamen', bs: 'Sufara: Imena harfova' }, description: { en: 'Read an Arabic letter and choose its name.', de: 'Lies einen arabischen Buchstaben und wähle seinen Namen.', bs: 'Pročitaj arapski harf i izaberi njegovo ime.' } },
  { id: 'name-to-letter', mode: 'name-letter', title: { en: 'Sufara: Name to Letter', de: 'Sufara: Name zum Buchstaben', bs: 'Sufara: Ime i harf' }, description: { en: 'Read a letter name and identify its Arabic shape.', de: 'Lies den Buchstabennamen und finde seine arabische Form.', bs: 'Pročitaj ime harfa i prepoznaj njegov arapski oblik.' } },
  { id: 'dot-families', mode: 'dots', title: { en: 'Sufara: Letter Dot Families', de: 'Sufara: Buchstaben-Punktgruppen', bs: 'Sufara: Porodice harfova' }, description: { en: 'Tell apart letters with similar shapes by their dots.', de: 'Unterscheide ähnlich geformte Buchstaben anhand ihrer Punkte.', bs: 'Razlikuj slične harfove po njihovim tačkama.' } },
  { id: 'fatha', mode: 'fatha', title: { en: 'Sufara: Fatha', de: 'Sufara: Fatha', bs: 'Sufara: Fetha' }, description: { en: 'Recognise the fatha sound on a letter.', de: 'Erkenne den Fatha-Laut auf einem Buchstaben.', bs: 'Prepoznaj fetha glas na harfu.' } },
  { id: 'kasra', mode: 'kasra', title: { en: 'Sufara: Kasra', de: 'Sufara: Kasra', bs: 'Sufara: Kesra' }, description: { en: 'Recognise the kasra sound on a letter.', de: 'Erkenne den Kasra-Laut auf einem Buchstaben.', bs: 'Prepoznaj kesra glas na harfu.' } },
  { id: 'damma', mode: 'damma', title: { en: 'Sufara: Damma', de: 'Sufara: Damma', bs: 'Sufara: Damma' }, description: { en: 'Recognise the damma sound on a letter.', de: 'Erkenne den Damma-Laut auf einem Buchstaben.', bs: 'Prepoznaj damma glas na harfu.' } },
  { id: 'vowel-marks', mode: 'vowel-mark', title: { en: 'Sufara: Read the Vowel Mark', de: 'Sufara: Vokalzeichen lesen', bs: 'Sufara: Prepoznaj vokalni znak' }, description: { en: 'Identify fatha, kasra, and damma by their marks.', de: 'Unterscheide Fatha, Kasra und Damma anhand ihrer Zeichen.', bs: 'Razlikuj fethu, kesru i dammu prema znakovima.' } },
  { id: 'vowel-sounds', mode: 'vowel-sound', title: { en: 'Sufara: Short Vowel Sounds', de: 'Sufara: Kurze Vokallaute', bs: 'Sufara: Glasovi kratkih vokala' }, description: { en: 'Match a short vowel sound to the Arabic syllable.', de: 'Ordne einen kurzen Vokallaut der arabischen Silbe zu.', bs: 'Spoji kratki vokalni glas s arapskim slogom.' } },
  { id: 'review', mode: 'mixed', title: { en: 'Sufara: Letter and Vowel Review', de: 'Sufara: Buchstaben und Vokale', bs: 'Sufara: Ponavljanje harfova i vokala' }, description: { en: 'Review letters and short vowels together.', de: 'Wiederhole Buchstaben und kurze Vokale gemeinsam.', bs: 'Ponovi harfove i kratke vokale zajedno.' } },
];

const names = (en: string, de: string, bs: string) => ({ en, de, bs });
const i18nFor = (id: string, title: LocalizedText, description?: LocalizedText) => defineNamespace(`game.${id}`, {
  en: { title: title.en, description: description?.en ?? 'A short, interactive activity built from the topic lessons.', howTo: 'Read the prompt, solve each round, and use the source note to review what you learned.', 'play.correct': 'Correct. Keep going.', 'play.tryAgain': 'Not quite. Try another answer.', 'play.continue': 'Continue', 'play.finish': 'Finish game', 'play.select': 'Choose the correct answer.', 'play.order': 'Tap the items in the correct order.', 'play.progress': 'Round {current} of {total}' },
  de: { title: title.de, description: description?.de ?? 'Eine kurze interaktive Übung aus den Themenlektionen.', howTo: 'Lies die Aufgabe, löse jede Runde und nutze den Quellenhinweis zur Wiederholung.', 'play.correct': 'Richtig. Weiter so.', 'play.tryAgain': 'Noch nicht. Versuch eine andere Antwort.', 'play.continue': 'Weiter', 'play.finish': 'Spiel beenden', 'play.select': 'Wähle die richtige Antwort.', 'play.order': 'Tippe die Elemente in der richtigen Reihenfolge an.', 'play.progress': 'Runde {current} von {total}' },
  bs: { title: title.bs, description: description?.bs ?? 'Kratka interaktivna igra napravljena od sadržaja ove teme.', howTo: 'Pročitaj zadatak, riješi svaku rundu i koristi izvor za ponavljanje naučenog.', 'play.correct': 'Tačno. Nastavi.', 'play.tryAgain': 'Nije baš. Pokušaj drugi odgovor.', 'play.continue': 'Nastavi', 'play.finish': 'Završi igru', 'play.select': 'Izaberi tačan odgovor.', 'play.order': 'Dodirni stavke pravilnim redoslijedom.', 'play.progress': 'Runda {current} od {total}' },
});

function localizedOption(id: string, text: LocalizedText): PuzzleOption {
  return { id, text };
}

function tasksFor(question: SupportedQuestion): PuzzleTask[] {
  if (question.type === 'ordering') {
    return [{ kind: 'order', prompt: question.prompt, options: question.items.map((item) => localizedOption(item.id, item.text)), correctIds: question.items.map((item) => item.id) }];
  }
  if (question.type === 'matching' || question.type === 'memory') {
    const options = question.pairs.map((pair) => localizedOption(pair.id, pair.right));
    return question.pairs.map((pair) => ({ kind: 'pick', prompt: question.prompt, display: pair.left, options, correctId: pair.id }));
  }
  if (question.type === 'categorize') {
    const options = question.categories.map((category) => localizedOption(category.id, category.label));
    return question.items.map((item) => ({ kind: 'pick', prompt: question.prompt, display: item.text, options, correctId: item.categoryId }));
  }
  if (question.type === 'trueFalse') {
    return [{ kind: 'pick', prompt: question.prompt, options: [localizedOption('true', names('True', 'Richtig', 'Tačno')), localizedOption('false', names('False', 'Falsch', 'Netačno'))], correctId: String(question.correct) }];
  }
  if (question.type === 'fillBlank') {
    return [{ kind: 'pick', prompt: question.sentence, options: question.options.map((option) => localizedOption(option.id, option.text)), correctId: question.correctOptionId }];
  }
  return [{ kind: 'pick', prompt: question.prompt, options: question.options.map((option) => localizedOption(option.id, option.text)), correctId: question.correctOptionId }];
}

function supported(question: Question): question is SupportedQuestion {
  return ['multipleChoice', 'lessonChoice', 'trueFalse', 'scenario', 'ordering', 'matching', 'memory', 'fillBlank', 'categorize'].includes(question.type) && Boolean(question.sources?.length);
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.md },
  header: { gap: spacing.xs },
  prompt: { borderRadius: radius.lg, backgroundColor: c.surfaceAlt, padding: spacing.lg, gap: spacing.md, minHeight: 150, justifyContent: 'center' },
  display: { fontSize: 46, textAlign: 'center', writingDirection: 'rtl' },
  options: { gap: spacing.sm },
  option: { minHeight: 54, justifyContent: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface },
  optionText: { textAlign: 'center' },
  feedback: { minHeight: 24 },
}));

function TopicArcadeGame(props: GameApi<ActivityConfig>) {
  if (props.config.kind === 'sufara') return <SufaraMiniGame {...props} config={props.config} />;
  return <QuestionMiniGame {...props} config={props.config} />;
}

function QuestionMiniGame({ config, facts, onComplete, playSound, haptic, t, l }: GameApi<ActivityConfig> & { config: TopicGameConfig }) {
  const styles = useStyles();
  const { c } = useTheme();
  const [taskIndex, setTaskIndex] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState('');
  const task = config.tasks[taskIndex];
  const currentFact = facts[0];
  const resetTask = () => { setSequence([]); setSolved(false); setFeedback(''); };
  const answer = (id: string) => {
    if (solved) return;
    if (task.kind === 'pick') {
      if (id === task.correctId) {
        setSolved(true);
        setFeedback(t('play.correct'));
        playSound('success');
        haptic('success');
      } else {
        setMistakes((count) => count + 1);
        setFeedback(t('play.tryAgain'));
        playSound('failure');
        haptic('warning');
      }
      return;
    }
    const expected = task.correctIds[sequence.length];
    if (id !== expected) {
      setMistakes((count) => count + 1);
      setSequence([]);
      setFeedback(t('play.tryAgain'));
      haptic('warning');
      return;
    }
    const next = [...sequence, id];
    setSequence(next);
    if (next.length === task.correctIds.length) {
      setSolved(true);
      setFeedback(t('play.correct'));
      playSound('success');
      haptic('success');
    }
  };
  const next = () => {
    if (taskIndex + 1 < config.tasks.length) {
      setTaskIndex((index) => index + 1);
      resetTask();
      return;
    }
    const score = Math.max(0, 10 - mistakes * 2);
    onComplete({ score, maxScore: 10, stars: score >= 9 ? 3 : score >= 6 ? 2 : 1, mistakes, factsMissed: mistakes > 0 ? [currentFact.id] : [] });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="small" color={c.textMuted}>{t('play.progress', { current: taskIndex + 1, total: config.tasks.length })}</AppText>
        <ProgressBar progress={(taskIndex + (solved ? 1 : 0)) / config.tasks.length} accessibilityLabel={`${taskIndex + (solved ? 1 : 0)} / ${config.tasks.length}`} />
      </View>
      <View style={styles.prompt}>
        {'display' in task && task.display ? <AppText variant="title" style={styles.display}>{l(task.display)}</AppText> : null}
        <AppText variant="bodyBold" align="center">{l(task.prompt)}</AppText>
      </View>
      {task.kind === 'order' ? <AppText variant="small" color={c.textMuted}>{t('play.order')}</AppText> : null}
      <View style={styles.options}>
        {task.kind === 'pick'
          ? task.options.map((option) => <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={l(option.text)} onPress={() => answer(option.id)} style={styles.option}><AppText variant={/[\u0600-\u06FF]/.test(l(option.text)) ? 'title' : 'body'} style={styles.optionText}>{l(option.text)}</AppText></Pressable>)
          : task.options.filter((option) => !sequence.includes(option.id)).map((option) => <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={l(option.text)} onPress={() => answer(option.id)} style={styles.option}><AppText variant={/[\u0600-\u06FF]/.test(l(option.text)) ? 'title' : 'body'} style={styles.optionText}>{l(option.text)}</AppText></Pressable>)}
      </View>
      <AppText variant="small" color={feedback === t('play.correct') ? c.success : c.goldText} style={styles.feedback} accessibilityLiveRegion="polite">{feedback}</AppText>
      {solved ? <SourceList sources={currentFact.sources} /> : null}
      {solved ? <Button label={taskIndex + 1 < config.tasks.length ? t('play.continue') : t('play.finish')} iconRight="chevron" onPress={next} /> : null}
    </View>
  );
}

function SufaraMiniGame({ config, facts, language, onComplete, playSound, haptic, t, l }: GameApi<ActivityConfig> & { config: SufaraGameConfig }) {
  const styles = useStyles();
  const { c } = useTheme();
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [letterIndex, setLetterIndex] = useState(0);
  const position = config.positions[letterIndex];
  const target = LETTERS[position - 1];
  const mixedMode: SufaraMode = config.mode === 'mixed' ? (['letter', 'fatha', 'kasra', 'damma'] as const)[(position - 1) % 4] : config.mode;
  const correctHaraka = (['fatha', 'kasra', 'damma'] as const).includes(mixedMode as Haraka) ? mixedMode as Haraka : vowelChoices(target.letter, position).target;
  const glyphs = letterChoices(position, language);
  const glyphOptions = glyphs.map((choice) => localizedOption(choice.letter, names(choice.letter, choice.letter, choice.letter)));
  const nameOptions = glyphs.map((choice) => localizedOption(choice.letter, names(choice.name, choice.name, choice.name)));
  const harakaOptions = HARAKA_NAMES.map((haraka) => localizedOption(haraka, names(haraka, haraka, haraka === 'fatha' ? 'fetha' : haraka === 'kasra' ? 'kesra' : 'damma')));
  const vowelSoundOptions = HARAKA_NAMES.map((haraka) => localizedOption(haraka, names(syllable(target.letter, haraka), syllable(target.letter, haraka), syllable(target.letter, haraka))));
  const similarLetters = lookAlikes(target.letter);
  const dotFamily = similarLetters.length > 0 ? [target.letter, ...similarLetters] : glyphs.map((choice) => choice.letter);
  const dotFamilyOptions = dotFamily.map((letter) => localizedOption(letter, letterInfo(letter)?.name ?? names(letter, letter, letter)));
  const options: PuzzleOption[] = mixedMode === 'fatha' || mixedMode === 'kasra' || mixedMode === 'damma' || mixedMode === 'vowel-mark'
    ? harakaOptions
    : mixedMode === 'vowel-sound'
      ? vowelSoundOptions
      : mixedMode === 'letter-name'
        ? nameOptions
        : mixedMode === 'dots'
          ? dotFamilyOptions
          : glyphOptions;
  const correctId = mixedMode === 'fatha' || mixedMode === 'kasra' || mixedMode === 'damma'
    ? mixedMode
    : mixedMode === 'vowel-mark' || mixedMode === 'vowel-sound'
      ? correctHaraka
    : mixedMode === 'letter-name'
      ? target.letter
      : mixedMode === 'dots'
        ? target.letter
        : target.letter;
  const consonant = SYLLABLE_LETTERS.find((entry) => entry.letter === target.letter)?.consonant ?? target.translit;
  const display = mixedMode === 'letter-name' || mixedMode === 'dots'
    ? mixedMode === 'dots' ? dotFamily.join('   ') : target.letter
    : mixedMode === 'name-letter' || mixedMode === 'letter'
      ? mixedMode === 'letter' ? target.translit : target.name[language]
      : mixedMode === 'vowel-mark'
        ? HARAKAT[correctHaraka].mark
        : mixedMode === 'vowel-sound'
          ? `${consonant}${HARAKAT[correctHaraka].vowel[language]}`
          : syllable(target.letter, mixedMode as Haraka);
  const prompt = mixedMode === 'letter-name'
    ? names('Choose the name of this letter.', 'Wähle den Namen dieses Buchstabens.', 'Izaberi ime ovog harfa.')
    : mixedMode === 'name-letter'
      ? names('Choose the letter with this name.', 'Wähle den Buchstaben mit diesem Namen.', 'Izaberi harf s ovim imenom.')
      : mixedMode === 'dots'
        ? names(`Select ${target.name.en} from this family.`, `Wähle ${target.name.de} aus dieser Gruppe.`, `Izaberi harf ${target.name.bs} iz ove grupe.`)
      : mixedMode === 'vowel-mark'
        ? names('Which short vowel mark is shown?', 'Welches kurze Vokalzeichen ist zu sehen?', 'Koji kratki vokalni znak je prikazan?')
        : mixedMode === 'vowel-sound'
          ? names('Choose the Arabic syllable for this sound.', 'Wähle die arabische Silbe zu diesem Laut.', 'Izaberi arapski slog za ovaj glas.')
        : mixedMode === 'fatha' || mixedMode === 'kasra' || mixedMode === 'damma'
          ? names('Which vowel is on this letter?', 'Welcher Vokal steht auf diesem Buchstaben?', 'Koji vokal je na ovom harfu?')
          : names('Choose the Arabic letter for this name.', 'Wähle den arabischen Buchstaben zu diesem Namen.', 'Izaberi arapski harf za ovo ime.');
  const fact = facts[0];
  const choose = (id: string) => {
    if (solved) return;
    if (id !== correctId) {
      setMistakes((count) => count + 1);
      setFeedback(t('play.tryAgain'));
      haptic('warning');
      return;
    }
    setSolved(true);
    setFeedback(t('play.correct'));
    playSound('success');
    haptic('success');
  };
  const finish = () => {
    if (letterIndex + 1 < config.positions.length) {
      setLetterIndex((index) => index + 1);
      setSolved(false);
      setFeedback('');
      return;
    }
    const maxScore = config.positions.length * 10;
    const score = Math.max(0, maxScore - mistakes * 2);
    const ratio = score / maxScore;
    onComplete({ score, maxScore, stars: ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1, mistakes, factsMissed: mistakes > 0 ? [fact.id] : [] });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}><AppText variant="small" color={c.textMuted}>{t('play.progress', { current: letterIndex + 1, total: config.positions.length })}</AppText><ProgressBar progress={(letterIndex + (solved ? 1 : 0)) / config.positions.length} accessibilityLabel={`${letterIndex + (solved ? 1 : 0)} / ${config.positions.length}`} /></View>
      <View style={styles.prompt}><AppText variant="title" style={styles.display}>{display}</AppText><AppText variant="bodyBold" align="center">{l(prompt)}</AppText></View>
      <View style={styles.options}>{options.map((option) => <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={l(option.text)} onPress={() => choose(option.id)} style={styles.option}><AppText variant={/[\u0600-\u06FF]/.test(l(option.text)) ? 'title' : 'body'} style={styles.optionText}>{l(option.text)}</AppText></Pressable>)}</View>
      <AppText variant="small" color={feedback === t('play.correct') ? c.success : c.goldText} style={styles.feedback} accessibilityLiveRegion="polite">{feedback}</AppText>
      {solved ? <SourceList sources={fact.sources} /> : null}
      {solved ? <Button label={letterIndex + 1 < config.positions.length ? t('play.continue') : t('play.finish')} iconRight="chevron" onPress={finish} /> : null}
    </View>
  );
}

const SUFARA_FACT: GameFact = {
  id: 'sufara-letter-practice',
  kind: 'language',
  text: names('Arabic letter and vowel practice.', 'Übung mit arabischen Buchstaben und Vokalen.', 'Vježba arapskih harfova i vokala.'),
  sources: [LANGUAGE_SOURCES.alphabet],
  art: 'object.book',
};

function registerSufaraGames(): void {
  SUFARA_GAMES.forEach(({ id: slug, mode, title, description }, gameIndex) => {
    const id = `sufara-${slug}`;
    const i18n = i18nFor(id, title, description);
    const def: GameDef<SufaraGameConfig> = {
      id,
      topicId: 'arabic',
      shelfGroup: 'sufara',
      i18n,
      coverArt: SUFARA_ART[gameIndex % SUFARA_ART.length],
      hintArt: 'object.pen',
      component: TopicArcadeGame,
      levels: [1, 2, 3].map((level) => {
        const positions = SUFARA_LEVEL_LETTERS[level - 1];
        return { level: level as 1 | 2 | 3, config: { kind: 'sufara', mode, positions: [...positions] }, facts: [{ ...SUFARA_FACT, id: `letters-level-${level}-${mode}` }] };
      }),
      teaches: { questionKeys: ['learn:arabic-letters-1', 'learn:arabic-harakat-1'] },
      order: 50 + gameIndex,
    };
    registerGame(def);
  });
}

export function registerTopicArcadeGames(): void {
  const initialGames = listGames({ includeDev: false });
  const coreQuestions = UNITS.flatMap((unit) => unit.questions.map((question) => ({ question: { ...question, areaId: unit.areaId, sources: question.sources?.length ? question.sources : unit.sources } as Question, reviewKey: `learn:${question.id}` })));
  const questQuestions = QUEST_QUESTIONS.map((question) => ({ question: question as Question, reviewKey: `quest:${question.id}` }));

  for (const [topic, titles] of Object.entries(ADDITIONAL_GAMES) as [TopicId, ActivityTitle[]][]) {
    const existingCount = initialGames.filter((game) => game.topicId === topic && game.shelfGroup !== 'sufara').length;
    const required = Math.max(0, 10 - existingCount);
    const pool = new Map<string, { question: SupportedQuestion; reviewKey: string }>();
    for (const entry of [...coreQuestions, ...questQuestions]) {
      if (entry.question.areaId !== topic || !supported(entry.question)) continue;
      const key = `${topic}:${entry.question.id}`;
      const prior = pool.get(key);
      if (!prior || (entry.question.sources?.length ?? 0) > (prior.question.sources?.length ?? 0)) pool.set(key, { question: entry.question, reviewKey: entry.reviewKey });
    }
    const available = [...pool.values()].sort((a, b) => a.question.id.localeCompare(b.question.id));
    if (titles.length < required || available.length < required) {
      throw new Error(`Topic ${topic} needs ${required} more mini-games with distinct sourced questions; found ${titles.length} titles and ${available.length} questions.`);
    }
    for (let gameIndex = 0; gameIndex < required; gameIndex++) {
      const gameTitle = titles[gameIndex];
      const id = `${topic}-${gameTitle.id}`;
      const rounds = available.slice(gameIndex, gameIndex + 1);
      const factsByQuestion = rounds.map(({ question }, index) => ({
        id: `source-${question.id.replace(/[^a-z0-9-]/g, '-')}`,
        text: question.explanation,
        sources: question.sources ?? [],
        reviewKey: rounds[index].reviewKey,
      }));
      const i18n = i18nFor(id, gameTitle.title, rounds[0].question.prompt);
      const def: GameDef<TopicGameConfig> = {
        id,
        topicId: topic,
        i18n,
        coverArt: ACTIVITY_ART[topic]?.[gameIndex] ?? initialGames.find((game) => game.topicId === topic)?.coverArt ?? 'object.book',
        hintArt: initialGames.find((game) => game.topicId === topic)?.hintArt,
        component: TopicArcadeGame,
        levels: rounds.map(({ question }, index) => ({ level: (index + 1) as 1, config: { kind: 'topic', tasks: tasksFor(question) }, facts: [factsByQuestion[index]] })),
        teaches: { questionKeys: rounds.map((round) => round.reviewKey) },
        order: 60 + gameIndex,
      };
      registerGame(def);
    }
  }
  registerSufaraGames();
}