import { createContext, useContext } from "react";

export type CompletionReporter = (fieldKey: string, complete: boolean) => void;

const noop: CompletionReporter = () => {};

export const CompletionContext = createContext<CompletionReporter>(noop);

export function useReportCompletion(): CompletionReporter {
  return useContext(CompletionContext);
}

/**
 * Screen-level completion requirements.
 * Keys must match the `fieldKey` used by inputs on that screen.
 * If the screen has no entry, it is purely informational and never gated.
 */
export const REQUIREMENTS: Record<number, string[]> = {
  6:  ["screen_6_known_strengths"],
  8:  ["screen_8_s8_love", "screen_8_s8_motivate", "screen_8_s8_freetime", "screen_8_s8_authentic", "screen_8_s8_persist"],
  9:  ["screen_9_best_sides", "screen_9_strengths", "screen_9_learned", "screen_9_spotted"],
  10: Array.from({ length: 7 }, (_, i) => `screen_10_mina_olen_${i + 1}`),
  12: ["screen_12_karkkikauppa_picks"],
  13: [
    "screen_13_karkki_1", "screen_13_karkki_2", "screen_13_karkki_3",
    "screen_13_karkki_4", "screen_13_karkki_5",
    "screen_13_examples", "screen_13_success", "screen_13_effect",
  ],
  14: Array.from({ length: 9 }, (_, i) => `screen_14_tiekartta_${i + 1}`),
  16: ["screen_16_koulussa", "screen_16_vapaa_ajalla", "screen_16_kotona", "screen_16_kaverisuhteissa"],
  17: ["screen_17_opetukset", "screen_17_kasvu", "screen_17_laheinen"],
  18: ["screen_18_tunne", "screen_18_vaikutus"],
  20: ["screen_20_onnistuminen", "screen_20_ydinvahvuudet", "screen_20_tuki", "screen_20_yhteinen"],
  21: [
    "screen_21_ylpea", "screen_21_sinnikas", "screen_21_kehut",
    "screen_21_rohkea", "screen_21_tavoite", "screen_21_tunne",
    "screen_21_vahvuudet", "screen_21_uudet",
  ],
  22: ["screen_22_tulevaisuus", "screen_22_oppi"],
};

export const COMPLETION_HINT = "Täytä ensin tämän sivun tehtävä, niin pääset jatkamaan.";
