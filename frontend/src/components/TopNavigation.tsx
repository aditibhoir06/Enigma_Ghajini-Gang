import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FileText, MessageCircle, Star, User, LogOut, FileBarChart, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  {
    to: "/chatbot",
    icon: MessageCircle,
    label: "Financial Advisor",
    color: "text-financial",
  },
  {
    to: "/schemes",
    icon: FileText,
    label: "Government Schemes",
    color: "text-primary",
  },
  {
    to: "/quiz",
    icon: Brain,
    label: "Finance Quiz",
    color: "text-purple-600",
  },
  {
    to: "/reviews",
    icon: Star,
    label: "Reviews",
    color: "text-success",
  },
];

export function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="hidden md:flex fixed top-0 pt-8 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm z-50">
      <div className="max-w-7xl mx-auto w-full px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileBarChart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">SachivJi</span>
              <span className="text-xs text-muted-foreground -mt-1">Your Financial Guide</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to ||
                (location.pathname === "/" && item.to === "/schemes");
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-muted/50",
                    isActive
                      ? `${item.color} bg-muted font-medium shadow-sm`
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-transform",
                    isActive && "scale-110"
                  )} />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-muted/50"
                >
                  <div className="w-7 h-7 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground -mt-0.5">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}