import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Spinner from "src/components/Spinner";

it("renders a spinner with default text", () => {
  render(<Spinner />);
  const spinner = screen.getByText(/loading/i);
  expect(spinner).toBeInTheDocument();
})

it("renders a spinner with custom text", () => {
  render(<Spinner text="Custom text" />);
  const spinner = screen.getByText(/custom text/i);
  expect(spinner).toBeInTheDocument();
})
