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
        className={`inset-0 absolute h-4 aspect-square bg-gray-200 hover:bg-white rounded-full transition-transform ${
          checked ? "translate-x-full" : "translate-x-0"
        }`}
      />
    </button>
  );
}
