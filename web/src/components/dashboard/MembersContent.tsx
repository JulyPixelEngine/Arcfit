"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Table,
  useTableFiltering,
  useTableFilterState,
  toSearchFilters,
  proportional,
} from "@astryxdesign/core/Table"
import type { TableColumn } from "@astryxdesign/core/Table"
import { usePowerSearchConfig } from "@astryxdesign/core/PowerSearch"
import type { PowerSearchFilter } from "@astryxdesign/core/PowerSearch"
import { HStack } from "@astryxdesign/core/HStack"
import { Avatar } from "@astryxdesign/core/Avatar"
import { Switch } from "@astryxdesign/core/Switch"
import { IconButton } from "@astryxdesign/core/IconButton"
import api from "@/lib/api"

interface Member {
  id: string
  branch_id: string
  trainer_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  is_active: boolean
  created_at: string
}

interface MemberRow extends Record<string, unknown> {
  id: string
  full_name: string
  email: string
  phone: string
  trainer_name: string
  is_active: boolean
  member: Member
}

interface Branch {
  id: string
  name: string
}

interface Trainer {
  id: string
  first_name: string
  last_name: string
}

interface MembersUser {
  id: string
  role: string
  branch_id?: string | null
}

const UNASSIGNED = "미배정"

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// ─── Member Form Modal ──────────────────────────────────────────────────────

interface MemberFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  trainer_id: string
}

