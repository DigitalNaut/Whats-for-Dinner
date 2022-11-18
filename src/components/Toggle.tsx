import { useState } from "react";

type ToggleProps = {
  initial?: boolean;
  onChange?: (value: boolean) => void;
};

export default function Toggle({ initial = false, onChange }: ToggleProps) {
  const [checked, setChecked] = useState(initial);

  return (
    <button
      className={`relative h-4 w-8 rounded-full transition-colors ${
        checked ? "bg-purple-600" : "bg-gray-500"
      }`}
      onClick={() => {
        setChecked(!checked);
        onChange?.(!checked);
      }}
    >
      <div
        className={`absolute inset-0 aspect-square h-4 rounded-full bg-gray-200 transition-transform hover:bg-white ${
          checked ? "translate-x-full" : "translate-x-0"
        }`}
      />
    </button>
  );
}
