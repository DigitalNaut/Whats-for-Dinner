import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Floating from "src/components/Floating";

it("renders a fixed element on the screen with children", () => {
  const { container } = render(<Floating>Test</Floating>);
  const children = screen.getByText("Test");

  expect(container.firstChild).toHaveClass("fixed");
  expect(children).toBeInTheDocument();
});
