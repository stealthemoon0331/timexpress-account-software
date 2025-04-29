import { db } from "./db"

// Log user activity
export async function logActivity(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>,
) {
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, entityType, entityId, ipAddress, userAgent, metadata ? JSON.stringify(metadata) : null],
    )

    return true
  } catch (error) {
    console.error("Error logging activity:", error)
    throw error
  }
}

// Get user activity logs
export async function getUserActivityLogs(userId: string, limit = 10, offset = 0) {
  try {
    const result = await db.query(
      `SELECT * FROM activity_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting user activity logs:", error)
    throw error
  }
}

// Get system activity logs (admin function)
export async function getSystemActivityLogs(
  limit = 50,
  offset = 0,
  filterAction?: string,
  filterEntityType?: string,
  startDate?: Date,
  endDate?: Date,
) {
  try {
    let query = `
      SELECT al.*, u.email, u.full_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `

    const queryParams = []
    let paramIndex = 1

    if (filterAction) {
      query += ` AND al.action = $${paramIndex}`
      queryParams.push(filterAction)
      paramIndex++
    }

    if (filterEntityType) {
      query += ` AND al.entity_type = $${paramIndex}`
      queryParams.push(filterEntityType)
      paramIndex++
    }

    if (startDate) {
      query += ` AND al.created_at >= $${paramIndex}`
      queryParams.push(startDate)
      paramIndex++
    }

    if (endDate) {
      query += ` AND al.created_at <= $${paramIndex}`
      queryParams.push(endDate)
      paramIndex++
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(limit, offset)

    const result = await db.query(query, queryParams)

    return result.rows
  } catch (error) {
    console.error("Error getting system activity logs:", error)
    throw error
  }
}
