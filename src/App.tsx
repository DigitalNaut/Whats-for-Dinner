import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ErrorBoundary } from "react-error-boundary";

import Header from "src/components/Header";
import Login from "src/pages/Login";
import Main from "src/pages/Main";
import Privacy from "src/pages/Privacy";
import Terms from "src/pages/Terms";
import ErrorFallback from "src/components/ErrorFallback";
import ProtectedRoutes from "src/components/ProtectedRoutes";
import { useUser } from "src/hooks/UserContext";
import { GoogleDriveProvider } from "src/hooks/GoogleDriveContext";

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
          md:rounded-xl p-12 max-w-screen-md w-screen h-full relative
          before:bg-transparent-geometry before:inset-0 before:absolute before:bg-repeat before:bg-top before:rounded-[inherit] before:pointer-events-none"
        >
          <UserCard />
          <Header>¿Qué para comer?</Header>

          {googleOAuthLoaded && (
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route
                element={
                  <GoogleDriveProvider>
                    <ProtectedRoutes />
                  </GoogleDriveProvider>
                }
              >
                <Route path="/home" element={<Main />} />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </div>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
