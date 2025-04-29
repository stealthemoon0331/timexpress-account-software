import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Create a Drizzle ORM instance
export const db = drizzle(pool)

// Function to test the database connection
export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()")
    console.log("Database connection successful:", result.rows[0].now)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Close the pool when the application shuts down
process.on("SIGINT", () => {
  pool.end()
  process.exit(0)
})
