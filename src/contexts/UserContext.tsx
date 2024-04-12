import type { CredentialResponse } from "@react-oauth/google";
import type { PropsWithChildren } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { createContext, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

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
        Cerrar sesión
      </button>
    );
  }

  function UserCard() {
    if (!user) return null;

    const { picture, name, email } = user;

    return (
      <div className="group relative w-fit lg:fixed lg:right-2 lg:top-2">
        <img
          src={picture}
          alt="User avatar"
          width={32}
          height={32}
          className="size-8 rounded-full"
        />
        <div
          className="absolute right-0 top-0 z-50 flex flex-col justify-center
            focus-within:gap-4 focus-within:rounded-md focus-within:bg-white focus-within:p-4 focus-within:text-black
            group-hover:gap-4 group-hover:rounded-md group-hover:bg-white group-hover:p-4 group-hover:text-black"
        >
          <div className="flex w-full justify-center">
            <img
              src={picture}
              alt="User avatar"
              width={32}
              height={32}
              className="size-8 rounded-full group-focus-within:size-16 group-hover:size-16"
            />
          </div>
          <div className="hidden flex-col gap-2 group-focus-within:flex group-hover:flex">
            <div className="flex w-full flex-col justify-center gap-1 text-sm font-medium">
              <span className="text-base font-bold">{name}</span>
              <span>{email}</span>
            </div>

            <a
              className="w-full text-blue-700 hover:underline"
              href="https://drive.google.com/drive/settings"
              target="_blank"
              rel="noreferrer"
              title="Abrir preferencias de Google Drive"
            >
              Administrar Drive
            </a>

            <div className="hidden w-full justify-center group-focus-within:flex group-hover:flex">
              <LogoutButton />
            </div>

            <div className="flex flex-col gap-1 text-xs italic text-slate-900">
              <Link to="/terms" className="hover:underline">
                Términos y Condiciones
              </Link>
              <Link to="/privacy" className="hover:underline">
                Póliza de Privacidad
              </Link>
            </div>
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
        <div className="fixed left-0 top-0 flex w-full justify-center gap-2 bg-blue-400 p-1 text-white shadow-xl sm:p-2 md:p-4">
          <div className="flex w-full justify-between px-4 sm:max-w-sm sm:px-0 md:max-w-md lg:max-w-lg">
            <div className="flex items-center gap-2">
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
