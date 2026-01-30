import { Link, useLocation } from "react-router-dom";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: TrendingUp, label: "Performance", href: "/performance" },
  { icon: Users, label: "Audience", href: "/audience" },
  { icon: Mic, label: "Voice Coach", href: "/voice-coach" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const [userName, setUserName] = useState("John Doe");
  const [userInitials, setUserInitials] = useState("JD");

  useEffect(() => {
    // Get user data
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || "John Doe");

      // Generate initials
      if (user.name) {
        const initials = user.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);
        setUserInitials(initials);
      }
    }
  }, []);

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-border flex items-center h-[65px]">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-soft">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Social<span className="text-primary">Leaf</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-leaf-200 flex items-center justify-center">
            <span className="text-leaf-700 font-semibold text-sm">{userInitials}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
