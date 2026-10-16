import { defineNamespace } from '@/core/i18n';

/** Namespace `game.hijrah-path` (v3 rework; the id stays so progress is kept). */
const en = {
  title: 'Hijrah Path',
  description: 'Trace the journey from Makkah to Madinah on the map – every stop tells what the Seerah sources report.',
  howTo: 'Slide your finger along the way from Makkah to Madinah, or tap the stops in order. In level 3 put the stages of the Hijrah in order.',
  'play.l1': 'Start in Makkah and follow the dotted route to Madinah.',
  'play.l2': 'No guide line this time – first south to the cave, then north along the coast.',
  'play.l3': 'Put the stages of the Hijrah in order, then check.',
  'stop.makkah': 'Makkah',
  'stop.thawr': 'Cave of Thawr',
  'stop.road': 'With the guide',
  'stop.coast': 'Towards the coast',
  'stop.north': 'Northwards',
  'stop.quba': 'Quba',
  'stop.madinah': 'Madinah',
  'caption.coast': 'The routes on this map are approximate lines; the positions of the cave and of Quba are drawn a little apart so they can be seen.',
  'step.aqabah': 'Pledges at al-ʿAqabah',
  'step.depart': 'Leaving Makkah secretly',
  'step.cave': 'Three nights in the Cave of Thawr',
  'step.guide': 'With a hired guide towards the coast',
  'step.quba': 'Arrival at Quba',
  'step.madinah': 'Entering Madinah',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Weg der Hidschra',
  description: 'Verfolge die Reise von Mekka nach Medina auf der Karte – jede Station erzählt, was die Quellen der Sira berichten.',
  howTo: 'Fahre mit dem Finger den Weg von Mekka nach Medina nach oder tippe die Stationen der Reihe nach an. In Stufe 3 ordnest du die Abschnitte der Hidschra.',
  'play.l1': 'Beginne in Mekka und folge der gepunkteten Route nach Medina.',
  'play.l2': 'Diesmal ohne Hilfslinie – zuerst nach Süden zur Höhle, dann nach Norden entlang der Küste.',
  'play.l3': 'Bring die Abschnitte der Hidschra in die richtige Reihenfolge und prüfe.',
  'stop.makkah': 'Mekka',
  'stop.thawr': 'Höhle Thaur',
  'stop.road': 'Mit dem Führer',
  'stop.coast': 'Richtung Küste',
  'stop.north': 'Nach Norden',
  'stop.quba': 'Quba',
  'stop.madinah': 'Medina',
  'caption.coast': 'Die Routen auf dieser Karte sind ungefähre Linien; die Höhle und Quba sind etwas abgesetzt gezeichnet, damit man sie sieht.',
  'step.aqabah': 'Treueeide in al-ʿAqaba',
  'step.depart': 'Heimlicher Aufbruch aus Mekka',
  'step.cave': 'Drei Nächte in der Höhle Thaur',
  'step.guide': 'Mit einem Führer Richtung Küste',
  'step.quba': 'Ankunft in Quba',
  'step.madinah': 'Einzug in Medina',
};

const bs: Record<Key, string> = {
  title: 'Put Hidžre',
  description: 'Prati putovanje od Mekke do Medine na mapi – svaka stanica govori šta prenose izvori sire.',
  howTo: 'Prstom prati put od Mekke do Medine ili dodiruj stanice redom. U 3. nivou poredaj dijelove Hidžre.',
  'play.l1': 'Počni u Mekki i prati isprekidani put do Medine.',
  'play.l2': 'Ovaj put bez pomoćne linije – prvo na jug do pećine, zatim na sjever uz obalu.',
  'play.l3': 'Poredaj dijelove Hidžre, pa provjeri.',
  'stop.makkah': 'Mekka',
  'stop.thawr': 'Pećina Sevr',
  'stop.road': 'S vodičem',
  'stop.coast': 'Prema obali',
  'stop.north': 'Prema sjeveru',
  'stop.quba': 'Kuba',
  'stop.madinah': 'Medina',
  'caption.coast': 'Putevi na ovoj mapi su približne linije; pećina i Kuba nacrtane su malo razmaknuto da bi se vidjele.',
  'step.aqabah': 'Prisege na Akabi',
  'step.depart': 'Tajni odlazak iz Mekke',
  'step.cave': 'Tri noći u pećini Sevr',
  'step.guide': 'S unajmljenim vodičem prema obali',
  'step.quba': 'Dolazak u Kubu',
  'step.madinah': 'Ulazak u Medinu',
};

export const hijrahI18n = defineNamespace('game.hijrah-path', { en, de, bs });
