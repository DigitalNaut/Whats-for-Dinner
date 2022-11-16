import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ErrorBoundary } from "react-error-boundary";

import Login from "src/pages/Login";
import Main from "src/pages/Main";
import Privacy from "src/pages/Privacy";
import Terms from "src/pages/Terms";
import NotFound from "src/pages/NotFound";
import ErrorFallback from "src/components/ErrorFallback";
import EditMenu from "src/pages/EditMenu";
import ProtectedRoutes from "src/components/ProtectedRoutes";
import { useUser } from "src/hooks/UserContext";
import { MainLayout, MenuLayout } from "src/components/Layouts";
import { GoogleDriveProvider } from "src/hooks/GoogleDriveContext";
import { SpinnerMenuContextProvider } from "src/hooks/SpinnerMenuContext";

// TODO: Remove
import Tests from "src/pages/Tests";

export default function App() {
  const [googleOAuthLoaded, setGoogleOAuthLoaded] = useState(false);
  const { UserCard } = useUser();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
        onScriptLoadError={() => {
          throw new Error("Google OAuth script failed to load");
        }}
        onScriptLoadSuccess={() => {
          setGoogleOAuthLoaded(true);
        }}
      >
        <UserCard />

        {googleOAuthLoaded && (
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Login redirectTo="/main" />} />
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
              </Route>
            </Route>
          </Routes>
        )}
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}
