import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import App from "src/App";
import ErrorFallback from "src/components/common/ErrorFallback";
import { HeaderProvider } from "src/hooks/useHeaderContext/Context";
import { LanguageProvider } from "src/hooks/useLanguageContext/Context";
import { UserProvider } from "src/hooks/useUserContext/Context";
import UserSettingsProvider from "src/hooks/useUserSettingsContext/Context";

import "src/index.css";
import "src/internationalization";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LanguageProvider>
        <UserProvider>
          <GoogleOAuthProvider
            clientId={(import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || ""}
            onScriptLoadError={() => {
              throw new Error("Google OAuth script failed to load");
            }}
          >
            <UserSettingsProvider>
              <HeaderProvider>
                <App />
              </HeaderProvider>
            </UserSettingsProvider>
          </GoogleOAuthProvider>
        </UserProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
