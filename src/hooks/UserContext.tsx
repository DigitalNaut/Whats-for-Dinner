import { createContext, PropsWithChildren, useContext, useState } from "react";
import {
  CredentialResponse,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import jwt_decode from "jwt-decode";

type UserContext = {
  user: User;
  UserSessionButton(): JSX.Element | null;
};

const userContext = createContext<UserContext>({
  user: null,
  UserSessionButton: () => null,
});

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>(null);

  const onSignInSuccess = (response: CredentialResponse) => {
    const { credential } = response || {};

    if (!credential) throw new Error("No JWT found in credentials");

    const decodedInfo = jwt_decode(credential) as User;
    setUser(decodedInfo);
  };

  const onSignInError = () => {
    throw new Error("Login failed");
  };

  const logout = () => {
    googleLogout();
    setUser(null);
  };

  function UserSessionButton() {
    if (user)
      return (
        <button className="g_id_signout" onClick={logout}>
          Logout
        </button>
      );

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

  return (
    <userContext.Provider value={{ user, UserSessionButton }}>
      {children}
    </userContext.Provider>
  );
}

export function useUser() {
  if (!userContext)
    throw new Error("useUser must be used within a UserProvider");

  return useContext(userContext);
}
