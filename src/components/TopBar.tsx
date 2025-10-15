"use client";

import { Bell, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface TopBarProps {
  onMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function TopBar({ onMenuToggle, mobileMenuOpen }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
            RealEstate AI
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-priority-high rounded-full" />
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-card shadow-lg p-4 space-y-3">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-priority-high-bg border-l-4 border-priority-high">
                    <p className="font-medium text-sm">Chiamata urgente</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mario Rossi - 15 min fa
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning-bg border-l-4 border-warning">
                    <p className="font-medium text-sm">Appuntamento in 2 ore</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Via Torino 42 - Laura Bianchi
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
