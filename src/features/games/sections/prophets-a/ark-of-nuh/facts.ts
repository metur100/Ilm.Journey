import type { GameFact } from '@/core/games';

import { lessonFact } from '../../prophets-story/episode';

/*
 * Facts of Ark of Nuh – texts and sources copied from the Nuh story (src/features/stories/content/prophets/nuh.json:
 * scenes, questions, lessons). Where a story question covers a fact, `reviewKey` queues that question for review.
 */
export const ARK_FACTS = {
  eachKind: {
    id: 'each-kind-two',
    text: {
      en: 'Nuh carried the believers and a pair of every kind of animal in the ark.',
      de: 'Nuh nahm die Gläubigen und ein Paar von jeder Tierart in die Arche.',
      bs: 'Nuh je u lađu ukrcao vjernike i po par od svake vrste životinja.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '11:40' }],
    art: 'object.ark',
    check: {
      type: 'choice',
      prompt: {
        en: 'How many of every kind of animal did Nuh carry in the ark?',
        de: 'Wie viele Tiere von jeder Art nahm Nuh in die Arche?',
        bs: 'Koliko je životinja od svake vrste Nuh ukrcao u lađu?',
      },
      options: [
        { en: 'A pair – two of every kind', de: 'Ein Paar – zwei von jeder Art', bs: 'Po par – dvije od svake vrste' },
        { en: 'Only one of every kind', de: 'Nur eines von jeder Art', bs: 'Samo jednu od svake vrste' },
        { en: 'Ten of every kind', de: 'Zehn von jeder Art', bs: 'Deset od svake vrste' },
      ],
      correctIndex: 0,
    },
  },
  command: {
    id: 'ark-by-command',
    text: {
      en: 'Allah commanded Nuh to build the ark under His watch and guidance.',
      de: 'Allah befahl Nuh, die Arche unter Seiner Aufsicht und Anleitung zu bauen.',
      bs: 'Allah je naredio Nuhu da pravi lađu pod Njegovim nadzorom i uputom.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '11:37' }],
    art: 'object.ark',
    reviewKey: 'stories:nuh-next',
  },
  years: {
    id: 'nuh-950-years',
    text: {
      en: 'Nuh stayed among his people for a thousand years minus fifty – 950 years. He never gave up, but only a few believed.',
      de: 'Nuh blieb tausend Jahre weniger fünfzig unter seinem Volk – 950 Jahre. Er gab nie auf, doch nur wenige glaubten.',
      bs: 'Nuh je u svom narodu boravio hiljadu godina manje pedeset – 950 godina. Nikad nije odustao, ali je samo malo njih povjerovalo.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '29:14' }],
    art: 'object.hourglass',
    reviewKey: 'stories:nuh-years',
  },
  mocked: {
    id: 'ark-mocked',
    text: {
      en: 'Allah commanded Nuh to build an ark under His watch. Every time the leaders of his people passed by, they mocked him – but Nuh kept building.',
      de: 'Allah befahl Nuh, unter Seiner Aufsicht eine Arche zu bauen. Jedes Mal, wenn die Anführer seines Volkes vorbeikamen, verspotteten sie ihn – doch Nuh baute weiter.',
      bs: 'Allah je naredio Nuhu da pod Njegovim nadzorom gradi lađu. Kad god bi glavešine njegova naroda prolazile pored njega, rugale su mu se – ali Nuh je nastavio graditi.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '11:37–38' }],
    art: 'object.ark',
    reviewKey: 'stories:nuh-mocked',
  },
  judi: {
    id: 'ark-rests-on-judi',
    text: {
      en: 'The Quran says the ark came to rest on Al-Judi. Muslim scholars traditionally place this mountain in the north of Mesopotamia.',
      de: 'Der Koran sagt, dass die Arche auf dem Dschudi zur Ruhe kam. Muslimische Gelehrte verorten diesen Berg traditionell im Norden Mesopotamiens.',
      bs: "Kur'an kaže da se lađa zaustavila na Džudiju. Muslimanski učenjaci tradicionalno smještaju to brdo na sjever Mezopotamije.",
    },
    sources: [{ sourceName: 'Quran', sourceReference: '11:44' }],
    art: 'place.mount-judi',
    reviewKey: 'stories:nuh-judi',
  },
  planks: {
    id: 'ark-planks-nails',
    text: {
      en: 'Allah carried Nuh on a ship made of planks and nails.',
      de: 'Allah trug Nuh auf einem Schiff aus Planken und Nägeln.',
      bs: 'Allah je Nuha nosio na lađi od dasaka i klinova.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '54:13' }],
    art: 'prophet.nuh-planks',
  },
  bismillah: {
    id: 'ark-bismillah',
    text: {
      en: 'Nuh said: "Board it. In the name of Allah it sails and comes to rest."',
      de: 'Nuh sagte: „Steigt ein. Im Namen Allahs fährt sie und kommt sie zur Ruhe.“',
      bs: 'Nuh je rekao: „Ukrcajte se u nju. U ime Allaha ona plovi i pristaje.“',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '11:41' }],
    art: 'prophet.nuh-ark',
    reviewKey: 'stories:nuh-board',
  },
  sabr: lessonFact(
    'sabr',
    {
      en: 'Keep calling to good with patience (sabr), even when people do not listen and it takes a long time – like Nuh for 950 years.',
      de: 'Ruf geduldig (mit Sabr) zum Guten auf, auch wenn die Leute nicht zuhören und es lange dauert – wie Nuh 950 Jahre lang.',
      bs: 'Strpljivo (sa saburom) pozivaj dobru, i kad te ljudi ne slušaju i kad dugo traje – kao Nuh 950 godina.',
    },
    [{ sourceName: 'Quran', sourceReference: '71:5–10' }, { sourceName: 'Quran', sourceReference: '29:14' }],
    { art: 'object.hourglass', reviewKey: 'stories:nuh-lesson' },
  ),
  obey: lessonFact(
    'obey',
    {
      en: 'Do what Allah commands, even when others laugh at you. Nuh kept building the ark while the leaders mocked him.',
      de: 'Tu, was Allah befiehlt, auch wenn andere über dich lachen. Nuh baute weiter an der Arche, während die Anführer spotteten.',
      bs: 'Čini ono što Allah naređuje, i kad ti se drugi smiju. Nuh je gradio lađu dok su mu se glavešine rugale.',
    },
    [{ sourceName: 'Quran', sourceReference: '11:37–38' }],
    { art: 'object.ark' },
  ),
  trust: lessonFact(
    'trust',
    {
      en: 'Trust Allah: He saved Nuh and the believers in the ark. Start with "In the name of Allah", as Nuh did.',
      de: 'Vertraue auf Allah: Er rettete Nuh und die Gläubigen in der Arche. Beginne mit „Im Namen Allahs“, wie Nuh.',
      bs: 'Pouzdaj se u Allaha: On je spasio Nuha i vjernike u lađi. Počni s „U ime Allaha“, kao Nuh.',
    },
    [{ sourceName: 'Quran', sourceReference: '11:41' }, { sourceName: 'Quran', sourceReference: '11:48' }],
    { art: 'prophet.nuh-judi' },
  ),
} satisfies Record<string, GameFact>;
