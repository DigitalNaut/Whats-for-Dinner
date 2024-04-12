import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Switcher, { SwitcherState } from "src/components/Switcher";

test("renders a switcher with two options", () => {
  render(
    <Switcher
      initialState={SwitcherState.FirstOption}
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
  expect(buttons[0]).toHaveTextContent("first");
  expect(buttons[1]).toHaveTextContent("second");
});

test("renders the first option", async () => {
  render(
    <Switcher
      initialState={SwitcherState.FirstOption}
      labels={["first option", "second option"]}
      renders={{
        firstOption: <p>cats</p>,
        secondOption: <p>dogs</p>,
      }}
      onChange={() => null}
    />
  );

  expect(await screen.findByText(/cats/i)).toBeInTheDocument();
  expect(screen.queryByText(/dogs/i)).not.toBeInTheDocument();
});

test("renders the second option", async () => {
  render(
    <Switcher
      initialState={SwitcherState.SecondOption}
      labels={["first option", "second option"]}
      renders={{
        firstOption: <p>cats</p>,
        secondOption: <p>dogs</p>,
      }}
      onChange={() => null}
    />
  );

  expect(await screen.findByText(/dogs/i)).toBeInTheDocument();
  expect(screen.queryByText(/cats/i)).not.toBeInTheDocument();
});

test("switches display based on clicks", async () => {
  const onChange = vi.fn();

  render(
    <Switcher
      initialState={SwitcherState.FirstOption}
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

  expect(screen.getByText(/cats/i)).toBeInTheDocument();
  expect(screen.queryByText(/dogs/i)).not.toBeInTheDocument();

  await userEvent.click(secondOption);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(SwitcherState.SecondOption);
  expect(await screen.findByText(/dogs/i)).toBeInTheDocument();
  expect(screen.queryByText(/cats/i)).not.toBeInTheDocument();

  await userEvent.click(firstOption);

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenCalledWith(SwitcherState.FirstOption);
  expect(await screen.findByText(/cats/i)).toBeInTheDocument();
  expect(screen.queryByText(/dogs/i)).not.toBeInTheDocument();
});
