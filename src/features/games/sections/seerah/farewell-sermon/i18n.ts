import { defineNamespace } from '@/core/i18n';

/** Namespace `game.farewell-sermon`. Only the messages the Seerah content gives (Sahih Muslim 1218, Sahih al-Bukhari 45). */
const en = {
  title: 'The Farewell Sermon',
  description: 'At ʿArafat in 10 AH the Prophet ﷺ addressed the people. Connect each topic with its message.',
  howTo: 'Draw a line from each topic to its message. In level 3 flip the cards and find the pairs from memory.',
  'play.l1': 'Connect each topic of the sermon at ʿArafat with its message.',
  'play.l2': 'More messages of the Farewell Sermon – connect them.',
  'play.l3': 'Flip two cards at a time and find each topic with its message.',
  'topic.life': 'Your blood and your property',
  'topic.women': 'Women',
  'topic.book': 'The Book of Allah',
  'topic.feuds': 'Blood feuds and usury of the time of ignorance',
  'topic.witness': 'The message',
  'topic.arafah': 'The day of ʿArafah',
  'msg.life': 'Sacred to one another',
  'msg.women': 'Fear Allah regarding them',
  'msg.book': 'Hold fast to it and you will not go astray',
  'msg.feuds': 'Abolished',
  'msg.witness': 'Bear witness that it was conveyed',
  'msg.arafah': 'The religion perfected (5:3)',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Die Abschiedspredigt',
  description: 'In ʿArafat sprach der Prophet ﷺ im Jahr 10 n. H. zu den Menschen. Verbinde jedes Thema mit seiner Botschaft.',
  howTo: 'Zieh eine Linie von jedem Thema zu seiner Botschaft. In Stufe 3 deckst du Karten auf und findest die Paare aus dem Gedächtnis.',
  'play.l1': 'Verbinde jedes Thema der Predigt in ʿArafat mit seiner Botschaft.',
  'play.l2': 'Weitere Botschaften der Abschiedspredigt – verbinde sie.',
  'play.l3': 'Deck jeweils zwei Karten auf und finde jedes Thema mit seiner Botschaft.',
  'topic.life': 'Euer Blut und euer Besitz',
  'topic.women': 'Die Frauen',
  'topic.book': 'Das Buch Allahs',
  'topic.feuds': 'Blutrache und Zinswucher der Zeit der Unwissenheit',
  'topic.witness': 'Die Botschaft',
  'topic.arafah': 'Der Tag von ʿArafa',
  'msg.life': 'Einander unantastbar',
  'msg.women': 'Fürchtet Allah in Bezug auf sie',
  'msg.book': 'Haltet daran fest, dann geht ihr nicht in die Irre',
  'msg.feuds': 'Abgeschafft',
  'msg.witness': 'Bezeugt, dass sie übermittelt wurde',
  'msg.arafah': 'Die Religion vervollkommnet (5:3)',
};

const bs: Record<Key, string> = {
  title: 'Oproštajna hutba',
  description: 'Na Arefatu se Poslanik ﷺ 10. g. po H. obratio ljudima. Spoji svaku temu s njenom porukom.',
  howTo: 'Povuci liniju od svake teme do njene poruke. U 3. nivou okreći karte i pronađi parove napamet.',
  'play.l1': 'Spoji svaku temu hutbe na Arefatu s njenom porukom.',
  'play.l2': 'Još poruka Oproštajne hutbe – spoji ih.',
  'play.l3': 'Okreni po dvije karte i pronađi svaku temu s njenom porukom.',
  'topic.life': 'Vaši životi i vaši imeci',
  'topic.women': 'Žene',
  'topic.book': 'Allahova Knjiga',
  'topic.feuds': 'Krvna osveta i kamata iz vremena neznanja',
  'topic.witness': 'Poslanica',
  'topic.arafah': 'Dan Arefata',
  'msg.life': 'Nepovredivi su jedni drugima',
  'msg.women': 'Bojte se Allaha u pogledu njih',
  'msg.book': 'Držite je se i nećete zalutati',
  'msg.feuds': 'Ukinuti',
  'msg.witness': 'Posvjedočite da je dostavljena',
  'msg.arafah': 'Vjera usavršena (5:3)',
};

export const farewellI18n = defineNamespace('game.farewell-sermon', { en, de, bs });
