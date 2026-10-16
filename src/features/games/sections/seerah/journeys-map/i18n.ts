import { defineNamespace } from '@/core/i18n';

/** Namespace `game.journeys-map`. */
const en = {
  title: 'Journeys of the Seerah',
  description: 'Trace the journeys on the map of the Hijaz: to Taʾif and back, to al-Hudaybiyyah, and the return to Makkah.',
  howTo: 'Trace the route with your finger from stop to stop, or tap the stops in order. The lines are approximate.',
  'play.l1': 'From Makkah to Taʾif and back again – trace the journey.',
  'play.l2': 'From Madinah towards Makkah for ʿUmrah – the road ends at al-Hudaybiyyah.',
  'play.l3': 'Ramadan 8 AH: from Madinah to Makkah. No guide line this time.',
  'stop.makkah': 'Makkah',
  'stop.taif': 'Taʾif',
  'stop.makkah-back': 'Back in Makkah',
  'stop.mountains': 'Through the mountains',
  'stop.madinah': 'Madinah',
  'stop.road': 'On the road',
  'stop.hudaybiyyah': 'al-Hudaybiyyah',
  'caption.back': 'Back to Makkah. The line on the map is a direct line – the exact path through the mountains is not recorded.',
  'caption.road': 'The routes on this map are approximate lines.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Reisen der Sira',
  description: 'Verfolge die Reisen auf der Karte des Hidschas: nach Taif und zurück, nach al-Hudaibiya und die Rückkehr nach Mekka.',
  howTo: 'Fahre die Route mit dem Finger von Station zu Station nach oder tippe die Stationen der Reihe nach an. Die Linien sind ungefähr.',
  'play.l1': 'Von Mekka nach Taif und wieder zurück – verfolge die Reise.',
  'play.l2': 'Von Medina Richtung Mekka zur ʿUmra – der Weg endet in al-Hudaibiya.',
  'play.l3': 'Ramadan 8 n. H.: von Medina nach Mekka. Diesmal ohne Hilfslinie.',
  'stop.makkah': 'Mekka',
  'stop.taif': 'Taif',
  'stop.makkah-back': 'Zurück in Mekka',
  'stop.mountains': 'Durch die Berge',
  'stop.madinah': 'Medina',
  'stop.road': 'Unterwegs',
  'stop.hudaybiyyah': 'al-Hudaibiya',
  'caption.back': 'Zurück nach Mekka. Die Linie auf der Karte ist gerade – der genaue Weg durch die Berge ist nicht überliefert.',
  'caption.road': 'Die Routen auf dieser Karte sind ungefähre Linien.',
};

const bs: Record<Key, string> = {
  title: 'Putovanja sire',
  description: 'Prati putovanja na mapi Hidžaza: do Taifa i nazad, do Hudejbije i povratak u Mekku.',
  howTo: 'Prstom prati put od stanice do stanice ili dodiruj stanice redom. Linije su približne.',
  'play.l1': 'Od Mekke do Taifa i nazad – prati putovanje.',
  'play.l2': 'Od Medine prema Mekki radi umre – put se završava na Hudejbiji.',
  'play.l3': 'Ramazan 8. g. po H.: od Medine do Mekke. Ovaj put bez pomoćne linije.',
  'stop.makkah': 'Mekka',
  'stop.taif': 'Taif',
  'stop.makkah-back': 'Nazad u Mekki',
  'stop.mountains': 'Kroz planine',
  'stop.madinah': 'Medina',
  'stop.road': 'Na putu',
  'stop.hudaybiyyah': 'Hudejbija',
  'caption.back': 'Nazad u Mekku. Linija na mapi je prava – tačan put kroz planine nije zabilježen.',
  'caption.road': 'Putevi na ovoj mapi su približne linije.',
};

export const journeysI18n = defineNamespace('game.journeys-map', { en, de, bs });
