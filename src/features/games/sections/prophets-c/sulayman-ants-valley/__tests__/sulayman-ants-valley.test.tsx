import { getGame } from "@/core/games";

import { describeProphetGame } from "../../shared/gameTest";
import { registerSulaymanGame, SULAYMAN_ART, SULAYMAN_ID } from "../register";

jest.mock("@/core/services/sound", () => ({ playSound: jest.fn() }));
registerSulaymanGame();

describe("The Valley of the Ants", () => {
  describeProphetGame(() => getGame(SULAYMAN_ID)!, { art: SULAYMAN_ART });
});
