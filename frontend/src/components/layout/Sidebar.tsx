import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Mic,
  Zap,
  Lock,
  User,
  ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { canAccessFeature, PLAN_DISPLAY_NAMES, FeatureType, PlanType } from "@/lib/planPermissions";
import UpgradeModal from "@/components/UpgradeModal";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", feature: null },
  { icon: BarChart3, label: "Analytics", href: "/analytics", feature: null },
  { icon: TrendingUp, label: "Performance", href: "/performance", feature: null },
  { icon: Users, label: "Audience", href: "/audience", feature: null },
  { icon: ImagePlus, label: "Create Post", href: "/create-post", feature: null },
  { icon: Mic, label: "Voice Coach", href: "/voice-coach", feature: "voiceCoach" as FeatureType },
  { icon: Zap, label: "Hook Detector", href: "/hook-detector", feature: "vlm" as FeatureType },
  { icon: Settings, label: "Settings", href: "/settings", feature: null },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [upgradeModal, setUpgradeModal] = useState<{ isOpen: boolean; feature: FeatureType | null }>({
    isOpen: false,
    feature: null,
  });

  const userName = profile?.name || "User";
  const userPlan = profile?.plan || "starter";
  const userRole = profile?.role || "user";
  const planDisplayName = PLAN_DISPLAY_NAMES[userPlan as PlanType] || "Starter";

  // Generate initials
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleNavClick = (e: React.MouseEvent, link: typeof sidebarLinks[0]) => {
    if (link.feature && !canAccessFeature(userPlan, userRole, link.feature)) {
      e.preventDefault();
      setUpgradeModal({ isOpen: true, feature: link.feature });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
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
              const isLocked = link.feature && !canAccessFeature(userPlan, userRole, link.feature);

              return (
                <li key={link.label}>
                  <Link
                    to={isLocked ? "#" : link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? "bg-primary text-primary-foreground"
                      : isLocked
                        ? "text-muted-foreground/50 hover:bg-muted/50 cursor-not-allowed"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="flex-1">{link.label}</span>
                    {isLocked && <Lock className="h-4 w-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Account Link */}
          <div className="mt-4 pt-4 border-t border-border">
            <Link
              to="/account"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === "/account"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <User className="h-5 w-5" />
              Account
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-leaf-200 flex items-center justify-center">
              <span className="text-leaf-700 font-semibold text-sm">{userInitials}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{planDisplayName} Plan</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Upgrade Modal */}
      {upgradeModal.feature && (
        <UpgradeModal
          isOpen={upgradeModal.isOpen}
          onClose={() => setUpgradeModal({ isOpen: false, feature: null })}
          feature={upgradeModal.feature}
          currentPlan={userPlan}
        />
      )}
    </>
  );
}
