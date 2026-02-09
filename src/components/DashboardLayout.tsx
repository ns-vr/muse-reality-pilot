import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Brain, Gamepad2, Mic, Sparkles, LayoutDashboard, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Eye, label: "Future Mode", to: "/dashboard/future" },
  { icon: Brain, label: "Coach Mode", to: "/dashboard/coach" },
  { icon: Gamepad2, label: "Creator Mode", to: "/dashboard/creator" },
  { icon: Mic, label: "Wingman Mode", to: "/dashboard/wingman" },
  { icon: Sparkles, label: "Inventor Mode", to: "/dashboard/inventor" },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center neon-glow-lime">
              <span className="text-primary-foreground font-heading font-bold">M</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground">MUSES</span>
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary neon-glow-lime"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
