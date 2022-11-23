import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import InputText from "src/components/InputText";

test("renders a custom input element with a label", () => {
  render(
    <InputText
      // cspell: disable-next-line
      data-testid="input-element"
      name="input-test"
      label="Test label"
    />
  );
  const inputElement = screen.getByTestId("input-element");
  const label = screen.getByLabelText("Test label");

  expect(inputElement).toBeInTheDocument();
  expect(label).toBeInTheDocument();
});

test("renders a custom input element with a hint", () => {
  render(<InputText hint="Hint text" />);
  const hint = screen.getByText("Hint text");

  expect(hint).toBeInTheDocument();
});

test("renders a custom input with an error that obscures the hint", () => {
  render(<InputText error="Error text" hint="Hint text" />);
  const errorElement = screen.getByText("Error text");
  const hintElement = screen.queryByText("Hint text");

  expect(errorElement).toBeInTheDocument();
  expect(hintElement).not.toBeInTheDocument();
});

test("renders a custom input with a value", () => {
  render(<InputText value="Test value" />);
  const inputElement = screen.getByDisplayValue("Test value");

  expect(inputElement).toBeInTheDocument();
});

test("renders a custom input with a placeholder", () => {
  render(<InputText placeholder="Placeholder text" />);
  const inputElement = screen.getByPlaceholderText("Placeholder text");

  expect(inputElement).toBeInTheDocument();
});

test("renders a custom input without a clear button", () => {
  render(<InputText onClear={() => null} />);
  const clearButton = screen.queryByLabelText("Borrar entrada");

  expect(clearButton).toBeNull();
});

test("renders a custom input with a functioning clear button", () => {
  render(<InputText value="a value" onClear={() => null} />);
  const clearButton = screen.getByLabelText("Borrar entrada");

  expect(clearButton).toBeInTheDocument();

  clearButton.click();
  const inputElement = screen.queryByDisplayValue("a value");

  expect(inputElement).toBeNull();
});
