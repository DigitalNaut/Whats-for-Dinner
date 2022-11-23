import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Switcher from "src/components/Switcher";

it("renders a switcher", () => {
  render(
    <Switcher
      initialState={true}
      labels={["first", "second"]}
      renders={{
        firstOption: <p>left option</p>,
        secondOption: <p>right option</p>,
      }}
      onChange={() => null}
    />
  );

  const buttons = screen.getAllByRole("button");

  expect(buttons).toHaveLength(2);
});

it("renders the first option", () => {
  render(
    <Switcher
      initialState={true}
      labels={["first option", "second option"]}
      renders={{
        firstOption: <p>cats</p>,
        secondOption: <p>dogs</p>,
      }}
      onChange={() => null}
    />
  );

  const firstOption = screen.getByText(/first option/i);

  expect(firstOption).toBeInTheDocument();
});

it("renders the second option", () => {
  render(
    <Switcher
      initialState={false}
      labels={["first option", "second option"]}
      renders={{
        firstOption: <p>cats</p>,
        secondOption: <p>dogs</p>,
      }}
      onChange={() => null}
    />
  );

  const secondOption = screen.getByText(/second option/i);

  expect(secondOption).toBeInTheDocument();
});

it("responds to clicks", async () => {
  const onChange = jest.fn();

  render(
    <Switcher
      initialState={true}
      labels={["first option", "second option"]}
      renders={{
        firstOption: <p>cats</p>,
        secondOption: <p>dogs</p>,
      }}
      onChange={onChange}
    />
  );

  const firstOption = screen.getByRole("button", { name: /first option/i });
  const secondOption = screen.getByRole("button", { name: /second option/i });

  await userEvent.click(secondOption);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(false);
  expect(screen.getByText(/dogs/i)).toBeInTheDocument();

  await userEvent.click(firstOption);

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenCalledWith(true);
  expect(screen.getByText(/cats/i)).toBeInTheDocument();
});
