import { DecodedToken, ErrorResponse, system } from "@/lib/ums/type";
import { isTokenExpired } from "@/lib/ums/utils";
import { error } from "console";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

export interface AuthContextType {
  user: DecodedToken | null;
  access_token: string | null;
  setUser: (user: DecodedToken | null) => void;
  logout: () => void;
  checkAndUpdateAccessToken: () => Promise<boolean>;
  addUserToKeycloak: (
    username: string,
    email: string,
    password: string,
    selectedSystems: system[]
  ) => Promise<ErrorResponse>;
  updateUserInKeycloak: (
    email: string,
    // newEmail: string,
    username: string,
    newPassword: string
  ) => Promise<ErrorResponse>;
  updateUserPermissionInKeycloak: (
    email: string,
    system: system,
    isAssigned: boolean
  ) => Promise<ErrorResponse>;
  removeUserFromKeycloak: (email: string) => Promise<ErrorResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [access_token, setAccessToken] = useState<string | null>(null);
  const [refresh_token, setRefreshToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        if (isTokenExpired(token)) {
          localStorage.removeItem("token");
          window.location.href = "/signin";
        }
        const decodedToken = jwtDecode<DecodedToken>(token);
        setUser(decodedToken);
        setAccessToken(token);
      } catch (error) {
        console.error("Invalid token: ", token);
        localStorage.removeItem("token");
      }
    }
    checkAndUpdateAccessToken();
  }, []);

  const checkAndUpdateAccessToken = async (): Promise<boolean> => {
    if (!access_token) {
      try {
        const response = await fetch(
          "/api/ums/keycloak/users/token/access_token",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/content-type",
            },
          }
        );
        const responseData = await response.json();
        if (responseData.token?.access_token) {
          setAccessToken(responseData.token.access_token);
          setRefreshToken(responseData.token.refresh_token);
          setExpiresIn(responseData.token.expires_in);
          
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    } else if (isTokenExpired(access_token)) {
      try {
        if (!refresh_token) return false;

        const params = new URLSearchParams();
        params.append("refresh_token", refresh_token);

        const res = await fetch("/api/ums/keycloak/users/token/refresh_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/content-type",
          },
          body: params.toString(),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          console.error("Token refresh failed:", data.message || data.error);
          return false;
        }

        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setExpiresIn(data.expires_in);

        return true;
      } catch (error) {
        console.error("Error refreshing token:", error);
        
        return false;
      }
    } 

    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/signin";
  };

  // -----------------------------
  // KEYCLOAK SERVICE FUNCTIONS
  // -----------------------------

  const addUserToKeycloak = async (
    username: string,
    email: string,
    password: string,
    selectedSystems: system[]
  ): Promise<ErrorResponse> => {
    const response = await fetch("/api/ums/keycloak/users/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        selectedSystems,
      }),
    });

    const data = await response.json();
    if (response.ok || !data.error) {
      return { error: false, message: "User added successfully" };
    } else {
      const errorMessage = JSON.parse(data.details).errorMessage;
      return { error: true, message: "Keycloak server error: " + errorMessage };
    }
  };

  const updateUserInKeycloak = async (
    email: string,
    // newEmail: string,
    username: string,
    newPassword: string
  ): Promise<ErrorResponse> => {
    const response = await fetch(`/api/ums/keycloak/users/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        newPassword,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      return {
        error: true,
        message: data.message || "Failed to update user in keycloak server",
      };
    }

    return { error: false, message: "User updated successfully" };
  };

  const updateUserPermissionInKeycloak = async (
    email: string,
    system: system,
    isAssigned: boolean
  ): Promise<ErrorResponse> => {
    try {
      const response = await fetch(`/api/ums/keycloak/users/updatePermission`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, system, isAssigned }),
      });

      const resData: { error: boolean; message: string } =
        await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.message || `Server error: ${response.status}`);
      }

      return resData;
    } catch (error: any) {
      return {
        error: true,
        message: error.message || "Keycloak Server Error",
      };
    }
  };

  const removeUserFromKeycloak = async (
    email: string
  ): Promise<ErrorResponse> => {
    const response = await fetch(`/api/ums/keycloak/users/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      return {
        error: true,
        message: data.message || "Failed to remove user from keycloak server",
      };
    }

    return response.ok
      ? { error: false, message: "User removed successfully" }
      : { error: true, message: "Failed to remove user" };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        access_token,
        checkAndUpdateAccessToken,
        addUserToKeycloak,
        updateUserInKeycloak,
        updateUserPermissionInKeycloak,
        removeUserFromKeycloak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
