import { FallbackProps } from "react-error-boundary";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-lg"
    >
      <h2 className="font-bold">Something went wrong:</h2>
      <pre className="bg-white text-black rounded-md p-4 mb-2">
        {error.message}
      </pre>
      <button data-filled onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}
