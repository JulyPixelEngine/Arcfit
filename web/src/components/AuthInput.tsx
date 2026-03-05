"use client"

import { InputHTMLAttributes, forwardRef } from "react"

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label
          className="text-[11px] uppercase tracking-[0.12em] text-[#737373]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {label}
        </label>
        <input
          ref={ref}
          className={`
            w-full bg-transparent py-3 text-[15px] text-black outline-none
            border-b border-[#e5e5e5]
            placeholder:text-[#c4c4c4]
            focus:border-black
            transition-colors duration-200
            ${className}
          `}
          style={{ fontFamily: "var(--font-inter)" }}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-red-500 mt-0.5">{error}</span>
        )}
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput"

export default AuthInput
