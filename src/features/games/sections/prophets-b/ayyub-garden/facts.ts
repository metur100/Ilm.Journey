import type { GameFact } from '@/core/games';

import { lessonFact } from '../../prophets-story/episode';
import { quran, T } from '../shared/kit';

/** Facts of the Garden of Patience – wording and references as in the Ayyub story (stories/content/prophets/ayyub.json). */
export const AYYUB_FACTS = {
  call: {
    id: 'ayyub-call',
    text: T(
      'Ayyub called out to his Lord: "Harm has touched me, and You are the Most Merciful of the merciful."',
      'Ayyub rief zu seinem Herrn: „Mich hat Unheil getroffen, und Du bist der Barmherzigste der Barmherzigen.“',
      'Ejjub je zamolio svoga Gospodara: „Mene je nevolja snašla, a Ti si od milostivih najmilostiviji.“',
    ),
    sources: quran('21:83'),
    art: 'story.lamp',
    reviewKey: 'stories:ayyub-dua',
  },
  answer: {
    id: 'ayyub-answer',
    text: T(
      'Allah answered Ayyub, removed his harm and gave him back his family, and as many again with them – a mercy from Allah and a reminder for those who worship Him.',
      'Allah erhörte Ayyub, nahm sein Unheil von ihm und gab ihm seine Familie zurück und noch einmal so viele dazu – als Barmherzigkeit von Allah und Ermahnung für die, die Ihm dienen.',
      'Allah se odazvao Ejjubu, otklonio njegovu nevolju i vratio mu porodicu, i još toliko uz njih – kao milost od Allaha i pouku onima koji Mu robuju.',
    ),
    sources: quran('21:84'),
    art: 'prophet.ayyub-plant-bloom',
    check: {
      type: 'choice',
      prompt: T('How did Allah answer Ayyub?', 'Wie antwortete Allah Ayyub?', 'Kako se Allah odazvao Ejjubu?'),
      options: [
        T('He removed his harm and gave him back his family', 'Er nahm sein Unheil und gab ihm seine Familie zurück', 'Otklonio mu je nevolju i vratio mu porodicu'),
        T('He did not answer him', 'Er antwortete ihm nicht', 'Nije mu se odazvao'),
        T('He gave him a palace', 'Er gab ihm einen Palast', 'Dao mu je dvorac'),
      ],
      correctIndex: 0,
    },
  },
  spring: {
    id: 'ayyub-spring',
    text: T(
      'Allah told Ayyub: "Strike the ground with your foot. Here is a cool spring to wash with and to drink."',
      'Allah sagte zu Ayyub: „Stampfe mit deinem Fuß auf. Hier ist kühles Wasser zum Waschen und zum Trinken.“',
      'Allah je rekao Ejjubu: „Udari nogom o tlo! Evo hladne vode za kupanje i za piće.“',
    ),
    sources: quran('38:42'),
    art: 'prophet.ayyub-spring',
    reviewKey: 'stories:ayyub-spring',
  },
  patient: {
    id: 'ayyub-patient',
    text: T(
      'Allah says about Ayyub: "We found him patient. What an excellent servant! He always turned back to Us."',
      'Allah sagt über Ayyub: „Wir fanden ihn geduldig. Welch ein vortrefflicher Diener! Er wandte sich stets Uns zu.“',
      'Allah kaže o Ejjubu: „Mi smo ga našli strpljivim. Divan li je to rob bio! Mnogo se kajao.“',
    ),
    sources: quran('38:44'),
    art: 'prophet.ayyub-plant-sprout',
    reviewKey: 'stories:ayyub-lesson',
  },
  tested: {
    id: 'ayyub-tested',
    text: T(
      'Allah tested Ayyub with hardship: illness touched him, and he lost much of what he loved, even his family. But Ayyub did not turn away from his Lord.',
      'Allah prüfte Ayyub mit Not: Krankheit traf ihn, und er verlor vieles, was er liebte, sogar seine Familie. Doch Ayyub wandte sich nicht von seinem Herrn ab.',
      'Allah je iskušao Ejjuba teškoćama: zadesila ga je bolest i izgubio je mnogo toga što je volio, čak i porodicu. Ali Ejjub se nije okrenuo od svoga Gospodara.',
    ),
    sources: quran('21:83–84', '38:41'),
    art: 'prophet.ayyub-plant-dry',
    reviewKey: 'stories:ayyub-test',
  },
  lessonPatience: lessonFact(
    'ayyub-patience',
    T(
      'Stay patient in hard times and keep turning to Allah. Allah praised Ayyub: "We found him patient. What an excellent servant!"',
      'Bleib geduldig in schweren Zeiten und wende dich immer wieder Allah zu. Allah lobte Ayyub: „Wir fanden ihn geduldig. Welch ein vortrefflicher Diener!“',
      'Budi strpljiv u teškim vremenima i stalno se obraćaj Allahu. Allah je pohvalio Ejjuba: „Mi smo ga našli strpljivim. Divan li je to rob bio!“',
    ),
    quran('38:44'),
    { art: 'prophet.ayyub-plant-sprout', reviewKey: 'stories:ayyub-lesson' },
  ),
  lessonAsk: lessonFact(
    'ayyub-ask',
    T(
      'When something hurts, tell Allah your need with good manners and praise Him – do not complain about Allah. Ayyub asked the Most Merciful, and Allah answered him.',
      'Wenn dir etwas weh tut, sag Allah mit gutem Benehmen, was du brauchst, und preise Ihn – beklage dich nicht über Allah. Ayyub bat den Barmherzigsten, und Allah erhörte ihn.',
      'Kad te nešto boli, reci Allahu svoju potrebu s lijepim ponašanjem i veličaj Ga – ne žali se na Allaha. Ejjub je molio Najmilostivijeg, i Allah mu se odazvao.',
    ),
    quran('21:83–84'),
    { art: 'story.lamp' },
  ),
  lessonEase: lessonFact(
    'ayyub-mercy-after-hardship',
    T(
      'After a hard time Allah’s mercy comes. Allah healed Ayyub and gave him back his family – a reminder for everyone who worships Him.',
      'Nach einer schweren Zeit kommt Allahs Barmherzigkeit. Allah heilte Ayyub und gab ihm seine Familie zurück – eine Ermahnung für alle, die Ihm dienen.',
      'Nakon teškog vremena dolazi Allahova milost. Allah je izliječio Ejjuba i vratio mu porodicu – pouka za sve koji Mu robuju.',
    ),
    quran('38:42–43', '21:84'),
    { art: 'prophet.ayyub-plant-bloom' },
  ),
} satisfies Record<string, GameFact>;
