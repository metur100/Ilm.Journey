import { create } from 'zustand';

import type { Character, LearnerGroup } from '../models';
import { DEFAULT_CHARACTER } from '../services/engine';

interface OnboardingDraft {
  name: string;
  character: Character;
  learnerGroup: LearnerGroup;
  setName: (name: string) => void;
  setCharacter: (character: Character) => void;
  setLearnerGroup: (group: LearnerGroup) => void;
}

/** Temporary choices made during onboarding; committed to the global store at the last step. */
export const useOnboardingDraft = create<OnboardingDraft>((set) => ({
  name: '',
  character: { ...DEFAULT_CHARACTER },
  learnerGroup: 'child',
  setName: (name) => set({ name }),
  setCharacter: (character) => set({ character }),
  setLearnerGroup: (learnerGroup) => set({ learnerGroup }),
}));
