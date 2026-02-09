import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Upload, Play, Mic, MicOff } from "lucide-react";
import SpinningPaletteLoader from "@/components/SpinningPaletteLoader";

const CreatorMode = () => {
  const [sketchFile, setSketchFile] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [gameReady, setGameReady] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSketchFile(URL.createObjectURL(file));
      setProcessing(true);
      setGameReady(false);
      // Simulate processing
      setTimeout(() => {
        setProcessing(false);
        setGameReady(true);
      }, 5000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSketchFile(URL.createObjectURL(file));
      setProcessing(true);
      setGameReady(false);
      setTimeout(() => { setProcessing(false); setGameReady(true); }, 5000);
    }
  }, []);

  useEffect(() => {
    if (!voiceEnabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (t.includes("clear") || t.includes("reset")) { setSketchFile(null); setGameReady(false); setProcessing(false); }
    };
    r.start();
    return () => r.stop();
  }, [voiceEnabled]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-neon-purple" /> Creator Mode
          </h1>
          <p className="text-muted-foreground mt-1">Sketch to Interactive World — Draw, snap, play</p>
        </div>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}>
          {voiceEnabled ? <Mic className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="glass-panel rounded-xl border-2 border-dashed border-border/50 hover:border-neon-purple/50 transition-colors aspect-square flex items-center justify-center relative overflow-hidden"
          >
            {sketchFile ? (
              <img src={sketchFile} alt="Uploaded sketch" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center p-8">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Drag & drop your sketch here</p>
                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold cursor-pointer neon-glow-lime">
                  <Upload className="w-4 h-4" /> Upload Sketch
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>
          {sketchFile && (
            <button onClick={() => { setSketchFile(null); setGameReady(false); setProcessing(false); }} className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Clear sketch
            </button>
          )}
        </div>

        {/* Output area */}
        <div className="glass-panel rounded-xl aspect-square flex items-center justify-center relative overflow-hidden">
          {processing ? (
            <SpinningPaletteLoader />
          ) : gameReady ? (
            <div className="text-center p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center mx-auto mb-4 neon-glow-purple">
                  <Gamepad2 className="w-10 h-10 text-neon-purple" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">Game Ready!</h3>
                <p className="text-muted-foreground text-sm mb-6">Your sketch has been converted into an interactive experience.</p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-neon-purple text-foreground font-heading font-bold neon-glow-purple"
              >
                <Play className="w-5 h-5" /> Play Now
              </motion.button>
            </div>
          ) : (
            <div className="text-center p-8">
              <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Upload a sketch to generate a game</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorMode;
