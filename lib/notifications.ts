import { db } from "./db"

// Get user notifications
export async function getUserNotifications(userId: string, limit = 10, offset = 0) {
  try {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )

    // Get unread count
    const unreadCountResult = await db.query(
      "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
      [userId],
    )

    return {
      notifications: result.rows,
      unreadCount: Number.parseInt(unreadCountResult.rows[0].count),
    }
  } catch (error) {
    console.error("Error getting user notifications:", error)
    throw error
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: number) {
  try {
    await db.query("UPDATE notifications SET is_read = true WHERE id = $1", [notificationId])

    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await db.query("UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false", [userId])

    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Create notification
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, any>,
) {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, metadata) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, metadata ? JSON.stringify(metadata) : null],
    )

    return true
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}
