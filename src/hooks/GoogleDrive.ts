import { useState } from "react";
import { useScript } from "src/hooks/UseScript";
import { useUser } from "src/hooks/UserContext";
import axios from "axios";

type MetadataType = {
  name: string;
  mimeType: string;
  parents?: string[];
};
type FileParams = {
  file: File;
  metadata: MetadataType;
};

export const scope = "https://www.googleapis.com/auth/drive.file";
const spaces = "drive";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

function constructMultipartBody({ file, metadata }: FileParams) {
  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  formData.append("file", file);

  return formData;
}

function crateMultipartUploadRequest(body: FormData, accessToken: string) {
  const newRequest = axios.post<FileUploadJSONResponse>(
    "https://www.googleapis.com/upload/drive/v3/files",
    body,
    {
      method: "POST",
      params: { uploadType: "multipart" },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return newRequest;
}

function createFileFetchRequest(
  file: gapi.client.drive.File,
  accessToken: string
) {
  const { id, mimeType } = file;

  const newRequest = axios.get(
    `https://www.googleapis.com/drive/v3/files/${id}`,
    {
      params: { mimeType, alt: "media" },
      method: "GET",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );

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

  const uploadFile = ({ file, metadata }: FileParams) => {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const requestBody = constructMultipartBody({
      file,
      metadata,
    });

    const request = crateMultipartUploadRequest(
      requestBody,
      userTokens.access_token
    );

    return request;
  };

  const fetchFiles = async () => {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const { result } = await gapi.client.drive.files.list({
      pageSize: 10,
      fields:
        "files(id, name, mimeType, hasThumbnail, thumbnailLink, webViewLink, iconLink, size)",
      spaces,
      oauth_token: userTokens?.access_token,
    });

    return result.files;
  };

  const fetchFile = (file: gapi.client.drive.File) => {
    if (!userTokens?.access_token)
      throw new Error("Drive upload failed: User not logged in");
    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");

    const request = createFileFetchRequest(file, userTokens.access_token);
    return request;
  };

  return { uploadFile, fetchFiles, fetchFile, isLoaded };
}
