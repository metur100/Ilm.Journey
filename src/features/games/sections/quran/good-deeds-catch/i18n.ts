import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Good Deeds of Juz ʿAmma',
  description: 'The short surahs name many good deeds – and some deeds to stay away from. Collect the good ones in your basket.',
  howTo: 'Move the basket under the good deeds as they float down, or tap them. Let the others drift past.',
  'play.prompt': 'Collect the good deeds the surahs teach.',
  'deed.feed': 'Feed the needy',
  'deed.orphan': 'Be kind to the orphan',
  'deed.give': 'Give in charity',
  'deed.patience': 'Be patient',
  'deed.truth': 'Speak the truth',
  'deed.pray': 'Pray to your Lord',
  'deed.favour': 'Tell of Allah’s favours',
  'deed.forgive': 'Ask Allah’s forgiveness',
  'deed.mock': 'Mock others',
  'deed.hoard': 'Hoard and count money',
  'deed.repel': 'Push the orphan away',
  'deed.scold': 'Scold someone who asks',
  'deed.showoff': 'Show off',
  'deed.withhold': 'Refuse small help',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Gute Taten aus Dschuz ʿAmma',
  description: 'Die kurzen Suren nennen viele gute Taten – und manche, von denen man sich fernhält. Sammle die guten in deinem Korb.',
  howTo: 'Schieb den Korb unter die guten Taten, während sie herabschweben, oder tippe sie an. Die anderen lässt du vorbeiziehen.',
  'play.prompt': 'Sammle die guten Taten, die die Suren lehren.',
  'deed.feed': 'Den Armen speisen',
  'deed.orphan': 'Gut zur Waise sein',
  'deed.give': 'Spenden',
  'deed.patience': 'Geduldig sein',
  'deed.truth': 'Die Wahrheit sagen',
  'deed.pray': 'Zu deinem Herrn beten',
  'deed.favour': 'Von Allahs Gunst erzählen',
  'deed.forgive': 'Allah um Vergebung bitten',
  'deed.mock': 'Andere verspotten',
  'deed.hoard': 'Geld horten und zählen',
  'deed.repel': 'Die Waise wegstoßen',
  'deed.scold': 'Einen Bittenden anfahren',
  'deed.showoff': 'Angeben',
  'deed.withhold': 'Kleine Hilfe verweigern',
};

const bs: Record<Key, string> = {
  title: 'Dobra djela iz Džuz Amme',
  description: 'Kratke sure spominju mnoga dobra djela – i neka kojih se treba čuvati. Skupi dobra djela u svoju korpu.',
  howTo: 'Pomjeraj korpu ispod dobrih djela dok lagano padaju ili ih dodirni. Ostala pusti da prođu.',
  'play.prompt': 'Skupi dobra djela kojima nas uče sure.',
  'deed.feed': 'Nahrani siromaha',
  'deed.orphan': 'Budi dobar prema siročetu',
  'deed.give': 'Udijeli sadaku',
  'deed.patience': 'Budi strpljiv',
  'deed.truth': 'Govori istinu',
  'deed.pray': 'Moli se svom Gospodaru',
  'deed.favour': 'Kazuj o Allahovoj blagodati',
  'deed.forgive': 'Traži od Allaha oprost',
  'deed.mock': 'Rugati se drugima',
  'deed.hoard': 'Gomilati i brojati novac',
  'deed.repel': 'Odgurnuti siroče',
  'deed.scold': 'Podviknuti na onoga ko moli',
  'deed.showoff': 'Pretvarati se pred ljudima',
  'deed.withhold': 'Uskratiti malu pomoć',
};

export const goodDeedsI18n = defineNamespace('game.good-deeds-catch', { en, de, bs });
export type DeedKey = Key;
