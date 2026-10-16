import type { GameApi } from "@/core/games";
import { BuildScene, GameBoard, kitResult } from "@/core/games/kit";

import { factsFor } from "../shared";
import { ILYAS_MISSED, type IlyasConfig } from "./register";

/** Lanterns of the Call (37:123–132) – the path lights up lantern by lantern, in the order of the ayahs. */
export function IlyasGame(api: GameApi<IlyasConfig>) {
  const { parts, ghosts, hints, visible, prompt } = api.config;
  return (
    <GameBoard api={api}>
      <BuildScene
        scene="prophet.ilyas-hills-map"
        parts={parts}
        ordered
        ghosts={ghosts}
        hints={hints}
        visible={visible}
        prompt={api.t(prompt)}
        reveal={{
          title: api.t("reveal.title"),
          caption: api.t("reveal.caption"),
        }}
        onDone={({ mistakes, missed }) =>
          api.onComplete(
            kitResult({
              moves: parts.length,
              mistakes,
              factsMissed: factsFor(missed, ILYAS_MISSED),
            }),
          )
        }
      />
    </GameBoard>
  );
}
