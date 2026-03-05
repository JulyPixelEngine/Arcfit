"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import api, { clearSession } from "@/lib/api"

interface User {
  id: string
  email: string
  provider: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    api.get<User>("/auth/me").then((res) => setUser(res.data)).catch(() => router.push("/login"))
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function handleLogout() {
    await api.post("/auth/logout")
    clearSession()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <header
        className={`
          sticky top-0 z-10 flex items-center justify-between
          px-8 py-5 bg-white
          transition-shadow duration-300
          ${scrolled ? "shadow-[0_1px_0_0_#e5e5e5]" : ""}
        `}
      >
        <span
          className="text-[13px] uppercase tracking-[0.25em] text-black"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          FitCore
        </span>
        <button
          onClick={handleLogout}
          className="
            text-[12px] uppercase tracking-[0.1em] text-[#737373]
            hover:text-black transition-colors duration-200
          "
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Sign out
        </button>
      </header>

      {/* Main content */}
      <main className="max-w-[720px] mx-auto px-8 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <p
            className="text-[12px] uppercase tracking-[0.18em] text-[#a3a3a3] mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Dashboard
          </p>
          <h1
            className="text-[48px] font-normal leading-[1.1] text-black mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Good to see you.
          </h1>
          <div className="h-px bg-[#e5e5e5] mb-10" />

          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <Row label="Email" value={user.email} />
              <Row label="Provider" value={user.provider} />
              <Row label="Member since" value={new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              })} />
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between items-baseline py-4 border-b border-[#f0f0f0]"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <span className="text-[12px] uppercase tracking-[0.12em] text-[#a3a3a3]">{label}</span>
      <span className="text-[14px] text-black">{value}</span>
    </div>
  )
}
