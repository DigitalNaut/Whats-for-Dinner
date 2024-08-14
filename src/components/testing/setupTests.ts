import "@testing-library/jest-dom";
import { vi } from "vitest";

import { type useLanguageContext } from "src/hooks/useLanguageContext";
import * as LanguageContextModule from "src/hooks/useLanguageContext";

vi.spyOn(LanguageContextModule, "useLanguageContext").mockReturnValue({
  t: (key: string) => key,
} as ReturnType<typeof useLanguageContext>);
