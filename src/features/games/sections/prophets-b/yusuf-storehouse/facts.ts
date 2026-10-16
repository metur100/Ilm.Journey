import type { GameFact } from '@/core/games';

/*
 * Facts of Yusuf's Storehouse. The dream, the advice to store and the storehouses are copied from the Yusuf story
 * (src/features/stories/content/prophets/yusuf.json) and the prophets unit (learn/content/prophets/
 * prophets-yusuf-yunus-isa.json). The three L3 facts state what the ayat 12:47, 12:48 and 12:49 say, in plain
 * words with their exact references (no Quran text is typed here).
 */
export const YUSUF_FACTS = {
  dream: {
    id: 'king-dream',
    text: {
      en: 'The king dreamed of seven fat cows eaten by seven thin cows, and seven green ears of grain and others dry. Yusuf explained it: seven good years, then seven years of drought – so store the grain.',
      de: 'Der König träumte von sieben fetten Kühen, die von sieben mageren gefressen wurden, und von sieben grünen Ähren und anderen vertrockneten. Yusuf deutete es: sieben gute Jahre, dann sieben Jahre Dürre – also Getreide lagern.',
      bs: 'Kralj je sanjao sedam debelih krava koje jede sedam mršavih, te sedam zelenih klasova i drugih suhih. Jusuf je protumačio: sedam rodnih godina, zatim sedam sušnih – pa treba sačuvati žito.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '12:43–49' }],
    art: 'object.grain-sack',
    reviewKey: 'stories:yusuf-dream',
  },
  plan: {
    id: 'store-for-hard-years',
    text: {
      en: 'Yusuf advised storing grain in the good years for the hard years that followed.',
      de: 'Yusuf riet, in den guten Jahren Getreide für die harten Jahre danach zu lagern.',
      bs: 'Jusuf je savjetovao da se u rodnim godinama sačuva žito za teške godine koje slijede.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '12:47–49' }],
    art: 'object.storehouse',
    check: {
      type: 'choice',
      prompt: {
        en: 'What did Yusuf advise for the seven good years?',
        de: 'Was riet Yusuf für die sieben guten Jahre?',
        bs: 'Šta je Jusuf savjetovao za sedam rodnih godina?',
      },
      options: [
        { en: 'Store the grain for the hard years that follow', de: 'Das Getreide für die harten Jahre danach lagern', bs: 'Sačuvati žito za teške godine koje slijede' },
        { en: 'Eat all the grain right away', de: 'Das ganze Getreide sofort essen', bs: 'Odmah pojesti svo žito' },
        { en: 'Stop sowing grain', de: 'Kein Getreide mehr säen', bs: 'Prestati sijati žito' },
      ],
      correctIndex: 0,
    },
  },
  storehouses: {
    id: 'yusuf-storehouses',
    text: {
      en: 'Yusuf was taken to Egypt, where he later looked after the storehouses of the land.',
      de: 'Yusuf wurde nach Ägypten gebracht, wo er später die Vorratskammern des Landes verwaltete.',
      bs: 'Jusuf je odveden u Egipat, gdje je kasnije upravljao riznicama zemlje.',
    },
    sources: [
      { sourceName: 'Quran', sourceReference: '12:21' },
      { sourceName: 'Quran', sourceReference: '12:55' },
    ],
    art: 'object.storehouse',
    reviewKey: 'stories:yusuf-map',
  },
  honest: {
    id: 'yusuf-honest',
    text: {
      en: 'Yusuf stayed honest and refused to do wrong – yet he was put in prison unjustly. Even in prison, he taught about Allah and explained dreams.',
      de: 'Yusuf blieb ehrlich und weigerte sich, Unrecht zu tun – dennoch kam er ungerecht ins Gefängnis. Selbst dort lehrte er über Allah und deutete Träume.',
      bs: 'Jusuf je ostao iskren i odbio da čini loše – ali je ipak nepravedno bačen u tamnicu. Čak je i tamo poučavao o Allahu i tumačio snove.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '12:19–41' }],
    art: 'object.scales',
  },
  ears: {
    id: 'leave-in-ears',
    text: {
      en: 'Yusuf advised: what you harvest in the seven good years, leave in its ears – except a little that you eat. Ibn Kathir explains that grain left in its ears keeps longer and does not spoil quickly.',
      de: 'Yusuf riet: Was ihr in den sieben guten Jahren erntet, lasst in seinen Ähren – außer wenigem, das ihr esst. Ibn Kathir erklärt, dass Getreide in seinen Ähren länger hält und nicht schnell verdirbt.',
      bs: 'Jusuf je savjetovao: ono što požanjete u sedam rodnih godina ostavite u klasu – osim malo onoga što ćete jesti. Ibn Kesir pojašnjava da se žito u klasu duže čuva i da se ne kvari brzo.',
    },
    sources: [
      { sourceName: 'Quran', sourceReference: '12:47' },
      { sourceName: 'Ibn Kathir', sourceReference: 'Tafsir, 12:47' },
    ],
    art: 'prophet.yusuf-sheaf-green',
    check: {
      type: 'choice',
      prompt: {
        en: 'How did Yusuf advise keeping the harvest of the good years?',
        de: 'Wie sollte die Ernte der guten Jahre nach Yusufs Rat aufbewahrt werden?',
        bs: 'Kako je Jusuf savjetovao da se čuva žetva rodnih godina?',
      },
      options: [
        { en: 'Left in its ears, except a little to eat', de: 'In ihren Ähren, außer wenigem zum Essen', bs: 'Ostavljena u klasu, osim malo za jelo' },
        { en: 'Threshed and spread out in the sun', de: 'Gedroschen und in der Sonne ausgebreitet', bs: 'Ovršena i raširena na suncu' },
        { en: 'Given away to other lands', de: 'An andere Länder verschenkt', bs: 'Poklonjena drugim zemljama' },
      ],
      correctIndex: 0,
    },
  },
  hardYears: {
    id: 'hard-years-use-store',
    text: {
      en: 'Then seven hard years would come that eat up what you had stored for them – except a little that you keep back.',
      de: 'Danach würden sieben harte Jahre kommen, die aufzehren, was ihr für sie gelagert habt – außer wenigem, das ihr zurückbehaltet.',
      bs: 'Zatim će doći sedam teških godina koje će pojesti ono što ste za njih sačuvali – osim malo što ćete ostaviti.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '12:48' }],
    art: 'prophet.yusuf-granary',
  },
  relief: {
    id: 'year-of-relief',
    text: {
      en: 'After that a year would come in which the people are given rain and in which they press (fruit and oil).',
      de: 'Danach würde ein Jahr kommen, in dem die Menschen Regen bekommen und in dem sie (Früchte und Öl) pressen.',
      bs: 'Nakon toga doći će godina u kojoj će ljudima biti dana kiša i u kojoj će cijediti (plodove i ulje).',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '12:49' }],
    art: 'garden.olive',
  },
} satisfies Record<string, GameFact>;
