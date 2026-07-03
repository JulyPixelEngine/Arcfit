"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, type CardVariant } from "@astryxdesign/core/Card"
import { Heading } from "@astryxdesign/core/Heading"
import { Text } from "@astryxdesign/core/Text"
import { HStack } from "@astryxdesign/core/HStack"
import { VStack } from "@astryxdesign/core/VStack"
import { Avatar } from "@astryxdesign/core/Avatar"
import { Badge, type BadgeVariant } from "@astryxdesign/core/Badge"
import { StatusDot, type StatusDotVariant } from "@astryxdesign/core/StatusDot"
import api from "@/lib/api"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import TabBar, { type Tab } from "@/components/dashboard/TabBar"
import StaffContent from "@/components/dashboard/StaffContent"
import MembersContent from "@/components/dashboard/MembersContent"
import ProductsContent from "@/components/dashboard/ProductsContent"
import LessonsContent from "@/components/dashboard/LessonsContent"

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string
  email: string
  name?: string
  role: string
  provider: string
  branch_id?: string | null
  created_at: string
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconDumbbell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" />
      <path d="M3 9.5v5" /><path d="M21 9.5v5" />
      <rect x="1" y="8" width="4" height="8" rx="1" />
      <rect x="19" y="8" width="4" height="8" rx="1" />
      <rect x="6" y="5" width="3" height="14" rx="1" />
      <rect x="15" y="5" width="3" height="14" rx="1" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  )
}

// ─── Shared mock data ─────────────────────────────────────────────────────────

type SessionStatus = "Confirmed" | "Pending" | "Completed"

interface Session {
  time: string; endTime: string; member: string; branch: string; type: string; status: SessionStatus
}

const STATUS_STYLE: Record<SessionStatus, string> = {
  Confirmed: "bg-blue-50 text-blue-600",
  Pending: "bg-yellow-50 text-yellow-600",
  Completed: "bg-green-50 text-green-600",
}

const STATUS_BADGE_VARIANT: Record<SessionStatus, BadgeVariant> = {
  Confirmed: "blue",
  Pending: "warning",
  Completed: "success",
}

const TODAY_SESSIONS: Session[] = [
  { time: "09:00", endTime: "10:00", member: "Kim Minjun",    branch: "Gangnam", type: "1:1 PT",   status: "Confirmed" },
  { time: "10:30", endTime: "11:30", member: "Lee Soojin",    branch: "Hongdae", type: "Yoga",     status: "Completed" },
  { time: "13:00", endTime: "14:00", member: "Park Jihye",    branch: "Gangnam", type: "1:1 PT",   status: "Confirmed" },
  { time: "15:00", endTime: "16:00", member: "Choi Donghyun", branch: "Gangnam", type: "Pilates",  status: "Pending" },
  { time: "17:30", endTime: "18:30", member: "Jung Yuna",     branch: "Hongdae", type: "CrossFit", status: "Confirmed" },
]

interface Member {
  name: string; phone: string; status: "active" | "inactive" | "suspended"; remaining: number; branch: string
}

const MOCK_MEMBERS: Member[] = [
  { name: "Kim Minjun",     phone: "010-1234-5678", status: "active",    remaining: 8,  branch: "Gangnam" },
  { name: "Lee Soojin",    phone: "010-2345-6789", status: "active",    remaining: 3,  branch: "Hongdae" },
  { name: "Park Jihye",    phone: "010-3456-7890", status: "active",    remaining: 1,  branch: "Gangnam" },
  { name: "Choi Donghyun", phone: "010-4567-8901", status: "inactive",  remaining: 0,  branch: "Gangnam" },
  { name: "Jung Yuna",     phone: "010-5678-9012", status: "active",    remaining: 12, branch: "Hongdae" },
  { name: "Oh Seungwoo",   phone: "010-6789-0123", status: "active",    remaining: 5,  branch: "Gangnam" },
  { name: "Han Eunji",     phone: "010-7890-1234", status: "suspended", remaining: 0,  branch: "Hongdae" },
]

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

interface WeekSlot { day: string; time: string; member: string; type: string }

