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
      <div className="m-auto w-fit cursor-pointer select-none rounded-full bg-slate-500">
        <button
          type="button"
          className={`box-content inline-block rounded-full px-2 py-1 text-center ${
            state ? "bg-slate-400" : ""
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
          className={`box-content inline-block rounded-full px-2 py-1 text-center ${
            state ? "" : "bg-slate-400"
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
