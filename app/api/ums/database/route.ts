import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/ums/database/connector";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" }); // Return 405 if method is not GET
  }

  try {
    const connection = await pool.getConnection();

    // Create the users table if it doesn’t exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    connection.release(); // No need for `await` on release

    return res.status(200).json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Database initialization error:", error);
    return res.status(500).json({ error: "Database initialization failed" });
  }
}
