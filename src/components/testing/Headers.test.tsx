import type { PropsWithChildren } from "react";
import userEvent from "@testing-library/user-event";
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

import { MenuHeader, TitleHeader } from "src/components/Headers";
import { HeaderProvider, useHeaderContext } from "src/contexts/HeaderContext";
import { act } from "react-dom/test-utils";

const user = userEvent.setup();

test("renders a title header with a chopstick svg", () => {
  const { container } = render(<TitleHeader>Test</TitleHeader>);
  const svg = container.querySelector("svg");
  const children = screen.getByText("Test");

  expect(svg).toBeInTheDocument();
  expect(children).toBeInTheDocument();
});

test("renders a menu header with a back button", async () => {
  const { container } = render(<MenuHeader />, { wrapper: MemoryRouter });
  const buttons = container.querySelectorAll("button");
  const [backButton, menuButton] = buttons;
  const svg = backButton.querySelector("svg");

  expect(backButton).toBeInTheDocument();
  expect(backButton).toHaveAttribute("aria-label", "Atrás");
  expect(svg).toBeInTheDocument();
  expect(menuButton).toBeUndefined();
});

test("expects the default back button behavior", async () => {
  render(<MenuHeader />, { wrapper: BrowserRouter });
  const backButton = screen.getByLabelText("Atrás");
  window.history.pushState({}, "Test page", "/test");

  expect(window.location.pathname).toBe("/test");

  await act(async () => {
    await user.click(backButton);
  });

  expect(window.location.pathname).toBe("/");
});

function Providers({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <HeaderProvider>{children}</HeaderProvider>
    </BrowserRouter>
  );
}

function TestComponent({ backTo }: { backTo?: string }) {
  const { setHeaderProperties } = useHeaderContext();

  setHeaderProperties({
    backTo: backTo || "",
    altColor: true,
    showMenuButton: true,
  });

  return <MenuHeader />;
}

test("expects a custom back button behavior", async () => {
  render(<TestComponent backTo="/test" />, { wrapper: Providers });

  const backButton = screen.getByLabelText("Atrás");

  expect(window.location.pathname).toBe("/");

  await act(async () => {
    await user.click(backButton);
  });

  expect(window.location.pathname).toBe("/test");
});

test("renders a menu header with a menu button", async () => {
  render(<TestComponent />, { wrapper: Providers });

  const buttons = await screen.findAllByRole("button");

  const [, menuButton] = buttons;

  expect(buttons).toHaveLength(2);
  expect(menuButton).toBeInTheDocument();
});

test("renders a menu header with an alternative color", () => {
  const { container } = render(<TestComponent />, { wrapper: Providers });

  expect(container.firstChild).toHaveClass("bg-amber-600");
});
