"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";

export default function DashboardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { user: loggedUser, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center w-full absolute h-[60vh]">
        <div className="loader" />
      </div>
    );
  }

  if (!session || !loggedUser) {
    return null; // Avoid rendering anything while redirecting
  }

  return <>{children}</>;
}
