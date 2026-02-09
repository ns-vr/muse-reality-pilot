import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload, Mic as MicIcon, MicOff, Camera, Loader2 } from "lucide-react";
import { useMusesAnalysis } from "@/hooks/useMusesAnalysis";

const InventorMode = () => {
  const [fridgeImage, setFridgeImage] = useState<string | null>(null);
  const [fridgeFile, setFridgeFile] = useState<File | null>(null);
  const [preference, setPreference] = useState("");
  const [recipe, setRecipe] = useState<null | {
    name: string;
    cuisine_style?: string;
    prep_time?: string;
    cook_time?: string;
    steps: Array<{ step: number; instruction: string; highlight?: string }>;
    currentStep: number;
    identified_ingredients?: string[];
    nutrition_notes?: string;
  }>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const { analyzing, analyze, imageToBase64 } = useMusesAnalysis("inventor");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFridgeFile(file);
      setFridgeImage(URL.createObjectURL(file));
    }
  };

  const generateRecipe = async () => {
    if (!fridgeFile) return;
    const base64 = await imageToBase64(fridgeFile);
    const result = await analyze(base64, preference || "Any cuisine, healthy options preferred");
    if (result && !result.error) {
      setRecipe({
        name: result.recipe_name || "AI Generated Recipe",
        cuisine_style: result.cuisine_style,
        prep_time: result.prep_time,
        cook_time: result.cook_time,
        steps: result.steps || [],
        currentStep: 0,
        identified_ingredients: result.identified_ingredients,
        nutrition_notes: result.nutrition_notes,
      });
    }
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
    const r = new SR(); r.continuous = true;
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
            {analyzing && <Loader2 className="w-5 h-5 animate-spin text-neon-lime" />}
          </h1>
          <p className="text-muted-foreground mt-1">Multimodal Recipe & AR Creator — AI generates recipes from your ingredients</p>
        </div>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}>
          {voiceEnabled ? <MicIcon className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              disabled={!fridgeFile || analyzing}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-bold disabled:opacity-50 disabled:cursor-not-allowed neon-glow-lime flex items-center justify-center gap-2"
            >
              {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : "Generate Recipe"}
            </motion.button>
          </div>

          {/* Identified ingredients */}
          {recipe?.identified_ingredients && recipe.identified_ingredients.length > 0 && (
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="font-heading font-semibold mb-3 text-neon-cyan">Identified Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.identified_ingredients.map((ing, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-xs text-neon-cyan">{ing}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recipe output */}
        <div className="glass-panel p-6 rounded-xl">
          {recipe ? (
            <div>
              <h3 className="font-heading font-bold text-xl mb-1">{recipe.name}</h3>
              {recipe.cuisine_style && <p className="text-sm text-neon-lime mb-1">{recipe.cuisine_style}</p>}
              <div className="flex gap-4 text-xs text-muted-foreground mb-6">
                {recipe.prep_time && <span>Prep: {recipe.prep_time}</span>}
                {recipe.cook_time && <span>Cook: {recipe.cook_time}</span>}
                <span>{recipe.steps.length} steps</span>
              </div>

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
                      <div>
                        <p className="text-sm">{step.instruction}</p>
                        {step.highlight && i === recipe.currentStep && (
                          <motion.span
                            className="inline-block mt-1 px-2 py-0.5 rounded bg-neon-lime/20 text-neon-lime text-xs font-medium"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            👉 {step.highlight}
                          </motion.span>
                        )}
                      </div>
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
                <button onClick={prevStep} disabled={recipe.currentStep === 0} className="flex-1 px-4 py-2 rounded-lg glass-panel text-sm font-medium disabled:opacity-30 hover:bg-secondary/50 transition-colors">Previous</button>
                <button onClick={nextStep} disabled={recipe.currentStep === recipe.steps.length - 1} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-30">Next Step</button>
              </div>

              {recipe.nutrition_notes && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/20 text-xs text-muted-foreground">
                  🥗 {recipe.nutrition_notes}
                </div>
              )}
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
