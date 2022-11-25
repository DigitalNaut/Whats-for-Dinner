import type { FocusEventHandler, InputHTMLAttributes } from "react";
import { createRef, useState } from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type InputTextProps = {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  onClear?: () => void;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "required" | "onChange"
>;

export default function InputText({
  name,
  value,
  label,
  hint,
  error,
  onClear,
  ...props
}: InputTextProps) {
  const inputRef = createRef<HTMLInputElement>();
  const [isFocused, setIsFocused] = useState(false);
  const description = error || hint;

  const onFocus = () => setIsFocused(true);
  const onBlur: FocusEventHandler<HTMLInputElement> = () => {
    setIsFocused(false);
  };

  return (
    <div>
      <div className="relative">
        <label
          htmlFor={name}
          className={`absolute left-4 -ml-0.5 h-fit -translate-y-1/2 px-0.5 leading-6 text-gray-400 transition-all ${
            isFocused || value
              ? "top-0 translate-y-0 text-xs leading-6"
              : "inset-y-1/2"
          }`}
        >
          {label}
        </label>
        <input
          id={name}
          name={name}
          type="text"
          aria-describedby={name + "-hint"}
          defaultValue={value}
          className={`w-full rounded-sm border-b-2 border-b-gray-400 bg-black/5 pt-6 pb-2 invalid:border-b-red-300 hover:bg-black/10 focus:border-b-white focus:bg-black/[15%] 
            ${error ? "border-b-red-300" : ""}
            ${onClear ? "pl-4 pr-7" : "px-4"}`}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={inputRef}
          {...props}
        />
        {value && onClear && (
          <button
            aria-label="Borrar entrada"
            type="button"
            className="absolute right-2 bottom-2"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onClear();
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      <div
        id={name + "-hint"}
        className={`pl-4 text-xs ${error ? "text-red-300" : ""}`}
      >
        {description}
      </div>
    </div>
  );
}
