import {
    KEYCLOAK_AUTH_ENDPOINT,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_PASSWORD,
    KEYCLOAK_REALM,
    KEYCLOAK_USERNAME,
  } from "@/app/config/setting";
  
  export async function POST(req: Request) {
    try {

      const { refresh_token } = await req.json();

      if (!refresh_token) {
        return new Response(
          JSON.stringify({ error: true, message: "Missing refresh_token" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const params = new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        username: KEYCLOAK_USERNAME,
        password: KEYCLOAK_PASSWORD,
        refresh_token,
        grant_type: "refresh_token",
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
  
      return new Response(
        JSON.stringify({
          error: false,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
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
  