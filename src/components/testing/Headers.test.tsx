import userEvent from "@testing-library/user-event";
import { test, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  BrowserRouter,
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";

import { MenuHeader, TitleHeader } from "src/components/Headers";
import * as HeaderContextModule from "src/contexts/HeaderContext";
import * as UserContextModule from "src/contexts/UserContext";

vi.spyOn(UserContextModule, "useUser").mockReturnValue({
  user: { name: "John Doe" },
  UserCard: () => null,
} as ReturnType<typeof UserContextModule.useUser>);
const headerContextSpy = vi
  .spyOn(HeaderContextModule, "useHeaderContext")
  .mockReturnValue({
    headerProperties: {},
  } as ReturnType<typeof HeaderContextModule.useHeaderContext>);

const user = userEvent.setup();

test("renders a title header with a chopstick svg", () => {
  const { baseElement } = render(<TitleHeader>Test</TitleHeader>);

  const svg = baseElement.querySelector("svg");
  const children = screen.getByText(/test/i);

  expect(svg).toBeInTheDocument();
  expect(children).toBeInTheDocument();
});

test("renders a menu header with a back button", async () => {
  const { container } = render(<MenuHeader />, { wrapper: MemoryRouter });
  const buttons = container.querySelectorAll("button");
  const [backButton, menuButton] = buttons;
  const svg = backButton.querySelector("svg");

  expect(backButton).toBeInTheDocument();
  expect(backButton).toHaveAttribute("aria-label", "Back");
  expect(svg).toBeInTheDocument();
  expect(menuButton).toBeUndefined();
});

const router = createMemoryRouter(
  [
    {
      path: "/",
      element: (
        <>
          <MenuHeader />
          <div>Home</div>
        </>
      ),
    },
    {
      path: "/test",
      element: (
        <>
          <MenuHeader />
          <div>Test</div>
        </>
      ),
    },
  ],
  { initialEntries: ["/test", "/"], initialIndex: 1 },
);

test("expects the default back button navigation", async () => {
  render(<RouterProvider router={router} />);

  const backButton = screen.getByLabelText("Back");
  const homeElement = await screen.findByText(/home/i);

  expect(backButton).toBeInTheDocument();
  expect(homeElement).toBeInTheDocument();

  await act(async () => {
    await user.click(backButton);
  });

  const testElement = await screen.findByText(/test/i);

  expect(testElement).toBeInTheDocument();
});

test("expects a custom back button behavior", async () => {
  headerContextSpy.mockReturnValue({
    headerProperties: {
      altBackButton: <button>Test button</button>,
    },
  } as ReturnType<typeof HeaderContextModule.useHeaderContext>);

  render(<RouterProvider router={router} />); // Reuse the router without intending to navigate

  const customBackButton = screen.getByText(/test button/i);

  expect(customBackButton).toBeInTheDocument();
});

test("renders a menu header with a custom button from context elements", async () => {
  vi.spyOn(HeaderContextModule, "useHeaderContext").mockReturnValue({
    headerProperties: {
      elements: <button>test</button>,
    },
  } as ReturnType<typeof HeaderContextModule.useHeaderContext>);

  render(<MenuHeader />, { wrapper: BrowserRouter });

  const [backButton, menuButton] = await screen.findAllByRole("button");

  expect(backButton).toBeInTheDocument();
  expect(menuButton).toBeInTheDocument();
});

test("renders a menu header with an alternative color", () => {
  // First render the component with the default color
  vi.spyOn(HeaderContextModule, "useHeaderContext").mockReturnValue({
    headerProperties: {
      altColor: false,
    },
  } as ReturnType<typeof HeaderContextModule.useHeaderContext>);

  const { container: preContainer } = render(<MenuHeader />, {
    wrapper: BrowserRouter,
  });

  expect(preContainer.firstChild).toHaveClass("bg-purple-800");

  // Then render the component with the alternative color
  vi.spyOn(HeaderContextModule, "useHeaderContext").mockReturnValue({
    headerProperties: {
      altColor: true,
    },
  } as ReturnType<typeof HeaderContextModule.useHeaderContext>);

  const { container: postContainer } = render(<MenuHeader />, {
    wrapper: BrowserRouter,
  });

  expect(postContainer.firstChild).toHaveClass("bg-amber-600");
});
