"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import StaffContent from "@/components/dashboard/StaffContent"
import api from "@/lib/api"

interface CurrentUser {
  id: string
  name?: string
  email: string
  role: string
  branch_id?: string | null
}

export default function StaffPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    api.get<CurrentUser>("/auth/me")
      .then((res) => setCurrentUser(res.data))
      .catch(() => router.replace("/login"))
  }, [router])

  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeTabId=""
        openTab={(id) => router.push(`/dashboard?tab=${id}`)}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
      <div className="flex-1 flex flex-col min-w-0 ml-65">
        <Header user={currentUser} />
        <main className="flex-1 overflow-y-auto p-6">
          <StaffContent user={currentUser} />
        </main>
      </div>
    </div>
  )
}
