"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

const PRODUCT_TYPES = [
  { value: "MEMBERSHIP", label: "회원권" },
  { value: "PERSONAL_LESSON", label: "개인 레슨" },
  { value: "LOCKER", label: "락커 상품" },
  { value: "EQUIPMENT", label: "운동 용품" },
] as const

const PASS_TYPES = [
  { value: "PERIOD", label: "기간제" },
  { value: "COUNT", label: "횟수제" },
] as const

const PRODUCT_TYPE_LABEL: Record<string, string> = Object.fromEntries(PRODUCT_TYPES.map((p) => [p.value, p.label]))

interface ClassType {
  id: string
  name: string
}

interface Product {
  id: string
  branch_id: string
  name: string
  product_type: string
  pass_type: string
  category: string | null
  duration_months: number | null
  service_extra_days: number
  session_count: number | null
  pause_allowed_days: number
  pause_min_days: number
  price: number
  description: string | null
  is_active: boolean
  created_at: string
}

interface Branch {
  id: string
  name: string
}

interface ProductsUser {
  id: string
  role: string
  branch_id?: string | null
}

const ADMIN_ROLES = ["admin", "super-admin"]

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

// ─── Product Form Modal (admin only) ───────────────────────────────────────────

interface ProductFormData {
  name: string
  product_type: string
  pass_type: string
  category: string
  duration_months: string
  service_extra_days: string
  session_count: string
  pause_allowed_days: string
  pause_min_days: string
  price: string
  description: string
}

