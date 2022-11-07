import type { CredentialResponse } from "@react-oauth/google";
import type { PropsWithChildren } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { createContext, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import jwtDecode from "jwt-decode";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";

type UserContext = {
  user?: GoogleUserCredential | null;
  LoginButton(): JSX.Element | null;
  LogoutButton(): JSX.Element | null;
  UserCard(): JSX.Element | null;
  logout(reason?: string): void;
};

const userContext = createContext<UserContext>({
  user: undefined,
  LoginButton: () => null,
  LogoutButton: () => null,
  UserCard: () => null,
  logout: () => null,
});

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<GoogleUserCredential | null>();
  const [notification, setNotification] = useState<string>();

  const onSignInSuccess = (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;

    if (!credential) throw new Error("No credential found");

    const userInfo: GoogleUserCredential = jwtDecode(credential);

    setUser(userInfo);
  };

  const onSignInError = () => {
    logout("Error iniciando sesión");
  };

  const logout = (reason?: string) => {
    googleLogout();
    setUser(null);
    setNotification(reason);

    setTimeout(() => setNotification(undefined), 3000);
  };

  function LoginButton() {
    if (user) return null;

    return (
      <GoogleLogin
        onSuccess={onSignInSuccess}
        onError={onSignInError}
        auto_select
        context="signin"
        itp_support
        shape="pill"
        locale="ES"
        size="large"
        theme="filled_blue"
        useOneTap
      />
    );
  }

  function LogoutButton() {
    if (!user) return null;

    return (
      <button
        data-filled
        className="g_id_signout"
        onClick={() => logout("Logged out")}
      >
        Logout
      </button>
    );
  }

  function UserCard() {
    if (!user) return null;

    const { userTokens } = useGoogleDrive();

    const { picture, name, email } = user;
    const isTokenExpired =
      userTokens === undefined || userTokens.tokenExpiration < new Date();

    return (
      <div className="justify-end align-baseline flex w-full">
        <div
          className="group flex gap-2 align-middle hover:bg-white hover:text-black hover:rounded-md p-1 cursor-pointer -mt-10 -mr-10"
          title={`${
            isTokenExpired
              ? "Token expired"
              : `Token expires ${userTokens?.tokenExpiration.toLocaleTimeString()}`
          }\nUser info: ${JSON.stringify(
            user,
            null,
            2
          )}\nTokens: ${JSON.stringify(userTokens, null, 2)}`}
        >
          <img
            src={picture}
            alt="User avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <a
            className="flex gap-2"
            href="https://drive.google.com/drive/settings"
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <div className="hidden sm:block text-sm">{name}</div>
              <div className="hidden sm:block text-xs">{email}</div>
            </div>
          </a>
          <div className="hidden group-hover:flex flex-col">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <userContext.Provider
      value={{
        user,
        UserCard,
        LoginButton,
        LogoutButton,
        logout,
      }}
    >
      {children}
      {notification && (
        <div className="fixed flex gap-2 top-0 left-0 w-full bg-blue-400 text-white justify-center shadow-xl p-1 sm:p-2 md:p-4">
          <div className="flex w-full sm:max-w-sm md:max-w-md lg:max-w-lg justify-between px-4 sm:px-0">
            <div className="flex gap-2 items-center">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(undefined)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}
    </userContext.Provider>
  );
}

export function useUser() {
  const context = useContext(userContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
