import type { GameFact } from '@/core/games';

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
} satisfies Record<string, GameFact>;
