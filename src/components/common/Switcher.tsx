import { useState } from "react";
import { twMerge } from "tailwind-merge";

const SwitcherState = ["firstOption", "secondOption"] as const;

type SwitcherProps = {
  labels: [string, string];
  renders: {
    firstOption: JSX.Element;
    secondOption: JSX.Element;
  };
  initialState: (typeof SwitcherState)[number];
  onChange: (value: (typeof SwitcherState)[number]) => void;
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
          className={twMerge(
            "box-content inline-block rounded-full px-2 py-1 text-center",
            state === "firstOption" ? "bg-slate-300 text-slate-600" : "",
          )}
          style={{ width: largestLabel + "ch" }}
          onClick={() => {
            setState("firstOption");
            onChange("firstOption");
          }}
        >
          {firstLabel}
        </button>
        <button
          type="button"
          className={twMerge(
            "box-content inline-block rounded-full px-2 py-1 text-center",
            state === "secondOption" ? "bg-slate-300 text-slate-600" : "",
          )}
          style={{ width: largestLabel + "ch" }}
          onClick={() => {
            setState("secondOption");
            onChange("secondOption");
          }}
        >
          {secondLabel}
        </button>
      </div>
      {state === "firstOption" ? firstOption : secondOption}
    </>
  );
}
