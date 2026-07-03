"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

const ADMIN_ROLES = ["admin", "super-admin"]

interface LookupItem {
  id: string
  branch_id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
}

interface Branch {
  id: string
  name: string
}

interface LessonsUser {
  id: string
  role: string
  branch_id?: string | null
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

// ─── Reusable lookup-table editor ──────────────────────────────────────────────

function LookupTable({
  title,
  endpoint,
  branchId,
  isAdmin,
}: {
  title: string
  endpoint: string
  branchId: string
  isAdmin: boolean
}) {
  const [items, setItems] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  function load() {
    if (!branchId) { setLoading(false); return }
    setLoading(true)
    api.get<LookupItem[]>(`${endpoint}?branch_id=${branchId}`)
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [endpoint, branchId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await api.post<LookupItem>(endpoint, {
        branch_id: branchId,
        name: newName.trim(),
        sort_order: items.length,
      })
      setItems((prev) => [...prev, res.data])
      setNewName("")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof msg === "string" ? msg : "추가에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) { setEditingId(null); return }
    try {
      const res = await api.put<LookupItem>(`${endpoint}/${id}`, { name: editingName.trim() })
      setItems((prev) => prev.map((it) => (it.id === id ? res.data : it)))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof msg === "string" ? msg : "수정에 실패했습니다.")
    } finally {
      setEditingId(null)
    }
  }

  async function handleToggleActive(item: LookupItem) {
    try {
      const res = await api.put<LookupItem>(`${endpoint}/${item.id}`, { is_active: !item.is_active })
      setItems((prev) => prev.map((it) => (it.id === item.id ? res.data : it)))
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("삭제하시겠습니까?")) return
    try {
      await api.delete(`${endpoint}/${id}`)
      setItems((prev) => prev.filter((it) => it.id !== id))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof msg === "string" ? msg : "삭제에 실패했습니다.")
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 min-w-[320px]">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[14px] font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="px-5 py-10 text-center text-[13px] text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-gray-400">등록된 항목이 없습니다</div>
        ) : items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
            {editingId === item.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRename(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(item.id)
                  if (e.key === "Escape") setEditingId(null)
                }}
                className="flex-1 h-8 px-2 text-[13.5px] border border-dopamine-violet rounded-md focus:outline-none"
              />
            ) : (
              <button
                onClick={() => { if (isAdmin) { setEditingId(item.id); setEditingName(item.name) } }}
                className={`flex-1 text-left text-[13.5px] ${item.is_active ? "text-gray-800" : "text-gray-350 line-through"} ${isAdmin ? "hover:text-dopamine-violet cursor-text" : "cursor-default"}`}
              >
                {item.name}
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                    item.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <IconTrash />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="새 항목 이름"
            className="flex-1 h-9 px-3 text-[13.5px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-dopamine-violet transition-colors"
          />
          <button
            type="submit"
            disabled={saving || !newName.trim()}
            className="flex items-center gap-1.5 px-3 h-9 bg-black text-white text-[13px] rounded-lg hover:opacity-85 disabled:opacity-40 transition-opacity"
          >
            <IconPlus />
            추가
          </button>
        </form>
      )}

      {error && <p className="px-5 pb-3 text-[12.5px] text-red-500">{error}</p>}
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

export default function LessonsContent({ user }: { user: LessonsUser }) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState(user.branch_id ?? "")

  useEffect(() => {
    api.get<Branch[]>("/branches").then((r) => {
      setBranches(r.data)
      setSelectedBranchId((prev) => prev || r.data[0]?.id || "")
    }).catch(() => {})
  }, [])

  const isAdmin = ADMIN_ROLES.includes(user.role)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-gray-900">수업 · 트레이너 등급 설정</h2>
        {(!user.branch_id && branches.length > 1) && (
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="h-9 px-3 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-dopamine-violet transition-colors"
          >
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {!isAdmin && (
        <p className="text-[12.5px] text-gray-400">항목 추가·수정·삭제는 관리자만 가능합니다.</p>
      )}

      {selectedBranchId && (
        <div className="flex flex-wrap gap-4">
          <LookupTable title="수업 종류" endpoint="/class-types" branchId={selectedBranchId} isAdmin={isAdmin} />
          <LookupTable title="트레이너 등급" endpoint="/trainer-levels" branchId={selectedBranchId} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  )
}
