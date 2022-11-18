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

// TODO: Remove
import Tests from "src/pages/Tests";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Login redirectTo="/main" />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* TODO: Remove */}
        <Route path="/tests" element={<Tests />} />
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
        <Route element={<MainLayout />}>
          <Route path="/main" element={<Main />} />
        </Route>
        <Route element={<MenuLayout />}>
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
