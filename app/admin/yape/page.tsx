"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function YapeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/orders?tab=yape");
  }, [router]);
  return null;
}
