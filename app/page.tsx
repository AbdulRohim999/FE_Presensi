"use client";

import { useRouter } from "next/navigation"; // ✅ gunakan next/navigation, bukan next/router
import { useEffect } from "react";

export default function RedirectToLogin() {
  const router = useRouter();

  useEffect(() => {
    router.push("/Login");
  }, [router]);

  return null;
}
