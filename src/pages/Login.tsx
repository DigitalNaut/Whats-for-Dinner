import { Navigate } from "react-router-dom";

import { useUser } from "src/hooks/UserContext";

type LoginProps = {
  redirectTo: string;
};

export default function Login({ redirectTo }: LoginProps) {
  const { user, LoginButton } = useUser();

  if (user) return <Navigate to={redirectTo} />;

  return (
    <div className="flex w-full grow justify-center pt-[10vh]">
      <LoginButton />
    </div>
  );
}
