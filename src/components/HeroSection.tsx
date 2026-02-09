import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ParticleField from "./ParticleField";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <ParticleField />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-glow mb-8"
            animate={{ boxShadow: ["0 0 20px hsl(85 100% 50% / 0.1)", "0 0 40px hsl(85 100% 50% / 0.2)", "0 0 20px hsl(85 100% 50% / 0.1)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm text-muted-foreground">Powered by Gemini 3</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight mb-6">
            <span className="text-gradient-muses">MUSES</span>
          </h1>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground/90 mb-4">
            Your Reality Co-Pilot
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            See. Think. Predict. Create.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg neon-glow-lime transition-all"
            >
              Start as Guest
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl glass-panel border-glow font-heading font-semibold text-lg hover:bg-secondary/50 transition-all"
            >
              Sign In / Create Account
            </motion.button>
          </div>
        </motion.div>

        {/* Floating brain visual */}
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
