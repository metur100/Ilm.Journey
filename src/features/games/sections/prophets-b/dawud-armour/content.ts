import type { GameFact } from '@/core/games';

import { type Episode, type EpisodeConfig, lessonFact } from '../../prophets-story/episode';
import { quran, T } from '../shared/kit';

/*
 * Dawud – three events of his life, each with its lesson:
 *  L1 Dawud and Jalut (2:249–251): put the events in order (episode, SequenceBoard).
 *  L2 Iron made soft (34:10–11, 21:80): link ring after ring into a coat of mail; every link must have the right size.
 *  L3 The mountains and birds glorify Allah with him, the Zabur, judging with truth (34:10, 38:19, 4:163, 38:26):
 *     connect each gift with its meaning (episode, ConnectPairs).
 */

export type RingSize = 's' | 'm' | 'l';
export const RING_SCALE: Record<RingSize, number> = { s: 0.62, m: 0.8, l: 1 };

export interface ArmourConfig {
  /** Sizes of every link in building order. */
  links: RingSize[];
  /** Links already in place at the start. */
  given: number;
  /** Links per row. */
  perRow: number;
  /** Faint outline of the needed size in every empty place. */
  ghosts: boolean;
  sizes: RingSize[];
  hints: boolean;
}

export type DawudConfig = ArmourConfig | EpisodeConfig;

/** L2 – a chain with three sizes; the faint outlines show the size each place needs. */
export const ARMOUR: ArmourConfig = { links: ['s', 'm', 'l', 'l', 'm', 's', 'm', 'l'], given: 0, perRow: 4, ghosts: true, sizes: ['s', 'm', 'l'], hints: false };

export const DAWUD_FACTS = {
  jalut: {
    id: 'dawud-and-jalut',
    text: T(
      'A small group of believers stayed firm against the great army of Jalut. By Allah’s permission they won; Dawud defeated Jalut, and Allah gave him kingship and wisdom.',
      'Eine kleine Gruppe von Gläubigen blieb standhaft gegen das große Heer Dschaluts. Mit Allahs Erlaubnis siegten sie; Dawud besiegte Dschalut, und Allah gab ihm Herrschaft und Weisheit.',
      'Mala skupina vjernika ostala je postojana pred velikom Džalutovom vojskom. Allahovom dozvolom pobijedili su; Davud je savladao Džaluta, a Allah mu je dao vlast i mudrost.',
    ),
    sources: quran('2:249–251'),
    art: 'object.shield',
    reviewKey: 'stories:dawud-few',
  },
  iron: {
    id: 'iron-made-soft',
    text: T('Allah made iron soft for Dawud.', 'Allah machte das Eisen für Dawud weich.', 'Allah je Davudu omekšao željezo.'),
    sources: quran('34:10'),
    art: 'prophet.dawud-iron',
    reviewKey: 'stories:dawud-iron',
  },
  links: {
    id: 'measure-the-links',
    text: T(
      'Allah told Dawud: "Make full coats of mail and measure the links well, and do good."',
      'Allah sagte zu Dawud: „Fertige volle Panzerhemden an und miss die Ringe gut ab, und tut Gutes.“',
      'Allah je rekao Davudu: „Pravi široke oklope i pravilno spajaj karike, i dobra djela činite.“',
    ),
    sources: quran('34:11'),
    art: 'prophet.dawud-chain',
    check: {
      type: 'choice',
      prompt: T('What did Allah teach Dawud to make from iron?', 'Was lehrte Allah Dawud aus Eisen zu fertigen?', 'Šta je Allah naučio Davuda da pravi od željeza?'),
      options: [T('Coats of mail (armour)', 'Panzerhemden (Rüstungen)', 'Oklope'), T('Ships', 'Schiffe', 'Lađe'), T('Coins', 'Münzen', 'Novčiće')],
      correctIndex: 0,
    },
  },
  mountains: {
    id: 'mountains-and-birds',
    text: T(
      'Allah said: "O mountains, glorify Allah with him – and you birds as well!"',
      'Allah sprach: „O ihr Berge, preist Allah mit ihm – und ihr Vögel ebenso!“',
      'Allah je rekao: „O planine, slavite Allaha zajedno s njim, i vi, ptice!“',
    ),
    sources: quran('34:10'),
    art: 'prophet.dawud-mountains-birds',
    reviewKey: 'stories:dawud-praise',
  },
  zabur: {
    id: 'dawud-zabur',
    text: T('Allah says: "And to Dawud We gave the Zabur."', 'Allah sagt: „Und Dawud gaben Wir den Zabur.“', 'Allah kaže: „A Davudu smo dali Zebur.“'),
    sources: quran('4:163'),
    art: 'prophet.dawud-zabur',
    reviewKey: 'stories:dawud-zabur',
  },
  lessonPatience: lessonFact(
    'dawud-patience',
    T(
      'Be patient and trust Allah. A small group that stays firm can overcome a big one – by Allah’s permission, for Allah is with the patient.',
      'Sei geduldig und vertraue auf Allah. Eine kleine Gruppe, die standhaft bleibt, kann eine große besiegen – mit Allahs Erlaubnis, denn Allah ist mit den Geduldigen.',
      'Budi strpljiv i pouzdaj se u Allaha. Mala skupina koja ostane postojana može savladati veliku – Allahovom dozvolom, jer Allah je sa strpljivima.',
    ),
    quran('2:249–250'),
    { art: 'object.shield' },
  ),
  lessonWork: lessonFact(
    'dawud-good-work',
    T(
      'Do your work carefully and well, and use your skills to protect and help others – as Allah taught Dawud to measure every link.',
      'Mach deine Arbeit sorgfältig und gut und nutze dein Können, um andere zu schützen und ihnen zu helfen – so wie Allah Dawud lehrte, jeden Ring gut abzumessen.',
      'Radi svoj posao pažljivo i dobro, i koristi svoje vještine da štitiš i pomažeš drugima – kao što je Allah naučio Davuda da pravilno spaja svaku kariku.',
    ),
    quran('34:11', '21:80'),
    { art: 'prophet.dawud-armour' },
  ),
  lessonFair: lessonFact(
    'dawud-remember-and-judge',
    T(
      'Remember Allah often and be fair to everyone: Dawud glorified Allah, and Allah told him to judge with truth and not by his own wishes.',
      'Gedenke Allahs oft und sei gerecht zu allen: Dawud pries Allah, und Allah befahl ihm, mit Wahrheit zu richten und nicht nach seinen eigenen Wünschen.',
      'Često spominji Allaha i budi pravedan prema svima: Davud je veličao Allaha, a Allah mu je naredio da sudi po istini, a ne po svojim željama.',
    ),
    quran('34:10', '38:26'),
    { art: 'prophet.dawud-zabur' },
  ),
} satisfies Record<string, GameFact>;

