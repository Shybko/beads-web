"use client";

import { usePathname } from "next/navigation";

import { Settings } from "lucide-react";

export function GlobalSettingsButton() {
  const pathname = usePathname();

  if (pathname === "/settings") return null;

  return (
    <a
      href="/settings"
      aria-label="Settings"
      className="fixed right-4 top-4 z-50 rounded-md p-2 text-t-tertiary transition-colors duration-150 hover:text-t-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-t-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
    >
      <Settings className="h-5 w-5" aria-hidden="true" />
    </a>
  );
}
