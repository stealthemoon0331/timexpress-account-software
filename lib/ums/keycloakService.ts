import {
  KEYCLOAK_AUTH_ENDPOINT,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  KEYCLOAK_PASSWORD,
  KEYCLOAK_REALM,
  KEYCLOAK_USERNAME,
} from "@/app/config/setting";

export async function getServiceToken() {
  try {
    const params = new URLSearchParams();

    params.append("client_id", KEYCLOAK_CLIENT_ID);
    params.append("client_secret", KEYCLOAK_CLIENT_SECRET);
    params.append("username", KEYCLOAK_USERNAME);
    params.append("password", KEYCLOAK_PASSWORD);
    params.append("grant_type", "password");
    // params.append("grant_type", "client_credentials");

    //   params.append("scope", 'openid profile email ums-scope');
    console.log("Fetching token from:", `${KEYCLOAK_AUTH_ENDPOINT}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`);


    const response = await fetch(
      `${KEYCLOAK_AUTH_ENDPOINT}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}