function MemberModal({
  initial,
  trainers,
  branchId,
  onClose,
  onSaved,
}: {
  initial?: Member | null
  trainers: Trainer[]
  branchId: string
  onClose: () => void
  onSaved: (member: Member) => void
}) {
  const [form, setForm] = useState<MemberFormData>({
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    trainer_id: initial?.trainer_id ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function set<K extends keyof MemberFormData>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError("이름과 이메일은 필수입니다.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const body = {
        branch_id: branchId,
        trainer_id: form.trainer_id || null,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
      }
      const res = initial
        ? await api.put<Member>(`/members/${initial.id}`, body)
        : await api.post<Member>("/members", body)
      onSaved(res.data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof msg === "string" ? msg : "저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-semibold text-gray-900">{initial ? "회원 정보 수정" : "회원 등록"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">성 *</label>
              <input
                type="text" value={form.last_name} onChange={set("last_name")}
                className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">이름 *</label>
              <input
                type="text" value={form.first_name} onChange={set("first_name")}
                className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">이메일 *</label>
            <input
              type="email" value={form.email} onChange={set("email")}
              placeholder="member@example.com"
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">연락처</label>
            <input
              type="text" value={form.phone} onChange={set("phone")}
              placeholder="010-0000-0000"
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
            />
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">담당 트레이너</label>
            <select
              value={form.trainer_id} onChange={set("trainer_id")}
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
            >
              <option value="">{UNASSIGNED}</option>
              {trainers.map((t) => <option key={t.id} value={t.id}>{t.last_name}{t.first_name}</option>)}
            </select>
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 h-10 text-[13px] border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 h-10 text-[13px] bg-black text-white rounded-lg hover:opacity-85 disabled:opacity-40 transition-opacity"
            >
              {loading ? "저장 중..." : initial ? "수정 저장" : "회원 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

export default function MembersContent({ user }: { user: MembersUser }) {
  const [members, setMembers] = useState<Member[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState(user.branch_id ?? "")
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"create" | Member | null>(null)

  useEffect(() => {
    api.get<Branch[]>("/branches").then((r) => {
      setBranches(r.data)
      setSelectedBranchId((prev) => prev || r.data[0]?.id || "")
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedBranchId) { setLoading(false); return }
    api.get<Trainer[]>(`/trainers?branch_id=${selectedBranchId}`).then((r) => setTrainers(r.data)).catch(() => {})

    setLoading(true)
    api.get<Member[]>(`/members?branch_id=${selectedBranchId}`)
      .then((r) => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedBranchId])

  function handleSaved(member: Member) {
    setMembers((prev) => {
      const exists = prev.find((m) => m.id === member.id)
      if (exists) return prev.map((m) => m.id === member.id ? member : m)
      return [member, ...prev]
    })
    setModal(null)
  }

  async function toggleActive(member: Member) {
    const path = member.is_active ? "deactivate" : "activate"
    try {
      const res = await api.patch<Member>(`/members/${member.id}/${path}`)
      setMembers((prev) => prev.map((m) => m.id === member.id ? res.data : m))
    } catch {
      alert("상태 변경에 실패했습니다.")
    }
  }

  const trainerName = (id: string | null) => {
    if (!id) return UNASSIGNED
    const t = trainers.find((tr) => tr.id === id)
    return t ? `${t.last_name}${t.first_name}` : "-"
  }

  const rows: MemberRow[] = useMemo(() => members.map((m) => ({
    id: m.id,
    full_name: `${m.last_name}${m.first_name}`,
    email: m.email,
    phone: m.phone ?? "-",
    trainer_name: trainerName(m.trainer_id),
    is_active: m.is_active,
    member: m,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [members, trainers])

  const fieldDefs = useMemo(() => ([
    { key: "full_name", type: "string", label: "이름" },
    { key: "phone", type: "string", label: "연락처" },
    {
      key: "trainer_name",
      type: "enum",
      label: "담당 트레이너",
      enumValues: [
        { value: UNASSIGNED, label: UNASSIGNED },
        ...trainers.map((t) => ({ value: `${t.last_name}${t.first_name}`, label: `${t.last_name}${t.first_name}` })),
      ],
    },
  ] as const), [trainers])

  const { config, applyFilters } = usePowerSearchConfig(fieldDefs)
  const { filters, onFilterChange } = useTableFilterState()

  const filterPlugin = useTableFiltering<MemberRow>({
    filters,
    onFilterChange,
    searchConfig: config,
    variant: "inline",
  })

  const columns: TableColumn<MemberRow>[] = useMemo(() => [
    {
      key: "full_name",
      header: "회원",
      width: proportional(1.4),
      filter: "full_name",
      renderCell: (row) => (
        <HStack gap={2} align="center">
          <Avatar name={row.full_name} size="small" />
          <span className="font-medium text-gray-800">{row.full_name}</span>
        </HStack>
      ),
    },
    { key: "phone", header: "연락처", width: proportional(1), filter: "phone" },
    { key: "trainer_name", header: "담당 트레이너", width: proportional(1), filter: "trainer_name" },
    {
      key: "is_active",
      header: "Active",
      width: proportional(0.6),
      align: "center",
      renderCell: (row) => (
        <HStack justify="center">
          <Switch
            label="Active"
            isLabelHidden
            value={row.is_active}
            changeAction={() => toggleActive(row.member)}
          />
        </HStack>
      ),
    },
    {
      key: "actions",
      header: "",
      width: proportional(0.5),
      align: "end",
      renderCell: (row) => (
        <IconButton label="수정" icon={<IconEdit />} variant="ghost" size="sm" onClick={() => setModal(row.member)} />
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  const data = applyFilters(
    toSearchFilters(filters, columns, config) as PowerSearchFilter[],
    rows,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-gray-900">회원 목록</h2>
        {(!user.branch_id && branches.length > 1) && (
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="h-9 px-3 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-dopamine-violet transition-colors"
          >
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <button
          onClick={() => setModal("create")}
          disabled={!selectedBranchId}
          className="ml-auto flex items-center gap-2 px-4 h-9 bg-black text-white text-[13px] rounded-lg hover:opacity-85 disabled:opacity-40 transition-opacity"
        >
          <IconPlus />
          회원 등록
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 text-[13px]">Loading...</div>
      ) : (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={{ filter: filterPlugin }}
          density="compact"
          dividers="rows"
          hasHover
        />
      )}

      {modal && selectedBranchId && (
        <MemberModal
          initial={modal === "create" ? null : modal}
          trainers={trainers}
          branchId={selectedBranchId}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
