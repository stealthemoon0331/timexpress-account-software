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

    // Unassign roles
    for (const system of deselectedSystems || []) {
      const config = systemConfig[system];
      if (!config) continue;

      const { clientId, roleName } = config;

      // Fetch client UUID
      const clientRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const clients = await clientRes.json();
      const clientUUID = clients[0]?.id;

      if (!clientUUID) {
        console.warn(`Client not found for system ${system}`);
        continue;
      }

      // Fetch role info
      const roleRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/clients/${clientUUID}/roles/${roleName}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const role = await roleRes.json();

      if (!role?.id) {
        console.warn(`Role ${roleName} not found in client ${clientId}`);
        continue;
      }

      // Remove role from user
      const removeRoleRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/clients/${clientUUID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify([{ id: role.id, name: role.name }]),
        }
      );

      if (!removeRoleRes.ok) {
        console.warn(`Failed to remove role ${roleName} from user`);
      } else {
        console.log(`✅ Unassigned role '${roleName}' for system '${system}'`);
      }
    }

    for (const system of selectedSystems || []) {
      const config = systemConfig[system];
      if (!config) {
        console.warn(`⚠️ No config found for system '${system}'`);
        continue;
      }
    
      const { clientId, roleName } = config;
    
      // Get client UUID
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
    
      // Get role
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
    
      // Assign role
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
