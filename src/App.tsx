import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import Login from "src/pages/Login";
import Main from "src/pages/Main";
import Privacy from "src/pages/Privacy";
import Terms from "src/pages/Terms";
import NotFound from "src/pages/NotFound";
import EditMenu from "src/pages/EditMenu";
import AddItem from "src/pages/AddItem";
import ProtectedRoutes from "src/components/ProtectedRoutes";
import { useUser } from "src/hooks/UserContext";
import { MainLayout, MenuLayout } from "src/components/Layouts";
import { GoogleDriveProvider } from "src/hooks/GoogleDriveContext";
import { SpinnerMenuContextProvider } from "src/hooks/SpinnerMenuContext";
import { MenuHeader, TitleHeader } from "src/components/Headers";

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
              <ProtectedRoutes />
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
    </>
  )
);

export default function App() {
  const { UserCard } = useUser();

  return (
    <>
      <UserCard />
      <RouterProvider router={router} />
    </>
  );
}
