import type { TokenResponse } from "@react-oauth/google";
import type { AxiosResponse } from "axios";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useGoogleLogin, hasGrantedAnyScopeGoogle } from "@react-oauth/google";
import { useState, createContext, useContext } from "react";
import axios from "axios";

import { useScript } from "src/hooks/UseScript";
import { useUser } from "src/hooks/UserContext";

type MetadataType = {
  name: string;
  mimeType: string;
  parents?: string[];
};
type FileParams = {
  file: File;
  metadata: MetadataType;
};
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

type FileUploadJSONResponse = (FileUploadSuccess & GoogleDriveError) | false;
type FileDownloadJSONResponse = ArrayBuffer | GoogleDriveError | false;
type FileDeletedJSONResponse = GoogleDriveError | "";
type FilesListJSONResponse = {
  files?: gapi.client.drive.File[];
} & GoogleDriveError;

type GoogleDriveContextType = {
  hasScope: boolean;
  uploadFile(
    { file, metadata }: FileParams,
    signal?: AbortSignal
  ): Promise<AxiosResponse<FileUploadJSONResponse, unknown>>;
  fetchList(
    signal?: AbortSignal
  ): Promise<AxiosResponse<FilesListJSONResponse, unknown>>;
  fetchFile(
    file: gapi.client.drive.File
  ): Promise<AxiosResponse<FileDownloadJSONResponse, unknown>>;
  deleteFile(
    file: gapi.client.drive.File
  ): Promise<AxiosResponse<FileDeletedJSONResponse, unknown>>;
  isLoaded: boolean;
  userTokens?: TokenResponseSuccess & TokenInfo;
};

const googleDriveContext = createContext<GoogleDriveContextType>({
  hasScope: false,
  uploadFile: () => {
    throw new Error("Google Drive context is uninitialized");
  },
  fetchList: () => {
    throw new Error("Google Drive context is uninitialized");
  },
  fetchFile: () => {
    throw new Error("Google Drive context is uninitialized");
  },
  deleteFile: () => {
    throw new Error("Google Drive context is uninitialized");
  },
  isLoaded: false,
  userTokens: undefined,
});

const scope = "https://www.googleapis.com/auth/drive.appdata";
const spaces = "appDataFolder";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

export function GoogleDriveProvider({ children }: PropsWithChildren) {
  const { user } = useUser();

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasScope, setHasScope] = useState(false);
  const [userTokens, setUserTokens] = useState<
    TokenResponseSuccess & TokenInfo
  >();

  async function initGapiClient() {
    try {
      await gapi.client.init({
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
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
      Date.now() + tokenResponse.expires_in * 1000
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

  function authGuard(): "OK" | "Authorizing" | "Unauthorized" {
    if (!isLoaded)
      throw new Error("Unauthorized", { cause: "Google Drive is not loaded" });
    if (!user) {
      setUserTokens(undefined);
      throw new Error("User not authenticated");
    }

    if (userTokens === undefined) {
      requestAccess({ prompt: "" });
      return "Authorizing";
    } else if (userTokens.tokenExpiration > new Date()) {
      return "OK";
    } else {
      setUserTokens(undefined);
      throw new Error("Unauthorized", { cause: "Session expired" });
    }
  }

  const uploadFile = async (
    { file, metadata }: FileParams,
    signal: AbortSignal
  ) => {
    const authStatus = authGuard();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    metadata.parents = [spaces];

    const body = new FormData();
    body.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    body.append("file", file);

    const request = axios.post<FileUploadJSONResponse>(
      "https://www.googleapis.com/upload/drive/v3/files",
      body,
      {
        params: { uploadType: "multipart" },
        headers: {
          Authorization: `Bearer ${userTokens?.access_token}`,
        },
        signal,
      }
    );

    return request;
  };

  const fetchList = async (signal?: AbortSignal) => {
    const authStatus = authGuard();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.get("https://www.googleapis.com/drive/v3/files", {
      params: {
        pageSize: 10,
        fields:
          "files(id, name, mimeType, hasThumbnail, thumbnailLink, iconLink, size)",
        spaces,
        oauth_token: userTokens?.access_token,
      },
      signal,
    });

    return request;
  };

  const fetchFile = async (file: gapi.client.drive.File) => {
    const authStatus = authGuard();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.get(
      `https://www.googleapis.com/drive/v3/files/${file.id}`,
      {
        params: { alt: "media" },
        responseType: "arraybuffer",
        headers: {
          authorization: `Bearer ${userTokens?.access_token}`,
        },
      }
    );

    return request;
  };

  const deleteFile = async (file: gapi.client.drive.File) => {
    const authStatus = authGuard();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.delete(
      `https://www.googleapis.com/drive/v3/files/${file.id}`,
      {
        headers: {
          authorization: `Bearer ${userTokens?.access_token}`,
        },
      }
    );

    return request;
  };

  useEffect(() => {
    if (!isLoaded || !userTokens) return;
    setHasScope(hasGrantedAnyScopeGoogle(userTokens, scope));
  }, [userTokens]);

  return (
    <googleDriveContext.Provider
      value={{
        hasScope,
        uploadFile,
        fetchList,
        fetchFile,
        deleteFile,
        isLoaded,
        userTokens,
      }}
    >
      {children}
    </googleDriveContext.Provider>
  );
}

export function useGoogleDrive() {
  const context = useContext(googleDriveContext);
  if (!context)
    throw new Error("useGoogleDrive must be used within a GoogleDriveContext");
  return context;
}
