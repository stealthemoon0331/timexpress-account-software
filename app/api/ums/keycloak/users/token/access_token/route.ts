import {
    KEYCLOAK_AUTH_ENDPOINT,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_PASSWORD,
    KEYCLOAK_REALM,
    KEYCLOAK_USERNAME,
  } from "@/app/config/setting";
  
  export async function GET() {
    try {
      const params = new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        username: KEYCLOAK_USERNAME,
        password: KEYCLOAK_PASSWORD,
        grant_type: "password",
      });
  
      const response = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok || data.error) {
        return new Response(
          JSON.stringify({
            error: true,
            message: data.error_description || "Failed to get token from Keycloak",
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(JSON.stringify({ error: false, token: data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Token request failed:", error);
      return new Response(
        JSON.stringify({ error: true, message: "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
  