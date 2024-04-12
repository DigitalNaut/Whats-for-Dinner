import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import { MainLayout, MenuLayout } from "src/components/Layouts";
import { MenuHeader, TitleHeader } from "src/components/Headers";
import { SpinnerMenuContextProvider } from "src/contexts/SpinnerMenuContext";
import AddItem from "src/pages/AddItem";
import EditMenu from "src/pages/EditMenu";
import Login from "src/pages/Login";
import Main from "src/pages/Main";
import NotFound from "src/pages/NotFound";
import Privacy from "src/pages/Privacy";
import ProtectedRoutes from "src/components/ProtectedRoutes";
import Terms from "src/pages/Terms";

// TODO: Remove
// import Tests from "src/pages/Tests";

const mainLayout = (
  <MainLayout>
    <TitleHeader>¿Qué para comer?</TitleHeader>
  </MainLayout>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={mainLayout}>
        <Route index element={<Login redirectTo="/main" />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        element={
          <GoogleDriveProvider>
            <SpinnerMenuContextProvider>
              <ProtectedRoutes redirectTo="/" />
            </SpinnerMenuContextProvider>
          </GoogleDriveProvider>
        }
      >
        <Route element={mainLayout}>
          <Route path="/main" element={<Main />} />
        </Route>
        <Route
          element={
            <MenuLayout>
              <MenuHeader />
            </MenuLayout>
          }
        >
          <Route path="/menu" element={<EditMenu />} />
          <Route path="/addItem" element={<AddItem />} />
        </Route>
      </Route>
    </>,
  ),
);

export default function App() {
  return <RouterProvider router={router} />;
}
