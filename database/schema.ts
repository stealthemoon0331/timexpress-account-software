// TypeScript types for the database schema

// User
export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string
  bio?: string
  email_verified: boolean
  verification_token?: string
  verification_token_expires_at?: Date
  reset_password_token?: string
  reset_password_token_expires_at?: Date
  created_at: Date
  updated_at: Date
  last_login_at?: Date
}

// Role
export interface Role {
  id: number
  name: string
  description?: string
}

// User Role Assignment
export interface UserRole {
  user_id: string
  role_id: number
}

// Social Account
export interface SocialAccount {
  id: number
  user_id: string
  provider: string
  provider_user_id: string
  provider_access_token?: string
  provider_refresh_token?: string
  token_expires_at?: Date
  created_at: Date
  updated_at: Date
}

// Subscription Plan
export interface SubscriptionPlan {
  id: number
  name: string
  description?: string
  price_monthly: number
  price_annual: number
  features: Record<string, any>
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Subscription
export interface Subscription {
  id: string
  user_id: string
  plan_id: number
  status: "active" | "canceled" | "expired" | "trial"
  trial_ends_at?: Date
  starts_at: Date
  ends_at?: Date
  canceled_at?: Date
  created_at: Date
  updated_at: Date
}

// Payment Method
export interface PaymentMethod {
  id: string
  user_id: string
  type: "credit_card" | "paypal" | "payfort"
  provider: "stripe" | "paypal" | "payfort"
  is_default: boolean
  details: Record<string, any>
  created_at: Date
  updated_at: Date
}

// Transaction
export interface Transaction {
  id: string
  user_id: string
  subscription_id?: string
  payment_method_id?: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  provider: "stripe" | "paypal" | "payfort"
  provider_transaction_id?: string
  description?: string
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

// Invoice
export interface Invoice {
  id: string
  user_id: string
  transaction_id?: string
  invoice_number: string
  amount: number
  tax_amount: number
  total_amount: number
  status: "draft" | "issued" | "paid" | "void"
  due_date?: Date
  paid_at?: Date
  billing_address?: Record<string, any>
  created_at: Date
  updated_at: Date
}

// Product
export interface Product {
  id: number
  name: string
  description?: string
  icon_path?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// User Product Access
export interface UserProduct {
  user_id: string
  product_id: number
  access_level: "standard" | "premium" | "admin"
  usage_limit?: number
  usage_count: number
  created_at: Date
  updated_at: Date
}

// Activity Log
export interface ActivityLog {
  id: number
  user_id: string
  action: string
  entity_type?: string
  entity_id?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at: Date
}

// Notification
export interface Notification {
  id: number
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  metadata?: Record<string, any>
  created_at: Date
}

// System Setting
export interface Setting {
  key: string
  value?: string
  description?: string
  updated_at: Date
}
