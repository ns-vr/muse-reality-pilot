import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Pause, Play, Eye, EyeOff, Download, Volume2, VolumeX, ThumbsUp, ThumbsDown, Mic, MicOff } from "lucide-react";

const FutureMode = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [predictions, setPredictions] = useState<Array<{ id: number; label: string; risk: string; x: number; y: number; w: number; h: number }>>([]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        // Simulate predictions
        setTimeout(() => {
          setPredictions([
            { id: 1, label: "Vehicle approaching", risk: "high", x: 15, y: 30, w: 25, h: 20 },
            { id: 2, label: "Pedestrian crossing", risk: "medium", x: 55, y: 45, w: 15, h: 30 },
            { id: 3, label: "Obstruction ahead", risk: "low", x: 70, y: 20, w: 20, h: 15 },
          ]);
        }, 2000);
      }
    } catch {
      console.error("Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
      setPredictions([]);
      if (recording) stopRecording();
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

  // Voice commands
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
    };
    recognition.start();
    return () => recognition.stop();
  }, [voiceEnabled, startCamera, stopCamera, startRecording, stopRecording]);

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
          </h1>
          <p className="text-muted-foreground mt-1">World Simulator — Predict what happens next</p>
        </div>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}
          title="Toggle voice commands"
        >
          {voiceEnabled ? <Mic className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      {/* Camera feed */}
      <div className="relative glass-panel rounded-xl overflow-hidden aspect-video mb-4">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {!streaming && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCamera}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold neon-glow-lime"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </motion.button>
          </div>
        )}

        {/* Risk overlays with pulsing animation */}
        {streaming && overlayVisible && predictions.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute border-2 rounded-lg ${riskColors[p.risk]}`}
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

        {/* Recording indicator */}
        {recording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/80 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            REC
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {streaming && (
          <>
            <button onClick={stopCamera} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">
              <Camera className="w-4 h-4" /> Stop Camera
            </button>
            <button onClick={() => setAnalysisActive(!analysisActive)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">
              {analysisActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {analysisActive ? "Pause Analysis" : "Resume Analysis"}
            </button>
            <button onClick={() => setOverlayVisible(!overlayVisible)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">
              {overlayVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {overlayVisible ? "Hide Overlay" : "Show Overlay"}
            </button>
            <button onClick={() => setNarrationEnabled(!narrationEnabled)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">
              {narrationEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {narrationEnabled ? "Mute Narration" : "Enable Narration"}
            </button>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors ${recording ? "border-destructive/50" : ""}`}
            >
              <div className={`w-3 h-3 rounded-full ${recording ? "bg-destructive animate-pulse" : "bg-destructive/60"}`} />
              {recording ? "Stop Recording" : "Record"}
            </button>
          </>
        )}
        {recordedUrl && (
          <a href={recordedUrl} download="muses-future-recording.webm" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium text-neon-lime hover:bg-secondary/50 transition-colors">
            <Download className="w-4 h-4" /> Download Recording
          </a>
        )}
      </div>

      {/* Prediction feedback */}
      {predictions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-heading font-semibold mb-3">Predictions</h3>
          <div className="space-y-2">
            {predictions.map((p) => (
              <div key={p.id} className="flex items-center justify-between glass-panel px-4 py-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${p.risk === "high" ? "bg-destructive" : p.risk === "medium" ? "bg-neon-lime" : "bg-neon-cyan"}`} />
                  <span className="text-sm">{p.label}</span>
                  <span className="text-xs text-muted-foreground capitalize">({p.risk} risk)</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 rounded hover:bg-secondary/50 transition-colors" title="Accurate prediction">
                    <ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-neon-lime" />
                  </button>
                  <button className="p-1 rounded hover:bg-secondary/50 transition-colors" title="Inaccurate prediction">
                    <ThumbsDown className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureMode;
