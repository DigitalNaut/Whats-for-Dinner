import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { debug } from "vitest-preview";

import * as UserContextModule from "src/contexts/UserContext";
import ProtectedRoutes from "src/components/ProtectedRoutes";

const useUserSpy = vi.spyOn(UserContextModule, "useUser");

const router = createBrowserRouter([
  {
    path: "/",

    element: (
      <ProtectedRoutes redirectTo="/redirected">{<Outlet />}</ProtectedRoutes>
    ),
    children: [
      {
        index: true,
        element: <div>Protected</div>,
      },
    ],
  },
  {
    path: "/redirected",
    element: <div>Main</div>,
  },
]);

describe("ProtectedRoutes", () => {
  test("renders a protected route if user exists", async () => {
    useUserSpy.mockReturnValue({
      user: { name: "John Doe" },
    } as ReturnType<typeof UserContextModule.useUser>);

    render(<RouterProvider router={router} />);

    const protectedRoute = await screen.findByText(/protected/i);
    expect(protectedRoute).toBeInTheDocument();

    debug();
  });

  test("redirects if user doesn't exists", async () => {
    useUserSpy.mockReturnValue({ user: null } as ReturnType<
      typeof UserContextModule.useUser
    >);

    render(<RouterProvider router={router} />);

    const unprotectedRoute = await screen.findByText(/main/i);
    expect(unprotectedRoute).toBeInTheDocument();

    // debug();
  });
});