function ProductModal({
  initial,
  branchId,
  onClose,
  onSaved,
}: {
  initial?: Product | null
  branchId: string
  onClose: () => void
  onSaved: (product: Product) => void
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: initial?.name ?? "",
    product_type: initial?.product_type ?? "MEMBERSHIP",
    pass_type: initial?.pass_type ?? "PERIOD",
    category: initial?.category ?? "",
    duration_months: initial?.duration_months?.toString() ?? "",
    service_extra_days: initial?.service_extra_days?.toString() ?? "0",
    session_count: initial?.session_count?.toString() ?? "",
    pause_allowed_days: initial?.pause_allowed_days?.toString() ?? "0",
    pause_min_days: initial?.pause_min_days?.toString() ?? "0",
    price: initial?.price?.toString() ?? "",
    description: initial?.description ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [classTypes, setClassTypes] = useState<ClassType[]>([])

  useEffect(() => {
    if (!branchId) return
    api.get<ClassType[]>(`/class-types?branch_id=${branchId}`).then((r) => setClassTypes(r.data)).catch(() => {})
  }, [branchId])

  function set<K extends keyof ProductFormData>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const isPeriod = form.pass_type === "PERIOD"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.price.trim()) {
      setError("상품명과 금액은 필수입니다.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const body = {
        branch_id: branchId,
        name: form.name,
        product_type: form.product_type,
        pass_type: form.pass_type,
        category: form.category || null,
        duration_months: isPeriod && form.duration_months ? Number(form.duration_months) : null,
        service_extra_days: isPeriod ? Number(form.service_extra_days || 0) : 0,
        session_count: !isPeriod && form.session_count ? Number(form.session_count) : null,
        pause_allowed_days: Number(form.pause_allowed_days || 0),
        pause_min_days: Number(form.pause_min_days || 0),
        price: Number(form.price),
        description: form.description || null,
      }
      const res = initial
        ? await api.put<Product>(`/products/${initial.id}`, body)
        : await api.post<Product>("/products", body)
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-semibold text-gray-900">{initial ? "상품 정보 수정" : "상품 등록"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">상품 유형 *</label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((pt) => (
                <label
                  key={pt.value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer transition-colors ${
                    form.product_type === pt.value
                      ? "border-dopamine-violet bg-pastel-lavender text-dopamine-violet"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio" name="product_type" className="hidden"
                    checked={form.product_type === pt.value}
                    onChange={() => setForm((prev) => ({ ...prev, product_type: pt.value }))}
                  />
                  {pt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">이용권 유형 *</label>
            <div className="flex flex-wrap gap-2">
              {PASS_TYPES.map((pt) => (
                <label
                  key={pt.value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer transition-colors ${
                    form.pass_type === pt.value
                      ? "border-dopamine-violet bg-pastel-lavender text-dopamine-violet"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio" name="pass_type" className="hidden"
                    checked={form.pass_type === pt.value}
                    onChange={() => setForm((prev) => ({ ...prev, pass_type: pt.value }))}
                  />
                  {pt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">이용권 카테고리</label>
            <div className="flex flex-wrap gap-2">
              {classTypes.map((ct) => (
                <label
                  key={ct.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border cursor-pointer transition-colors ${
                    form.category === ct.name
                      ? "border-dopamine-violet bg-pastel-lavender text-dopamine-violet"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio" name="category" className="hidden"
                    checked={form.category === ct.name}
                    onChange={() => setForm((prev) => ({ ...prev, category: ct.name }))}
                  />
                  {ct.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">상품명 *</label>
            <input
              type="text" value={form.name} onChange={set("name")}
              placeholder="예: 헬스 12개월권"
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              required
            />
          </div>

          {isPeriod ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">기간 (개월) *</label>
                <input
                  type="number" min="1" value={form.duration_months} onChange={set("duration_months")}
                  placeholder="12"
                  className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">서비스 기간 (일)</label>
                <input
                  type="number" min="0" value={form.service_extra_days} onChange={set("service_extra_days")}
                  className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">횟수 *</label>
              <input
                type="number" min="1" value={form.session_count} onChange={set("session_count")}
                placeholder="10"
                className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">정지 가능일</label>
              <input
                type="number" min="0" value={form.pause_allowed_days} onChange={set("pause_allowed_days")}
                className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">최소 정지 가능일</label>
              <input
                type="number" min="0" value={form.pause_min_days} onChange={set("pause_min_days")}
                className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">금액 (원) *</label>
            <input
              type="number" min="0" value={form.price} onChange={set("price")}
              placeholder="1200000"
              className="w-full h-10 px-3 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-wide text-gray-500 mb-1.5">상품 설명</label>
            <textarea
              value={form.description} onChange={set("description")}
              placeholder="상품의 특징, 이용 방법, 유의사항 등"
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-dopamine-violet transition-colors resize-none"
            />
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
              {loading ? "저장 중..." : initial ? "수정 저장" : "상품 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

export default function ProductsContent({ user }: { user: ProductsUser }) {
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState(user.branch_id ?? "")
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"create" | Product | null>(null)

  useEffect(() => {
    api.get<Branch[]>("/branches").then((r) => {
      setBranches(r.data)
      setSelectedBranchId((prev) => prev || r.data[0]?.id || "")
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedBranchId) { setLoading(false); return }
    setLoading(true)
    api.get<Product[]>(`/products?branch_id=${selectedBranchId}`)
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedBranchId])

  function handleSaved(product: Product) {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) return prev.map((p) => p.id === product.id ? product : p)
      return [product, ...prev]
    })
    setModal(null)
  }

  const isAdmin = ADMIN_ROLES.includes(user.role)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-gray-900">상품 목록</h2>
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
            className="ml-auto flex items-center gap-2 px-4 h-9 bg-black text-white text-[13px] rounded-lg hover:opacity-85 disabled:opacity-40 transition-opacity"
          >
            <IconPlus />
            상품 등록
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["상품명", "유형", "이용권", "카테고리", "기간/횟수", "금액", "상태", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-wide text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-gray-400">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-gray-400">등록된 상품이 없습니다</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{p.name}</td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{PRODUCT_TYPE_LABEL[p.product_type] ?? p.product_type}</td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{p.pass_type === "PERIOD" ? "기간제" : "횟수제"}</td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{p.category ?? "-"}</td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                    {p.pass_type === "PERIOD" ? `${p.duration_months ?? "-"}개월` : `${p.session_count ?? "-"}회`}
                  </td>
                  <td className="px-5 py-3.5 text-gray-800 whitespace-nowrap">{p.price.toLocaleString()}원</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${p.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => setModal(p)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-dopamine-violet hover:bg-pastel-lavender transition-colors"
                      >
                        <IconEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && selectedBranchId && (
        <ProductModal
          initial={modal === "create" ? null : modal}
          branchId={selectedBranchId}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
