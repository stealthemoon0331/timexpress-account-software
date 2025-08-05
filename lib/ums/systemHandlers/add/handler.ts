import {
  CRM_API_PATH,
  FMS_API_PATH,
  TMS_API_PATH,
  WMS_API_PATH,
  AMS_API_PATH,
  QCMS_API_PATH,
  TSMS_API_PATH,
  TDMS_API_PATH,
  HR_API_PATH,
  USLM_API_PATH,
  CHATESS_API_PATH,
} from "@/app/config/setting";
import { systemRoles } from "@/lib/ums/data";
import { system } from "@/lib/ums/type";
import { getRoleName } from "@/lib/ums/utils";

interface RegistrationParams {
  ssoUser: any;
  roleId: number | string;
  accessToken?: string;
  selectedAccess?: any;
  system: system;
}

// ✅ Utility to safely parse JSON
const safeParseJSON = async (response: Response) => {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn("❌ Failed to parse response JSON:", err);
    return null;
  }
};

// ✅ Generic handler for API responses
const handleAPIResponse = async (
  system: system,
  response: Response,
  fallbackMessage: string
) => {
  const data = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: `${system} : ` + data?.message || fallbackMessage,
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data,
  };
};

export async function registerUserToFMS({
  ssoUser,
  roleId,
  accessToken,
  system,
}: RegistrationParams) {
  const payload = {
    name: ssoUser.name,
    username: ssoUser.username,
    password: ssoUser.password,
    email: ssoUser.email,
    phone: ssoUser.phone,
    branch: ssoUser.fms_branch,
    roleId: roleId,
    tenantId: ssoUser.tenant_id,
    status: 1,
  };

  const response = await fetch(`${FMS_API_PATH}/api/adduser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return await handleAPIResponse(system, response, "Failed to register user");
}

export async function registerUserToCRM({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    name: ssoUser.name,
    username: ssoUser.username,
    email: ssoUser.email,
    password: ssoUser.password,
    phone: ssoUser.phone,
    mobile: ssoUser.mobile,
    role_id: roleId,
    tenant_id: ssoUser.tenant_id,
    status: 1,
  };

  try {
    const userRes = await fetch(`${CRM_API_PATH}/api/users/adduser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const userData = await safeParseJSON(userRes);
    if (!userRes.ok) {
      throw new Error(userData?.message || "CRM user registration failed");
    }

    const salesPayload = {
      name: ssoUser.name,
      username: ssoUser.username,
      email: ssoUser.email,
      password: ssoUser.password,
      phone: ssoUser.phone,
      mobile: ssoUser.mobile,
      role_id: roleId,
      tenantId: ssoUser.tenant_id,
      status: 1,
    };

    const salesRes = await fetch(`${CRM_API_PATH}/api/salespersons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(salesPayload),
    });

    const salesData = await safeParseJSON(salesRes);
    if (!salesRes.ok) {
      return {
        isError: true,
        message: salesData?.message || "CRM salesperson creation failed",
        data: null,
      };
    }

    return {
      isError: false,
      message: "User registered successfully",
      data: {
        userId: userData?.id,
        salespersonId: salesData?.id,
      },
    };
  } catch (err) {
    console.error(
      "❌ CRM Registration Error:",
      err instanceof Error ? err.message : err
    );
    return {
      isError: true,
      message:
        err instanceof Error
          ? `CRM : ${err.message}`
          : "CRM registration failed",
      data: null,
    };
  }
}
export async function registerUserToWMS({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    name: ssoUser.name,
    username: ssoUser.username,
    email: ssoUser.email,
    password: ssoUser.password,
    role: {
      id: roleId,
      role: getRoleName(system, roleId),
    },
    tenant_id: ssoUser.tenant_id,
    status: 1,
  };

  const response = await fetch(`${WMS_API_PATH}/api/users/adduser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await handleAPIResponse(system, response, "Failed to register user");
}

export async function registerUserToTMS({
  ssoUser,
  roleId,
  accessToken,
  selectedAccess,
  system,
}: RegistrationParams) {
  const roleType = systemRoles["TMS"].find(
    (role) => role.roleId === roleId
  )?.role_type;

  const payload = {
    personnel_name: ssoUser.name,
    phone: ssoUser.phone,
    email: ssoUser.email,
    password: ssoUser.password,
    teams: ssoUser.teams.filter((t: string) => t),
    role: roleType,
    access: selectedAccess,
    updated_by: 2,
  };
  const response = await fetch(
    `${TMS_API_PATH}/shypvdriverapp/personnel/createPersonnel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: "TMS : " + responseData?.message || "Failed to register user",
      data: null,
    };
  }

  const tmsErrors = responseData?.errors || [];
  if (tmsErrors.length > 0) {
    return {
      isError: true,
      message: "TMS : " + tmsErrors[0]?.errorMessage || "Unknown error",
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data: responseData?.data,
  };
}

export async function registerUserToAMS({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    email: ssoUser.email,
    name: ssoUser.name,
    password: ssoUser.password,
    role: roleId,
    tenantId: ssoUser.tenant_id,
    status: 1,
  };

  const response = await fetch(`${AMS_API_PATH}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: responseData?.msg || "Failed to register user",
      data: null,
    };
  }

  if (!responseData?.result) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  return {
    isError: false,
    message: responseData?.msg || "User registered successfully",
    data: responseData?.user,
  };
}

export async function registerUserToQCMS({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    email: ssoUser.email,
    firstName: ssoUser.name.split(" ")[0],
    lastName: ssoUser.name.split(" ")[1],
    password: ssoUser.password,
    role: roleId,
    tenantId: ssoUser.tenant_id,
    status: 1,
  };

  const response = await fetch(`${QCMS_API_PATH}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  if (!responseData?.result) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data: responseData?.user,
  };
}

export async function registerUserToTSMS({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    email: ssoUser.email,
    name: ssoUser.name,
    password: ssoUser.password,
    role: roleId,
    tenantId: ssoUser.tenant_id,
    status: 1,
  };

  const response = await fetch(`${TSMS_API_PATH}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  if (!responseData?.result) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data: responseData?.user,
  };
}

export async function registerUserToTDMS({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    email: ssoUser.email,
    name: ssoUser.name,
    password: ssoUser.password,
    role: roleId,
    tenantId: ssoUser.tenant_id,
    status: 1,
  };

  const response = await fetch(`${TDMS_API_PATH}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: "Internal Portal Server Error",
      data: null,
    };
  }

  if (!responseData?.result) {
    return {
      isError: true,
      message: "Internal Portal Server Error",
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data: responseData?.user,
  };
}

export async function registerUserToHR({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    email: ssoUser.email,
    name: ssoUser.name,
    password: ssoUser.password,
    role: roleId,
    tenantId: ssoUser.tenant_id,
    status: 1,
  };

  const response = await fetch(`${HR_API_PATH}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  if (!responseData?.result) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data: responseData?.user,
  };
}

export async function registerUserToUSLM({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  // Split full name into firstName and lastName
const fullName = (ssoUser.name || "").trim();
const nameParts = fullName.split(" ");
const firstName = nameParts[0] || "Unknown";
const lastName = nameParts.slice(1).join(" ") || "Unknown"; // fallback here

  const payload = {
    email: ssoUser.email,
    name: ssoUser.name,
    password: ssoUser.password,
    role: {
      id: roleId,
      role: getRoleName(system, roleId),
    },
    tenantId: ssoUser.tenant_id,
    status: 1,
  };
  console.log("Registering user with payload:", payload);

  const response = await fetch(`${USLM_API_PATH}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  if (!responseData?.result) {
    return {
      isError: true,
      message: responseData?.msg,
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data: responseData?.user,
  };
}

export async function registerUserToCHATESS({
  ssoUser,
  roleId,
  system,
}: RegistrationParams) {
  const payload = {
    email: ssoUser.email,
    username: ssoUser.name,
    password: ssoUser.password,
    tenant_id: ssoUser.tenant_id,
  };


  const response = await fetch(`${CHATESS_API_PATH}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await safeParseJSON(response);

  if (!response.ok) {
    return {
      isError: true,
      message: responseData?.detail || "Chatess Server Error",
      data: null,
    };
  }

  return {
    isError: false,
    message: "User registered successfully",
    data: responseData,
  };
}
