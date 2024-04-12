import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "src/components/common/ErrorFallback";

function ErrorComponent() {
  throw new Error("Error!");
  return null;
}

test("renders an error handler component", () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => null);

  render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ErrorComponent />
    </ErrorBoundary>,
  );
  const element = screen.getByText(/Something went wrong:/i);
  expect(element).toBeInTheDocument();
  expect(consoleSpy).toHaveBeenCalled();

  vi.spyOn(console, "error").mockRestore();
});
