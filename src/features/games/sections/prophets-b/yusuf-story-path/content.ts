import type { GameFact } from '@/core/games';

import { type Episode, lessonFact } from '../../prophets-story/episode';
import { quran, T } from '../shared/kit';
import { YUSUF_FACTS } from '../yusuf-storehouse/facts';

/*
 * Yusuf – the best of stories, three events, each with its lesson (the king's dream and the storehouses are in the
 * other Yusuf game, yusuf-storehouse). Places and objects only, never a person.
 *  L1 The dream, the brothers' envy and the well (12:4–19): the stones of the path (SequenceBoard path).
 *  L2 In the house of al-Aziz and in prison – honest and pure, calling to Allah the One (12:23–41): connect.
 *  L3 The brothers come to Egypt – "No blame upon you today" – the family reunited (12:58–100): order from memory.
 */

/** L1 – from the dream to the caravan. */
export const WELL_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'path',
  endArt: 'animal.camel',
  prompt: T(
    'Which stop of the story comes next? Put it on the glowing stone.',
    'Welche Station der Geschichte kommt als Nächstes? Lege sie auf den leuchtenden Stein.',
    'Koja stanica kazivanja dolazi sljedeća? Stavi je na kamen koji svijetli.',
  ),
  hints: true,
  items: [
    { id: 'dream', art: 'prophet.yusuf-dream', label: T('The dream of the stars', 'Der Traum von den Sternen', 'San o zvijezdama'), sub: '12:4' },
    { id: 'keep-secret', art: 'prophet.yaqub-home', label: T('"Do not tell your brothers"', '„Erzähl es nicht deinen Brüdern“', '„Ne pričaj braći“'), sub: '12:5' },
    { id: 'envy', art: 'garden.bush', label: T('The brothers’ envy', 'Der Neid der Brüder', 'Zavist braće'), sub: '12:8–9' },
    { id: 'well', art: 'prophet.yusuf-well', label: T('Into the well', 'In den Brunnen', 'U bunar'), sub: '12:15' },
    { id: 'caravan', art: 'object.well-bucket', label: T('A caravan finds him', 'Eine Karawane findet ihn', 'Karavan ga pronalazi'), sub: '12:19' },
  ],
  factMap: { dream: 'yusuf-dream-trail', 'keep-secret': 'yusuf-dream-trail', envy: 'lesson-yusuf-no-envy', well: 'lesson-yusuf-no-envy', caravan: 'yusuf-dream-trail' },
};

/** L2 – honest and pure, in the house and in prison. */
export const PRISON_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'In Egypt Yusuf was tested again. Connect each moment with what Yusuf said or did.',
    'In Ägypten wurde Yusuf wieder geprüft. Verbinde jeden Moment mit dem, was Yusuf sagte oder tat.',
    'U Egiptu je Jusuf ponovo bio iskušan. Spoji svaki trenutak s onim što je Jusuf rekao ili učinio.',
  ),
  hints: false,
  pairs: [
    { id: 'refuge', left: { art: 'place.house', label: T('Called to do wrong', 'Zum Unrecht aufgefordert', 'Pozvan da učini loše') }, right: { label: T('"I seek refuge in Allah"', '„Ich suche Zuflucht bei Allah“', '„Utječem se Allahu“'), sub: '12:23' } },
    { id: 'prison-dearer', left: { art: 'object.lamp', label: T('Threatened with prison', 'Mit Gefängnis bedroht', 'Prijećeno mu tamnicom'), sub: '12:32' }, right: { label: T('"Prison is dearer to me"', '„Das Gefängnis ist mir lieber“', '„Draža mi je tamnica“'), sub: '12:33' } },
    { id: 'the-one', left: { art: 'object.book', label: T('Two prisoners ask him', 'Zwei Gefangene fragen ihn', 'Dvojica zatvorenika ga pitaju') }, right: { label: T('He calls them to Allah, the One', 'Er ruft sie zu Allah, dem Einen', 'Poziva ih Allahu, Jedinom'), sub: '12:39–40' } },
    { id: 'their-dreams', left: { art: 'prophet.yusuf-dream', label: T('Their dreams', 'Ihre Träume', 'Njihovi snovi'), sub: '12:36' }, right: { label: T('He explains them', 'Er deutet sie', 'On ih tumači'), sub: '12:41' } },
  ],
  factMap: { refuge: 'lesson-yusuf-stay-pure', 'prison-dearer': 'lesson-yusuf-stay-pure', 'the-one': 'yusuf-honesty-trail', 'their-dreams': 'yusuf-honesty-trail' },
};

