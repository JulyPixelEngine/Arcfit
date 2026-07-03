"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

const ADMIN_ROLES = ["admin", "super-admin"]

interface ClassType {
  id: string
  name: string
}

interface TrainerLevel {
  id: string
  name: string
}

interface Trainer {
  id: string
  branch_id: string
  additional_branch_ids: string[]
  first_name: string
  last_name: string
  email: string
  phone: string | null
  trainer_level: string
  class_permissions: string[]
  is_active: boolean
  has_login: boolean
  created_at: string
}

interface Branch {
  id: string
  name: string
}

interface StaffUser {
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

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

// ─── Staff Form Modal (admin only) ─────────────────────────────────────────────

interface StaffFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  trainer_level: string
  branch_id: string
  additional_branch_ids: string[]
  class_permissions: string[]
}

function StaffModal({
  initial,
  branches,
  defaultBranchId,
  onClose,
  onSaved,
}: {
  initial?: Trainer | null
  branches: Branch[]
  defaultBranchId: string
  onClose: () => void
  onSaved: (trainer: Trainer) => void
}) {
  const [form, setForm] = useState<StaffFormData>({
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    password: "",
    trainer_level: initial?.trainer_level ?? "",
    branch_id: initial?.branch_id ?? defaultBranchId,
    additional_branch_ids: initial?.additional_branch_ids ?? [],
    class_permissions: initial?.class_permissions ?? [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [trainerLevels, setTrainerLevels] = useState<TrainerLevel[]>([])

  // Class types / trainer levels are branch-scoped — refetch whenever the
  // selected primary branch changes.
  useEffect(() => {
    if (!form.branch_id) return
    api.get<ClassType[]>(`/class-types?branch_id=${form.branch_id}`).then((r) => setClassTypes(r.data)).catch(() => {})
    api.get<TrainerLevel[]>(`/trainer-levels?branch_id=${form.branch_id}`).then((r) => {
      setTrainerLevels(r.data)
      setForm((prev) => (prev.trainer_level ? prev : { ...prev, trainer_level: r.data[0]?.name ?? "" }))
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.branch_id])

  function set<K extends keyof StaffFormData>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function toggleClassPermission(type: string) {
    setForm((prev) => ({
      ...prev,
      class_permissions: prev.class_permissions.includes(type)
        ? prev.class_permissions.filter((t) => t !== type)
        : [...prev.class_permissions, type],
    }))
  }

  function toggleAdditionalBranch(branchId: string) {
    setForm((prev) => ({
      ...prev,
      additional_branch_ids: prev.additional_branch_ids.includes(branchId)
        ? prev.additional_branch_ids.filter((b) => b !== branchId)
        : [...prev.additional_branch_ids, branchId],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.branch_id) {
      setError("이름, 이메일, 소속 지점은 필수입니다.")
      return
    }
    if (!initial && !form.password.trim()) {
      setError("로그인 비밀번호는 필수입니다.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const body = {
        branch_id: form.branch_id,
        additional_branch_ids: form.additional_branch_ids,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        trainer_level: form.trainer_level,
        class_permissions: form.class_permissions,
        ...(form.password.trim() ? { password: form.password } : {}),
      }
      const res = initial
        ? await api.put<Trainer>(`/trainers/${initial.id}`, body)
        : await api.post<Trainer>("/trainers", body)
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-semibold text-gray-900">{initial ? "직원 정보 수정" : "직원 등록"}</h2>
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
              placeholder="trainer@example.com"
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">
              로그인 비밀번호 {initial ? "(변경 시에만 입력)" : "*"}
            </label>
            <input
              type="password" value={form.password} onChange={set("password")}
              placeholder={initial && initial.has_login ? "••••••••" : "새 비밀번호"}
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              required={!initial}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">연락처</label>
              <input
                type="text" value={form.phone} onChange={set("phone")}
                placeholder="010-0000-0000"
                className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">등급</label>
              <select
                value={form.trainer_level} onChange={set("trainer_level")}
                className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              >
                {trainerLevels.map((lvl) => <option key={lvl.id} value={lvl.name}>{lvl.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">소속 지점(주) *</label>
            <select
              value={form.branch_id} onChange={set("branch_id")}
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              required
            >
              <option value="">선택하세요</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {branches.length > 1 && (
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">추가로 근무 가능한 지점</label>
              <div className="flex flex-wrap gap-2">
                {branches.filter((b) => b.id !== form.branch_id).map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer transition-colors ${
                      form.additional_branch_ids.includes(b.id)
                        ? "border-dopamine-violet bg-pastel-lavender text-dopamine-violet"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.additional_branch_ids.includes(b.id)}
                      onChange={() => toggleAdditionalBranch(b.id)}
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">수업 권한</label>
            <div className="flex flex-wrap gap-2">
              {classTypes.map((ct) => (
                <label
                  key={ct.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer transition-colors ${
                    form.class_permissions.includes(ct.name)
                      ? "border-dopamine-violet bg-pastel-lavender text-dopamine-violet"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.class_permissions.includes(ct.name)}
                    onChange={() => toggleClassPermission(ct.name)}
                  />
                  {ct.name}
                </label>
              ))}
            </div>
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
              {loading ? "저장 중..." : initial ? "수정 저장" : "직원 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

export default function StaffContent({ user }: { user: StaffUser }) {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState(user.branch_id ?? "")
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"create" | Trainer | null>(null)

  useEffect(() => {
    api.get<Branch[]>("/branches").then((r) => {
      setBranches(r.data)
      // Platform admins have no home branch — default to the first branch so the page isn't stuck empty.
      setSelectedBranchId((prev) => prev || r.data[0]?.id || "")
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedBranchId) { setLoading(false); return }
    setLoading(true)
    api.get<Trainer[]>(`/trainers?branch_id=${selectedBranchId}`)
      .then((r) => setTrainers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedBranchId])

  function handleSaved(trainer: Trainer) {
    setTrainers((prev) => {
      const exists = prev.find((t) => t.id === trainer.id)
      if (exists) return prev.map((t) => t.id === trainer.id ? trainer : t)
      return [trainer, ...prev]
    })
    setModal(null)
  }

  async function handleToggleActive(trainer: Trainer) {
    try {
      const res = await api.put<Trainer>(`/trainers/${trainer.id}`, { is_active: !trainer.is_active })
      setTrainers((prev) => prev.map((t) => (t.id === trainer.id ? res.data : t)))
    } catch {
      // ignore
    }
  }

  async function handleDelete(trainerId: string) {
    if (!window.confirm("직원을 삭제하시겠습니까?")) return
    try {
      await api.delete(`/trainers/${trainerId}`)
      setTrainers((prev) => prev.filter((t) => t.id !== trainerId))
    } catch {
      // ignore
    }
  }

  const isAdmin = ADMIN_ROLES.includes(user.role)
  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-wide text-gray-400 mb-1">Staff</p>
          <h1 className="text-[22px] font-semibold text-gray-900">직원 목록</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Branch scope selector — a user tied to one branch just sees that branch;
              platform admins (no branch_id) can switch between all branches. */}
          {(!user.branch_id && branches.length > 1) && (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="h-9 px-3 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-dopamine-violet transition-colors"
            >
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          {isAdmin && (
            <button
              onClick={() => setModal("create")}
              disabled={!selectedBranchId}
              className="flex items-center gap-2 px-4 h-9 bg-black text-white text-[13px] rounded-lg hover:opacity-85 disabled:opacity-40 transition-opacity"
            >
              <IconPlus />
              직원 등록
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 text-[13px]">Loading...</div>
      ) : trainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-[14px]">등록된 직원이 없습니다</p>
          {isAdmin && (
            <button
              onClick={() => setModal("create")}
              className="mt-4 text-[13px] text-dopamine-violet hover:opacity-70 transition-colors"
            >
              첫 번째 직원 등록하기 →
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["이름", "등급", "이메일", "연락처", "소속 지점", "수업 권한", "상태", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-wide text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{t.last_name}{t.first_name}</td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize">{t.trainer_level}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {t.email}
                      {!t.has_login && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 whitespace-nowrap">
                          로그인 미설정
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{t.phone ?? "-"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {[t.branch_id, ...t.additional_branch_ids].map((bid) => (
                          <span key={bid} className="text-[11px] px-2 py-0.5 rounded-full bg-pastel-sky text-dopamine-sky whitespace-nowrap">
                            {branchName(bid)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {t.class_permissions.map((c) => (
                          <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-pastel-lavender text-dopamine-violet whitespace-nowrap">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isAdmin ? (
                        <button
                          onClick={() => handleToggleActive(t)}
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                            t.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {t.is_active ? "Active" : "Inactive"}
                        </button>
                      ) : (
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${t.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                          {t.is_active ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModal(t)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-dopamine-violet hover:bg-pastel-lavender transition-colors"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && selectedBranchId && (
        <StaffModal
          initial={modal === "create" ? null : modal}
          branches={branches}
          defaultBranchId={selectedBranchId}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
