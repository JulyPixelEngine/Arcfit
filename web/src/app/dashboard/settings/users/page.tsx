"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import api from "@/lib/api"

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  branch_id: string | null
  is_active: boolean
  provider: string
  created_at: string
}

interface Branch {
  id: string
  name: string
}

interface CurrentUser {
  id: string
  name?: string
  email: string
  role: string
}

const ROLES = ["user", "trainer", "admin", "super-admin"]

const ROLE_COLORS: Record<string, string> = {
  "super-admin": "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  trainer: "bg-green-100 text-green-700",
  user: "bg-gray-100 text-gray-600",
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ─── Role Change Dropdown ─────────────────────────────────────────────────────

function RoleDropdown({ userId, currentRole, onChanged }: { userId: string; currentRole: string; onChanged: (role: string) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  async function changeRole(role: string) {
    setLoading(true)
    setOpen(false)
    try {
      await api.patch(`/admin/users/${userId}/role`, { role })
      onChanged(role)
    } catch {
      alert("역할 변경에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium transition-opacity ${ROLE_COLORS[currentRole] ?? "bg-gray-100 text-gray-600"} ${loading ? "opacity-50" : "hover:opacity-80"}`}
      >
        {currentRole}
        <IconChevronDown />
      </button>

      {open && (
        <div className="absolute top-8 left-0 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => changeRole(r)}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors ${r === currentRole ? "font-semibold text-blue-600" : "text-gray-700"}`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<CurrentUser>("/auth/me")
      .then((res) => {
        if (!["admin", "super-admin"].includes(res.data.role)) {
          router.replace("/dashboard")
          return
        }
        setCurrentUser(res.data)
      })
      .catch(() => router.replace("/login"))
  }, [router])

  useEffect(() => {
    api.get<Branch[]>("/branches").then((r) => setBranches(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!currentUser) return
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (roleFilter) params.set("role", roleFilter)
    api.get<User[]>(`/admin/users?${params}`)
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentUser, search, roleFilter])

  function handleRoleChanged(userId: string, newRole: string) {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
  }

  async function toggleActive(user: User) {
    try {
      const endpoint = user.is_active ? "deactivate" : "activate"
      const res = await api.patch<User>(`/admin/users/${user.id}/${endpoint}`)
      setUsers((prev) => prev.map((u) => u.id === user.id ? res.data : u))
    } catch {
      alert("상태 변경에 실패했습니다.")
    }
  }

  function getBranchName(branchId: string | null) {
    if (!branchId) return "—"
    return branches.find((b) => b.id === branchId)?.name ?? branchId.slice(0, 8)
  }

  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeTabId="settings-users" openTab={() => {}} />
      <div className="flex-1 flex flex-col min-w-0 ml-65">
        <Header user={currentUser} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page header */}
          <div className="mb-6">
            <p className="text-[12px] uppercase tracking-wide text-gray-400 mb-1">Settings</p>
            <h1 className="text-[22px] font-semibold text-gray-900">User Management</h1>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
              <input
                type="text"
                placeholder="이름 또는 이메일 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 text-gray-700"
            >
              <option value="">전체 역할</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <p className="text-[13px] text-gray-400 ml-auto">총 {users.length}명</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Name", "Email", "Phone", "Role", "Branch", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400 text-[13px]">
                        Loading...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400 text-[13px]">
                        검색 결과가 없습니다
                      </td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600 flex-shrink-0">
                            {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{u.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3.5 text-gray-500">{u.phone ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <RoleDropdown
                          userId={u.id}
                          currentRole={u.role}
                          onChanged={(role) => handleRoleChanged(u.id, role)}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{getBranchName(u.branch_id)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${u.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleActive(u)}
                          className={`text-[12px] px-3 py-1 rounded-md border transition-colors ${u.is_active ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
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
