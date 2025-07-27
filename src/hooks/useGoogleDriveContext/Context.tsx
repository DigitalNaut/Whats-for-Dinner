import { type PropsWithChildren, useState, useMemo, useCallback } from "react";
import { useGoogleLogin, hasGrantedAllScopesGoogle } from "@react-oauth/google";

import { useScript } from "src/hooks/useScript";

import type {
  TokenResponseSuccess,
  GoogleDriveContextType,
  TokenResponseError,
} from "./types";
import { GoogleDriveContextProvider } from ".";

const scope = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

export function GoogleDriveProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userTokens, setUserTokens] =
    useState<GoogleDriveContextType["userTokens"]>();

  const hasScope = useMemo(() => {
    if (!userTokens) return false;
    return hasGrantedAllScopesGoogle(userTokens, scope);
  }, [userTokens]);

  async function initGapiClient() {
    try {
      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY as string,
        discoveryDocs: [DISCOVERY_DOC],
      });

      setIsLoaded(true);
    } catch (error) {
      console.error(error);
    }
  }

  function handleGapiLoad() {
    gapi.load("client", () => void initGapiClient());
  }

  const handleGapiError: HTMLScriptElement["onerror"] = function (event) {
    setIsLoaded(false);
    console.warn(
      "Google Drive API failed to load due to:",
      JSON.stringify(event),
    );
  };

  useScript({
    url: "https://apis.google.com/js/api.js",
    onLoad: handleGapiLoad,
    onError: handleGapiError,
  });

  const onSignInSuccess = (tokenResponse: TokenResponseSuccess) => {
    const tokenExpiration = new Date(
      Date.now() + tokenResponse.expires_in * 1000,
    );
    setUserTokens({ ...tokenResponse, tokenExpiration });
  };

  const onSignInError = (errorResponse: TokenResponseError) => {
    setUserTokens(undefined);

    throw new Error(errorResponse.error || "Unknown error");
  };

  const requestAccess = useGoogleLogin({
    onSuccess: onSignInSuccess,
    onError: onSignInError,
    scope,
  });

  const hasAuthorization = useCallback(() => {
    if (!isLoaded) throw new Error("Unauthorized: Google Drive is not loaded");

    if (userTokens === undefined) {
      requestAccess({ prompt: "" });
      return "Authorizing";
    }

    if (userTokens.tokenExpiration <= new Date()) {
      setUserTokens(undefined);
      throw new Error("Unauthorized: Session expired");
    }

    return "OK";
  }, [isLoaded, requestAccess, userTokens]);

  return (
    <GoogleDriveContextProvider
      value={{
        hasScope,
        hasAuthorization,
        isLoaded,
        userTokens,
      }}
    >
      {children}
    </GoogleDriveContextProvider>
  );
}
