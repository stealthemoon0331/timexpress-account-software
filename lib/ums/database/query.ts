import { DB_NAME } from "@/app/config/setting";

export const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`;
export const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        tenant_id VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        mobile VARCHAR(255),
        fms_user_id INT,
        selected_systems VARCHAR(255),
        fms_branch VARCHAR(255),
        fms_user_role_id INT,
        wms_user_id INT,
        wms_user_role_id INT,
        crm_user_id INT,
        crm_user_role_id INT,
        tms_user_id INT,
        tms_user_role_id INT,
        ams_user_id INT,
        ams_user_role_id VARCHAR(255),
        qcms_user_id INT,
        qcms_user_role_id VARCHAR(255),
        access VARCHAR(255),
        teams VARCHAR(255),
        systems_with_permission VARCHAR(255),
        status INT,
        adminId VARCHAR(255)
      );
    `;

export const createAdminTableQuery = `
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
      `;
