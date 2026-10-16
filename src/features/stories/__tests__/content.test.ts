import { hasArt } from '@/core/art';
import { isForbiddenStageArt, stageArtNames, validateStage, type StageSpec } from '@/core/components/scene/stage';
import { LANGUAGES, type LocalizedText } from '@/core/models';
import { getQuestion, LESSONS, QUESTIONS, SCENES, STORIES } from '@/features/stories/content';
import { PROPHET_COUNT, PROPHET_ORDER } from '@/features/stories/content/order';
import { isMapPlace, PLACES } from '@/features/stories/content/places';
import { STORY_STAGES } from '@/features/stories/content/stages';
import { storiesI18n } from '@/features/stories/i18n';

/** "State truths directly" (GAMES-V3 §2): phrasings that are never used in story text. */
const FORBIDDEN_PHRASES = [
  /muslims? (believe|think)/i,
  /for muslims/i,
  /according to islam/i,
  /muslime glauben/i,
  /für muslime/i,
  /laut (dem )?islam/i,
  /im islamischen glauben/i,
  /muslimani vjeruju/i,
  /za muslimane/i,
  /prema islamu/i,
];

const storyStages = (story: (typeof STORIES)[number]): { where: string; stage: StageSpec }[] =>
  [{ where: `${story.id} cover`, stage: story.coverStage }, ...story.scenes.map((s) => ({ where: s.id, stage: s.stage }))].filter(
    (x): x is { where: string; stage: StageSpec } => !!x.stage,
  );

const SCENE_ELEMENTS = new Set([
  'stars', 'crescent', 'fullMoon', 'sun', 'clouds', 'rain', 'mountains', 'hills', 'dunes', 'sea', 'partedSea', 'waves', 'palms', 'garden',
  'tree', 'mosque', 'kaaba', 'lanterns', 'ark', 'fire', 'well', 'cave', 'city', 'whale', 'book', 'pattern', 'caravan', 'river', 'basket',
  'grain', 'dates', 'prayerMat',
]);
const SKIES = new Set(['night', 'dawn', 'day', 'sunset', 'dusk', 'storm', 'sea']);

function localizedTexts(value: unknown, path = ''): { path: string; text: LocalizedText }[] {
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if ('en' in obj && 'de' in obj && 'bs' in obj) return [{ path, text: obj as unknown as LocalizedText }];
  return Object.entries(obj).flatMap(([k, v]) => localizedTexts(v, `${path}.${k}`));
}

