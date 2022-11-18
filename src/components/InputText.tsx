import type { FocusEventHandler, InputHTMLAttributes } from "react";
import { useState } from "react";

type InputTextProps = {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  value: string;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "required" | "onChange">;

export default function InputText({
  name,
  label,
  hint,
  error,
  value,
  ...props
}: InputTextProps) {
  const [isFocused, setIsFocused] = useState(false);
  const description = error || hint;

  const onFocus = () => setIsFocused(true);
  const onBlur: FocusEventHandler<HTMLInputElement> = () => {
    setIsFocused(false);
  };

  return (
    <label htmlFor={name}>
      <div className="relative">
        <div
          className={`absolute left-4 leading-6 transition-all text-gray-400 px-0.5 -ml-0.5 h-fit -translate-y-1/2 ${
            isFocused || value
              ? "top-0 translate-y-0 text-xs leading-6"
              : "inset-y-1/2"
          }`}
        >
          {label}
        </div>
        <input
          id={name}
          name={name}
          type="text"
          aria-describedby={name + "-hint"}
          defaultValue={value}
          className={`w-full px-4 pt-6 pb-2 border-b-2 focus:border-b-white bg-black/5 hover:bg-black/10 focus:bg-black/[15%] rounded-sm
        ${error ? "border-b-red-300" : "border-b-gray-400"}`}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
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
