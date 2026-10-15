import { defineNamespace } from '@/core/i18n';

const en = {
  'arabicVoice.title': 'No Arabic voice on this device',
  'arabicVoice.bodyAndroid':
    'To hear the letters, install the Arabic voice: Settings → Accessibility → Text-to-speech output → Speech Services by Google (gear) → Install voice data → Arabic.',
  'arabicVoice.bodyIos': 'To hear the letters, add an Arabic voice: Settings → Accessibility → Spoken Content → Voices → Arabic.',
  'arabicVoice.open': 'Open voice settings',
  'arabicVoice.close': 'Close',
};

const de: Record<keyof typeof en, string> = {
  'arabicVoice.title': 'Keine arabische Stimme auf diesem Gerät',
  'arabicVoice.bodyAndroid':
    'Um die Buchstaben zu hören, installiere die arabische Stimme: Einstellungen → Bedienungshilfen → Sprachausgabe → Sprachdienste von Google (Zahnrad) → Sprachdaten installieren → Arabisch.',
  'arabicVoice.bodyIos': 'Um die Buchstaben zu hören, füge eine arabische Stimme hinzu: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Arabisch.',
  'arabicVoice.open': 'Spracheinstellungen öffnen',
  'arabicVoice.close': 'Schließen',
};

const bs: Record<keyof typeof en, string> = {
  'arabicVoice.title': 'Na ovom uređaju nema arapskog glasa',
  'arabicVoice.bodyAndroid':
    'Da bi čuo harfove, instaliraj arapski glas: Postavke → Pristupačnost → Pretvaranje teksta u govor → Googleove usluge govora (zupčanik) → Instaliraj glasovne podatke → Arapski.',
  'arabicVoice.bodyIos': 'Da bi čuo harfove, dodaj arapski glas: Postavke → Pristupačnost → Izgovoreni sadržaj → Glasovi → Arapski.',
  'arabicVoice.open': 'Otvori postavke glasa',
  'arabicVoice.close': 'Zatvori',
};

export const audioI18n = defineNamespace('audio', { en, de, bs });
