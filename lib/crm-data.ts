// CRM Types
export type ContactStatus = "lead" | "prospect" | "customer" | "churned"
export type DealStage = "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
export type ActivityType = "call" | "email" | "meeting" | "note" | "task"
export type Priority = "low" | "medium" | "high"

export interface Contact {
  id: string
  name: string
  email: string
  company: string
  role: string
  phone: string
  status: ContactStatus
  lastContact: string
  avatar: string
  notes: string
}

export interface Deal {
  id: string
  title: string
  amount: number
  stage: DealStage
  probability: number
  contactId: string
  expectedCloseDate: string | null
  createdAt: string
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  contactId: string
  dealId: string | null
  dueDate: string | null
  completed: boolean
  createdAt: string
}

// Utility functions
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 0) return `In ${Math.abs(diffDays)} days`
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function getContactName(contactId: string, contacts: Contact[]): string {
  return contacts.find((c) => c.id === contactId)?.name ?? ""
}

export const stageLabels: Record<DealStage, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
}
