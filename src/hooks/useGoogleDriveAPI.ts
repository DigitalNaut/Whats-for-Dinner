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
  | string
  | ArrayBuffer
  | Blob
  | Document
  | JSON
  | ReadableStream;

type FileDownloadResponse<T extends DownloadFileTypes> =
  | false
  | GoogleDriveError
  | T;

type FileDeletedResponse = GoogleDriveError | "";

type UploadFile = (
  { file, metadata }: Omit<FileParams, "id">,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileUploadResponse>>;

type UpdateFile = (
  { file, metadata }: FileParams,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileUploadResponse>>;

type FetchList = (
  config?: AxiosRequestConfig &
    Parameters<gapi.client.drive.FilesResource["list"]>[0],
) => Promise<AxiosResponse<gapi.client.drive.FileList | GoogleDriveError>>;

type FetchFile = <T extends DownloadFileTypes>(
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig<T>,
) => Promise<AxiosResponse<FileDownloadResponse<T>>>;

type DeleteFile = (
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileDeletedResponse>>;

const spaces = "appDataFolder";

export function useGoogleDriveAPI() {
  const { hasAuthorization, userTokens } = useGoogleDriveContext();

  const uploadFile: UploadFile = useCallback(
    async ({ file, metadata }, config) => {
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
    },
    [hasAuthorization, userTokens?.access_token],
  );

  const updateFile: UpdateFile = useCallback(
    async ({ id, file, metadata }, config) => {
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
    },
    [hasAuthorization, userTokens?.access_token],
  );

  const fetchList: FetchList = useCallback(
    async ({ params, ...config }: AxiosRequestConfig = {}) => {
      const authStatus = hasAuthorization();
      if (authStatus !== "OK") return Promise.reject(authStatus);

      const request = axios.get("https://www.googleapis.com/drive/v3/files", {
        params: {
          fields:
            "files(id, name, mimeType, hasThumbnail, thumbnailLink, iconLink, size), nextPageToken",
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

  const fetchFile: FetchFile = useCallback(
    async ({ id }, { params, ...config }: AxiosRequestConfig = {}) => {
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
    },
    [hasAuthorization, userTokens?.access_token],
  );

  const deleteFile: DeleteFile = useCallback(
    async ({ id }, config) => {
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
    },
    [hasAuthorization, userTokens?.access_token],
  );

  return {
    uploadFile,
    updateFile,
    fetchList,
    fetchFile,
    deleteFile,
  };
}
