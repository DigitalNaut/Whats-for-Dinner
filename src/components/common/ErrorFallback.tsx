import { type FallbackProps } from "react-error-boundary";

import ThemedButton from "src/components/common/ThemedButton";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-lg bg-gradient-to-br from-red-500 to-red-700 p-6 text-white"
    >
      <h2 className="font-bold">Something went wrong:</h2>
      <pre className="mb-2 rounded-md bg-white p-4 text-black">
        {error.message}
      </pre>
      <ThemedButton onClick={resetErrorBoundary}>Try again</ThemedButton>
    </div>
  );
}