/** L3 – the brothers in Egypt and the family reunited. */
export const FORGIVE_EPISODE: Episode = {
  kind: 'sequence',
  prompt: T(
    'Years later the brothers came to Egypt. Put the end of the story in order – then check.',
    'Jahre später kamen die Brüder nach Ägypten. Bring das Ende der Geschichte in die richtige Reihenfolge – dann prüfen.',
    'Godinama kasnije braća su došla u Egipat. Poredaj kraj kazivanja – pa provjeri.',
  ),
  hints: false,
  items: [
    { id: 'brothers-come', art: 'object.grain-sack', label: T('The brothers come to buy grain', 'Die Brüder kommen, um Getreide zu kaufen', 'Braća dolaze kupiti žito'), sub: '12:58' },
    { id: 'i-am-yusuf', art: 'object.lantern', label: T('"I am Yusuf"', '„Ich bin Yusuf“', '„Ja sam Jusuf“'), sub: '12:90' },
    { id: 'no-blame', art: 'garden.flower-rose', label: T('"No blame upon you today"', '„Kein Tadel soll euch heute treffen“', '„Danas nema prijekora za vas“'), sub: '12:92' },
    { id: 'shirt-sent', art: 'prophet.yaqub-shirt', label: T('His shirt is sent to his father', 'Sein Hemd wird zum Vater geschickt', 'Košulja se šalje ocu'), sub: '12:93' },
    { id: 'dream-true', art: 'garden.stars', label: T('The family comes – the dream comes true', 'Die Familie kommt – der Traum wird wahr', 'Porodica dolazi – san se obistinjuje'), sub: '12:99–100' },
  ],
  factMap: { 'brothers-come': 'yusuf-forgive-trail', 'i-am-yusuf': 'yusuf-forgive-trail', 'no-blame': 'lesson-yusuf-forgive', 'shirt-sent': 'yusuf-forgive-trail', 'dream-true': 'lesson-yusuf-forgive' },
};

export const PATH_FACTS = {
  dream: {
    id: 'yusuf-dream-trail',
    text: T(
      'As a boy, Yusuf saw in a dream eleven stars, the sun and the moon prostrating to him. His father Yaqub told him not to tell his brothers.',
      'Als Junge sah Yusuf im Traum elf Sterne, die Sonne und den Mond, die sich vor ihm niederwarfen. Sein Vater Yaqub sagte ihm, er solle es seinen Brüdern nicht erzählen.',
      'Kao dječak, Jusuf je usnio jedanaest zvijezda, sunce i mjesec kako mu se klanjaju. Otac Jakub mu je rekao da to ne priča braći.',
    ),
    sources: quran('12:4–5'),
    art: 'prophet.yusuf-dream',
    reviewKey: 'stories:yusuf-stars',
  },
  honest: { ...YUSUF_FACTS.honest, id: 'yusuf-honesty-trail' },
  forgive: {
    id: 'yusuf-forgive-trail',
    text: T(
      'Yusuf told his brothers: "No blame upon you today. May Allah forgive you – He is the Most Merciful of the merciful."',
      'Yusuf sagte seinen Brüdern: „Kein Tadel soll euch heute treffen. Allah möge euch vergeben – Er ist der Barmherzigste der Barmherzigen.“',
      'Jusuf je rekao braći: „Danas nema prijekora za vas. Allah će vam oprostiti – On je od milostivih najmilostiviji.“',
    ),
    sources: quran('12:92'),
    art: 'prophet.yaqub-shirt',
    reviewKey: 'stories:yusuf-revenge',
  },
  lessonEnvy: lessonFact(
    'yusuf-no-envy',
    T(
      'Envy leads to wrong – be glad for others instead. And Allah does not forget you even in the darkest place: in the well He inspired Yusuf that one day he would tell his brothers what they had done.',
      'Neid führt zu Unrecht – freu dich lieber für andere. Und Allah vergisst dich auch am dunkelsten Ort nicht: Im Brunnen gab Er Yusuf ein, dass er seinen Brüdern eines Tages sagen würde, was sie getan hatten.',
      'Zavist vodi u zlo – radije se raduj drugima. A Allah te ne zaboravlja ni na najmračnijem mjestu: u bunaru je Jusufu objavio da će jednog dana podsjetiti braću na ono što su uradili.',
    ),
    quran('12:8–15'),
    { art: 'prophet.yusuf-well' },
  ),
  lessonPure: lessonFact(
    'yusuf-stay-pure',
    T(
      'Stay honest and pure, even when it is hard and costs you something. Yusuf chose prison over doing wrong, and he kept calling to Allah.',
      'Bleib ehrlich und rein, auch wenn es schwer ist und dich etwas kostet. Yusuf wählte das Gefängnis statt Unrecht zu tun, und er rief weiter zu Allah.',
      'Ostani iskren i čist, i kad je teško i kad te nešto košta. Jusuf je radije izabrao tamnicu nego da učini loše, i nastavio je pozivati Allahu.',
    ),
    quran('12:23', '12:33'),
    { art: 'object.lamp' },
  ),
  lessonForgive: lessonFact(
    'yusuf-forgive',
    T(
      'Forgiveness is strength. When Yusuf could have taken revenge, he forgave his brothers and asked Allah to forgive them.',
      'Vergebung ist Stärke. Als Yusuf sich hätte rächen können, vergab er seinen Brüdern und bat Allah, ihnen zu vergeben.',
      'Oprost je snaga. Kad se Jusuf mogao osvetiti, oprostio je braći i molio Allaha da im oprosti.',
    ),
    quran('12:92'),
    { art: 'garden.flower-rose', reviewKey: 'stories:yusuf-decision' },
  ),
} satisfies Record<string, GameFact>;
