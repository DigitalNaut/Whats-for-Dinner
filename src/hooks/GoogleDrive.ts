import { useState } from "react";
import { useScript } from "src/hooks/UseScript";
import { useUser } from "src/hooks/UserContext";

type MetadataType = {
  name: string;
  mimeType: string;
  parents: string[];
};
type FileParams = {
  fileData: string;
  metadata: MetadataType;
};

export const scope = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

const boundary = "BOUNDARY";
const delimiter = `\r\n--${boundary}\r\n`;
const close_delimiter = `\r\n--${boundary}--`;

function constructMultipartRequestBody({
  fileData,
  metadata,
}: Pick<FileParams, "fileData" | "metadata">) {
  return (
    delimiter +
    "Content-Type: application/json; charset-UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${metadata.mimeType}\r\n\r\n${fileData}\r\n` +
    close_delimiter
  );
}

function crateMultipartUploadRequest(body: string, accessToken: string) {
  const newRequest = gapi.client.request({
    path: "https://www.googleapis.com/upload/drive/v3/files",
    method: "POST",
    params: { uploadType: "multipart" },
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
      authorization: `Bearer ${accessToken}`,
    },
    body,
  });

  return newRequest as unknown as gapi.client.HttpRequest<FileUploadJSONResponse>;
}

function createFileFetchRequest(
  file: { fileId: string; mimeType: string },
  accessToken: string
) {
  const { fileId, mimeType } = file;

  const newRequest = gapi.client.request({
    path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
    params: { mimeType, alt: "media" },
    method: "GET",
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  // return newRequest as unknown as gapi.client.HttpRequest<FileJSONResponse>;
  return newRequest;
}

export default function useGoogleDrive() {
  const { userTokens } = useUser();
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

  const uploadFile = (
    { fileData, metadata }: FileParams,
    callback: Parameters<
      gapi.client.HttpRequest<FileUploadJSONResponse>["execute"]
    >[0]
  ) => {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const requestBody = constructMultipartRequestBody({
      fileData,
      metadata,
    });

    const request = crateMultipartUploadRequest(
      requestBody,
      userTokens.access_token
    );

    request.execute(callback);
  };

  const fetchFiles = async () => {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const { result } = await gapi.client.drive.files.list({
      pageSize: 10,
      fields:
        "files(id, name, mimeType, hasThumbnail, thumbnailLink, webViewLink, iconLink, size)",
      spaces: "appDataFolder",
      oauth_token: userTokens?.access_token,
    });

    return result.files;
  };

  const fetchFile = (
    file: { fileId: string; mimeType: string },
    callback: (response: unknown) => unknown
  ) => {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const request = createFileFetchRequest(file, userTokens.access_token);
    request.execute(callback);
  };

  return { uploadFile, fetchFiles, fetchFile, isLoaded };
}
