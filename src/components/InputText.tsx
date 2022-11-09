import type { FocusEventHandler } from "react";
import { useState } from "react";

type InputTextProps = {
  name: string;
  initialValue?: string;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
};

export default function InputText({
  name,
  label,
  initialValue,
  hint,
  error,
}: InputTextProps) {
  const [state, setState] = useState<string>();
  const [value, setValue] = useState<string>(initialValue || "");
  const description = error || hint;

  const onFocus = () => setState("focus");
  const onBlur: FocusEventHandler<HTMLInputElement> = ({ target }) => {
    setState(undefined);
    setValue(target.value);
  };

  return (
    <label htmlFor={name}>
      <div className="relative">
        <div
          className={`absolute left-4 leading-6 transition-all text-gray-400 px-0.5 -ml-0.5 h-fit -translate-y-1/2 ${
            state === "focus" || value
              ? "top-0 translate-y-0 text-xs leading-6"
              : "inset-y-1/2"
          }`}
        >
          {label}
        </div>
        <input
          id={name}
          type="text"
          aria-describedby={name + "-hint"}
          defaultValue={initialValue}
          className={`w-full px-4 pt-6 pb-2 border-b-2 focus:border-b-white bg-black/5 hover:bg-black/10 focus:bg-black/[15%] rounded-sm
        ${error ? "border-b-red-300" : "border-b-gray-400"}`}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      <div
        id={name + "-hint"}
        className={`pl-4 text-xs ${error ? "text-red-300" : ""}`}
      >
        {description}
      </div>
    </label>
  );
}
