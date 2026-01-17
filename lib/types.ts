export type UserRole = "citizen" | "authority" | "admin"
export type IssueStatus = "submitted" | "in_progress" | "resolved"
export type IssueCategory = "road_pothole" | "water_supply" | "garbage" | "streetlight" | "sanitation" | "other"
export type Department = "road" | "water" | "sanitation" | "electrical" | "general"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  department: Department | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Issue {
  id: string
  citizen_id: string
  assigned_authority_id: string | null
  category: IssueCategory
  description: string
  photo_urls: string[]
  audio_url: string | null
  latitude: number
  longitude: number
  address: string | null
  status: IssueStatus
  priority: number
  completion_photo_url: string | null
  created_at: string
  updated_at: string
  citizen?: Profile
  authority?: Profile
}

export interface StatusLog {
  id: string
  issue_id: string
  old_status: IssueStatus | null
  new_status: IssueStatus
  remarks: string | null
  changed_by: string
  created_at: string
  changer?: Profile
}

export interface Notification {
  id: string
  user_id: string
  issue_id: string | null
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  road_pothole: "Road / Pothole",
  water_supply: "Water Supply",
  garbage: "Garbage",
  streetlight: "Streetlight",
  sanitation: "Sanitation",
  other: "Other",
}

export const STATUS_LABELS: Record<IssueStatus, string> = {
  submitted: "Submitted",
  in_progress: "In Progress",
  resolved: "Resolved",
}

export const STATUS_COLORS: Record<IssueStatus, string> = {
  submitted: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-emerald-100 text-emerald-800",
}
