import type { GameFact } from '@/core/games';

import { lessonFact } from '../../prophets-story/episode';
import { quran, T } from '../shared/kit';

/** Facts of The Shirt's Road – the same wording and references as the Yaqub story (stories/content/prophets/yaqub.json). */
export const YAQUB_FACTS = {
  shirt: {
    id: 'shirt-sight',
    text: T(
      "Yusuf gave his brothers his shirt: \"Cast it over my father's face – he will see again.\" The bringer of good news cast it over Yaqub's face, and by Allah's will he could see again.",
      'Yusuf gab seinen Brüdern sein Hemd: „Legt es auf das Gesicht meines Vaters – er wird wieder sehen.“ Der Freudenbote legte es auf Yaqubs Gesicht, und mit Allahs Willen konnte er wieder sehen.',
      'Jusuf je dao braći svoju košulju: „Prebacite je preko lica mog oca – progledat će.“ Donosilac radosne vijesti prebacio ju je preko Jakubovog lica, i Allahovom voljom on je ponovo vidio.',
    ),
    sources: quran('12:93', '12:96'),
    art: 'prophet.yaqub-shirt',
    check: {
      type: 'choice',
      prompt: T('What did Yusuf send to his father from Egypt?', 'Was schickte Yusuf seinem Vater aus Ägypten?', 'Šta je Jusuf iz Egipta poslao ocu?'),
      options: [T('His shirt', 'Sein Hemd', 'Svoju košulju'), T('A sack of gold', 'Einen Sack Gold', 'Vreću zlata'), T('A camel', 'Ein Kamel', 'Devu')],
      correctIndex: 0,
    },
  },
  patience: {
    id: 'beautiful-patience',
    text: T(
      'When his sons came back without Yusuf, Yaqub said: "Beautiful patience. Allah is the One whose help is sought."',
      'Als seine Söhne ohne Yusuf zurückkamen, sagte Yaqub: „Schöne Geduld. Allah ist Der, bei Dem Hilfe gesucht wird.“',
      'Kada su se sinovi vratili bez Jusufa, Jakub je rekao: „Lijepo strpljenje! Allah je Onaj od Koga se pomoć traži.“',
    ),
    sources: quran('12:18'),
    art: 'prophet.yaqub-home',
    reviewKey: 'stories:yaqub-next',
  },
  scent: {
    id: 'scent-of-yusuf',
    text: T(
      'As the caravan left Egypt, Yaqub said: "I sense the scent of Yusuf."',
      'Als die Karawane Ägypten verließ, sagte Yaqub: „Ich spüre den Duft Yusufs.“',
      'Kada je karavan krenuo iz Egipta, Jakub je rekao: „Ja osjećam miris Jusufov.“',
    ),
    sources: quran('12:94'),
    art: 'animal.camel',
  },
  hope: {
    id: 'never-despair',
    text: T(
      'Yaqub told his sons: "Go and look for Yusuf and his brother, and do not despair of the mercy of Allah."',
      'Yaqub sagte seinen Söhnen: „Geht und sucht nach Yusuf und seinem Bruder, und gebt die Hoffnung auf Allahs Barmherzigkeit nicht auf.“',
      'Jakub je rekao sinovima: „Idite i raspitajte se o Jusufu i njegovom bratu, i ne gubite nadu u Allahovu milost.“',
    ),
    sources: quran('12:87'),
    art: 'object.well',
    check: {
      type: 'choice',
      prompt: T('What did Yaqub tell his sons never to do?', 'Was sollten Yaqubs Söhne niemals tun?', 'Šta je Jakub rekao sinovima da nikada ne čine?'),
      options: [T("Despair of Allah's mercy", 'An Allahs Barmherzigkeit verzweifeln', 'Gubiti nadu u Allahovu milost'), T('Travel to Egypt', 'Nach Ägypten reisen', 'Putovati u Egipat'), T('Buy grain', 'Getreide kaufen', 'Kupovati žito')],
      correctIndex: 0,
    },
  },
  complain: {
    id: 'complain-to-allah',
    text: T(
      'In his sorrow Yaqub said: "I only complain of my grief and sorrow to Allah."',
      'In seinem Kummer sagte Yaqub: „Ich klage meinen Kummer und meine Trauer nur Allah.“',
      'U svojoj tuzi Jakub je rekao: „Ja se samo Allahu žalim na svoju tugu i brigu.“',
    ),
    sources: quran('12:86'),
    art: 'story.lamp',
    reviewKey: 'stories:yaqub-patience',
  },
  lessonPatience: lessonFact(
    'yaqub-beautiful-patience',
    T(
      'Beautiful patience means bearing a hard time without complaining about Allah to people, and asking Allah for help – Yaqub was sad, and still patient.',
      'Schöne Geduld heißt, eine schwere Zeit zu ertragen, ohne sich bei den Menschen über Allah zu beklagen, und Allah um Hilfe zu bitten – Yaqub war traurig und doch geduldig.',
      'Lijepo strpljenje znači podnijeti teško vrijeme bez žaljenja ljudima na Allaha i tražiti pomoć od Allaha – Jakub je bio tužan, a ipak strpljiv.',
    ),
    quran('12:18'),
    { art: 'prophet.yaqub-home', reviewKey: 'stories:yaqub-lesson' },
  ),
  lessonHope: lessonFact(
    'yaqub-never-despair',
    T(
      'Never give up hope in Allah’s mercy. Tell Allah what makes you sad, and keep doing your part – Yaqub still sent his sons to search after many years.',
      'Gib die Hoffnung auf Allahs Barmherzigkeit nie auf. Sag Allah, was dich traurig macht, und tu weiter deinen Teil – Yaqub schickte seine Söhne nach vielen Jahren noch auf die Suche.',
      'Nikad ne gubi nadu u Allahovu milost. Reci Allahu šta te rastužuje i nastavi činiti svoj dio – Jakub je i nakon mnogo godina slao sinove da traže.',
    ),
    quran('12:86–87'),
    { art: 'garden.sun' },
  ),
  lessonJoy: lessonFact(
    'yaqub-joy-after-patience',
    T(
      'Allah’s help comes at the right time. After many years of patience Allah gave Yaqub back his sight and his son – and Yaqub asked forgiveness for the sons who had wronged him.',
      'Allahs Hilfe kommt zur rechten Zeit. Nach vielen Jahren der Geduld gab Allah Yaqub sein Augenlicht und seinen Sohn zurück – und Yaqub bat um Vergebung für die Söhne, die ihm Unrecht getan hatten.',
      'Allahova pomoć dolazi u pravo vrijeme. Nakon mnogo godina strpljenja Allah je Jakubu vratio vid i sina – a Jakub je molio oprost za sinove koji su mu nepravdu učinili.',
    ),
    quran('12:96–98'),
    { art: 'prophet.yaqub-shirt' },
  ),
} satisfies Record<string, GameFact>;
