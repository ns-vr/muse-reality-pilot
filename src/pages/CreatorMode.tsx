import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Upload, Play, Mic, MicOff, Loader2 } from "lucide-react";
import SpinningPaletteLoader from "@/components/SpinningPaletteLoader";
import { useMusesAnalysis } from "@/hooks/useMusesAnalysis";

const CreatorMode = () => {
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const [gameDescription, setGameDescription] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const { analyzing, analyze, imageToBase64 } = useMusesAnalysis("creator");

  const processSketch = useCallback(async (file: File) => {
    setSketchFile(file);
    setSketchPreview(URL.createObjectURL(file));
    setGameHtml(null);
    setGameDescription("");

    const base64 = await imageToBase64(file);
    const result = await analyze(base64, "Convert this sketch into a playable HTML game");
    if (result && !result.error) {
      if (result.game_html) setGameHtml(result.game_html);
      if (result.game_concept) setGameDescription(result.game_concept);
      if (result.sketch_description) setGameDescription(prev => `${result.sketch_description}\n\n${prev}`);
    }
  }, [analyze, imageToBase64]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSketch(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processSketch(file);
  }, [processSketch]);

  useEffect(() => {
    if (!voiceEnabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.continuous = true;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (t.includes("clear") || t.includes("reset")) { setSketchFile(null); setSketchPreview(null); setGameHtml(null); }
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
            {analyzing && <Loader2 className="w-5 h-5 animate-spin text-neon-purple" />}
          </h1>
          <p className="text-muted-foreground mt-1">Sketch to Interactive World — AI generates playable games</p>
        </div>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}>
          {voiceEnabled ? <Mic className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="glass-panel rounded-xl border-2 border-dashed border-border/50 hover:border-neon-purple/50 transition-colors aspect-square flex items-center justify-center relative overflow-hidden"
          >
            {sketchPreview ? (
              <img src={sketchPreview} alt="Uploaded sketch" className="w-full h-full object-contain p-4" />
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
          {sketchPreview && (
            <button onClick={() => { setSketchFile(null); setSketchPreview(null); setGameHtml(null); setGameDescription(""); }} className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Clear sketch
            </button>
          )}
          {gameDescription && (
            <div className="glass-panel p-4 rounded-xl mt-4">
              <p className="text-sm text-muted-foreground whitespace-pre-line">{gameDescription}</p>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-xl aspect-square flex items-center justify-center relative overflow-hidden">
          {analyzing ? (
            <SpinningPaletteLoader />
          ) : gameHtml ? (
            <div className="w-full h-full flex flex-col">
              <div className="p-3 border-b border-border/30 flex items-center justify-between">
                <span className="text-sm font-heading font-semibold text-neon-purple">🎮 Generated Game</span>
                <button
                  onClick={() => {
                    const w = window.open();
                    if (w) { w.document.write(gameHtml); w.document.close(); }
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition-colors"
                >
                  <Play className="w-3 h-3" /> Open Fullscreen
                </button>
              </div>
              <iframe
                srcDoc={gameHtml}
                className="flex-1 w-full border-0 rounded-b-xl bg-foreground/5"
                sandbox="allow-scripts"
                title="Generated Game"
              />
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
