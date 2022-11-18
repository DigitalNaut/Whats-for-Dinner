import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "src/App";
import ErrorFallback from "src/components/ErrorFallback";
import { UserProvider } from "src/hooks/UserContext";

import "src/styles/tailwind.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <UserProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <GoogleOAuthProvider
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
          onScriptLoadError={() => {
            throw new Error("Google OAuth script failed to load");
          }}
        >
          <App />
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </UserProvider>
  </React.StrictMode>
);

// reportWebVitals(console.log);
