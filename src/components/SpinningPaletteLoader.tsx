import { motion } from "framer-motion";

interface SpinningPaletteLoaderProps {
  className?: string;
}

const SpinningPaletteLoader = ({ className = "" }: SpinningPaletteLoaderProps) => {
  const codeSymbols = ["{ }", "< />", "( )", "[ ]", "=>", "&&"];

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className="relative w-32 h-32">
        {/* Central spinning palette */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="hsl(var(--neon-purple))" strokeWidth="2" strokeDasharray="8 4" opacity="0.6" />
            {/* Palette blobs */}
            <circle cx="32" cy="10" r="6" fill="hsl(var(--neon-lime))" opacity="0.9" />
            <circle cx="50" cy="24" r="5" fill="hsl(var(--neon-cyan))" opacity="0.9" />
            <circle cx="46" cy="46" r="5.5" fill="hsl(var(--neon-purple))" opacity="0.9" />
            <circle cx="18" cy="46" r="5" fill="hsl(var(--neon-lime))" opacity="0.7" />
            <circle cx="14" cy="24" r="5.5" fill="hsl(var(--neon-cyan))" opacity="0.7" />
            {/* Center hole */}
            <circle cx="32" cy="32" r="8" fill="hsl(var(--deep-space))" />
            <circle cx="32" cy="32" r="4" fill="hsl(var(--neon-purple))" opacity="0.5" />
          </svg>
        </motion.div>

        {/* Orbiting code symbols */}
        {codeSymbols.map((symbol, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.4,
            }}
          >
            <motion.span
              className="absolute font-mono text-xs font-semibold text-neon-cyan/80"
              style={{
                transform: `translateX(${55 + i * 3}px)`,
              }}
              animate={{ rotate: -360, opacity: [0.4, 1, 0.4] }}
              transition={{
                rotate: { duration: 4 + i * 0.5, repeat: Infinity, ease: "linear", delay: i * 0.4 },
                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
              }}
            >
              {symbol}
            </motion.span>
          </motion.div>
        ))}

        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-[-8px] rounded-full border border-neon-purple/20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.p
        className="text-sm text-muted-foreground font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Converting sketch to interactive world...
      </motion.p>
    </div>
  );
};

export default SpinningPaletteLoader;
