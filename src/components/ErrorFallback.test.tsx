import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "src/components/ErrorFallback";

function ErrorComponent() {
  throw new Error("Error!");
  return null;
}

it("renders an error handler component", () => {
  const consoleSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => null);

  render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ErrorComponent />
    </ErrorBoundary>
  );
  const element = screen.getByText(/Something went wrong:/i);
  expect(element).toBeInTheDocument();
  expect(consoleSpy).toHaveBeenCalled();

  jest.spyOn(console, "error").mockRestore();
});
