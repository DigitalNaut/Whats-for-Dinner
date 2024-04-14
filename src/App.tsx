import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import { MainLayout, MenuLayout } from "src/components/Layouts";
import { MenuHeader, TitleHeader } from "src/components/Headers";
import { SpinnerMenuContextProvider } from "src/contexts/SpinnerMenuContext";
import NotFound from "src/pages/NotFound";
import ProtectedRoutes from "src/components/ProtectedRoutes";
import Spinner from "src/components/common/Spinner";

const LazyAddItem = lazy(() => import("src/pages/AddItem"));
const LazyEditMenu = lazy(() => import("src/pages/EditMenu"));
const LazyMain = lazy(() => import("src/pages/Main"));
const LazyLogin = lazy(() => import("src/pages/Login"));
const LazyPrivacy = lazy(() => import("src/pages/Privacy"));
const LazyTerms = lazy(() => import("src/pages/Terms"));

// TODO: Remove
// import Tests from "src/pages/Tests";

const mainLayout = (
  <MainLayout>
    <TitleHeader>¿Qué para comer?</TitleHeader>
  </MainLayout>
);

const newRouter = createBrowserRouter([
  {
    path: "/",
    element: mainLayout,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Spinner />}>
            <LazyLogin redirectTo="/main" />
          </Suspense>
        ),
      },
      {
        path: "/privacy",
        element: (
          <Suspense fallback={<Spinner />}>
            <LazyPrivacy />
          </Suspense>
        ),
      },
      {
        path: "/terms",
        element: (
          <Suspense fallback={<Spinner />}>
            <LazyTerms />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    element: (
      <GoogleDriveProvider>
        <SpinnerMenuContextProvider>
          <ProtectedRoutes redirectTo="/" />
        </SpinnerMenuContextProvider>
      </GoogleDriveProvider>
    ),
    children: [
      {
        element: mainLayout,
        children: [
          {
            path: "/main",
            element: (
              <Suspense fallback={<Spinner />}>
                <LazyMain />
              </Suspense>
            ),
          },
        ],
      },
      {
        element: (
          <MenuLayout>
            <MenuHeader />
          </MenuLayout>
        ),
        children: [
          {
            path: "/menu",
            element: (
              <Suspense fallback={<Spinner />}>
                <LazyEditMenu />
              </Suspense>
            ),
          },
          {
            path: "/addItem",
            element: (
              <Suspense fallback={<Spinner />}>
                <LazyAddItem />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={newRouter} />;
}
