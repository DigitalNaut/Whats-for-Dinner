import { useState } from "react";
export enum SwitcherState {
  FirstOption,
  SecondOption,
}
type SwitcherProps = {
  labels: [string, string];
  renders: {
    firstOption: JSX.Element;
    secondOption: JSX.Element;
  };
  initialState: SwitcherState;
  onChange: (value: SwitcherState) => void;
};

export default function Switcher({
  labels,
  initialState,
  onChange,
  renders: { firstOption, secondOption },
}: SwitcherProps) {
  const [state, setState] = useState(initialState);

  const largestLabel = Math.max(...labels.map((label) => label.length));
  const [firstLabel, secondLabel] = labels;

  return (
    <>
      <div className="m-auto w-fit cursor-pointer select-none rounded-full bg-slate-600 text-slate-400">
        <button
          type="button"
          className={`box-content inline-block rounded-full px-2 py-1 text-center ${
            state === SwitcherState.FirstOption
              ? "bg-slate-300 text-slate-600"
              : ""
          }`}
          style={{ width: largestLabel + "ch" }}
          onClick={() => {
            setState(SwitcherState.FirstOption);
            onChange(SwitcherState.FirstOption);
          }}
        >
          {firstLabel}
        </button>
        <button
          type="button"
          className={`box-content inline-block rounded-full px-2 py-1 text-center ${
            state === SwitcherState.SecondOption
              ? "bg-slate-300 text-slate-600"
              : ""
          }`}
          style={{ width: largestLabel + "ch" }}
          onClick={() => {
            setState(SwitcherState.SecondOption);
            onChange(SwitcherState.SecondOption);
          }}
        >
          {secondLabel}
        </button>
      </div>
      {state === SwitcherState.FirstOption ? firstOption : secondOption}
    </>
  );
}
