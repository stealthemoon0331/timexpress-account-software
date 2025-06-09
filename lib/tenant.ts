import { nanoid } from "nanoid";

export const registerTenantId = async (email: string) => {
  const tenantId = nanoid();

  try {
    const response = await fetch("/api/user/register-tenant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        tenantId: tenantId,
      }),
    });

    if (response.ok) {
      const resData = await response.json();

      console.log("*** resData ***", resData);

      return {
        error: false,
        tenantId: resData.tenantId,
      };
    } else {
      throw new Error("Failed tenant Id registeration");
    }
  } catch (error) {
    return {
      error: true,
      errorMessage: "Failed register",
    };
  }
};

export const checkIfHasTenant = async (email: string) => {
  try {
    const response = await fetch(`/api/user/register-tenant?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const tenantId = (await response.json()).data;
      console.log("*** tenantId *** ", tenantId);
      return {
        error: false,
        data: tenantId
      }
    } else {
      throw new Error("Failed Tenant Check");
    }
  } catch (error) {
    console.error("error : ", error);
    return {
        error: true,
        errorMessage: error || "Failed Tenant Check",
        data: null
    }
  }
};
