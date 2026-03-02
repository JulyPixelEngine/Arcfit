export type ClassType = "PT" | "YOGA" | "PILATES" | "CROSSFIT"
export type AttendanceStatus = "ATTENDED" | "NO_SHOW" | "CANCELLED"

export interface ClassSchedule {
  id: string
  studioId: string
  classType: ClassType
  trainerId: string
  trainerName: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  createdAt: string
  updatedAt: string
}

export interface ClassScheduleCreate {
  classType: ClassType
  trainerId: string
  startTime: string
  endTime: string
  capacity: number
}

export interface Attendance {
  id: string
  scheduleId: string
  memberId: string
  memberName: string
  status: AttendanceStatus
  checkedAt?: string
  createdAt: string
  updatedAt: string
}
