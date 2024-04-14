import type { CredentialResponse } from "@react-oauth/google";
import type { PropsWithChildren } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { createContext, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

import { useLanguageContext } from "src/contexts/LanguageContext";

type UserContext = {
  user?: GoogleUserCredential | null;
  LoginButton(): JSX.Element | null;
  LogoutButton(): JSX.Element | null;
  UserCard(): JSX.Element | null;
  logout(options: { notification?: string }): void;
};

const userContext = createContext<UserContext | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
  const { t } = useLanguageContext();
  const [user, setUser] = useState<GoogleUserCredential | null>();
  const [notification, setNotification] = useState<string>();

  const onSignInSuccess = (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;

    if (!credential) throw new Error("No credential found");

    const userInfo: GoogleUserCredential = jwtDecode(credential);

    setUser(userInfo);
  };

  const onSignInError = () => {
    logout({ notification: t("Failed to sign in") });
  };

  const logout: UserContext["logout"] = ({ notification: reason }) => {
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
    const { t } = useLanguageContext();

    if (!user) return null;

    return (
      <button
        data-filled
        className="g_id_signout"
        onClick={() => logout({ notification: t("Logged out") })}
      >
        {t("Sign out")}
      </button>
    );
  }

  function UserCard() {
    const { t } = useLanguageContext();

    if (!user) return null;

    const { picture, name, email } = user;

    return (
      <div className="group relative w-fit lg:fixed lg:right-2 lg:top-2">
        <img
          className="size-8 rounded-full"
          src={picture}
          alt={t("User avatar")}
          width={32}
          height={32}
          referrerPolicy="no-referrer"
        />
        <div
          className="absolute right-0 top-0 z-50 flex flex-col justify-center
            focus-within:gap-4 focus-within:rounded-md focus-within:bg-white focus-within:p-4 focus-within:text-black
            group-hover:gap-4 group-hover:rounded-md group-hover:bg-white group-hover:px-6 group-hover:py-4 group-hover:text-black"
        >
          <div className="flex w-full justify-center">
            <img
              className="size-8 rounded-full group-focus-within:size-16 group-hover:size-16"
              src={picture}
              alt={t("User avatar")}
              width={32}
              height={32}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden flex-col gap-4 group-focus-within:flex group-hover:flex">
            <div className="flex w-full flex-col justify-center gap-1 text-sm font-medium">
              <span className="text-base font-bold">{name}</span>
              <span>{email}</span>
            </div>

            <div className="flex w-max flex-col justify-center gap-2 rounded-sm bg-slate-100 p-4">
              <a
                className="w-full text-blue-700 hover:underline"
                href="https://drive.google.com/drive/settings"
                target="_blank"
                rel="noreferrer"
                title={t("Open Google Drive preferences")}
              >
                {t("Drive Preferences")}
              </a>

              <div className="hidden w-full justify-center group-focus-within:flex group-hover:flex">
                <LogoutButton />
              </div>
            </div>

            <div className="flex w-full flex-col gap-1 text-center text-xs italic text-slate-800">
              <Link to="/terms" className="hover:underline">
                {t("Terms and Conditions")}
              </Link>
              <Link to="/privacy" className="hover:underline">
                {t("Privacy Policy")}
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
