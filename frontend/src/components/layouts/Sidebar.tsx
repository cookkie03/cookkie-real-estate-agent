"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  Building2,
  Users,
  Search,
  Target,
  Activity,
  Map,
  Home,
  Calendar,
  CheckSquare,
  Globe,
  Wrench,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Icon mapping
 */
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Building2,
  Users,
  Search,
  Target,
  Activity,
  Map,
  Home,
  Calendar,
  CheckSquare,
  Globe,
  Wrench,
  Settings,
};

/**
 * Sidebar Component
 * ChatGPT-style fixed sidebar with navigation
 */
export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">CRM Immobiliare</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer with theme toggle */}
        <div className="border-t p-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="sidebar-item w-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span>Cambia tema</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
