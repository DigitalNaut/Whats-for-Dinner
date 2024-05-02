import { type PropsWithChildren } from "react";
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";

import { PlainLayout, MenuLayout } from "src/components/Layouts";

function TestRoutes({ children }: PropsWithChildren) {
  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "/",
          element: children,

          children: [
            {
              index: true,
              element: <div>Content</div>,
            },
          ],
        },
      ])}
    />
  );
}

test("renders a main layout", () => {
  render(
    <TestRoutes>
      <PlainLayout header={<div>Header</div>}>
        <Outlet />
      </PlainLayout>
    </TestRoutes>,
  );

  const mainLayout = screen.getByText(/content/i);
  expect(mainLayout).toBeInTheDocument();
});

test("renders a menu layout", () => {
  render(
    <TestRoutes>
      <MenuLayout header={<div>Header</div>}>
        <Outlet />
      </MenuLayout>
    </TestRoutes>,
  );
  const menuLayout = screen.getByText(/content/i);
  expect(menuLayout).toBeInTheDocument();
});
