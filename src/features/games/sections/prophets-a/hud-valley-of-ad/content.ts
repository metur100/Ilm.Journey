import type { GameFact } from '@/core/games';
import type { SceneSpot } from '@/core/games/kit';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { quran, T } from '../shared';

/*
 * Hud – The Valley of ʿAd, three events (story hud.json): L1 the gifts Allah gave ʿAd (26:132–134, 89:6–8), L2 Hud's
 * call and their pride (7:65, 11:50–52, 26:128–130, 41:15), L3 the cloud, the wind and the rescue of Hud and the
 * believers (46:24–25, 69:6–7, 11:58) – the punishment is narrated, never played.
 */

export const HUD_FACTS = {
  gifts: {
    id: 'hud-gifts-of-allah',
    text: T(
      'Hud reminded his people: Allah gave you livestock and children, gardens and springs.',
      'Hud erinnerte sein Volk: Allah gab euch Vieh und Kinder, Gärten und Quellen.',
      'Hud je podsjetio svoj narod: Allah vam je dao stoku i djecu, bašče i izvore.',
    ),
    sources: [quran('26:132–134')],
    art: 'prophet.hud-spring',
    reviewKey: 'stories:hud-gifts',
  },
  iram: {
    id: 'hud-iram-pillars',
    text: T(
      'ʿAd built Iram, the city of lofty pillars, whose like had not been made in the lands.',
      'Die ʿAd bauten Iram, die Stadt der hohen Säulen, deren Gleichen im Land nicht erschaffen worden war.',
      'Ad je sagradio Irem, grad visokih stubova, kakav nije bio stvoren u zemljama.',
    ),
    sources: [quran('89:6–8')],
    art: 'prophet.hud-iram',
  },
  shukr: lessonFact(
    'shukr',
    T(
      'Thank Allah for His gifts (shukr): health, family, food and strength all come from Him. Remember the Giver and use His gifts well.',
      'Danke Allah für Seine Gaben (Schukr): Gesundheit, Familie, Essen und Kraft kommen alle von Ihm. Denk an den Geber und nutze Seine Gaben gut.',
      'Zahvaljuj Allahu na Njegovim blagodatima (šukur): zdravlje, porodica, hrana i snaga – sve je od Njega. Sjeti se Darivatelja i lijepo koristi Njegove darove.',
    ),
    [quran('7:69'), quran('26:132–134')],
    { art: 'garden.pomegranate' },
  ),
  istighfar: {
    id: 'hud-istighfar-rain',
    text: T(
      'Hud said: Ask your Lord for forgiveness – He will send you rain in abundance and add strength to your strength.',
      'Hud sagte: Bittet euren Herrn um Vergebung – Er wird euch reichlich Regen senden und eurer Stärke Stärke hinzufügen.',
      'Hud je rekao: Tražite oprost od Gospodara svoga – On će vam slati obilnu kišu i dodati snagu vašoj snazi.',
    ),
    sources: [quran('11:52')],
    art: 'story.cloud',
    reviewKey: 'stories:hud-istighfar',
  },
  pride: {
    id: 'hud-who-is-stronger',
    text: T(
      'ʿAd grew proud and said: "Who is stronger than us?" But Allah, who created them, is far stronger.',
      'Die ʿAd wurden hochmütig und sagten: „Wer ist stärker als wir?“ Doch Allah, der sie erschuf, ist viel stärker.',
      'Ad se uzoholio i rekao: „Ko je od nas jači?“ A Allah, koji ih je stvorio, mnogo je jači.',
    ),
    sources: [quran('41:15')],
    art: 'prophet.hud-tower',
    check: {
      type: 'choice',
      prompt: T('What did ʿAd say in their pride?', 'Was sagten die ʿAd in ihrem Hochmut?', 'Šta je Ad rekao u svojoj oholosti?'),
      options: [T('"Who is stronger than us?"', '„Wer ist stärker als wir?“', '„Ko je od nas jači?“'), T('"Thank you, Allah."', '„Danke, Allah.“', '„Hvala Ti, Allahu.“'), T('"Let us share."', '„Lasst uns teilen.“', '„Hajde da dijelimo.“')],
      correctIndex: 0,
    },
  },
  humble: lessonFact(
    'humble',
    T(
      'Stay humble, however strong, clever or rich you become – all strength belongs to Allah.',
      'Bleib bescheiden, egal wie stark, klug oder reich du wirst – alle Stärke gehört Allah.',
      'Ostani skroman, ma koliko jak, pametan ili bogat postao – sva snaga pripada Allahu.',
    ),
    [quran('41:15')],
    { art: 'garden.sprout' },
  ),
  wind: {
    id: 'hud-cloud-wind',
    text: T(
      'ʿAd saw a cloud and said: "This cloud will bring us rain." But it was a wind that blew for seven nights and eight days, and only their empty dwellings remained.',
      'Die ʿAd sahen eine Wolke und sagten: „Diese Wolke bringt uns Regen.“ Doch es war ein Wind, der sieben Nächte und acht Tage wehte, und nur ihre leeren Wohnstätten blieben.',
      'Ad je vidio oblak i rekao: „Ovaj oblak će nam kišu donijeti.“ Ali bio je to vjetar koji je puhao sedam noći i osam dana, i ostala su samo njihova prazna boravišta.',
    ),
    sources: [quran('46:24–25'), quran('69:6–7')],
    art: 'story.rain-clouds',
  },
  saved: {
    id: 'hud-saved-by-mercy',
    text: T(
      'Allah saved Hud and those who believed with him by His mercy.',
      'Allah rettete Hud und die, die mit ihm glaubten, durch Seine Barmherzigkeit.',
      'Allah je Svojom milošću spasio Huda i one koji su s njim vjerovali.',
    ),
    sources: [quran('11:58')],
    art: 'story.sun',
    reviewKey: 'stories:hud-saved',
  },
  listen: lessonFact(
    'listen',
    T(
      'Listen to good advice while there is time, and stay with the believers even if they are few – Allah’s mercy saved Hud and those with him.',
      'Hör auf guten Rat, solange Zeit ist, und bleib bei den Gläubigen, auch wenn sie wenige sind – Allahs Barmherzigkeit rettete Hud und die mit ihm.',
      'Poslušaj dobar savjet dok ima vremena i ostani s vjernicima, makar ih bilo malo – Allahova milost je spasila Huda i one s njim.',
    ),
    [quran('11:58'), quran('46:21')],
    { art: 'story.sun' },
  ),
} satisfies Record<string, GameFact>;

