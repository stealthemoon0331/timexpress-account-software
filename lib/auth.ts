import { db } from "./db"
import { compare, hash } from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import type { User } from "../database/schema"

// Register a new user
export async function registerUser(email: string, password: string, fullName: string): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return null // User already exists
    }

    // Hash the password
    const passwordHash = await hash(password, 10)

    // Generate verification token
    const verificationToken = uuidv4()
    const verificationTokenExpiresAt = new Date()
    verificationTokenExpiresAt.setHours(verificationTokenExpiresAt.getHours() + 24) // 24 hours from now

    // Insert the new user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, verification_token, verification_token_expires_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [email, passwordHash, fullName, verificationToken, verificationTokenExpiresAt],
    )

    // Assign default role
    await db.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2))", [
      result.rows[0].id,
      "user",
    ])

    // Create free trial subscription
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30) // 30 days from now

    await db.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, starts_at, trial_ends_at) 
       VALUES ($1, (SELECT id FROM subscription_plans WHERE name = $2), $3, $4, $5)`,
      [result.rows[0].id, "Free Trial", "trial", new Date(), trialEndsAt],
    )

    // Grant access to all products
    const products = await db.query("SELECT id FROM products WHERE is_active = true")
    for (const product of products.rows) {
      await db.query("INSERT INTO user_products (user_id, product_id) VALUES ($1, $2)", [result.rows[0].id, product.id])
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Verify user email
export async function verifyEmail(token: string): Promise<boolean> {
  try {
    const result = await db.query(
      `UPDATE users 
       SET email_verified = true, 
           verification_token = NULL, 
           verification_token_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE verification_token = $1 
         AND verification_token_expires_at > CURRENT_TIMESTAMP
       RETURNING id`,
      [token],
    )

    return result.rows.length > 0
  } catch (error) {
    console.error("Error verifying email:", error)
    throw error
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return null // User not found
    }

    const user = result.rows[0]
    const passwordMatch = await compare(password, user.password_hash)

    if (!passwordMatch) {
      return null // Password doesn't match
    }

    // Update last login time
    await db.query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1", [user.id])

    // Log activity
    await db.query("INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)", [user.id, "user.login"])

    return user
  } catch (error) {
    console.error("Error logging in user:", error)
    throw error
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<boolean> {
  try {
    // Generate reset token
    const resetToken = uuidv4()
    const resetTokenExpiresAt = new Date()
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1) // 1 hour from now

    const result = await db.query(
      `UPDATE users 
       SET reset_password_token = $1, 
           reset_password_token_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $3
       RETURNING id`,
      [resetToken, resetTokenExpiresAt, email],
    )

    return result.rows.length > 0
  } catch (error) {
    console.error("Error requesting password reset:", error)
    throw error
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    // Hash the new password
    const passwordHash = await hash(newPassword, 10)

    const result = await db.query(
      `UPDATE users 
       SET password_hash = $1, 
           reset_password_token = NULL, 
           reset_password_token_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE reset_password_token = $2 
         AND reset_password_token_expires_at > CURRENT_TIMESTAMP
       RETURNING id`,
      [passwordHash, token],
    )

    if (result.rows.length > 0) {
      // Log activity
      await db.query("INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)", [
        result.rows[0].id,
        "user.password_reset",
      ])

      return true
    }

    return false
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}

// Social login
export async function socialLogin(
  provider: string,
  providerUserId: string,
  email: string,
  fullName: string,
  accessToken: string,
): Promise<User> {
  try {
    // Check if social account exists
    const socialAccount = await db.query(
      "SELECT * FROM social_accounts WHERE provider = $1 AND provider_user_id = $2",
      [provider, providerUserId],
    )

    if (socialAccount.rows.length > 0) {
      // Get user
      const user = await db.query("SELECT * FROM users WHERE id = $1", [socialAccount.rows[0].user_id])

      // Update access token
      await db.query(
        "UPDATE social_accounts SET provider_access_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [accessToken, socialAccount.rows[0].id],
      )

      // Update last login time
      await db.query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1", [user.rows[0].id])

      // Log activity
      await db.query("INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)", [
        user.rows[0].id,
        `user.login.${provider}`,
      ])

      return user.rows[0]
    }

    // Check if user with email exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email])

    let userId

    if (existingUser.rows.length > 0) {
      // User exists, link social account
      userId = existingUser.rows[0].id
    } else {
      // Create new user
      const newUser = await db.query(
        `INSERT INTO users (email, password_hash, full_name, email_verified) 
         VALUES ($1, $2, $3, true) 
         RETURNING *`,
        [email, await hash(uuidv4(), 10), fullName],
      )

      userId = newUser.rows[0].id

      // Assign default role
      await db.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2))", [
        userId,
        "user",
      ])

      // Create free trial subscription
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 30) // 30 days from now

      await db.query(
        `INSERT INTO subscriptions (user_id, plan_id, status, starts_at, trial_ends_at) 
         VALUES ($1, (SELECT id FROM subscription_plans WHERE name = $2), $3, $4, $5)`,
        [userId, "Free Trial", "trial", new Date(), trialEndsAt],
      )

      // Grant access to all products
      const products = await db.query("SELECT id FROM products WHERE is_active = true")
      for (const product of products.rows) {
        await db.query("INSERT INTO user_products (user_id, product_id) VALUES ($1, $2)", [userId, product.id])
      }
    }

    // Create social account
    await db.query(
      `INSERT INTO social_accounts (user_id, provider, provider_user_id, provider_access_token) 
       VALUES ($1, $2, $3, $4)`,
      [userId, provider, providerUserId, accessToken],
    )

    // Log activity
    await db.query("INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)", [userId, `user.login.${provider}`])

    // Get user
    const user = await db.query("SELECT * FROM users WHERE id = $1", [userId])

    return user.rows[0]
  } catch (error) {
    console.error("Error with social login:", error)
    throw error
  }
}
