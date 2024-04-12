import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "src/App";
import ErrorFallback from "src/components/common/ErrorFallback";
import { UserProvider } from "src/contexts/UserContext";
import { HeaderProvider } from "src/contexts/HeaderContext";

import "src/index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <UserProvider>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
          onScriptLoadError={() => {
            throw new Error("Google OAuth script failed to load");
          }}
        >
          <HeaderProvider>
            <App />
          </HeaderProvider>
        </GoogleOAuthProvider>
      </UserProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// reportWebVitals(console.log);