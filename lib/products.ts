import { db } from "./db"
import type { Product } from "../database/schema"

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const result = await db.query("SELECT * FROM products WHERE is_active = true ORDER BY name")

    return result.rows
  } catch (error) {
    console.error("Error getting all products:", error)
    throw error
  }
}

// Get user products
export async function getUserProducts(userId: string) {
  try {
    const result = await db.query(
      `SELECT p.*, up.access_level, up.usage_limit, up.usage_count
       FROM products p
       JOIN user_products up ON p.id = up.product_id
       WHERE up.user_id = $1 AND p.is_active = true
       ORDER BY p.name`,
      [userId],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting user products:", error)
    throw error
  }
}

// Track product usage
export async function trackProductUsage(userId: string, productId: number) {
  try {
    await db.query(
      `UPDATE user_products 
       SET usage_count = usage_count + 1, 
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId],
    )

    // Get updated usage
    const result = await db.query(
      "SELECT usage_count, usage_limit FROM user_products WHERE user_id = $1 AND product_id = $2",
      [userId, productId],
    )

    if (result.rows.length > 0) {
      const { usage_count, usage_limit } = result.rows[0]

      // If usage is approaching limit (80% or more), create notification
      if (usage_limit && usage_count >= usage_limit * 0.8) {
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message) 
           VALUES ($1, $2, $3, $4)`,
          [
            userId,
            "usage",
            "Usage Limit Approaching",
            `You've used ${usage_count} of your ${usage_limit} allocated usage for this product.`,
          ],
        )
      }

      return { usage_count, usage_limit }
    }

    return null
  } catch (error) {
    console.error("Error tracking product usage:", error)
    throw error
  }
}

// Get product usage statistics
export async function getProductUsageStats(userId: string) {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, up.usage_count, up.usage_limit,
              CASE WHEN up.usage_limit IS NULL OR up.usage_limit = 0 
                   THEN 0 
                   ELSE (up.usage_count::float / up.usage_limit) * 100 
              END as usage_percentage
       FROM products p
       JOIN user_products up ON p.id = up.product_id
       WHERE up.user_id = $1 AND p.is_active = true
       ORDER BY p.name`,
      [userId],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting product usage stats:", error)
    throw error
  }
}
