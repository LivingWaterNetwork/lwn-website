"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/yan/admin/logout", { method: "POST" });
        router.push("/yan/admin/login");
        router.refresh();
      }}
      className="yan-btn-ghost !border-white/20 !text-white hover:!bg-white/10 text-xs"
    >
      Sign out
    </button>
  );
}
