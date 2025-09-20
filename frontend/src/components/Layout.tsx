import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { TopNavigation } from "./TopNavigation";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopNavigation />
      <main className="pb-16 md:pb-0 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Outlet />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}