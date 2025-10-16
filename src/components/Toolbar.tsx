"use client";

import { Building2, Users, Settings, Home, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Immobili", icon: Building2 },
  { href: "/clients", label: "Clienti", icon: Users },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/settings", label: "Impostazioni", icon: Settings },
];

export function Toolbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:w-20 lg:h-screen lg:border-r lg:bg-card lg:flex lg:flex-col lg:items-center lg:pt-4 lg:gap-2 lg:z-40">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "w-12 h-12 rounded-lg",
                  isActive && "bg-primary text-primary-foreground"
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Link>
          );
        })}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="grid grid-cols-5 gap-0 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full flex-col h-auto py-2 rounded-lg",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
