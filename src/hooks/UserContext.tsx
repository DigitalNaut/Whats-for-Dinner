import { createContext, PropsWithChildren, useContext, useState } from "react";
import {
  CredentialResponse,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import jwt_decode from "jwt-decode";

type UserContext = {
  user: User;
  LoginButton(): JSX.Element | null;
  LogoutButton(): JSX.Element | null;
  UserCard(): JSX.Element | null;
};

const userContext = createContext<UserContext>({
  user: null,
  LoginButton: () => null,
  LogoutButton: () => null,
  UserCard: () => null,
});

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>();

  const onSignInSuccess = (response: CredentialResponse) => {
    const { credential } = response || {};

    if (!credential) throw new Error("No JWT found in credentials");

    const decodedInfo = jwt_decode(credential) as User;
    setUser(decodedInfo);
  };

  const onSignInError = () => {
    setUser(null);
    throw new Error("Login failed");
  };

  const logout = () => {
    googleLogout();
    setUser(null);
  };

  function LoginButton() {
    if (user) return null;

    return (
      <GoogleLogin
        theme="filled_blue"
        auto_select
        useOneTap
        onSuccess={onSignInSuccess}
        onError={onSignInError}
        shape="pill"
        size="large"
        width="220"
        context="signin"
      />
    );
  }

  function LogoutButton() {
    if (!user) return null;

    return (
      <button className="g_id_signout" onClick={logout}>
        Logout
      </button>
    );
  }

  function UserCard() {
    if (!user) return null;

    const { picture, name, email, exp } = user;
    const expirationDate = new Date(exp * 1000).toLocaleTimeString('en-US');

    return (
      <div className="justify-end align-baseline flex w-full">
        <div
          className="group flex gap-2 align-middle hover:bg-white hover:text-black hover:rounded-md p-1 cursor-pointer -mt-10 -mr-10"
          title={`Session ends: ${expirationDate}`}
        >
          <img
            src={picture}
            alt="User avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex gap-2">
            <div>
              <div className="hidden sm:block text-sm">{name}</div>
              <div className="hidden sm:block text-xs">{email}</div>
            </div>

            <div className="hidden group-hover:block">
              <LogoutButton />
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <userContext.Provider value={{ user, UserCard, LoginButton, LogoutButton }}>
      {children}
    </userContext.Provider>
  );
}

export function useUser() {
  if (!userContext)
    throw new Error("useUser must be used within a UserProvider");

  return useContext(userContext);
}
