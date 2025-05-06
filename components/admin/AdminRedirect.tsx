"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    console.log("Client-side path:", pathname);
  }, [pathname]);

  return null;
}
