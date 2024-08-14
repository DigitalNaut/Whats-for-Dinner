import type { Dispatch, SetStateAction } from "react";
import type { SpinnerEntry } from "src/components/SpinningWheel";

export type SpinnerMenuContext = {
  allMenuItems?: SpinnerEntry[];
  enabledMenuItems?: SpinnerEntry[];
  isLoaded: boolean;
  setError: Dispatch<SetStateAction<string | undefined>>;
  setAllMenuItems: Dispatch<SetStateAction<SpinnerEntry[] | undefined>>;
  resetConfigFile: (signal?: AbortSignal) => Promise<void>;
};
