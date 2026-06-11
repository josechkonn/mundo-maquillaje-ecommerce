import { useState, useEffect, useRef, forwardRef, type InputHTMLAttributes } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate, className, checked: controlledChecked, defaultChecked, onChange, disabled, ...props }, ref) => {
    const [checked, setChecked] = useState(controlledChecked ?? !!defaultChecked);
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    const isChecked = controlledChecked !== undefined ? controlledChecked : checked;

    useEffect(() => {
      if (controlledChecked !== undefined) setChecked(controlledChecked);
    }, [controlledChecked]);

    useEffect(() => {
      if (inputRef?.current) {
        inputRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate, inputRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (controlledChecked === undefined) setChecked(e.target.checked);
      onChange?.(e);
    };

    const box = (
      <span className="relative inline-flex items-center justify-center shrink-0">
        <input
          type="checkbox"
          ref={inputRef}
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          checked={controlledChecked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <span className={`
          w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0
          transition-all duration-200
          ${indeterminate || isChecked
            ? "bg-brand-400 border-brand-400"
            : "bg-white border-neutral-300 group-hover/checkbox:border-brand-300"
          }
          ${disabled ? "opacity-50" : ""}
          peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300 peer-focus-visible:ring-offset-1
        `}>
          {indeterminate ? (
            <span className="w-2.5 h-0.5 bg-white rounded-full" />
          ) : isChecked ? (
            <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3]" />
          ) : null}
        </span>
      </span>
    );

    if (label) {
      return (
        <label className={`flex items-center gap-3 group/checkbox ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
          {box}
          <span className="text-sm text-text-base select-none">{label}</span>
        </label>
      );
    }

    return box;
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
