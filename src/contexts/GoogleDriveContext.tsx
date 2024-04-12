import type { PropsWithChildren } from "react";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { TokenResponse } from "@react-oauth/google";
import { useState, createContext, useContext, useMemo } from "react";
import { useGoogleLogin, hasGrantedAllScopesGoogle } from "@react-oauth/google";
import axios from "axios";

import { useScript } from "src/hooks/useScript";

type MetadataType = {
  name: string;
  mimeType: string;
  parents?: string[];
};

type FileParams = {
  id: string;
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

type FileUploadResponse = (FileUploadSuccess & GoogleDriveError) | false;

type DownloadFileTypes =
  | JSON
  | Blob
  | ArrayBuffer
  | Document
  | string
  | ReadableStream;

type FileDownloadResponse<T extends DownloadFileTypes> =
  | T
  | GoogleDriveError
  | false;

type FileDeletedResponse = GoogleDriveError | "";

type FilesListResponse = {
  files?: gapi.client.drive.File[];
} & GoogleDriveError;

type UploadFile = (
  { file, metadata }: Omit<FileParams, "id">,
  config?: AxiosRequestConfig
) => Promise<AxiosResponse<FileUploadResponse, unknown>>;

type UpdateFile = (
  { file, metadata }: FileParams,
  config?: AxiosRequestConfig
) => Promise<AxiosResponse<FileUploadResponse, unknown>>;

type FetchList = (
  config?: AxiosRequestConfig
) => Promise<AxiosResponse<FilesListResponse, unknown>>;

type FetchFile = <T extends DownloadFileTypes>(
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig<T>
) => Promise<AxiosResponse<FileDownloadResponse<T>, unknown>>;

type DeleteFile = (
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig
) => Promise<AxiosResponse<FileDeletedResponse, unknown>>;

type GoogleDriveContextType = {
  hasScope: boolean;
  uploadFile: UploadFile;
  updateFile: UpdateFile;
  fetchList: FetchList;
  fetchFile: FetchFile;
  deleteFile: DeleteFile;
  isLoaded: boolean;
  userTokens?: TokenResponseSuccess & TokenInfo;
};

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

const scope = "https://www.googleapis.com/auth/drive.appdata";
const spaces = "appDataFolder";
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

  function hasAuthorization() {
    if (!isLoaded)
      throw new Error("Unauthorized", { cause: "Google Drive is not loaded" });

    if (userTokens === undefined) {
      requestAccess({ prompt: "" });
      return "Authorizing";
    }

    if (userTokens.tokenExpiration <= new Date()) {
      setUserTokens(undefined);
      throw new Error("Unauthorized", { cause: "Session expired" });
    }

    return "OK";
  }

  const uploadFile: GoogleDriveContextType["uploadFile"] = async (
    { file, metadata },
    config
  ) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    metadata.parents = [spaces];

    const body = new FormData();
    body.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    body.append("file", file);

    const request = axios.post<FileUploadResponse>(
      "https://www.googleapis.com/upload/drive/v3/files",
      body,
      {
        params: { uploadType: "multipart" },
        headers: {
          Authorization: `Bearer ${userTokens?.access_token}`,
        },
        ...config,
      }
    );

    return request;
  };

  const updateFile: GoogleDriveContextType["updateFile"] = async (
    { id, file, metadata },
    config
  ) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const body = new FormData();
    body.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    body.append("file", file);

    const request = axios.patch<FileUploadResponse>(
      `https://www.googleapis.com/upload/drive/v3/files/${id}`,
      body,
      {
        params: { uploadType: "multipart" },
        headers: {
          Authorization: `Bearer ${userTokens?.access_token}`,
        },
        ...config,
      }
    );

    return request;
  };

  const fetchList: GoogleDriveContextType["fetchList"] = async ({
    params,
    ...config
  }: AxiosRequestConfig = {}) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.get("https://www.googleapis.com/drive/v3/files", {
      params: {
        pageSize: 10,
        fields:
          "files(id, name, mimeType, hasThumbnail, thumbnailLink, iconLink, size)",
        spaces,
        oauth_token: userTokens?.access_token,
        ...params,
      },
      ...config,
    });

    return request;
  };

  const fetchFile: GoogleDriveContextType["fetchFile"] = async (
    { id },
    { params, ...config }: AxiosRequestConfig = {}
  ) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.get(
      `https://www.googleapis.com/drive/v3/files/${id}`,
      {
        params: { alt: "media", ...params },
        responseType: "arraybuffer",
        headers: {
          authorization: `Bearer ${userTokens?.access_token}`,
        },
        ...config,
      }
    );

    return request;
  };

  const deleteFile: GoogleDriveContextType["deleteFile"] = async (
    { id },
    config
  ) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.delete(
      `https://www.googleapis.com/drive/v3/files/${id}`,
      {
        headers: {
          authorization: `Bearer ${userTokens?.access_token}`,
        },
        ...config,
      }
    );

    return request;
  };

  return (
    <googleDriveContext.Provider
      value={{
        hasScope,
        uploadFile,
        updateFile,
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

export function useGoogleDriveContext() {
  const context = useContext(googleDriveContext);

  if (!context)
    throw new Error("useGoogleDrive must be used within a GoogleDriveContext");

  return context;
}
