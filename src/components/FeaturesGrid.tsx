import { motion } from "framer-motion";
import { Eye, Brain, Sparkles, Gamepad2, Mic } from "lucide-react";

const modes = [
  {
    icon: Eye,
    title: "Future Mode",
    subtitle: "World Simulator",
    description: "Point your camera at anything — MUSES predicts what happens next, highlights risks, and suggests actions.",
    color: "neon-cyan",
    href: "/dashboard/future",
  },
  {
    icon: Brain,
    title: "Coach Mode",
    subtitle: "Live Skill Trainer",
    description: "Real-time posture analysis, visual overlays, voice guidance, and personalized drill generation.",
    color: "neon-lime",
    href: "/dashboard/coach",
  },
  {
    icon: Gamepad2,
    title: "Creator Mode",
    subtitle: "Sketch to World",
    description: "Draw anything on paper, snap a photo, and MUSES converts it into a playable game or interactive simulation.",
    color: "neon-purple",
    href: "/dashboard/creator",
  },
  {
    icon: Mic,
    title: "Wingman Mode",
    subtitle: "Interview Coach",
    description: "Real-time body language analysis, answer feedback, and confidence scoring for mock interviews.",
    color: "neon-cyan",
    href: "/dashboard/wingman",
  },
  {
    icon: Sparkles,
    title: "Inventor Mode",
    subtitle: "Recipe & AR Creator",
    description: "Show your ingredients, speak your preferences, and MUSES designs fusion recipes with AR cooking steps.",
    color: "neon-lime",
    href: "/dashboard/inventor",
  },
];

const colorMap: Record<string, string> = {
  "neon-cyan": "from-neon-cyan/20 to-transparent border-neon-cyan/30 hover:border-neon-cyan/60",
  "neon-lime": "from-neon-lime/20 to-transparent border-neon-lime/30 hover:border-neon-lime/60",
  "neon-purple": "from-neon-purple/20 to-transparent border-neon-purple/30 hover:border-neon-purple/60",
};

const iconColorMap: Record<string, string> = {
  "neon-cyan": "text-neon-cyan",
  "neon-lime": "text-neon-lime",
  "neon-purple": "text-neon-purple",
};

const FeaturesGrid = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Five Powerful <span className="text-gradient-muses">Modes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each mode is a specialized AI lens into reality, powered by Gemini 3.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode, i) => (
            <motion.a
              key={mode.title}
              href={mode.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`glass-panel bg-gradient-to-br ${colorMap[mode.color]} p-6 rounded-xl border cursor-pointer transition-all duration-500 group`}
            >
              <mode.icon className={`w-10 h-10 ${iconColorMap[mode.color]} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="text-xl font-heading font-bold mb-1">{mode.title}</h3>
              <p className={`text-sm ${iconColorMap[mode.color]} mb-3 font-medium`}>{mode.subtitle}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{mode.description}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
