import { useEffect } from "react";

export function useScript({
  src,
  onLoad,
}: {
  src: string;
  onLoad: (this: GlobalEventHandlers, ev: Event) => void;
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = onLoad;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onLoad, src]);

  return null;
}
