import { useEffect } from "react";

export function useScript({
  url,
  onLoad,
  onError,
}: {
  url: string;
  onLoad: GlobalEventHandlers["onload"];
  onError: OnErrorEventHandler;
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = onLoad;
    script.onerror = onError;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onLoad, onError, url]);

  return null;
}
