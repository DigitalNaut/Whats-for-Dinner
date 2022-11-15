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
import ProtectedRoutes from "src/components/ProtectedRoutes";
import { useUser } from "src/hooks/UserContext";
import { GoogleDriveProvider } from "src/hooks/GoogleDriveContext";
import { WithHeader } from "src/components/Header";

// TODO: Remove
import Tests from "src/pages/Tests";

function App() {
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
        <div
          className="text-white bg-gradient-to-br from-[#5B0B68] to-[#4C1D95] shadow-2xl
          md:rounded-xl max-w-screen-md w-screen h-full"
        >
          <div className="bg-svg-abstract-shapes inset-0 bg-repeat bg-top rounded-[inherit] w-full h-full p-3 sm:p-4 md:p-5 lg:p-6">
            <UserCard />

            {googleOAuthLoaded && (
              <Routes>
                <Route element={<WithHeader />}>
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
                      <ProtectedRoutes />
                    </GoogleDriveProvider>
                  }
                >
                  <Route element={<WithHeader />}>
                    <Route path="/main" element={<Main />} />
                  </Route>
                </Route>
              </Routes>
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
