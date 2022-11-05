declare type GoogleUserInfo =
  | {
      sub: string;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      email: string;
      email_verified: boolean;
      locale: string;
    }
  | null
  | undefined;

type FileUploadError = {
  error: {
    errors: [
      {
        domain: string;
        reason: string;
        message: string;
      }
    ];
    code: number;
    message: string;
  };
};

type FileUploadSuccess = {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
};

declare type FileUploadJSONResponse =
  | (FileUploadError & FileUploadSuccess)
  | false;
