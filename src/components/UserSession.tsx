import { useUser } from "src/hooks/UserContext";

export default function UserSession() {
  const { UserSessionButton } = useUser();

  return (
    <div className="flex w-full justify-end p-3">
      <UserSessionButton />
    </div>
  );
}