const WEEKLY_SLOTS: WeekSlot[] = [
  { day: "Mon", time: "09:00", member: "Kim Minjun",    type: "1:1 PT" },
  { day: "Mon", time: "11:00", member: "Lee Soojin",    type: "Yoga" },
  { day: "Tue", time: "10:00", member: "Park Jihye",    type: "1:1 PT" },
  { day: "Tue", time: "15:00", member: "Jung Yuna",     type: "CrossFit" },
  { day: "Wed", time: "09:00", member: "Kim Minjun",    type: "1:1 PT" },
  { day: "Wed", time: "13:00", member: "Oh Seungwoo",   type: "1:1 PT" },
  { day: "Thu", time: "10:00", member: "Park Jihye",    type: "1:1 PT" },
  { day: "Thu", time: "17:00", member: "Choi Donghyun", type: "Pilates" },
  { day: "Fri", time: "09:00", member: "Kim Minjun",    type: "1:1 PT" },
  { day: "Fri", time: "11:00", member: "Lee Soojin",    type: "Yoga" },
  { day: "Fri", time: "16:00", member: "Jung Yuna",     type: "CrossFit" },
  { day: "Sat", time: "10:00", member: "Oh Seungwoo",   type: "1:1 PT" },
]

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, variant, iconBg, icon }: {
  label: string; value: string | number; sub: string; variant: CardVariant; iconBg: string; icon: React.ReactNode
}) {
  return (
    <Card variant={variant} padding={4}>
      <HStack gap={4} align="start">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
        <VStack gap={0} className="min-w-0">
          <Text type="supporting" color="secondary">{label}</Text>
          <Heading level={2} type="display-3">{value}</Heading>
          <Text type="supporting" color="secondary">{sub}</Text>
        </VStack>
      </HStack>
    </Card>
  )
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      </div>
      <p className="text-[15px] font-medium text-gray-500">{title}</p>
      <p className="text-[13px] text-gray-400 mt-1">Coming soon</p>
    </div>
  )
}

// ─── Tab Content: Dashboard ───────────────────────────────────────────────────

