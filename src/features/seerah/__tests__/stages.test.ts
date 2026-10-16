import { hasArt } from '@/core/art';
import { isForbiddenStageArt, stageArtNames, validateStage, type StageSpec } from '@/core/components/scene/stage';
import { EPISODES, SEERAH_CONTENT } from '@/features/seerah/content';
import { EPISODE_STEPS } from '@/features/seerah/services/engine';
import { EPISODE_STAGES, EVENT_STAGES, episodeStage, episodeStepStage, eventStage } from '@/features/seerah/stages';

/** Every stage of the Seerah (episode JSON / events JSON or the overlay). */
function allStages(): { where: string; stage: StageSpec }[] {
  const out: { where: string; stage: StageSpec }[] = [];
  for (const ep of EPISODES) {
    const cover = episodeStage(ep);
    if (cover) out.push({ where: `${ep.id} cover`, stage: cover });
    for (const step of EPISODE_STEPS) {
      const s = episodeStepStage(ep, step);
      if (s) out.push({ where: `${ep.id} ${step}`, stage: s });
    }
  }
  for (const ev of SEERAH_CONTENT.events) {
    const s = eventStage(ev);
    if (s) out.push({ where: ev.id, stage: s });
  }
  return out;
}

describe('seerah stages', () => {
  it('gives every episode an animated cover', () => {
    for (const ep of EPISODES) expect({ id: ep.id, stage: !!episodeStage(ep) }).toEqual({ id: ep.id, stage: true });
  });

  it('uses only existing art, valid effects – and never people', () => {
    for (const { where, stage } of allStages()) {
      expect({ where, problems: validateStage(stage) }).toEqual({ where, problems: [] });
      for (const name of stageArtNames(stage)) expect({ where, name, exists: hasArt(name), person: isForbiddenStageArt(name) }).toEqual({ where, name, exists: true, person: false });
    }
  });

  it('keeps the overlay in step with the content', () => {
    for (const id of Object.keys(EPISODE_STAGES)) expect(EPISODES.some((e) => e.id === id)).toBe(true);
    for (const id of Object.keys(EVENT_STAGES)) expect(SEERAH_CONTENT.events.some((e) => e.id === id)).toBe(true);
    for (const overlay of Object.values(EPISODE_STAGES)) for (const step of Object.keys(overlay.stages ?? {})) expect(EPISODE_STEPS).toContain(step);
  });
});
