"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = id || `input-${React.useId()}`;

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-800/30 z-10 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            "peer w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-navy-800",
            "transition-all duration-200 ease-out",
            "placeholder:text-transparent",
            "border-warm-200 hover:border-warm-300",
            "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none",
            icon && "pl-11",
            label && "pt-5 pb-2",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          placeholder={label || " "}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 transition-all duration-200 ease-out pointer-events-none",
              icon && "left-11",
              isFloating
                ? "top-2 text-[10px] font-medium text-teal-600"
                : "top-1/2 -translate-y-1/2 text-sm text-navy-800/40",
              error && isFloating && "text-red-500"
            )}
          >
            {label}
          </label>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