function ContentDashboard({ user }: { user: User }) {
  const trainerName = user.name ?? user.email.split("@")[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  })

  const alerts: { name: string; msg: string; dot: StatusDotVariant }[] = [
    { name: "Park Jihye",  msg: "Membership expires in 1 day",  dot: "error" },
    { name: "Oh Seungwoo", msg: "3 sessions remaining",          dot: "warning" },
    { name: "Kim Minjun",  msg: "Membership expires in 5 days",  dot: "warning" },
    { name: "Han Eunji",   msg: "No attendance in 14 days",      dot: "neutral" },
  ]

  return (
    <VStack gap={6}>
      {/* Greeting banner */}
      <Card variant="default" padding={6}>
        <HStack justify="between" align="center">
          <VStack gap={0.5}>
            <Text type="supporting" color="secondary">{today}</Text>
            <Heading level={1} type="display-2">{greeting}, {trainerName}</Heading>
            <Text type="supporting" color="secondary">
              {TODAY_SESSIONS.filter((s) => s.status === "Confirmed").length} confirmed sessions today ·{" "}
              {MOCK_MEMBERS.filter((m) => m.remaining <= 2 && m.status === "active").length} members expiring soon
            </Text>
          </VStack>
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-black/10 shrink-0">
            <IconDumbbell />
          </div>
        </HStack>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Members"       value={MOCK_MEMBERS.length}                                          sub="across all branches"   variant="default" iconBg="bg-dopamine-lime"   icon={<IconUsers />} />
        <StatCard label="Today's PT Sessions" value={TODAY_SESSIONS.length}                                        sub={`${TODAY_SESSIONS.filter(s=>s.status==="Confirmed").length} confirmed`} variant="default" iconBg="bg-dopamine-violet" icon={<IconDumbbell />} />
        <StatCard label="Upcoming Sessions"   value={TODAY_SESSIONS.filter(s=>s.status!=="Completed").length}      sub="remaining today"       variant="default" iconBg="bg-dopamine-yellow" icon={<IconCalendar />} />
        <StatCard label="Active Members"      value={MOCK_MEMBERS.filter(m=>m.status==="active").length}           sub="currently enrolled"    variant="default" iconBg="bg-dopamine-pink"   icon={<IconAlert />} />
      </div>

      {/* Today schedule + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card padding={0} className="xl:col-span-2">
          <HStack justify="between" align="center" className="px-5 py-4 border-b border-gray-100">
            <Heading level={2} type="display-3">Today&apos;s Schedule</Heading>
            <Text type="supporting" color="secondary">{TODAY_SESSIONS.length} sessions</Text>
          </HStack>
          <VStack gap={0.5} className="p-4">
            {TODAY_SESSIONS.map((s, i) => (
              <HStack key={i} gap={4} align="center" className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Text type="supporting" color="secondary" className="font-mono w-12 shrink-0">{s.time}</Text>
                <HStack gap={2} align="center" className="flex-1 min-w-0">
                  <Avatar name={s.member} size="small" />
                  <VStack gap={0} className="min-w-0">
                    <Text weight="medium" className="truncate">{s.member}</Text>
                    <Text type="supporting" color="secondary" size="xsm">{s.type} · {s.branch}</Text>
                  </VStack>
                </HStack>
                <Badge variant={STATUS_BADGE_VARIANT[s.status]} label={s.status} />
              </HStack>
            ))}
          </VStack>
        </Card>

        <Card padding={0}>
          <div className="px-5 py-4 border-b border-gray-100">
            <Heading level={2} type="display-3">Alerts</Heading>
          </div>
          <VStack gap={1} className="p-4">
            {alerts.map((a, i) => (
              <HStack key={i} gap={3} align="start" className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="mt-1.5">
                  <StatusDot variant={a.dot} label={a.msg} />
                </span>
                <VStack gap={0} className="min-w-0">
                  <Text weight="medium" className="truncate">{a.name}</Text>
                  <Text type="supporting" color="secondary" size="xsm">{a.msg}</Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Card>
      </div>
    </VStack>
  )
}

// ─── Tab Content: Today Sessions ──────────────────────────────────────────────

function ContentTodaySessions() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-gray-500">{TODAY_SESSIONS.length} sessions scheduled for today</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {TODAY_SESSIONS.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.status==="Completed"?"bg-green-400":s.status==="Pending"?"bg-yellow-400":"bg-blue-500"}`} />
                <span className="text-[13px] font-mono text-gray-500">{s.time} – {s.endTime}</span>
              </div>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLE[s.status]}`}>{s.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-semibold text-gray-600 shrink-0">
                {s.member.split(" ").map(w=>w[0]).join("")}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-900">{s.member}</p>
                <p className="text-[12px] text-gray-400">{s.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[12px] text-gray-400">{s.branch}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab Content: Weekly Schedule ────────────────────────────────────────────

function ContentWeeklySchedule() {
  const slotMap = new Map<string, WeekSlot>()
  WEEKLY_SLOTS.forEach(s => slotMap.set(`${s.day}|${s.time}`, s))

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wide text-gray-400 font-medium w-20">Time</th>
              {WEEK_DAYS.map(d => (
                <th key={d} className="text-center px-3 py-3 text-[11px] uppercase tracking-wide text-gray-500 font-semibold min-w-27.5">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(time => (
              <tr key={time} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-mono">{time}</td>
                {WEEK_DAYS.map(day => {
                  const slot = slotMap.get(`${day}|${time}`)
                  return (
                    <td key={day} className="px-2 py-2 text-center">
                      {slot ? (
                        <div className="bg-pastel-lavender border border-dopamine-violet/25 rounded-lg px-2 py-2 text-left">
                          <p className="text-[11px] font-semibold text-dopamine-violet truncate">{slot.member.split(" ")[0]}</p>
                          <p className="text-[10px] text-dopamine-violet/60 truncate">{slot.type}</p>
                        </div>
                      ) : (
                        <div className="h-10 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                          <span className="text-[10px] text-gray-300">—</span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab content renderer ─────────────────────────────────────────────────────

function TabContent({ tabId, user }: { tabId: string; user: User }) {
  switch (tabId) {
    case "dashboard":        return <ContentDashboard user={user} />
    case "staff":            return <StaffContent user={user} />
    case "members":          return <MembersContent user={user} />
    case "products":         return <ProductsContent user={user} />
    case "lessons":          return <LessonsContent user={user} />
    case "today-sessions":   return <ContentTodaySessions />
    case "weekly-schedule":  return <ContentWeeklySchedule />
    case "schedule-calendar":return <ContentWeeklySchedule />
    default:                 return <ComingSoon title={tabId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} />
  }
}

// ─── Tab helpers ──────────────────────────────────────────────────────────────

const DEFAULT_TAB: Tab = { id: "dashboard", title: "Dashboard", closable: false }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser]     = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs]     = useState<Tab[]>([DEFAULT_TAB])
  const [activeId, setActiveId] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    api.get<User>("/auth/me")
      .then(res => {
        const allowed = ["trainer", "admin", "super-admin"]
        if (!allowed.includes(res.data.role)) { router.replace("/login"); return }
        setUser(res.data)
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false))
  }, [router])

  // Sidebar items clicked from other pages (e.g. /dashboard/staff) land back
  // here with ?tab=<id> — open that tab instead of always defaulting to Dashboard.
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && tab !== "dashboard") {
      const title = tab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      openTab(tab, title)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function openTab(id: string, title: string) {
    setTabs(prev => {
      if (prev.some(t => t.id === id)) return prev
      return [...prev, { id, title, closable: true }]
    })
    setActiveId(id)
  }

  function closeTab(id: string) {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id)
      if (activeId === id) {
        // Focus the tab to the left, or dashboard
        const idx = prev.findIndex(t => t.id === id)
        const fallback = next[Math.max(0, idx - 1)]
        setActiveId(fallback?.id ?? "dashboard")
      }
      return next
    })
  }

  function closeAll() {
    setTabs([DEFAULT_TAB])
    setActiveId("dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-cream flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-dopamine-violet rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="relative flex h-screen overflow-hidden bg-white">
      <Sidebar
        activeTabId={activeId}
        openTab={openTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ${sidebarCollapsed ? "ml-16" : "ml-65"}`}>
        <Header
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        />

        {/* Tab bar */}
        <TabBar
          tabs={tabs}
          activeId={activeId}
          onSwitch={setActiveId}
          onClose={closeTab}
          onCloseAll={closeAll}
        />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <TabContent tabId={activeId} user={user} />
        </main>
      </div>
    </div>
  )
}
