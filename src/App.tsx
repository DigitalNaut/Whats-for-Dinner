import { type PropsWithChildren, lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import { PlainLayout, MenuLayout } from "src/components/Layouts";
import { MenuHeader, TitleHeader } from "src/components/Headers";
import { SpinnerMenuContextProvider } from "src/contexts/SpinnerMenuContext";
import { useLanguageContext } from "src/contexts/LanguageContext";
import ProtectedRoutes from "src/components/ProtectedRoutes";
import Spinner from "src/components/common/Spinner";

const LazyAddItem = lazy(() => import("src/pages/AddItem"));
const LazyEditMenu = lazy(() => import("src/pages/EditMenu"));
const LazyMain = lazy(() => import("src/pages/Main"));
const LazyLogin = lazy(() => import("src/pages/Login"));
const LazyPrivacy = lazy(() => import("src/pages/Privacy"));
const LazyTerms = lazy(() => import("src/pages/Terms"));
const LazyNotFound = lazy(() => import("src/pages/NotFound"));

// TODO: Remove
const LazyTests = lazy(() => import("src/pages/Tests"));

function MainLayout({ children }: PropsWithChildren) {
  const { t } = useLanguageContext();

  return (
    <PlainLayout header={<TitleHeader>{t("Title")}</TitleHeader>}>
      {children}
    </PlainLayout>
  );
}

const newRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    ),
    children: [
      { index: true, element: <LazyLogin redirectTo="/main" /> },
      { path: "/privacy", element: <LazyPrivacy /> },
      { path: "/terms", element: <LazyTerms /> },
      { path: "*", element: <LazyNotFound /> },
    ],
  },
  {
    element: (
      <GoogleDriveProvider>
        <SpinnerMenuContextProvider>
          <ProtectedRoutes redirectTo="/">
            <Outlet />
          </ProtectedRoutes>
        </SpinnerMenuContextProvider>
      </GoogleDriveProvider>
    ),
    children: [
      {
        element: (
          <MainLayout>
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: [{ path: "/main", element: <LazyMain /> }],
      },
      {
        element: (
          <MenuLayout header={<MenuHeader />}>
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </MenuLayout>
        ),
        children: [
          { path: "/menu", element: <LazyEditMenu /> },
          { path: "/addItem", element: <LazyAddItem /> },
          { path: "/test", element: <LazyTests /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={newRouter} />;
}