/** L1 – the gifts of Allah in the valley (26:133–134). */
export const GIFT_SPOTS: SceneSpot[] = [
  { id: 'cattle', label: T('Livestock', 'Vieh', 'Stoka'), art: 'animal.cow', spotArt: 'animal.cow', at: { x: 0.05, y: 0.6, w: 0.22, h: 0.22 }, caption: T('Livestock – a gift from Allah (26:133).', 'Vieh – eine Gabe Allahs (26:133).', 'Stoka – Allahov dar (26:133).') },
  { id: 'garden', label: T('Gardens', 'Gärten', 'Bašče'), art: 'garden.pomegranate', spotArt: 'garden.pomegranate', at: { x: 0.56, y: 0.44, w: 0.18, h: 0.3 }, caption: T('Gardens full of fruit (26:134).', 'Gärten voller Früchte (26:134).', 'Bašče pune plodova (26:134).') },
  { id: 'spring', label: T('Springs', 'Quellen', 'Izvori'), art: 'prophet.hud-spring', spotArt: 'prophet.hud-spring', at: { x: 0.68, y: 0.76, w: 0.3, h: 0.2 }, caption: T('Springs of fresh water (26:134).', 'Quellen frischen Wassers (26:134).', 'Izvori svježe vode (26:134).') },
  { id: 'sheep', label: T('Sheep', 'Schafe', 'Ovce'), art: 'animal.sheep', spotArt: 'animal.sheep', at: { x: 0.32, y: 0.74, w: 0.16, h: 0.16 }, caption: T('Grazing flocks (26:133).', 'Weidende Herden (26:133).', 'Stada na ispaši (26:133).') },
  { id: 'palm', label: T('Date palms', 'Dattelpalmen', 'Palme'), art: 'garden.palm', spotArt: 'garden.palm', at: { x: 0.02, y: 0.3, w: 0.16, h: 0.3 }, caption: T('Gardens and fruit trees (26:134).', 'Gärten und Fruchtbäume (26:134).', 'Bašče i voćke (26:134).') },
];

