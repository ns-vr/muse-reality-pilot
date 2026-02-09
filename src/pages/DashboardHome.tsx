import { motion } from "framer-motion";
import { Eye, Brain, Gamepad2, Mic, Sparkles, Camera, FileText, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const widgets = [
  { icon: Camera, label: "Live Camera Feed", description: "Open any mode to start analysis", color: "neon-cyan" },
  { icon: FileText, label: "Recent Analyses", description: "No analyses yet", color: "neon-lime" },
  { icon: Gamepad2, label: "Generated Games", description: "Upload a sketch to create", color: "neon-purple" },
  { icon: Trophy, label: "Interview Scores", description: "Start a mock interview", color: "neon-cyan" },
];

const quickActions = [
  { icon: Eye, label: "Future Mode", to: "/dashboard/future", color: "from-neon-cyan/20 to-transparent" },
  { icon: Brain, label: "Coach Mode", to: "/dashboard/coach", color: "from-neon-lime/20 to-transparent" },
  { icon: Gamepad2, label: "Creator Mode", to: "/dashboard/creator", color: "from-neon-purple/20 to-transparent" },
  { icon: Mic, label: "Wingman Mode", to: "/dashboard/wingman", color: "from-neon-cyan/20 to-transparent" },
  { icon: Sparkles, label: "Inventor Mode", to: "/dashboard/inventor", color: "from-neon-lime/20 to-transparent" },
];

const iconColor: Record<string, string> = {
  "neon-cyan": "text-neon-cyan",
  "neon-lime": "text-neon-lime",
  "neon-purple": "text-neon-purple",
};

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-2">Welcome to MUSES</h1>
      <p className="text-muted-foreground mb-8">Your Reality Co-Pilot is ready. Choose a mode to begin.</p>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.03 }}
            onClick={() => navigate(action.to)}
            className={`glass-panel bg-gradient-to-br ${action.color} p-4 rounded-xl text-center border border-border/50 card-hover-glow`}
          >
            <action.icon className="w-8 h-8 mx-auto mb-2 text-foreground/80" />
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Widgets */}
      <h2 className="text-xl font-heading font-semibold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((w, i) => (
          <motion.div
            key={w.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-panel p-6 rounded-xl border border-border/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <w.icon className={`w-5 h-5 ${iconColor[w.color]}`} />
              <h3 className="font-heading font-semibold">{w.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{w.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