describe('story content', () => {
  it('orders the stories uniquely within the 25 prophets (missing stories are fine)', () => {
    const orders = STORIES.map((s) => s.order);
    expect(new Set(orders).size).toBe(orders.length);
    for (const story of STORIES) {
      expect({ id: story.id, ok: Number.isInteger(story.order) && story.order >= 1 && story.order <= PROPHET_COUNT }).toEqual({ id: story.id, ok: true });
      if (PROPHET_ORDER[story.id] !== undefined) expect(story.order).toBe(PROPHET_ORDER[story.id]);
    }
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    expect(new Set(Object.values(PROPHET_ORDER)).size).toBe(PROPHET_COUNT);
    // The stories of v2 keep their ids (progress is stored by id).
    for (const id of ['adam', 'nuh', 'ibrahim', 'musa', 'yusuf', 'yunus', 'isa', 'muhammad']) expect(STORIES.some((s) => s.id === id)).toBe(true);
  });

  it('uses unique ids', () => {
    for (const ids of [STORIES.map((s) => s.id), QUESTIONS.map((q) => q.id), LESSONS.map((l) => l.id), SCENES.map((s) => s.id)]) {
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('is fully translated', () => {
    for (const story of STORIES) {
      for (const { path, text } of localizedTexts(story)) {
        for (const lang of LANGUAGES) {
          expect({ story: story.id, path, lang, ok: text[lang]?.trim().length > 0 }).toEqual({ story: story.id, path, lang, ok: true });
        }
      }
    }
  });

  it('has scenes, lessons and sources for every story', () => {
    for (const story of STORIES) {
      expect(story.scenes.length).toBeGreaterThanOrEqual(3);
      expect(story.lessons.length).toBeGreaterThanOrEqual(2);
      expect(story.sources.length).toBeGreaterThan(0);
      for (const lesson of story.lessons) {
        expect(lesson.value.length).toBeGreaterThan(0);
        expect(lesson.explanation.en && lesson.example.en && lesson.reflection.en).toBeTruthy();
      }
      for (const scene of story.scenes) expect(scene.sources?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('cites a source on every question and tags it with the prophets topic', () => {
    for (const q of QUESTIONS) {
      expect({ id: q.id, sources: (q.sources ?? []).length > 0 }).toEqual({ id: q.id, sources: true });
      for (const s of q.sources ?? []) expect(s.sourceName && s.sourceReference).toBeTruthy();
      expect(q.areaId).toBe('prophets');
      expect(q.topic.length).toBeGreaterThan(0);
    }
  });

  it('references only questions of the same story and uses each question once', () => {
    for (const story of STORIES) {
      const referenced = [...story.scenes.flatMap((s) => (s.interactionId ? [s.interactionId] : [])), story.miniGameId, ...story.quizIds];
      expect(new Set(referenced).size).toBe(referenced.length);
      expect([...referenced].sort()).toEqual(story.questions.map((q) => q.id).sort());
      for (const id of referenced) expect(getQuestion(id)?.storyId).toBe(story.id);
    }
  });

  it('only uses scene elements the SceneView can draw (landscapes and objects, never people)', () => {
    for (const story of STORIES) {
      const specs = [story.cover, ...story.scenes.map((s) => s.scene)];
      for (const spec of specs) {
        expect(SKIES.has(spec.sky)).toBe(true);
        for (const el of spec.elements) expect(SCENE_ELEMENTS.has(el)).toBe(true);
      }
      expect(SCENE_ELEMENTS.has(story.symbol)).toBe(true);
    }
  });

  it('uses many different interaction types, not only multiple choice', () => {
    const types = new Set(QUESTIONS.map((q) => q.type));
    for (const type of ['multipleChoice', 'trueFalse', 'ordering', 'memory', 'scenario', 'find', 'map', 'lessonChoice']) {
      expect(types.has(type as never)).toBe(true);
    }
    const mc = QUESTIONS.filter((q) => q.type === 'multipleChoice').length;
    expect(mc / QUESTIONS.length).toBeLessThan(0.4);
  });

  it('has well-formed questions', () => {
    for (const q of QUESTIONS) {
      if (q.type === 'multipleChoice' || q.type === 'lessonChoice' || q.type === 'scenario') {
        expect(q.options.some((o) => o.id === q.correctOptionId)).toBe(true);
      }
      if (q.type === 'find') {
        const ids = q.items.map((i) => i.id);
        expect(q.correctIds.every((id) => ids.includes(id))).toBe(true);
        expect(q.correctIds.length).toBeLessThan(q.items.length);
        for (const item of q.items) expect(SCENE_ELEMENTS.has(item.element)).toBe(true);
      }
      if (q.type === 'map') {
        expect(q.places).toContain(q.correctPlace);
        for (const place of q.places) expect(PLACES[place as keyof typeof PLACES]).toBeDefined();
      }
      if (q.type === 'ordering') expect(q.items.length).toBeGreaterThanOrEqual(4);
      if (q.type === 'memory' || q.type === 'matching') expect(q.pairs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('never says "Muslims believe" – truths are stated directly (all languages)', () => {
    for (const story of STORIES) {
      for (const { path, text } of localizedTexts(story)) {
        for (const lang of LANGUAGES) {
          const hit = FORBIDDEN_PHRASES.find((re) => re.test(text[lang] ?? ''));
          expect({ story: story.id, path, lang, phrase: hit?.source ?? null }).toEqual({ story: story.id, path, lang, phrase: null });
        }
      }
    }
  });

  it('uses only existing art in stages and symbols – and never people', () => {
    for (const story of STORIES) {
      const names = [...(story.symbolArt ? [story.symbolArt] : []), ...storyStages(story).flatMap(({ stage }) => stageArtNames(stage))];
      for (const name of names) {
        expect({ story: story.id, name, exists: hasArt(name), person: isForbiddenStageArt(name) }).toEqual({ story: story.id, name, exists: true, person: false });
      }
      for (const { where, stage } of storyStages(story)) expect({ where, problems: validateStage(stage) }).toEqual({ where, problems: [] });
    }
  });

  it('puts stories only on known map places', () => {
    for (const story of STORIES) for (const place of story.mapPlaces ?? []) expect({ story: story.id, place, ok: isMapPlace(place) }).toEqual({ story: story.id, place, ok: true });
  });

  it('gives every story its own symbol, animated cover and a stage on every scene (the JSON wins)', () => {
    for (const story of STORIES) {
      const overlay = STORY_STAGES[story.id];
      expect({ id: story.id, symbol: !!story.symbolArt, cover: !!story.coverStage, scenes: story.scenes.every((s) => !!s.stage) }).toEqual({
        id: story.id,
        symbol: true,
        cover: true,
        scenes: true,
      });
      if (overlay?.cover) expect(story.coverStage).not.toBe(overlay.cover);
    }
  });

  it('keeps the stage overlay in step with the stories', () => {
    for (const [id, overlay] of Object.entries(STORY_STAGES)) {
      const story = STORIES.find((s) => s.id === id);
      if (!story) continue;
      for (const sceneId of Object.keys(overlay.scenes ?? {})) expect({ id, sceneId, ok: story.scenes.some((s) => s.id === sceneId) }).toEqual({ id, sceneId, ok: true });
    }
  });

  it('names every map place in every language', () => {
    for (const lang of LANGUAGES) {
      for (const id of Object.keys(PLACES)) {
        expect(storiesI18n.dictionaries[lang][`place.${id}` as 'place.makkah']?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });
});
