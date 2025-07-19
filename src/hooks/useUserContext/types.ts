import type { JSX } from "react";
import type { CredentialResponse } from "@react-oauth/google";

export type UserContext = {
  user?: GoogleUserCredential | null;
  onSignInSuccess: (credentialResponse: CredentialResponse) => void;
  onSignInError: () => void;
  UserCard: () => JSX.Element | null;
  logout: (options: { notification?: string }) => void;
};
