
export const FMS_API_PATH = process.env.NEXT_PUBLIC_FMS_API_PATH || "http://localhost:4015";
export const CRM_API_PATH = process.env.NEXT_PUBLIC_CRM_API_PATH || "http://localhost:4016";
export const WMS_API_PATH = process.env.NEXT_PUBLIC_WMS_API_PATH || "http://localhost:4011";
export const TMS_API_PATH = process.env.NEXT_PUBLIC_TMS_API_PATH || "http://localhost:5566";

/**
 * Keycloak Config
 */
export const KEYCLOAK_AUTH_ENDPOINT = process.env.NEXT_PUBLIC_KEYCLOAK_AUTH_ENDPOINT || "";
export const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "";
export const KEYCLOAK_CLIENT_SECRET = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || "";
export const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "";
export const KEYCLOAK_USERNAME = process.env.NEXT_PUBLIC_KEYCLOAK_USERNAME || "";
export const KEYCLOAK_PASSWORD = process.env.NEXT_PUBLIC_KEYCLOAK_PASSWORD || "";
export const KEYCLOAK_WMS_UUID = process.env.NEXT_PUBLIC_KEYCLOAK_WMS_UUID || "";
export const KEYCLOAK_WMS_ACCESS_ROLE_UUID=process.env.NEXT_PUBLIC_KEYCLOAK_WMS_ACCESS_UUID || "";

export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT;

