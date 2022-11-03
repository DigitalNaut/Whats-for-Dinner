// * See: https://cloud.google.com/iam/docs/reference/sts/rest/v1/TopLevel/token#response-body

declare type GoogleUserCredential =
  | {
      aud: string;
      azp: string;
      email: string;
      email_verified: boolean;
      exp: number;
      family_name: string;
      given_name: string;
      iat: number;
      iss: string;
      jti: string;
      name: string;
      nbf: number;
      picture: string;
      sub: string;
    }
  | null
  | undefined;
