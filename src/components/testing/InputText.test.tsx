import { useState } from "react";
import { expect, test } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";

import InputText from "src/components/InputText";

test("renders a custom input element with a label", () => {
  render(<InputText name="input-test" label="test label" />);
  const inputElement = screen.getByRole("textbox", { name: /test label/i });

  expect(inputElement).toBeInTheDocument();
});

test("renders a custom input element with a hint", () => {
  render(<InputText name="input-test" hint="Hint text" />);
  const hintElement = screen.getByRole("textbox", {
    description: /hint text/i,
  });

  expect(hintElement).toBeInTheDocument();
});

test("renders a custom input with an error that obscures the hint", () => {
  render(<InputText name="input-test" error="Error text" hint="Hint text" />);
  const errorElement = screen.getByRole("textbox", {
    description: /error text/i,
  });
  const hintElement = screen.queryByRole("textbox", {
    description: /hint text/i,
  });

  expect(errorElement).toBeInTheDocument();
  expect(hintElement).not.toBeInTheDocument();
});

test("renders a custom input with a value", () => {
  render(<InputText name="input-test" value="Test value" />);
  const inputElement = screen.getByDisplayValue("Test value");

  expect(inputElement).toBeInTheDocument();
});

test("has a placeholder", () => {
  render(<InputText name="input-test" placeholder="Placeholder text" />);
  const inputElement = screen.getByPlaceholderText("Placeholder text");

  expect(inputElement).toBeInTheDocument();
});

test("renders a custom input without a clear button", () => {
  render(<InputText name="input-test" onClear={() => null} />);
  const clearButton = screen.queryByLabelText("Borrar entrada");

  expect(clearButton).toBeNull();
});

test("ensures the input is accessible with tab", async () => {
  render(<InputText name="input-test" label="Test label" />);
  const inputElement = screen.getByRole("textbox", { name: /test label/i });

  expect(document.body).toHaveFocus();

  await userEvent.tab();

  expect(inputElement).toHaveFocus();

  await userEvent.tab();

  expect(inputElement).not.toHaveFocus();
});

function TestElement() {
  const [value, setValue] = useState("");

  const onClear = () => setValue("");

  return (
    <InputText
      name="input-test"
      label="test textbox"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={onClear}
    />
  );
}

test("renders a button to clear the input", async () => {
  render(<TestElement />);
  const inputElement = screen.getByRole("textbox", { name: /test textbox/i });
  userEvent.type(inputElement, "Test value");

  await waitFor(() => expect(inputElement).toHaveValue("Test value"));

  const clearButton = await screen.findByRole("button", {
    name: /clear input/i,
  });
  expect(clearButton).toBeInTheDocument();

  await userEvent.click(clearButton);

  const inputElementAfterClear = screen.getByRole("textbox", {
    name: /test textbox/i,
  });

  await waitFor(() => expect(inputElementAfterClear).toHaveValue(""));

  expect(clearButton).not.toBeInTheDocument();
});
