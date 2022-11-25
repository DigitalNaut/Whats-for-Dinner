import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import type { PropsWithChildren } from "react";
import { createContext } from "react";
import * as UserContextModule from "src/hooks/UserContext";
import ProtectedRoutes from "src/components/ProtectedRoutes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
const { UserProvider, useUser } = UserContextModule;

const fakedUserContext = createContext({});
const FakedUserProvider = ({ children }: PropsWithChildren) => (
  <fakedUserContext.Provider value={{ user: null }}>
    {children}
  </fakedUserContext.Provider>
);
const userProviderSpy = jest
  .spyOn(UserContextModule, "UserProvider")
  .mockImplementation(FakedUserProvider);
const useUserSpy = jest
  .spyOn(UserContextModule, "useUser")
  .mockReturnValue({ user: { name: "John Doe" } } as ReturnType<
    typeof useUser
  >);

afterEach(() => {
  useUserSpy.mockReset();
});

afterAll(() => {
  userProviderSpy.mockRestore();
});

function Providers({ children }: PropsWithChildren) {
  return (
    <UserProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </UserProvider>
  );
}

function TestRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoutes redirectTo="/redirected" />}>
        <Route index element={<p>Protected</p>} />
      </Route>
      <Route path="/redirected" element={<p>Main</p>} />
    </Routes>
  );
}

describe("ProtectedRoutes", () => {
  it("renders a protected route if user exists", async () => {
    useUserSpy.mockReturnValue({ user: { name: "John Doe" } } as ReturnType<
      typeof useUser
    >);

    render(<TestRoutes />, { wrapper: Providers });
    const protectedRoute = await screen.findByText(/protected/i);

    expect(protectedRoute).toBeInTheDocument();
  });

  it("redirects if user doesn't exists", async () => {
    useUserSpy.mockReturnValue({} as ReturnType<typeof useUser>);

    render(<TestRoutes />, { wrapper: Providers });
    const nonProtectedRoute = await screen.findByText(/main/i);

    expect(nonProtectedRoute).toBeInTheDocument();
  });
});
