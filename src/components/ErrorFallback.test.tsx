import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "./ErrorFallback";

function ErrorComponent() {
  throw new Error("Error!");
  return null;
}

test("renders an error handler component", () => {
  jest
    .spyOn(console, "error")
    .mockImplementation(() => console.log("Purposeful error thrown!"));

  render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ErrorComponent />
    </ErrorBoundary>
  );
  const element = screen.getByText(/Something went wrong:/i);
  expect(element).toBeInTheDocument();
});
