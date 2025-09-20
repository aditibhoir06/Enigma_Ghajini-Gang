import { NavLink, useLocation } from "react-router-dom";
import { FileText, MessageCircle, Star, User, Brain, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/",
    icon: Home,
    label: "Home",
    color: "text-success",
  },
  {
    to: "/app/schemes",
    icon: FileText,
    label: "Schemes",
    color: "text-primary",
  },
  {
    to: "/app/chatbot",
    icon: MessageCircle,
    label: "Financial Help",
    color: "text-financial",
  },
  {
    to: "/app/quiz",
    icon: Brain,
    label: "Quiz",
    color: "text-purple-600",
  },
  {
    to: "/app/reviews",
    icon: Star,
    label: "Reviews",
    color: "text-success",
  },
  {
    to: "/app/profile",
    icon: User,
    label: "Profile",
    color: "text-muted-foreground",
  },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors",
                isActive 
                  ? `${item.color} font-medium` 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 mb-1 transition-transform",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-xs leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}