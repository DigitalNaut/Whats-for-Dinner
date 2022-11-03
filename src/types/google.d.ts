// * See: https://cloud.google.com/iam/docs/reference/sts/rest/v1/TopLevel/token#response-body

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
