import { Navigate } from "react-router-dom";

import { useUser } from "src/hooks/UserContext";

export default function Landing() {
  const { user, LoginButton } = useUser();

  if (user) return <Navigate to="/home" />;

  return (
    <div className="flex w-full grow justify-center pt-[10vh]">
      <LoginButton />
    </div>
  );
}
