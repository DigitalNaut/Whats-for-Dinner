import { useEffect } from "react";

const alertUser = (event: BeforeUnloadEvent) => {
  event.preventDefault();
};

export function useBeforeUnload(when: boolean) {
  useEffect(() => {
    window.onbeforeunload = when ? alertUser : null;

    return () => {
      window.removeEventListener("beforeunload", alertUser);
    };
  }, [when]);

  return null;
}
