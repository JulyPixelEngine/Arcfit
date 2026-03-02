export type PaymentStatus = "PENDING" | "APPROVED" | "CANCELLED" | "PARTIAL_REFUND" | "FULL_REFUND"
export type PaymentMethod = "CARD" | "VIRTUAL_ACCOUNT" | "EASY_PAY" | "CASH"

export interface Payment {
  id: string
  studioId: string
  memberId: string
  memberName: string
  membershipId?: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  pgTransactionId: string      // Toss Payments orderId
  pgApprovalNumber?: string    // 승인번호
  cardLastFour?: string        // 카드 뒤 4자리만 저장
  paidAt?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentCreate {
  memberId: string
  membershipId?: string
  amount: number
  paymentMethod: PaymentMethod
  pgTransactionId: string
  pgApprovalNumber?: string
  cardLastFour?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}
