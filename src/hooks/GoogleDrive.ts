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

export const scope = "https://www.googleapis.com/auth/drive.appdata";
const spaces = "appDataFolder";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

export default function useGoogleDrive() {
  const { userTokens, logout } = useUser();
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

  function guard() {
    if (!userTokens?.access_token) logout("Session expired");

    if (!isLoaded) throw new Error("Drive upload failed: Client is not ready");
  }

  const uploadFile = ({ file, metadata }: FileParams) => {
    guard();

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
    guard();

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
    guard();

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

  return { uploadFile, fetchFiles, fetchFile, isLoaded };
}
