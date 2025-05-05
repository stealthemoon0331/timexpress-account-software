import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createAdminTableQuery, createDatabaseQuery, createUserTableQuery } from './query';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '@/app/config/setting';

dotenv.config();

// Function to initialize the connection and create the database if not exists
const initConnection = async () => {
  try {
    // Create a connection to the MySQL server (without specifying the database yet)
    console.log('Connecting to MySQL server...');
    console.log('✨ DB_HOST:', DB_HOST);
    console.log('✨ DB_USER:', DB_USER);
    console.log('✨ DB_PASSWORD:', DB_PASSWORD);
    console.log('✨ DB_PORT:', DB_PORT);
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: process.env.DB_PORT ? parseInt(DB_PORT || "3306") : undefined,
    });

    console.log('✅ Connected to MySQL server');

    // Create the database if it doesn't exist
    await connection.query(createDatabaseQuery);

    await connection.changeUser({ database: DB_NAME });
   
    await connection.query(createUserTableQuery);

    await connection.query(createAdminTableQuery);


    // Close the initial connection after the DB is created (or ensured)
    await connection.end();
  } catch (error) {
    console.error('Error connecting to the MySQL server:', error);
  }
};
// Call the initialization function
initConnection().catch(error => {
  console.error('Failed to initialize database:', error);
});
// Create the connection pool to the specific database
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME, // Ensure you're using DB_NAME here
  port: DB_PORT ? parseInt(DB_PORT) : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
