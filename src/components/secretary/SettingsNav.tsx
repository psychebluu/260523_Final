"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { href: "/secretary/settings/tags", label: "태그" },
  { href: "/secretary/settings/notifications", label: "알림" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap gap-2 border-b border-primary/10 pb-4">
      {SETTINGS_TABS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn("jarvis-tab", active && "jarvis-tab-active")}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
