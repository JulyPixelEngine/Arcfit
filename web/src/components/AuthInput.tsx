"use client"

import { InputHTMLAttributes, forwardRef, useState } from "react"

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.06 4.13M6.6 6.6C3.7 8.4 2 11 2 11a17.4 17.4 0 0 0 4.32 5.42A10.94 10.94 0 0 0 12 18c1.2 0 2.34-.2 3.4-.6" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className = "", type, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const isPassword = type === "password"
    const resolvedType = isPassword ? (visible ? "text" : "password") : type

    return (
      <div className="flex flex-col gap-1">
        <label className="font-body text-[11px] uppercase tracking-[0.12em] text-muted">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={resolvedType}
            className={`
              font-body w-full bg-white/40 rounded-xl px-3 py-3 text-[15px] text-foreground outline-none
              border border-border/70
              placeholder:text-[#c4bcd6]
              focus:border-dopamine-violet focus:bg-white/60
              transition-colors duration-200
              ${isPassword ? "pr-11" : ""}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              tabIndex={-1}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dopamine-violet transition-colors"
            >
              {visible ? <IconEyeOff /> : <IconEye />}
            </button>
          )}
        </div>
        {error && (
          <span className="font-body text-[12px] text-dopamine-coral mt-0.5">{error}</span>
        )}
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput"

export default AuthInput
