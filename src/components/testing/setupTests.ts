import "@testing-library/jest-dom";
import { vi } from "vitest";

import { type useLanguageContext } from "src/contexts/LanguageContext";
import * as LanguageContextModule from "src/contexts/LanguageContext";

vi.spyOn(LanguageContextModule, "useLanguageContext").mockReturnValue({
  t: (key: string) => key,
} as ReturnType<typeof useLanguageContext>);