/** L1 – Dawud and Jalut, in order (2:249–251). */
export const JALUT_EPISODE: Episode = {
  kind: 'sequence',
  prompt: T(
    'The believers faced the great army of Jalut. Put what happened in order.',
    'Die Gläubigen standen dem großen Heer Dschaluts gegenüber. Bring das Geschehen in die richtige Reihenfolge.',
    'Vjernici su stali pred veliku Džalutovu vojsku. Poredaj šta se dogodilo.',
  ),
  hints: true,
  items: [
    { id: 'few-firm', art: 'object.shield', label: T('A small group stays firm', 'Eine kleine Gruppe bleibt standhaft', 'Mala skupina ostaje postojana'), sub: '2:249' },
    { id: 'pray-patience', art: 'object.prayer-mat', label: T('"Our Lord, pour patience upon us"', '„Unser Herr, gieße Geduld über uns aus“', '„Gospodaru naš, daj nam strpljenja“'), sub: '2:250' },
    { id: 'jalut', art: 'story.hills', label: T('Dawud defeats Jalut', 'Dawud besiegt Dschalut', 'Davud savladava Džaluta'), sub: '2:251' },
    { id: 'kingship', art: 'prophet.dawud-zabur', label: T('Allah gives him kingship and wisdom', 'Allah gibt ihm Herrschaft und Weisheit', 'Allah mu daje vlast i mudrost'), sub: '2:251' },
  ],
  factMap: { 'few-firm': 'lesson-dawud-patience', 'pray-patience': 'lesson-dawud-patience', jalut: 'dawud-and-jalut', kingship: 'dawud-and-jalut' },
};

/** L3 – the gifts Allah gave Dawud (34:10, 38:19, 4:163, 38:26). */
export const PRAISE_EPISODE: Episode = {
  kind: 'connect',
  prompt: T('Connect each gift of Allah to Dawud with what it means.', 'Verbinde jede Gabe Allahs an Dawud mit ihrer Bedeutung.', 'Spoji svaki Allahov dar Davudu s onim što znači.'),
  hints: false,
  pairs: [
    { id: 'mountains', left: { art: 'prophet.dawud-mountains-birds', label: T('The mountains', 'Die Berge', 'Planine') }, right: { label: T('glorified Allah with him', 'priesen Allah mit ihm', 'veličale su Allaha s njim'), sub: '34:10' } },
    { id: 'birds', left: { art: 'animal.birds', label: T('The birds', 'Die Vögel', 'Ptice') }, right: { label: T('gathered, all turning to Allah', 'versammelten sich, alle Allah zugewandt', 'okupljale su se, sve Allahu okrenute'), sub: '38:19' } },
    { id: 'zabur', left: { art: 'prophet.dawud-zabur', label: T('The Zabur', 'Der Zabur', 'Zebur') }, right: { label: T('the book Allah gave Dawud', 'das Buch, das Allah Dawud gab', 'knjiga koju je Allah dao Davudu'), sub: '4:163' } },
    { id: 'judge', left: { art: 'object.scales', label: T('Successor on the earth', 'Nachfolger auf der Erde', 'Namjesnik na Zemlji') }, right: { label: T('judge between people with truth', 'richte zwischen den Menschen mit Wahrheit', 'sudi ljudima po istini'), sub: '38:26' } },
  ],
  factMap: { mountains: 'mountains-and-birds', birds: 'mountains-and-birds', zabur: 'dawud-zabur', judge: 'lesson-dawud-remember-and-judge' },
};
