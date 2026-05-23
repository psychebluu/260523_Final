"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const REPORT_TABS = [
  { href: "/secretary/report", label: "일간 리포트", exact: true },
  { href: "/secretary/report/monthly", label: "월간 리포트" },
];

export function ReportNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap gap-2 border-b border-primary/10 pb-4">
      {REPORT_TABS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
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
