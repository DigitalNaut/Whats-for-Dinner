/**
 * Docs: https://developers.google.com/identity/gsi/web/reference/js-reference#credential
 */
declare interface GoogleUserCredential extends Omit<GoogleUserInfo, "locale"> {
  /**
   * Your server's client ID
   */
  aud: string;
  /**
   *  Seemingly identical to aud: your server's client ID
   */
  azp: string;
  /**
   * Unix timestamp of the assertion's expiration time
   */
  exp: number;
  /**
   * Unix timestamp of the assertion's creation time
   */
  iat: number;
  /**
   * The JWT's issuer
   */
  iss: string;
  /**
   * The JWT's unique identifier
   */
  jti: string;
  /**
   * time before which the JWT MUST NOT be accepted for processing
   */
  nbf: number;
  /**
   * If present, the host domain of the user's GSuite email address
   */
  hd?: string;
}

declare interface GoogleUserInfo {
  /**
   * The user's email address
   */
  email: string;
  /**
   * true, if Google has verified the email address
   */
  email_verified: boolean;
  family_name: string;
  given_name: string;
  /**
   * The user's full name
   */
  name: string;
  /**
   * If present, a URL to user's profile picture
   */
  picture?: string;
  /**
   * The unique ID of the user's Google Account
   */
  sub: string;

  locale: string;
}

type GoogleDriveError = {
  error: {
    errors: [
      {
        domain: string;
        reason: string;
        message: string;
        locationType?: string;
        location?: string;
      },
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
