"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoggedUser } from "@/types/user";

interface UserContextType {
  user: LoggedUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/user/me");
          const userData = await res.json();
          console.log("userData => ", userData);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      } else if (status === "unauthenticated") {
        router.push("/login");
      }
      setLoading(false);
    };

    fetchUser();
  }, [status, session, router]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
