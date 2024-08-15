import type { Dispatch, SetStateAction } from "react";

import type { SpinnerEntry } from "src/types/SpinnerMenu";

export type SpinnerMenuContext = {
  allMenuItems?: SpinnerEntry[];
  enabledMenuItems?: SpinnerEntry[];
  isLoaded: boolean;
  setError: Dispatch<SetStateAction<string | undefined>>;
  setAllMenuItems: Dispatch<SetStateAction<SpinnerEntry[] | undefined>>;
  resetMenuFile: (signal?: AbortSignal) => Promise<void>;
};
