"use client"

import { ButtonHTMLAttributes, ReactElement } from "react"

type Provider = "google" | "kakao"

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#000"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#333"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#555"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#222"/>
  </svg>
)

const KakaoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 1C4.582 1 1 3.91 1 7.5c0 2.302 1.523 4.323 3.826 5.468L3.9 16.3a.25.25 0 0 0 .38.26L8.1 13.94c.296.03.597.06.9.06 4.418 0 8-2.91 8-6.5S13.418 1 9 1Z"
      fill="#000"
    />
  </svg>
)

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: Provider
}

const labels: Record<Provider, string> = {
  google: "Continue with Google",
  kakao: "Continue with Kakao",
}

const icons: Record<Provider, ReactElement> = {
  google: <GoogleIcon />,
  kakao: <KakaoIcon />,
}

export default function SocialButton({ provider, className = "", ...props }: SocialButtonProps) {
  return (
    <button
      type="button"
      className={`
        glass-pill font-body flex w-full items-center justify-center gap-3
        rounded-xl py-3 px-4 text-[13px] text-foreground
        hover:bg-white/60 transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {icons[provider]}
      <span>{labels[provider]}</span>
    </button>
  )
}
