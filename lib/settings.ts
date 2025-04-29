import { db } from "./db"

// Get all settings
export async function getAllSettings() {
  try {
    const result = await db.query("SELECT * FROM settings")

    // Convert to key-value object
    const settings: Record<string, string> = {}
    result.rows.forEach((row) => {
      settings[row.key] = row.value
    })

    return settings
  } catch (error) {
    console.error("Error getting all settings:", error)
    throw error
  }
}

// Get setting by key
export async function getSetting(key: string) {
  try {
    const result = await db.query("SELECT value FROM settings WHERE key = $1", [key])

    return result.rows.length > 0 ? result.rows[0].value : null
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    throw error
  }
}

// Update setting
export async function updateSetting(key: string, value: string) {
  try {
    await db.query(
      `INSERT INTO settings (key, value, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [key, value],
    )

    return true
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error)
    throw error
  }
}
