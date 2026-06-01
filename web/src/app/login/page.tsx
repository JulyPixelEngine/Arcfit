"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import api, { saveSession } from "@/lib/api"
import AuthInput from "@/components/AuthInput"
import SocialButton from "@/components/SocialButton"
import Divider from "@/components/Divider"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
}

interface Branch { id: string; name: string }

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [branchId, setBranchId] = useState("")
  const [branches, setBranches] = useState<Branch[]>([])
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("session") === "expired") setNotice("세션이 만료되었습니다. 다시 로그인해 주세요.")
    else if (params.get("registered") === "true") setNotice("계정이 생성되었습니다. 로그인해 주세요.")

    api.get<Branch[]>("/branches").then((r) => setBranches(r.data)).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/login", { email, password, branch_id: branchId || null })
      saveSession()
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Login failed. Please try again."
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
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="mb-14 text-center">
          <span
            className="text-[13px] uppercase tracking-[0.25em] text-black"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            FitCore
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mb-10 text-center">
          <h1
            className="text-[40px] font-normal leading-[1.15] text-black mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Welcome back.
          </h1>
          <p
            className="text-[14px] text-[#737373]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Sign in to continue to your studio
          </p>
        </motion.div>

        {/* Notice (session expired / registered) */}
        {notice && (
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.14 }}
            className="mb-6 text-center text-[13px] text-[#737373] bg-[#f5f5f5] py-2.5 px-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {notice}
          </motion.p>
        )}

        {/* Form */}
        <motion.form
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.18 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-7 mb-6"
        >
          {/* Branch selector */}
          <div className="flex flex-col gap-2">
            <label
              className="text-[11px] uppercase tracking-widest text-[#737373]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full h-11 px-3 text-[14px] border-b border-[#e5e5e5] bg-transparent text-black focus:outline-none focus:border-black transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <option value="">지점을 선택하세요</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </motion.form>

        {/* Divider */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.24 }}>
          <Divider />
        </motion.div>

        {/* Social buttons */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.28 }}
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
          transition={{ ...fadeUp.transition, delay: 0.32 }}
          className="mt-10 text-center text-[13px] text-[#737373]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          No account?{" "}
          <Link href="/signup" className="text-black underline underline-offset-4 hover:opacity-60 transition-opacity">
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </main>
  )
}
