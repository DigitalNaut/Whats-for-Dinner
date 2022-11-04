import { useState } from "react";
import { useScript } from "src/hooks/UseScript";
import { useUser } from "src/hooks/UserContext";

type MetadataType = {
  name: string;
  mimeType:
    | "application/vnd.google-apps.folder"
    | "application/vnd.google-apps.file";
  parents: string[];
};
type FileParams = {
  filename: string;
  fileData: string;
  contentType: string;
  metadata: MetadataType;
};

export const scope = "https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

const boundary = "BOUNDARY";
const delimiter = `\r\n--${boundary}\r\n`;
const close_delimiter = `\r\n--${boundary}--`;

function constructMultipartRequestBody({
  fileData,
  contentType,
  metadata,
}: Pick<FileParams, "fileData" | "contentType" | "metadata">) {
  return (
    delimiter +
    "Content-Type: application/json; charset-UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${contentType}\r\n\r\n${fileData}\r\n` +
    close_delimiter
  );
}

function crateMultipartRequest(body: string, accessToken: string) {
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
    { fileData, contentType, metadata }: FileParams,
    callback: Parameters<
      gapi.client.HttpRequest<FileUploadJSONResponse>["execute"]
    >[0]
  ) => {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const requestBody = constructMultipartRequestBody({
      fileData,
      contentType,
      metadata,
    });

    const request = crateMultipartRequest(requestBody, userTokens.access_token);

    request.execute(callback);
  };

  async function listFiles() {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const { result } = await gapi.client.drive.files.list({
      pageSize: 10,
      fields: "files(id, name)",
      oauth_token: userTokens?.access_token,
    });

    return result.files;
  }

  return { uploadFile, listFiles, isLoaded };
}
