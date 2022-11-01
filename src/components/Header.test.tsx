import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Header from "./Header";

test("renders a header", () => {
  const text = "Header title";
  render(<Header>{text}</Header>);
  const element = screen.getByText(text);
  expect(element).toBeInTheDocument();
});
