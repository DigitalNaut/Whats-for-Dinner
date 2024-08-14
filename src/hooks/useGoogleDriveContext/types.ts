import { type TokenResponse } from "@react-oauth/google";
type TokenInfo = {
  tokenExpiration: Date;
};

export type TokenResponseSuccess = Omit<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;

export type TokenResponseError = Pick<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;
export type GoogleDriveContextType = {
  hasScope: boolean;
  hasAuthorization: () => "Authorizing" | "OK";
  isLoaded: boolean;
  userTokens?: TokenResponseSuccess & TokenInfo;
};
