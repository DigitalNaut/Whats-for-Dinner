import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ErrorBoundary } from "react-error-boundary";

import Header from "src/components/Header";
import Home from "src/pages/Home";
import UserSession from "src/components/UserSession";
import ErrorFallback from "src/components/ErrorFallback";

function App() {
  const [googleOAuthLoaded, setGoogleOAuthLoaded] = useState(false);

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
          className="text-white text-center bg-gradient-to-br from-[#5B0B68] to-[#4C1D95] shadow-2xl
      rounded-xl p-12 max-w-screen-md w-screen h-full relative
      before:bg-transparent-geometry before:inset-0 before:absolute before:bg-repeat before:bg-top before:rounded-[inherit] before:pointer-events-none"
        >
          <UserSession />
          <Header>¿Qué para comer?</Header>

          {googleOAuthLoaded && (
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          )}
        </div>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
