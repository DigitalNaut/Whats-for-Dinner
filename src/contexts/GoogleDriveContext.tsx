import {
  type PropsWithChildren,
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import type { TokenResponse } from "@react-oauth/google";
import { useGoogleLogin, hasGrantedAllScopesGoogle } from "@react-oauth/google";

import { useScript } from "src/hooks/useScript";

type TokenResponseSuccess = Omit<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;

type TokenResponseError = Pick<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;

type TokenInfo = {
  tokenExpiration: Date;
};

type GoogleDriveContextType = {
  hasScope: boolean;
  hasAuthorization: () => "Authorizing" | "OK";
  isLoaded: boolean;
  userTokens?: TokenResponseSuccess & TokenInfo;
};

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

const scope = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

export function GoogleDriveProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userTokens, setUserTokens] = useState<
    TokenResponseSuccess & TokenInfo
  >();
  const hasScope = useMemo(() => {
    if (!userTokens) return false;
    return hasGrantedAllScopesGoogle(userTokens, scope);
  }, [userTokens]);

  async function initGapiClient() {
    try {
      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });

      setIsLoaded(true);
    } catch (error) {
      console.error(error);
    }
  }

  function handleGapiLoad() {
    gapi.load("client", initGapiClient);
  }

  useScript({
    src: "https://apis.google.com/js/api.js",
    onLoad: handleGapiLoad,
  });

  const onSignInSuccess = async (tokenResponse: TokenResponseSuccess) => {
    const tokenExpiration = new Date(
      Date.now() + tokenResponse.expires_in * 1000,
    );
    setUserTokens({ ...tokenResponse, tokenExpiration });
  };

  const onSignInError = (errorResponse: TokenResponseError) => {
    setUserTokens(undefined);
    throw errorResponse.error;
  };

  const requestAccess = useGoogleLogin({
    onSuccess: onSignInSuccess,
    onError: onSignInError,
    scope,
  });

  const hasAuthorization = useCallback(() => {
    if (!isLoaded)
      throw new Error("Unauthorized", { cause: "Google Drive not loaded" });

    if (userTokens === undefined) {
      requestAccess({ prompt: "" });
      return "Authorizing";
    }

    if (userTokens.tokenExpiration <= new Date()) {
      setUserTokens(undefined);
      throw new Error("Unauthorized", { cause: "Session expired" });
    }

    return "OK";
  }, [isLoaded, requestAccess, userTokens]);

  return (
    <googleDriveContext.Provider
      value={{
        hasScope,
        hasAuthorization,
        isLoaded,
        userTokens,
      }}
    >
      {children}
    </googleDriveContext.Provider>
  );
}

export function useGoogleDriveContext() {
  const context = useContext(googleDriveContext);

  if (!context)
    throw new Error("useGoogleDrive must be used within a GoogleDriveContext");

  return context;
}
