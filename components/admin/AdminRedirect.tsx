"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminRedirect() {
  const pathname = usePathname();

  useEffect(() => {
  }, [pathname]);

  return null;
}
