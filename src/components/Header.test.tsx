import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { TitleHeader } from "src/components/Header";

test("renders a header", () => {
  const text = "Header title";
  render(<TitleHeader>{text}</TitleHeader>);
  const element = screen.getByText(text);
  expect(element).toBeInTheDocument();
});
