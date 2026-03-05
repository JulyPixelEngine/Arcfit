"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, type Transition } from "framer-motion"
import api from "@/lib/api"
import AuthInput from "@/components/AuthInput"
import SocialButton from "@/components/SocialButton"
import Divider from "@/components/Divider"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function validatePassword(pw: string): string | null {
    if (pw.length < 12) return "비밀번호는 최소 12자리여야 합니다"
    if (!/[A-Z]/.test(pw)) return "대문자를 최소 1개 포함해야 합니다"
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return "특수문자를 최소 1개 포함해야 합니다"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const pwError = validatePassword(password)
    if (pwError) { setError(pwError); return }
    if (password !== confirmPassword) { setError("비밀번호가 일치하지 않습니다"); return }

    setLoading(true)
    try {
      await api.post("/auth/register", { email, password })
      router.push("/login?registered=true")
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Registration failed. Please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-white">
      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* Wordmark */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 }}
          className="mb-14 text-center"
        >
          <span
            className="text-[13px] uppercase tracking-[0.25em] text-black"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            FitCore
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
          className="mb-10 text-center"
        >
          <h1
            className="text-[40px] font-normal leading-[1.15] text-black mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Create account.
          </h1>
          <p
            className="text-[14px] text-[#737373]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Start managing your studio today
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.18 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-7 mb-6"
        >
          <AuthInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="대문자·특수문자 포함 12자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="비밀번호 재입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={error}
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full bg-black text-white py-3.5 text-[13px] tracking-[0.06em] uppercase
              hover:opacity-85 transition-opacity duration-200
              disabled:opacity-40
            "
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </motion.form>

        {/* Divider */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.24 }}
        >
          <Divider />
        </motion.div>

        {/* Social buttons */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.28 }}
          className="flex flex-col gap-3 mt-5"
        >
          <SocialButton
            provider="google"
            onClick={() => { window.location.href = `${API_BASE}/auth/google/login` }}
          />
          <SocialButton
            provider="kakao"
            onClick={() => { window.location.href = `${API_BASE}/auth/kakao/login` }}
          />
        </motion.div>

        {/* Footer link */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.32 }}
          className="mt-10 text-center text-[13px] text-[#737373]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Already have an account?{" "}
          <Link href="/login" className="text-black underline underline-offset-4 hover:opacity-60 transition-opacity">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </main>
  )
}
