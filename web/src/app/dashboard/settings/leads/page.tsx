"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import api from "@/lib/api"

interface Lead {
  id: string
  studio_name: string
  owner_name: string
  email: string
  phone: string | null
  message: string | null
  status: string
  created_at: string
}

interface CurrentUser {
  id: string
  name?: string
  email: string
  role: string
}

const STATUSES = ["new", "contacted", "onboarded", "dismissed"] as const

const STATUS_LABEL: Record<string, string> = {
  new: "신규",
  contacted: "연락함",
  onboarded: "온보딩 완료",
  dismissed: "보류",
}

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue-50 text-blue-600",
  contacted: "bg-amber-50 text-amber-600",
  onboarded: "bg-green-50 text-green-600",
  dismissed: "bg-gray-100 text-gray-500",
}

export default function LeadsManagementPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<CurrentUser>("/auth/me")
      .then((res) => {
        if (res.data.role !== "super-admin") {
          router.replace("/dashboard")
          return
        }
        setCurrentUser(res.data)
      })
      .catch(() => router.replace("/login"))
  }, [router])

  useEffect(() => {
    if (!currentUser) return
    api.get<Lead[]>("/leads")
      .then((r) => setLeads(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentUser])

  async function handleStatusChange(lead: Lead, status: string) {
    try {
      const res = await api.patch<Lead>(`/leads/${lead.id}/status`, { status })
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? res.data : l)))
    } catch {
      alert("상태 변경에 실패했습니다.")
    }
  }

  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeTabId="settings-leads"
        openTab={(id) => router.push(`/dashboard?tab=${id}`)}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
      <div className="flex-1 flex flex-col min-w-0 ml-65">
        <Header user={currentUser} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <p className="text-[12px] uppercase tracking-wide text-gray-400 mb-1">Settings</p>
            <h1 className="text-[22px] font-semibold text-gray-900">가입 문의 (Leads)</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["센터명", "담당자", "연락처", "메시지", "상태", "접수일"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-wide text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-gray-400">Loading...</td></tr>
                  ) : leads.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-gray-400">접수된 문의가 없습니다</td></tr>
                  ) : leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors align-top">
                      <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{lead.studio_name}</td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {lead.owner_name}
                        <div className="text-[11px] text-gray-400">{lead.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{lead.phone ?? "-"}</td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[280px]">
                        <span className="line-clamp-2">{lead.message ?? "-"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead, e.target.value)}
                          className={`text-[12px] font-medium px-2 py-1 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-dopamine-violet ${STATUS_STYLE[lead.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
