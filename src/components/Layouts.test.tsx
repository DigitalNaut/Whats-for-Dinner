import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import type { PropsWithChildren } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout, MenuLayout } from "src/components/Layouts";

function Providers({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={children}>
          <Route index element={<div>Content</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

it("renders a main layout", () => {
  render(<MainLayout />, { wrapper: Providers });
  const mainLayout = screen.getByText(/content/i);
  expect(mainLayout).toBeInTheDocument();
});

it("renders a menu layout", () => {
  render(<MenuLayout />, { wrapper: Providers });
  const menuLayout = screen.getByText(/content/i);
  expect(menuLayout).toBeInTheDocument();
});