export const SPOT_FACT: Record<string, string> = Object.fromEntries(GIFT_SPOTS.map((s) => [s.id, HUD_FACTS.gifts.id]));

/** L2 – Hud's call and their pride (7:65, 11:52, 26:128–130, 41:15). */
export const CALL_EPISODE: Episode = {
  kind: 'sort',
  prompt: T(
    'What did Hud call his people to – and how did they answer in their pride?',
    'Wozu rief Hud sein Volk auf – und wie antworteten sie in ihrem Hochmut?',
    'Čemu je Hud pozivao svoj narod – i kako su odgovorili u svojoj oholosti?',
  ),
  hints: false,
  bins: [
    { id: 'call', art: 'object.lamp', label: T('Hud’s call', 'Huds Aufruf', 'Hudov poziv') },
    { id: 'pride', art: 'prophet.hud-tower', label: T('Their pride', 'Ihr Hochmut', 'Njihova oholost') },
  ],
  items: [
    { id: 'worship', bin: 'call', label: T('Worship Allah alone', 'Allah allein dienen', 'Robovati samo Allahu'), sub: '7:65' },
    { id: 'forgive', bin: 'call', label: T('Ask your Lord for forgiveness', 'Bittet euren Herrn um Vergebung', 'Tražite oprost od Gospodara'), sub: '11:52' },
    { id: 'rain', bin: 'call', label: T('He will send you rain', 'Er sendet euch Regen', 'On će vam slati kišu'), sub: '11:52' },
    { id: 'landmarks', bin: 'pride', label: T('Towers on every height for show', 'Türme auf jeder Höhe zum Angeben', 'Kule na svakoj uzvisini za razmetanje'), sub: '26:128' },
    { id: 'forever', bin: 'pride', label: T('Building as if to live forever', 'Bauen, als lebten sie ewig', 'Gradili kao da će vječno živjeti'), sub: '26:129' },
    { id: 'stronger', bin: 'pride', label: T('"Who is stronger than us?"', '„Wer ist stärker als wir?“', '„Ko je jači od nas?“'), sub: '41:15' },
  ],
  factMap: { worship: 'hud-istighfar-rain', forgive: 'hud-istighfar-rain', rain: 'hud-istighfar-rain', landmarks: 'hud-who-is-stronger', forever: 'hud-who-is-stronger', stronger: 'lesson-humble' },
};

/** L3 – the cloud, the wind and the rescue, in order (46:24–25, 69:6–7, 11:58). */
export const RESCUE_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'list',
  prompt: T(
    'How did the story of ʿAd end? Put it in order, then tap Check.',
    'Wie endete die Geschichte der ʿAd? Bring sie in die richtige Reihenfolge und tippe auf Prüfen.',
    'Kako je završila priča o Adu? Poredaj, pa dodirni Provjeri.',
  ),
  hints: false,
  items: [
    { id: 'warned', art: 'object.lamp', label: T('Hud warned his people in al-Ahqaf', 'Hud warnte sein Volk in al-Ahqaf', 'Hud je opominjao svoj narod u Ahkafu'), sub: '46:21' },
    { id: 'cloud', art: 'story.rain-clouds', label: T('They saw a cloud: "It will bring us rain"', 'Sie sahen eine Wolke: „Sie bringt uns Regen“', 'Vidjeli su oblak: „Donijet će nam kišu“'), sub: '46:24' },
    { id: 'wind', art: 'prophet.hud-ahqaf', label: T('A wind for seven nights and eight days', 'Ein Wind, sieben Nächte und acht Tage', 'Vjetar sedam noći i osam dana'), sub: '69:7' },
    { id: 'empty', art: 'story.ruins', label: T('Only their empty dwellings remained', 'Nur ihre leeren Wohnstätten blieben', 'Ostala su samo prazna boravišta'), sub: '46:25' },
    { id: 'rescued', art: 'story.sun', label: T('Hud and the believers saved by mercy', 'Hud und die Gläubigen durch Barmherzigkeit gerettet', 'Hud i vjernici spašeni milošću'), sub: '11:58' },
  ],
  factMap: { warned: 'lesson-listen', cloud: 'hud-cloud-wind', wind: 'hud-cloud-wind', empty: 'hud-cloud-wind', rescued: 'hud-saved-by-mercy' },
};
