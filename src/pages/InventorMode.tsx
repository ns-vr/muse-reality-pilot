import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload, Mic as MicIcon, MicOff, Camera } from "lucide-react";

const InventorMode = () => {
  const [fridgeImage, setFridgeImage] = useState<string | null>(null);
  const [preference, setPreference] = useState("");
  const [recipe, setRecipe] = useState<null | { name: string; steps: string[]; currentStep: number }>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFridgeImage(URL.createObjectURL(file));
  };

  const generateRecipe = () => {
    setRecipe({
      name: "Karnataka-Style Low-Carb Veggie Bowl",
      steps: [
        "Dice the available vegetables into bite-sized pieces",
        "Heat coconut oil in a pan, add mustard seeds",
        "Add curry leaves, green chillies, and diced onions",
        "Add vegetables and sauté for 5 minutes",
        "Season with turmeric, coriander, and a pinch of jaggery",
        "Serve hot with a side of coconut chutney",
      ],
      currentStep: 0,
    });
  };

  const nextStep = () => {
    if (recipe && recipe.currentStep < recipe.steps.length - 1) {
      setRecipe({ ...recipe, currentStep: recipe.currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (recipe && recipe.currentStep > 0) {
      setRecipe({ ...recipe, currentStep: recipe.currentStep - 1 });
    }
  };

  useEffect(() => {
    if (!voiceEnabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (t.includes("next")) nextStep();
      if (t.includes("previous") || t.includes("back")) prevStep();
      if (t.includes("generate") || t.includes("cook")) generateRecipe();
    };
    r.start();
    return () => r.stop();
  }, [voiceEnabled, recipe]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-neon-lime" /> Inventor Mode
          </h1>
          <p className="text-muted-foreground mt-1">Multimodal Recipe & AR Creator</p>
        </div>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}>
          {voiceEnabled ? <MicIcon className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input area */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
            {fridgeImage ? (
              <img src={fridgeImage} alt="Fridge contents" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Show your fridge or ingredients</p>
                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold cursor-pointer neon-glow-lime">
                  <Upload className="w-4 h-4" /> Upload Photo
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div className="glass-panel p-5 rounded-xl">
            <label className="text-sm font-medium mb-2 block">Dietary Preference</label>
            <input
              type="text"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="e.g. Karnataka-style low-carb veg"
              className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateRecipe}
              disabled={!fridgeImage}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-bold disabled:opacity-50 disabled:cursor-not-allowed neon-glow-lime"
            >
              Generate Recipe
            </motion.button>
          </div>
        </div>

        {/* Recipe output with AR-style steps */}
        <div className="glass-panel p-6 rounded-xl">
          {recipe ? (
            <div>
              <h3 className="font-heading font-bold text-xl mb-1">{recipe.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{recipe.steps.length} steps</p>

              <div className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    className={`relative p-4 rounded-lg border transition-all ${
                      i === recipe.currentStep
                        ? "border-neon-lime/60 bg-neon-lime/10 neon-glow-lime"
                        : i < recipe.currentStep
                        ? "border-border/30 bg-secondary/20 opacity-60"
                        : "border-border/30 bg-secondary/10 opacity-40"
                    }`}
                    animate={i === recipe.currentStep ? { scale: [1, 1.01, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === recipe.currentStep ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                        {i + 1}
                      </span>
                      <p className="text-sm">{step}</p>
                    </div>
                    {i === recipe.currentStep && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-primary"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={prevStep} disabled={recipe.currentStep === 0} className="flex-1 px-4 py-2 rounded-lg glass-panel text-sm font-medium disabled:opacity-30 hover:bg-secondary/50 transition-colors">
                  Previous
                </button>
                <button onClick={nextStep} disabled={recipe.currentStep === recipe.steps.length - 1} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-30">
                  Next Step
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Upload ingredients & generate a recipe</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventorMode;
