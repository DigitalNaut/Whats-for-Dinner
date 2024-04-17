import type { PropsWithChildren } from "react";
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { PlainLayout, MenuLayout } from "src/components/Layouts";

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

test("renders a main layout", () => {
  render(<PlainLayout />, { wrapper: Providers });
  const mainLayout = screen.getByText(/content/i);
  expect(mainLayout).toBeInTheDocument();
});

test("renders a menu layout", () => {
  render(<MenuLayout />, { wrapper: Providers });
  const menuLayout = screen.getByText(/content/i);
  expect(menuLayout).toBeInTheDocument();
});
