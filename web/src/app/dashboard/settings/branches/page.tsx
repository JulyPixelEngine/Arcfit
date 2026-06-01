"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import api from "@/lib/api"

interface Branch {
  id: string
  name: string
  address: string
  phone: string | null
  description: string | null
  created_at: string
}

interface CurrentUser {
  id: string
  name?: string
  email: string
  role: string
}

// Kakao Postcode API type
declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: { oncomplete: (data: { address: string; zonecode: string }) => void }) => { open: () => void }
    }
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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

function IconLocation() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// ─── Branch Form Modal ────────────────────────────────────────────────────────

interface BranchFormData {
  name: string
  address: string
  phone: string
  description: string
}

interface BranchModalProps {
  initial?: Branch | null
  onClose: () => void
  onSaved: (branch: Branch) => void
}

function BranchModal({ initial, onClose, onSaved }: BranchModalProps) {
  const [form, setForm] = useState<BranchFormData>({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    description: initial?.description ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function set(field: keyof BranchFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function openAddressSearch() {
    if (!window.daum?.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.")
      return
    }
    new window.daum.Postcode({
      oncomplete(data) {
        setForm((prev) => ({ ...prev, address: data.address }))
      },
    }).open()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim()) {
      setError("지점명과 주소는 필수입니다.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const body = {
        name: form.name,
        address: form.address,
        phone: form.phone || null,
        description: form.description || null,
      }
      const res = initial
        ? await api.put<Branch>(`/branches/${initial.id}`, body)
        : await api.post<Branch>("/branches", body)
      onSaved(res.data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? "저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {initial ? "지점 수정" : "새 지점 등록"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">지점명 *</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="예: 강남점"
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
              required
            />
          </div>

          {/* Address with search */}
          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">주소 *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.address}
                onChange={set("address")}
                placeholder="주소를 검색하거나 직접 입력"
                className="flex-1 h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                required
              />
              <button
                type="button"
                onClick={openAddressSearch}
                className="flex items-center gap-1.5 px-3 h-10 text-[13px] bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                <IconLocation />
                주소 검색
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">전화번호</label>
            <input
              type="text"
              value={form.phone}
              onChange={set("phone")}
              placeholder="02-1234-5678"
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">설명</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="지점 소개 (선택)"
              rows={3}
              className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 text-[13px] border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 text-[13px] bg-black text-white rounded-lg hover:opacity-85 disabled:opacity-40 transition-opacity"
            >
              {loading ? "저장 중..." : initial ? "수정 저장" : "지점 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchManagementPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"create" | Branch | null>(null)
  const kakaoLoaded = useRef(false)

  // Load Kakao Postcode script once
  useEffect(() => {
    if (kakaoLoaded.current) return
    const script = document.createElement("script")
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    script.async = true
    document.head.appendChild(script)
    kakaoLoaded.current = true
  }, [])

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

  function fetchBranches() {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    api.get<Branch[]>(`/branches${params}`)
      .then((r) => setBranches(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!currentUser) return
    fetchBranches()
  }, [currentUser, search])

  async function handleDelete(branch: Branch) {
    if (!confirm(`"${branch.name}" 지점을 삭제하시겠습니까?`)) return
    try {
      await api.delete(`/branches/${branch.id}`)
      setBranches((prev) => prev.filter((b) => b.id !== branch.id))
    } catch {
      alert("삭제에 실패했습니다.")
    }
  }

  function handleSaved(saved: Branch) {
    setBranches((prev) => {
      const exists = prev.find((b) => b.id === saved.id)
      if (exists) return prev.map((b) => b.id === saved.id ? saved : b)
      return [saved, ...prev]
    })
    setModal(null)
  }

  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeTabId="settings-branches" openTab={() => {}} />
      <div className="flex-1 flex flex-col min-w-0 ml-65">
        <Header user={currentUser} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page header */}
          <div className="mb-6">
            <p className="text-[12px] uppercase tracking-wide text-gray-400 mb-1">Settings</p>
            <h1 className="text-[22px] font-semibold text-gray-900">Branch Management</h1>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-[320px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
              <input
                type="text"
                placeholder="지점명 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>
            <p className="text-[13px] text-gray-400">총 {branches.length}개</p>
            <button
              onClick={() => setModal("create")}
              className="ml-auto flex items-center gap-2 px-4 h-9 bg-black text-white text-[13px] rounded-lg hover:opacity-85 transition-opacity"
            >
              <IconPlus />
              새 지점 등록
            </button>
          </div>

          {/* Branch cards grid */}
          {loading ? (
            <div className="flex justify-center py-20 text-gray-400 text-[13px]">Loading...</div>
          ) : branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-[14px]">등록된 지점이 없습니다</p>
              <button
                onClick={() => setModal("create")}
                className="mt-4 text-[13px] text-blue-500 hover:text-blue-700 transition-colors"
              >
                첫 번째 지점 등록하기 →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-900">{branch.name}</h3>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        {new Date(branch.created_at).toLocaleDateString("ko-KR")} 등록
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setModal(branch)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(branch)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-[13px]">
                    <div className="flex items-start gap-2 text-gray-600">
                      <IconLocation />
                      <span className="leading-tight">{branch.address}</span>
                    </div>
                    {branch.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {branch.phone}
                      </div>
                    )}
                    {branch.description && (
                      <p className="text-gray-400 text-[12px] mt-2 line-clamp-2">{branch.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <BranchModal
          initial={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
