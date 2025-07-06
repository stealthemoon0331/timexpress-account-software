// assign and unassign

import { KEYCLOAK_AUTH_ENDPOINT, KEYCLOAK_REALM } from "@/app/config/setting";
import { systemConfig } from "@/app/config/systemConfig";
import { getServiceToken } from "@/lib/ums/keycloakService";
import { system } from "@/lib/ums/type";
import { SwitchThumb } from "@radix-ui/react-switch";

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

async function unAssignRoleToUser(
  systems: system[],
  access_token: string,
  user_id: string
) {
  try {
    for (const system of systems || []) {
      const config = systemConfig[system];
      if (!config) {
        return {
          isError: true,
          message: `No config found for system '${system}'`,
        };
      }

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
        return {
          isError: true,
          message: `Client '${clientId}' not found`,
        };
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

      if (!role || !role.id) {
        console.warn(`Role ${roleName} not found in client ${clientId}`);
        return {
          isError: true,
          message: `⚠️ Role '${roleName}' not found in client '${clientId}'`,
        };
      }

      // Remove role from user
      const removeRoleRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users/${user_id}/role-mappings/clients/${clientUUID}`,
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
        console.warn(`Failed to unassign role ${roleName} from user`);
        return {
          isError: true,
          message: `Failed to unassign role ${roleName} from user`,
        };
      }
    }
    return {
      isError: false,
      message: "Successfully unassigned!",
    };
  } catch (error) {
    return {
      isError: true,
      message: `Server Error`,
    };
  }
}

async function assignRoleFromUser(
  systems: system[],
  access_token: string,
  user_id: string
) {
  try {
    // Assign role

    for (const system of systems || []) {
      const config = systemConfig[system];
      if (!config) {
        return {
          isError: true,
          message: `No config found for system '${system}'`,
        };
      }

      const { clientId, roleName } = config;

      // Get client UUID
      const clientRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const clientList = await clientRes.json();
      const clientUUID = clientList[0]?.id;

      if (!clientUUID) {
        return {
          isError: true,
          message: `Client '${clientId}' not found`,
        };
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

      if (!role || !role.id) {
        return {
          isError: true,
          message: `⚠️ Role '${roleName}' not found in client '${clientId}'`,
        };
      }

      // assign role to user
      const assignRoleRes = await fetch(
        `${KEYCLOAK_AUTH_ENDPOINT}/admin/realms/${KEYCLOAK_REALM}/users/${user_id}/role-mappings/clients/${clientUUID}`,
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
        console.error(
          `❌ Failed to assign role '${roleName}' for client '${clientId}'`,
          roleErr
        );
        return {
          isError: true,
          message: `Failed to assign role '${roleName}' for client '${clientId}'`,
        };
      }
    }

    return {
      isError: false,
      message: "Successfully assigned!",
    };
  } catch (error) {
    return {
      isError: true,
      message: `Server error`,
    };
  }
}

export async function PUT(req: Request) {
  try {
    const { email, isAssigned, systems } = await req.json();

    if (email === null || isAssigned === null || systems.length === 0) {
      return new Response(
        JSON.stringify({ error: true, message: "Request Error" }),
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

    const user_id = await getUserIdByEmail(email, access_token);

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: true, message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (isAssigned) {
      const response = await assignRoleFromUser(systems, access_token, user_id);
      if (!response?.isError) {
        return new Response(
          JSON.stringify({ error: false, message: response?.message }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: true, message: response?.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      const response = await unAssignRoleToUser(systems, access_token, user_id);

      if (!response?.isError) {
        return new Response(
          JSON.stringify({ error: false, message: response?.message }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: true, message: response?.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  } catch (error) {}
}
