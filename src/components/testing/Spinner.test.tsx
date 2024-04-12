import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Spinner from "src/components/common/Spinner";

test("renders a spinner with default text", () => {
  render(<Spinner />);
  const spinner = screen.getByText(/loading/i);
  expect(spinner).toBeInTheDocument();
});

test("renders a spinner with custom text", () => {
  render(<Spinner text="Custom text" />);
  const spinner = screen.getByText(/custom text/i);
  expect(spinner).toBeInTheDocument();
});
