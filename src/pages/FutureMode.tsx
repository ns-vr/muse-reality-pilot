import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Pause, Play, Eye, EyeOff, Download, Volume2, VolumeX, ThumbsUp, ThumbsDown, Mic, MicOff, Loader2 } from "lucide-react";
import { useMusesAnalysis } from "@/hooks/useMusesAnalysis";

const FutureMode = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [predictions, setPredictions] = useState<Array<{ label: string; risk: string; x: number; y: number; w: number; h: number }>>([]);
  const [sceneDescription, setSceneDescription] = useState("");
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  const { analyzing, analyze, captureFrame } = useMusesAnalysis("future");

  const runAnalysis = useCallback(async () => {
    if (!videoRef.current || !analysisActive) return;
    const base64 = captureFrame(videoRef.current);
    const result = await analyze(base64);
    if (result && !result.error) {
      if (result.predictions) setPredictions(result.predictions);
      if (result.scene_description) setSceneDescription(result.scene_description);
      if (result.suggested_actions) setSuggestedActions(result.suggested_actions);
      if (result.narration && narrationEnabled && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(result.narration);
        utterance.rate = 1.1;
        speechSynthesis.speak(utterance);
      }
    }
  }, [analysisActive, analyze, captureFrame, narrationEnabled]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      console.error("Camera access denied");
    }
  }, []);

  // Auto-analyze every 8 seconds when streaming
  useEffect(() => {
    if (streaming && analysisActive) {
      // Run once immediately after 2s
      const timeout = setTimeout(runAnalysis, 2000);
      analysisIntervalRef.current = setInterval(runAnalysis, 10000);
      return () => {
        clearTimeout(timeout);
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      };
    } else {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    }
  }, [streaming, analysisActive, runAnalysis]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
      setPredictions([]);
      setSceneDescription("");
      setSuggestedActions([]);
      if (recording) stopRecording();
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    }
  }, [recording]);

  const startRecording = useCallback(() => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedUrl(URL.createObjectURL(blob));
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!voiceEnabled) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (transcript.includes("start camera")) startCamera();
      if (transcript.includes("stop camera")) stopCamera();
      if (transcript.includes("start recording")) startRecording();
      if (transcript.includes("stop recording")) stopRecording();
      if (transcript.includes("analyze")) runAnalysis();
    };
    recognition.start();
    return () => recognition.stop();
  }, [voiceEnabled, startCamera, stopCamera, startRecording, stopRecording, runAnalysis]);

  const riskColors: Record<string, string> = {
    high: "border-destructive shadow-[0_0_15px_hsl(0_84%_60%/0.5)]",
    medium: "border-neon-lime shadow-[0_0_15px_hsl(85_100%_50%/0.4)]",
    low: "border-neon-cyan shadow-[0_0_10px_hsl(187_100%_45%/0.3)]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Eye className="w-8 h-8 text-neon-cyan" />
            Future Mode
            {analyzing && <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />}
          </h1>
          <p className="text-muted-foreground mt-1">World Simulator — AI predicts what happens next</p>
        </div>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}>
          {voiceEnabled ? <Mic className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative glass-panel rounded-xl overflow-hidden aspect-video mb-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {!streaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={startCamera} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold neon-glow-lime">
                  <Camera className="w-5 h-5" /> Start Camera
                </motion.button>
              </div>
            )}

            {streaming && overlayVisible && predictions.map((p, i) => (
              <motion.div
                key={i}
                className={`absolute border-2 rounded-lg ${riskColors[p.risk] || riskColors.low}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="absolute -top-6 left-0 text-xs font-mono px-2 py-0.5 rounded bg-background/80 whitespace-nowrap">
                  {p.label} <span className={`ml-1 ${p.risk === "high" ? "text-destructive" : p.risk === "medium" ? "text-neon-lime" : "text-neon-cyan"}`}>●</span>
                </span>
              </motion.div>
            ))}

            {recording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/80 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" /> REC
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {streaming && (
              <>
                <button onClick={stopCamera} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors"><Camera className="w-4 h-4" /> Stop Camera</button>
                <button onClick={() => setAnalysisActive(!analysisActive)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">{analysisActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {analysisActive ? "Pause Analysis" : "Resume Analysis"}</button>
                <button onClick={() => setOverlayVisible(!overlayVisible)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">{overlayVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} Overlay</button>
                <button onClick={() => setNarrationEnabled(!narrationEnabled)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">{narrationEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} Narration</button>
                <button onClick={runAnalysis} disabled={analyzing} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors text-neon-cyan disabled:opacity-50">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Analyze Now
                </button>
                <button onClick={recording ? stopRecording : startRecording} className={`flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors ${recording ? "border-destructive/50" : ""}`}>
                  <div className={`w-3 h-3 rounded-full ${recording ? "bg-destructive animate-pulse" : "bg-destructive/60"}`} /> {recording ? "Stop Rec" : "Record"}
                </button>
              </>
            )}
            {recordedUrl && <a href={recordedUrl} download="muses-future.webm" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium text-neon-lime"><Download className="w-4 h-4" /> Download</a>}
          </div>
        </div>

        {/* AI Results panel */}
        <div className="space-y-4">
          {sceneDescription && (
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="font-heading font-semibold mb-2 text-neon-cyan">Scene Analysis</h3>
              <p className="text-sm text-muted-foreground">{sceneDescription}</p>
            </div>
          )}

          {predictions.length > 0 && (
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="font-heading font-semibold mb-3">Predictions</h3>
              <div className="space-y-2">
                {predictions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.risk === "high" ? "bg-destructive" : p.risk === "medium" ? "bg-neon-lime" : "bg-neon-cyan"}`} />
                      <span className="text-sm">{p.label}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 rounded hover:bg-secondary/50"><ThumbsUp className="w-3.5 h-3.5 text-muted-foreground hover:text-neon-lime" /></button>
                      <button className="p-1 rounded hover:bg-secondary/50"><ThumbsDown className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestedActions.length > 0 && (
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="font-heading font-semibold mb-3 text-neon-lime">Suggested Actions</h3>
              <ul className="space-y-2">
                {suggestedActions.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-neon-lime mt-0.5">→</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!sceneDescription && !predictions.length && (
            <div className="glass-panel p-8 rounded-xl text-center">
              <Eye className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Start the camera to begin AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FutureMode;
