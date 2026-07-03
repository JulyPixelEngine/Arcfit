"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import api, { clearSession } from "@/lib/api"
import LanguageSwitcher from "@/components/LanguageSwitcher"

interface HeaderProps {
  user: { email: string; name?: string } | null
  onMenuToggle?: () => void
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" x2="21" y1="6" y2="6" />
      <line x1="3" x2="21" y1="12" y2="12" />
      <line x1="3" x2="21" y1="18" y2="18" />
    </svg>
  )
}

function IconPanelToggle({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="9" x2="9" y1="3" y2="21" />
      <path d="m14 9-3 3 3 3" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function IconMessage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({ user, onMenuToggle, sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleLogout() {
    await api.post("/auth/logout")
    clearSession()
    router.push("/login")
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "??"

  return (
    <header className="glass-bar font-body sticky top-0 z-10 h-[64px] flex items-center px-6 gap-4 border-x-0 border-t-0 rounded-none">
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        className="text-gray-500 hover:text-gray-900 transition-colors lg:hidden"
      >
        <IconMenu />
      </button>

      {/* Sidebar collapse toggle */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
        >
          <IconPanelToggle collapsed={!!sidebarCollapsed} />
        </button>
      )}

      {/* Search */}
      <div className="flex-1 max-w-[400px]">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Search members, sessions..."
            className="w-full h-9 pl-9 pr-4 text-[13px] bg-white/50 border border-border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-dopamine-violet focus:bg-white/80 transition-colors"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((p) => !p); setDropdownOpen(false) }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <IconBell />
            {/* Badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {notifOpen && (
            <div className="glass-dropdown absolute right-0 top-11 w-[320px] rounded-xl py-2 z-50">
              <p className="text-[12px] uppercase tracking-wide text-gray-400 px-4 py-2 border-b border-gray-100">
                Notifications
              </p>
              {[
                { text: "Kim Minjun's session starts in 30 min", time: "just now" },
                { text: "Park Jihye membership expires in 3 days", time: "1h ago" },
                { text: "New payment received from Lee Soojin", time: "3h ago" },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-[13px] text-gray-700">{n.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <IconMessage />
        </button>

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setDropdownOpen((p) => !p); setNotifOpen(false) }}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dopamine-violet to-dopamine-pink flex items-center justify-center text-white text-[12px] font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-medium text-gray-800 leading-tight">
                {user?.name ?? user?.email?.split("@")[0] ?? "Trainer"}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">Trainer</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="glass-dropdown absolute right-0 top-12 w-[190px] rounded-xl py-1.5 z-50">
              <button
                onClick={() => { router.push("/dashboard/profile"); setDropdownOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <IconUser />
                Profile
              </button>
              <button
                onClick={() => { router.push("/dashboard/settings"); setDropdownOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <IconSettings />
                Account Settings
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <IconLogout />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
