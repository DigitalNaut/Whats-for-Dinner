import { useCallback } from "react";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";

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
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileUploadResponse, unknown>>;

type UpdateFile = (
  { file, metadata }: FileParams,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileUploadResponse, unknown>>;

type FetchList = (
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FilesListResponse, unknown>>;

type FetchFile = <T extends DownloadFileTypes>(
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig<T>,
) => Promise<AxiosResponse<FileDownloadResponse<T>, unknown>>;

type DeleteFile = (
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileDeletedResponse, unknown>>;

const spaces = "appDataFolder";

export function useGoogleDriveAPI() {
  const { hasAuthorization, userTokens } = useGoogleDriveContext();

  const uploadFile: UploadFile = async ({ file, metadata }, config) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    metadata.parents = [spaces];

    const body = new FormData();
    body.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
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
      },
    );

    return request;
  };

  const updateFile: UpdateFile = async ({ id, file, metadata }, config) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const body = new FormData();
    body.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
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
      },
    );

    return request;
  };

  const fetchList: FetchList = useCallback(
    async ({ params, ...config }: AxiosRequestConfig = {}) => {
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
    },
    [hasAuthorization, userTokens?.access_token],
  );

  const fetchFile: FetchFile = async (
    { id },
    { params, ...config }: AxiosRequestConfig = {},
  ) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.get(
      `https://www.googleapis.com/drive/v3/files/${id}`,
      {
        params: { alt: "media", ...params },
        responseType: "blob",
        headers: {
          authorization: `Bearer ${userTokens?.access_token}`,
        },
        ...config,
      },
    );

    return request;
  };

  const deleteFile: DeleteFile = async ({ id }, config) => {
    const authStatus = hasAuthorization();
    if (authStatus !== "OK") return Promise.reject(authStatus);

    const request = axios.delete(
      `https://www.googleapis.com/drive/v3/files/${id}`,
      {
        headers: {
          authorization: `Bearer ${userTokens?.access_token}`,
        },
        ...config,
      },
    );

    return request;
  };

  return {
    uploadFile,
    updateFile,
    fetchList,
    fetchFile,
    deleteFile,
  };
}
