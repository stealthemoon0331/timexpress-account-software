import { db } from "./db"
import { hash } from "bcrypt"
import { v4 as uuidv4 } from "uuid"

// Get all users (with pagination)
export async function getAllUsers(page = 1, limit = 10, searchTerm = "", statusFilter = "all") {
  try {
    let query = `
      SELECT u.*, 
             s.status as subscription_status, 
             sp.name as plan_name,
             (SELECT COUNT(*) FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id AND r.name = 'admin') > 0 as is_admin
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status != 'canceled'
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE 1=1
    `

    const queryParams = []
    let paramIndex = 1

    if (searchTerm) {
      query += ` AND (u.email ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`
      queryParams.push(`%${searchTerm}%`)
      paramIndex++
    }

    if (statusFilter !== "all") {
      query += ` AND (s.status = $${paramIndex} OR (s.status IS NULL AND $${paramIndex} = 'inactive'))`
      queryParams.push(statusFilter)
      paramIndex++
    }

    // Add pagination
    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(limit, (page - 1) * limit)

    const result = await db.query(query, queryParams)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status != 'canceled'
      WHERE 1=1
    `

    const countParams = []
    paramIndex = 1

    if (searchTerm) {
      countQuery += ` AND (u.email ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`
      countParams.push(`%${searchTerm}%`)
      paramIndex++
    }

    if (statusFilter !== "all") {
      countQuery += ` AND (s.status = $${paramIndex} OR (s.status IS NULL AND $${paramIndex} = 'inactive'))`
      countParams.push(statusFilter)
    }

    const countResult = await db.query(countQuery, countParams)
    const totalCount = Number.parseInt(countResult.rows[0].count)

    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

// Create user (admin function)
export async function createUser(email: string, password: string, fullName: string, isAdmin = false) {
  try {
    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return null // User already exists
    }

    // Hash the password
    const passwordHash = await hash(password, 10)

    // Insert the new user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, email_verified) 
       VALUES ($1, $2, $3, true) 
       RETURNING *`,
      [email, passwordHash, fullName],
    )

    // Assign role
    await db.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2))", [
      result.rows[0].id,
      "user",
    ])

    // If admin, assign admin role
    if (isAdmin) {
      await db.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2))", [
        result.rows[0].id,
        "admin",
      ])
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Update user (admin function)
export async function updateUser(userId: string, data: { email?: string; fullName?: string; isAdmin?: boolean }) {
  try {
    let query = "UPDATE users SET "
    const queryParams = []
    let paramIndex = 1

    if (data.email) {
      query += `email = $${paramIndex}, `
      queryParams.push(data.email)
      paramIndex++
    }

    if (data.fullName) {
      query += `full_name = $${paramIndex}, `
      queryParams.push(data.fullName)
      paramIndex++
    }

    query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`
    queryParams.push(userId)

    const result = await db.query(query, queryParams)

    // Handle admin role if specified
    if (data.isAdmin !== undefined) {
      // Remove existing admin role
      await db.query(
        `DELETE FROM user_roles 
         WHERE user_id = $1 AND role_id = (SELECT id FROM roles WHERE name = 'admin')`,
        [userId],
      )

      // Add admin role if needed
      if (data.isAdmin) {
        await db.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2))",
          [userId, "admin"],
        )
      }
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Reset user password (admin function)
export async function resetUserPassword(userId: string) {
  try {
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await hash(tempPassword, 10)

    await db.query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      passwordHash,
      userId,
    ])

    // Log activity
    await db.query("INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)", [
      userId,
      "user.password_reset_admin",
      "user",
      userId,
    ])

    return tempPassword
  } catch (error) {
    console.error("Error resetting user password:", error)
    throw error
  }
}

// Change user subscription (admin function)
export async function changeUserSubscription(userId: string, planId: number) {
  try {
    // Get current subscription
    const currentSubscription = await db.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status != 'canceled'
       ORDER BY created_at DESC LIMIT 1`,
      [userId],
    )

    if (currentSubscription.rows.length > 0) {
      // Cancel current subscription
      await db.query(
        `UPDATE subscriptions 
         SET status = 'canceled', 
             canceled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [currentSubscription.rows[0].id],
      )
    }

    // Create new subscription
    const startsAt = new Date()
    let endsAt = null

    // Get plan details
    const plan = await db.query("SELECT * FROM subscription_plans WHERE id = $1", [planId])

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
      "subscription.change_admin",
      "subscription",
      result.rows[0].id,
    ])

    return result.rows[0]
  } catch (error) {
    console.error("Error changing user subscription:", error)
    throw error
  }
}

// Get system statistics
export async function getSystemStats() {
  try {
    // Total users
    const totalUsersResult = await db.query("SELECT COUNT(*) FROM users")
    const totalUsers = Number.parseInt(totalUsersResult.rows[0].count)

    // Active subscriptions by plan
    const subscriptionsResult = await db.query(`
      SELECT sp.name, COUNT(*) as count
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.status != 'canceled'
      GROUP BY sp.name
    `)

    // Revenue stats
    const revenueResult = await db.query(`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_transactions,
        MAX(created_at) as last_transaction_date
      FROM transactions
      WHERE status = 'completed'
    `)

    // Recent signups
    const recentSignupsResult = await db.query(`
      SELECT id, email, full_name, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `)

    return {
      totalUsers,
      subscriptions: subscriptionsResult.rows,
      revenue: revenueResult.rows[0],
      recentSignups: recentSignupsResult.rows,
    }
  } catch (error) {
    console.error("Error getting system stats:", error)
    throw error
  }
}
