export interface Member {
  id: string
  studioId: string
  name: string
  phone: string
  email?: string
  birthDate?: string
  gender?: "MALE" | "FEMALE"
  healthNotes?: string
  createdAt: string
  updatedAt: string
}

export interface MemberCreate {
  name: string
  phone: string
  email?: string
  birthDate?: string
  gender?: "MALE" | "FEMALE"
  healthNotes?: string
}

export interface MemberUpdate {
  name?: string
  phone?: string
  email?: string
  birthDate?: string
  gender?: "MALE" | "FEMALE"
  healthNotes?: string
}

export type MembershipType = "SESSION" | "PERIOD" | "MONTHLY" | "DROPIN"

export interface Membership {
  id: string
  memberId: string
  studioId: string
  type: MembershipType
  totalSessions?: number
  remainingSessions?: number
  startDate: string
  endDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
