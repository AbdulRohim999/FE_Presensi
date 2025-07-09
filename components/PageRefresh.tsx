"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageRefresh() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Hanya refresh jika pathname berubah dan bukan halaman login atau dashboard
    if (prevPathRef.current !== pathname && 
        !pathname.includes("/Login") && 
        !pathname.includes("/Dashboard")) {
      prevPathRef.current = pathname;
      window.location.reload();
    } else {
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
