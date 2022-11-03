import type { AxiosResponse } from "axios";
import type { TokenResponse } from "@react-oauth/google";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import GoogleLoginButton from "src/components/GoogleLoginButton";

type UserContext = {
  user: GoogleUserInfo;
  LoginButton(): JSX.Element | null;
  LogoutButton(): JSX.Element | null;
  UserCard(): JSX.Element | null;
};

type TokenResponseSuccess = Omit<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;
type TokenResponseError = Pick<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;
type TokenInfo = {
  tokenExpiration: Date;
};

const userContext = createContext<UserContext>({
  user: undefined,
  LoginButton: () => null,
  LogoutButton: () => null,
  UserCard: () => null,
});

const scope = "https://www.googleapis.com/auth/drive.appdata";

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<GoogleUserInfo>();
  const [userTokens, setUserTokens] = useState<
    TokenResponseSuccess & TokenInfo
  >();

  const onSignInSuccess = async (tokenResponse: TokenResponseSuccess) => {
    const tokenExpiration = new Date(
      Date.now() + tokenResponse.expires_in * 1000
    );
    setUserTokens({ ...tokenResponse, tokenExpiration });

    try {
      const userInfo: AxiosResponse<GoogleUserInfo> = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      );

      setUser(userInfo.data);
    } catch (error) {
      if (axios.isAxiosError(error))
        throw new Error(`Failed to fetch user info: ${error.message}`);

      if (error instanceof Error) throw error;
    }
  };

  const onSignInError = (errorResponse: TokenResponseError) => {
    setUser(null);
    throw errorResponse.error;
  };

  const logout = () => {
    googleLogout();
    setUser(null);
  };

  function LoginButton() {
    if (user) return null;

    const requestAccess = useGoogleLogin({
      onSuccess: onSignInSuccess,
      onError: onSignInError,
      scope,
    });

    return <GoogleLoginButton onClick={() => requestAccess()} />;
  }

  function LogoutButton() {
    if (!user) return null;

    return (
      <button data-filled className="g_id_signout" onClick={logout}>
        Logout
      </button>
    );
  }

  function UserCard() {
    if (!user) return null;

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
          <div className="flex gap-2">
            <div>
              <div className="hidden sm:block text-sm">{name}</div>
              <div className="hidden sm:block text-xs">{email}</div>
            </div>

            <div className="hidden group-hover:flex flex-col">
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
