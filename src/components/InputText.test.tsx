import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { render, screen, waitFor } from "@testing-library/react";

import InputText from "src/components/InputText";

const user = userEvent.setup();

it("renders a custom input element with a label", () => {
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

it("renders a custom input element with a hint", () => {
  render(<InputText name="input-test" hint="Hint text" />);
  const hint = screen.getByText("Hint text");

  expect(hint).toBeInTheDocument();
});

it("renders a custom input with an error that obscures the hint", () => {
  render(<InputText name="input-test" error="Error text" hint="Hint text" />);
  const errorElement = screen.getByText("Error text");
  const hintElement = screen.queryByText("Hint text");

  expect(errorElement).toBeInTheDocument();
  expect(hintElement).not.toBeInTheDocument();
});

it("renders a custom input with a value", () => {
  render(<InputText name="input-test" value="Test value" />);
  const inputElement = screen.getByDisplayValue("Test value");

  expect(inputElement).toBeInTheDocument();
});

it("has a placeholder", () => {
  render(<InputText name="input-test" placeholder="Placeholder text" />);
  const inputElement = screen.getByPlaceholderText("Placeholder text");

  expect(inputElement).toBeInTheDocument();
});

it("renders a custom input without a clear button", () => {
  render(<InputText name="input-test" onClear={() => null} />);
  const clearButton = screen.queryByLabelText("Borrar entrada");

  expect(clearButton).toBeNull();
});

it("renders a button to clear the input", async () => {
  const onClear = jest.fn();
  render(
    <InputText
      // cspell: disable-next-line
      data-testid="input-element"
      name="input-test"
      value="a value"
      onClear={onClear}
    />
  );
  const inputElement = screen.getByDisplayValue("a value");
  const clearButton = screen.getByLabelText("Borrar entrada");

  expect(clearButton).toBeInTheDocument();

  await act(async () => {
    await user.click(clearButton);
  });

  expect(onClear).toHaveBeenCalledTimes(1);
  expect(inputElement).toHaveDisplayValue("");
  waitFor(() => {
    expect(clearButton).not.toBeInTheDocument();
  });
});

it("ensures the input is focusable", async () => {
  render(
    <InputText
      // cspell: disable-next-line
      data-testid="input-element"
      name="input-test"
      label="Test label"
    />
  );
  const inputElement = screen.getByTestId("input-element");
  const labelElement = screen.getByLabelText("Test label");
  await user.click(labelElement);

  expect(inputElement).toHaveFocus();

  await user.tab();

  expect(inputElement).not.toHaveFocus();
});
