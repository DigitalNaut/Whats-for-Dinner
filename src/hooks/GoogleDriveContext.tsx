import type { TokenResponse } from "@react-oauth/google";
import type { AxiosResponse } from "axios";
import type { PropsWithChildren } from "react";
import { useGoogleLogin } from "@react-oauth/google";
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

type GoogleDriveContextType = {
  uploadFile({
    file,
    metadata,
  }: FileParams): Promise<AxiosResponse<FileUploadJSONResponse, unknown>>;
  fetchFiles(): Promise<gapi.client.drive.File[] | undefined>;
  fetchFile(
    file: gapi.client.drive.File
  ): Promise<AxiosResponse<FileDownloadJSONResponse, unknown>>;
  isLoaded: boolean;
  userTokens?: TokenResponseSuccess & TokenInfo;
};

const googleDriveContext = createContext<GoogleDriveContextType>({
  uploadFile: () => {
    throw new Error("Google Drive context is uninitialized");
  },
  fetchFiles: () => {
    throw new Error("Google Drive context is uninitialized");
  },
  fetchFile: () => {
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

  const [userTokens, setUserTokens] = useState<
    TokenResponseSuccess & TokenInfo
  >();

  const [isLoaded, setIsLoaded] = useState(false);

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

  async function guardTokens() {
    const promise = new Promise<string>((resolve, reject) => {
      if (!isLoaded) reject("Drive upload failed: Client is not ready");
      if (!user) {
        setUserTokens(undefined);
        reject("User not logged in");
      }

      if (userTokens === undefined) requestAccess();
      else if (userTokens.tokenExpiration > new Date()) resolve("OK");
    });

    return promise;
  }

  const uploadFile = async ({ file, metadata }: FileParams) => {
    await guardTokens();

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
        method: "POST",
        params: { uploadType: "multipart" },
        headers: {
          Authorization: `Bearer ${userTokens?.access_token}`,
        },
      }
    );

    return request;
  };

  const fetchFiles = async () => {
    try {
      await guardTokens();
    } catch (error) {
      console.error(error);
      return;
    }

    const { result } = await gapi.client.drive.files.list({
      pageSize: 10,
      fields:
        "files(id, name, mimeType, hasThumbnail, thumbnailLink, iconLink, size)",
      spaces,
      oauth_token: userTokens?.access_token,
    });

    return result.files;
  };

  const fetchFile = async (file: gapi.client.drive.File) => {
    await guardTokens();

    const { id } = file;

    const request = axios.get(
      `https://www.googleapis.com/drive/v3/files/${id}`,
      {
        params: { alt: "media" },
        method: "GET",
        responseType: "arraybuffer",
        headers: {
          authorization: `Bearer ${userTokens?.access_token}`,
        },
      }
    );

    return request;
  };

  return (
    <googleDriveContext.Provider
      value={{
        uploadFile,
        fetchFiles,
        fetchFile,
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
