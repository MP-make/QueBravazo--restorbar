"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchedulesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/menu?tab=schedules");
  }, [router]);
  return null;
}
