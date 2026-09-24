"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { House, Wallet, Receipt, SignOut, List, X, SidebarSimple } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  const navContent = (
    <>
      {/* brand — text on mobile/expanded, hidden when collapsed */}
      <span
        className={cn(
          "text-sm font-bold tracking-tight px-3 pb-4 hidden md:block",
          collapsed && "md:hidden"
        )}
      >
        Budget Tracker
      </span>
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                collapsed && "md:justify-center md:px-0",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-label={collapsed ? label : undefined}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              <span className={cn(collapsed && "md:hidden")}>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-0.5">
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            collapsed && "md:justify-center md:px-0"
          )}
          aria-label={collapsed ? "Keluar" : undefined}
        >
          <SignOut size={16} />{" "}
          <span className={cn(collapsed && "md:hidden")}>Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* hamburger — mobile only */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center size-9 rounded-lg bg-card ring-1 ring-foreground/10 shadow-md md:hidden"
        aria-label="Open menu"
      >
        <List size={18} />
      </button>

      {/* backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* sidebar — static on md+, drawer on mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 shrink-0 border-r border-border bg-sidebar p-4 flex flex-col gap-1 transition-all duration-200 shadow-2xl md:static md:shadow-none",
          collapsed && "md:w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* header row: toggle (desktop) / close (mobile) */}
        <div className="flex items-center justify-between pb-4">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex items-center justify-center size-7 rounded-lg hover:bg-muted transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
            title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            <SidebarSimple size={16} />
          </button>
          <span className="text-sm font-bold tracking-tight md:hidden">
            Budget Tracker
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center size-7 rounded-lg hover:bg-muted transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
}