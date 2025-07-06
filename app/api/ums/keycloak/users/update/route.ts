import {
  KEYCLOAK_AUTH_ENDPOINT,
  KEYCLOAK_REALM,
} from "@/app/config/setting";
import { systemConfig } from "@/app/config/systemConfig";
import { getServiceToken } from "@/lib/ums/keycloakService";

const getUserIdByEmail = async (
  email: string,
  access_token: string
): Promise<string | null> => {
  if (!access_token) return null;

  const response = await fetch(
    `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users?email=${email}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch user ID from Keycloak");
    return null;
  }

  const users = await response.json();
  return users.length > 0 ? users[0].id : null;
};

export async function PUT(req: Request) {
  try {
    const { email, username, newPassword, deselectedSystems, selectedSystems } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: true, message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const tokenInfo = await getServiceToken();
    const tokenInfoJson = await tokenInfo.json();
    const access_token = tokenInfoJson.access_token;

    if (!access_token) {
      return new Response(
        JSON.stringify({ error: true, message: "Access token not found" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = await getUserIdByEmail(email, access_token);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: true, message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const kcResponse = await fetch(
      `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          username,
          enabled: true,
          credentials: [{ type: "password", value: newPassword, temporary: false }],
        }),
      }
    );

    if (!kcResponse.ok) {
      const errorText = await kcResponse.text();

      return new Response(
        JSON.stringify({
          error: true,
          message: "Failed to update user in Keycloak",
          details: errorText,
        }),
        {
          status: kcResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }


    return new Response(
      JSON.stringify({ error: false, message: "User updated and roles unassigned successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: true, message: "Internal Server Error", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
