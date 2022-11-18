import { useState } from "react";

type SwitcherProps = {
  labels: [string, string];
  renders: {
    firstOption: JSX.Element;
    secondOption: JSX.Element;
  };
  initialState: boolean;
  onChange: (value: boolean) => void;
};

export default function Switcher({
  labels,
  initialState,
  onChange,
  renders: { firstOption, secondOption },
}: SwitcherProps) {
  const [state, setState] = useState(initialState);
  const largestLabel = Math.max(...labels.map((label) => label.length));

  return (
    <>
      <div className="m-auto w-fit bg-slate-500 rounded-full cursor-pointer select-none">
        <button
          type="button"
          className={`inline-block px-2 py-1 box-content text-center ${
            state ? "rounded-full bg-slate-400" : ""
          }`}
          style={{ width: largestLabel + "ch" }}
          onClick={() => {
            setState(true);
            onChange(true);
          }}
        >
          {labels[0]}
        </button>
        <button
          type="button"
          className={`inline-block px-2 py-1 box-content text-center ${
            state ? "" : "rounded-full bg-slate-400"
          }`}
          style={{ width: largestLabel + "ch" }}
          onClick={() => {
            setState(false);
            onChange(false);
          }}
        >
          {labels[1]}
        </button>
      </div>
      {state ? firstOption : secondOption}
    </>
  );
}
