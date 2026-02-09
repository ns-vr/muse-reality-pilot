import { motion } from "framer-motion";
import { Camera, Brain, Zap } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Upload or Use Camera",
    description: "Point your webcam or upload any image, video, or sketch to begin.",
  },
  {
    icon: Brain,
    step: "02",
    title: "Gemini 3 Analyzes",
    description: "MUSES processes your input through multimodal AI reasoning and deep analysis.",
  },
  {
    icon: Zap,
    step: "03",
    title: "MUSES Acts",
    description: "Get predictions, coaching, generated games, recipes, or interview feedback instantly.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            How It <span className="text-gradient-purple">Works</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-lime/50 via-neon-cyan/50 to-neon-purple/50 hidden md:block" />

          <div className="space-y-16">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-8"
              >
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "order-2 text-left"}`}>
                  <span className="text-neon-lime font-mono text-sm">{s.step}</span>
                  <h3 className="text-2xl font-heading font-bold mt-1">{s.title}</h3>
                  <p className="text-muted-foreground mt-2">{s.description}</p>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-full glass-panel flex items-center justify-center neon-glow-cyan shrink-0">
                  <s.icon className="w-7 h-7 text-neon-cyan" />
                </div>
                <div className={`flex-1 ${i % 2 === 0 ? "order-3" : ""}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
