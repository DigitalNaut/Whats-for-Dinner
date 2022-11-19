type ToggleProps = {
  checked?: boolean;
  onChange?: (value: boolean) => void;
};

export default function Toggle({ checked = false, onChange }: ToggleProps) {
  return (
    <button
      className={`h-4 w-8 rounded-full transition-colors ${
        checked ? "bg-purple-600" : "bg-gray-500"
      }`}
      onClick={() => {
        onChange?.(!checked);
      }}
    >
      <div
        className={`z-0 aspect-square h-4 rounded-full bg-gray-200 transition-transform hover:bg-white ${
          checked ? "translate-x-full" : "translate-x-0"
        }`}
      />
    </button>
  );
}
