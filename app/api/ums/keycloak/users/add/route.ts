import {
  KEYCLOAK_AUTH_ENDPOINT,
  KEYCLOAK_REALM,
} from "@/app/config/setting";
import { systemConfig } from "@/app/config/systemConfig";
import { getServiceToken } from "@/lib/ums/keycloakService";

export async function POST(req: Request) {
  try {
    const { username, email, password, selectedSystems } = await req.json();

    if (!username || !email || !password || selectedSystems.length === 0) {
      return new Response(JSON.stringify({ error: true, message: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tokenInfo = await getServiceToken();
    const tokenInfoJson = await tokenInfo.json();
    const access_token = tokenInfoJson.access_token;

    if (!access_token) {
      return new Response(JSON.stringify({ error: true, message: "Access token not found. Please check your network status." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create user
    const createUserRes = await fetch(
      `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          username,
          email,
          enabled: true,
          emailVerified: true,
          requiredActions: ["VERIFY_EMAIL"],
          credentials: [{ type: "password", value: password }],
        }),
      }
    );

    if (!createUserRes.ok) {
      const errorText = await createUserRes.text();

      return new Response(
        JSON.stringify({
          error: true,
          message: "Failed to add user to Keycloak",
          details: errorText,
        }),
        {
          status: createUserRes.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the user's UUID
    const getUserRes = await fetch(
      `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users?username=${encodeURIComponent(username)}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const userList = await getUserRes.json();
    const userId = userList[0]?.id;

    if (!userId) {
      throw new Error("User ID not found after creation.");
    }

    for (const system of selectedSystems) {
      const config = systemConfig[system];
      if (!config) {
        console.warn(`⚠️ No config found for system '${system}'`);
        continue;
      }
    
      const { clientId, roleName } = config;
    
      // 1. Get client UUID
      const getClientRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const clientList = await getClientRes.json();
      const clientUUID = clientList[0]?.id;
    
      if (!clientUUID) {
        console.warn(`⚠️ Client '${clientId}' not found`);
        continue;
      }
    
      // 2. Get role
      const getRolesRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/clients/${clientUUID}/roles/${roleName}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const role = await getRolesRes.json();
    
      if (!role || !role.id) {
        console.warn(`⚠️ Role '${roleName}' not found in client '${clientId}'`);
        continue;
      }
    
      // 3. Assign role
      const assignRoleRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/clients/${clientUUID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify([
            {
              id: role.id,
              name: role.name,
              containerId: clientUUID,
            },
          ]),
        }
      );
    
      if (!assignRoleRes.ok) {
        const roleErr = await assignRoleRes.text();
        console.error(`❌ Failed to assign role '${roleName}' for client '${clientId}'`, roleErr);
        continue;
      }
    
    }

    return new Response(
      JSON.stringify({ error: false, message: "User added and role assigned successfully" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: true, message: "Internal Keycloak Server Error", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
