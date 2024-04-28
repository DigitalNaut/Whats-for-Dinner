import "@testing-library/jest-dom";
import * as LanguageContextModule from "src/contexts/LanguageContext";
import { type useLanguageContext } from "src/contexts/LanguageContext";
import { vi } from "vitest";

vi.spyOn(LanguageContextModule, "useLanguageContext").mockReturnValue({
  t: (key: string) => key,
} as ReturnType<typeof useLanguageContext>);
