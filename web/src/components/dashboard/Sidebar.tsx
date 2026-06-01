"use client"

import { useState } from "react"

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconDumbbell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11" />
      <path d="M6.5 17.5h11" />
      <path d="M3 9.5v5" />
      <path d="M21 9.5v5" />
      <rect x="1" y="8" width="4" height="8" rx="1" />
      <rect x="19" y="8" width="4" height="8" rx="1" />
      <rect x="6" y="5" width="3" height="14" rx="1" />
      <rect x="15" y="5" width="3" height="14" rx="1" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function IconCreditCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="22" height="16" x="1" y="4" rx="2" ry="2" />
      <line x1="1" x2="23" y1="10" y2="10" />
    </svg>
  )
}

function IconBarChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ─── Nav Data ─────────────────────────────────────────────────────────────────

interface NavChild {
  label: string
  tabId: string
}

interface NavGroup {
  label: string
  icon: React.ReactNode
  tabId?: string          // single-item → opens this tab
  children?: NavChild[]  // group → children open tabs
}

const NAV: NavGroup[] = [
  {
    label: "Dashboard",
    tabId: "dashboard",
    icon: <IconHome />,
  },
  {
    label: "Members",
    icon: <IconUsers />,
    children: [
      { label: "Member List",     tabId: "members" },
      { label: "Member Progress", tabId: "member-progress" },
    ],
  },
  {
    label: "PT Sessions",
    icon: <IconDumbbell />,
    children: [
      { label: "Today Sessions",  tabId: "today-sessions" },
      { label: "Session History", tabId: "session-history" },
    ],
  },
  {
    label: "Schedule",
    icon: <IconCalendar />,
    children: [
      { label: "Calendar Booking",  tabId: "schedule-calendar" },
      { label: "Upcoming Sessions", tabId: "schedule-upcoming" },
    ],
  },
  {
    label: "Payments",
    icon: <IconCreditCard />,
    children: [
      { label: "Member Payments", tabId: "payments-members" },
      { label: "Revenue",         tabId: "payments-revenue" },
    ],
  },
  {
    label: "Reports",
    icon: <IconBarChart />,
    children: [
      { label: "Monthly Stats",     tabId: "reports-monthly" },
      { label: "Member Retention",  tabId: "reports-retention" },
    ],
  },
  {
    label: "Settings",
    icon: <IconSettings />,
    children: [
      { label: "User Management",   tabId: "settings-users" },
      { label: "Branch Management", tabId: "settings-branches" },
    ],
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeTabId: string
  openTab: (id: string, title: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ activeTabId, openTab }: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Auto-expand group containing the active tab
    const initial: Record<string, boolean> = {}
    NAV.forEach((item) => {
      if (item.children?.some((c) => c.tabId === activeTabId)) {
        initial[item.label] = true
      }
    })
    return initial
  })

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-65 bg-[#1a1a2e] flex flex-col z-20 select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-white text-[15px] font-semibold tracking-wide">FitCore</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 px-3 mb-3 mt-2">Main Menu</p>

        {NAV.map((item) => {
          const isLeafActive = item.tabId === activeTabId
          const isGroupActive = item.children?.some((c) => c.tabId === activeTabId)
          const isOpen = openGroups[item.label] ?? false

          if (item.tabId && !item.children) {
            // Single item
            return (
              <button
                key={item.label}
                onClick={() => openTab(item.tabId!, item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13.5px] transition-colors duration-150 text-left ${
                  isLeafActive
                    ? "bg-[#2563eb] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <span className={isLeafActive ? "text-white" : "text-white/50"}>{item.icon}</span>
                {item.label}
              </button>
            )
          }

          // Group with children
          return (
            <div key={item.label} className="mb-0.5">
              <button
                onClick={() => toggleGroup(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors duration-150 ${
                  isGroupActive
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <span className={isGroupActive ? "text-[#60a5fa]" : "text-white/50"}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                <span className={isGroupActive ? "text-white/70" : "text-white/30"}>
                  <IconChevron open={isOpen} />
                </span>
              </button>

              {isOpen && (
                <div className="ml-9 mt-0.5 flex flex-col gap-0.5">
                  {item.children!.map((child) => (
                    <button
                      key={child.tabId}
                      onClick={() => openTab(child.tabId, child.label)}
                      className={`text-left text-[13px] py-2 px-3 rounded-md transition-colors duration-150 ${
                        activeTabId === child.tabId
                          ? "text-white bg-[#2563eb]/80"
                          : "text-white/50 hover:text-white hover:bg-white/8"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom version */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-[11px] text-white/25">FitCore v0.1 · Trainer Panel</p>
      </div>
    </aside>
  )
}
