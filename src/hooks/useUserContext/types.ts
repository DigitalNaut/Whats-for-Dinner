import type { CredentialResponse } from "@react-oauth/google";
import type { UserCard } from "./Context";

export type UserContext = {
  user?: GoogleUserCredential | null;
  onSignInSuccess: (credentialResponse: CredentialResponse) => void;
  onSignInError: () => void;
  UserCard: UserCard;
  logout: (options: { notification?: string }) => void;
};
