import { db } from "./db"
import { v4 as uuidv4 } from "uuid"
import type { Subscription, Transaction } from "../database/schema"

// Get user subscription
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const result = await db.query(
      `SELECT s.*, p.name as plan_name, p.price_monthly, p.price_annual, p.features
       FROM subscriptions s
       JOIN subscription_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error("Error getting user subscription:", error)
    throw error
  }
}

// Change subscription plan
export async function changeSubscriptionPlan(userId: string, planId: number): Promise<Subscription> {
  try {
    // Get current subscription
    const currentSubscription = await getUserSubscription(userId)

    if (currentSubscription) {
      // Cancel current subscription
      await db.query(
        `UPDATE subscriptions 
         SET status = 'canceled', 
             canceled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [currentSubscription.id],
      )
    }

    // Get plan details
    const plan = await db.query("SELECT * FROM subscription_plans WHERE id = $1", [planId])

    if (plan.rows.length === 0) {
      throw new Error("Subscription plan not found")
    }

    // Create new subscription
    const startsAt = new Date()
    let endsAt = null

    // If annual plan, set end date to 1 year from now
    if (plan.rows[0].name === "Annual") {
      endsAt = new Date()
      endsAt.setFullYear(endsAt.getFullYear() + 1)
    }
    // If monthly plan, set end date to 1 month from now
    else if (plan.rows[0].name === "Monthly") {
      endsAt = new Date()
      endsAt.setMonth(endsAt.getMonth() + 1)
    }

    const result = await db.query(
      `INSERT INTO subscriptions (id, user_id, plan_id, status, starts_at, ends_at) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [uuidv4(), userId, planId, "active", startsAt, endsAt],
    )

    // Log activity
    await db.query("INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)", [
      userId,
      "subscription.change",
      "subscription",
      result.rows[0].id,
    ])

    return result.rows[0]
  } catch (error) {
    console.error("Error changing subscription plan:", error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const result = await db.query(
      `UPDATE subscriptions 
       SET status = 'canceled', 
           canceled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING user_id`,
      [subscriptionId],
    )

    if (result.rows.length > 0) {
      // Log activity
      await db.query("INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)", [
        result.rows[0].user_id,
        "subscription.cancel",
        "subscription",
        subscriptionId,
      ])

      return true
    }

    return false
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw error
  }
}

// Process subscription payment
export async function processSubscriptionPayment(
  userId: string,
  subscriptionId: string,
  paymentMethodId: string,
  amount: number,
  provider: string,
  providerTransactionId?: string,
): Promise<Transaction> {
  try {
    // Create transaction
    const transactionId = uuidv4()
    const result = await db.query(
      `INSERT INTO transactions (
         id, user_id, subscription_id, payment_method_id, amount, status, provider, provider_transaction_id, description
       ) VALUES ($1, $2, $3, $4,  amount, status, provider, provider_transaction_id, description
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        transactionId,
        userId,
        subscriptionId,
        paymentMethodId,
        amount,
        "completed",
        provider,
        providerTransactionId,
        "Subscription payment",
      ],
    )

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}`
    await db.query(
      `INSERT INTO invoices (
         id, user_id, transaction_id, invoice_number, amount, tax_amount, total_amount, status, paid_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [uuidv4(), userId, transactionId, invoiceNumber, amount, 0, amount, "paid", new Date()],
    )

    // Log activity
    await db.query("INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)", [
      userId,
      "payment.processed",
      "transaction",
      transactionId,
    ])

    // Create notification
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES ($1, $2, $3, $4)`,
      [userId, "payment", "Payment Successful", `Your payment of $${amount} has been processed successfully.`],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error processing subscription payment:", error)
    throw error
  }
}

// Get user payment methods
export async function getUserPaymentMethods(userId: string) {
  try {
    const result = await db.query("SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC", [userId])

    return result.rows
  } catch (error) {
    console.error("Error getting user payment methods:", error)
    throw error
  }
}

// Add payment method
export async function addPaymentMethod(
  userId: string,
  type: string,
  provider: string,
  details: Record<string, any>,
  isDefault = false,
) {
  try {
    // If this is the default payment method, unset any existing default
    if (isDefault) {
      await db.query("UPDATE payment_methods SET is_default = false WHERE user_id = $1", [userId])
    }

    const result = await db.query(
      `INSERT INTO payment_methods (id, user_id, type, provider, details, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [uuidv4(), userId, type, provider, JSON.stringify(details), isDefault],
    )

    // Log activity
    await db.query("INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)", [
      userId,
      "payment_method.add",
      "payment_method",
      result.rows[0].id,
    ])

    return result.rows[0]
  } catch (error) {
    console.error("Error adding payment method:", error)
    throw error
  }
}

// Get user transactions
export async function getUserTransactions(userId: string) {
  try {
    const result = await db.query(
      `SELECT t.*, i.invoice_number 
       FROM transactions t
       LEFT JOIN invoices i ON t.id = i.transaction_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting user transactions:", error)
    throw error
  }
}

// Get user invoices
export async function getUserInvoices(userId: string) {
  try {
    const result = await db.query(
      `SELECT i.*, t.amount as transaction_amount, t.provider
       FROM invoices i
       LEFT JOIN transactions t ON i.transaction_id = t.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
      [userId],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting user invoices:", error)
    throw error
  }
}
