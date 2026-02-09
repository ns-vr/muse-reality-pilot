import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic as MicIcon, MicOff, Camera, Download, Pause, Play } from "lucide-react";

const WingmanMode = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [scores] = useState({ confidence: 72, clarity: 85, communication: 68 });
  const [tips] = useState([
    "Maintain eye contact with the camera",
    "Slow down your speaking pace slightly",
    "Use more specific examples in your answers",
  ]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true); }
    } catch { console.error("Camera denied"); }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
      if (recording) stopRecording();
    }
  }, [recording]);

  const startRecording = useCallback(() => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => { setRecordedUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: "video/webm" }))); };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => { mediaRecorderRef.current?.stop(); setRecording(false); }, []);

  useEffect(() => {
    if (!voiceEnabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (t.includes("start")) startCamera();
      if (t.includes("stop")) stopCamera();
    };
    r.start();
    return () => r.stop();
  }, [voiceEnabled, startCamera, stopCamera]);

  const scoreColor = (v: number) => v >= 80 ? "text-neon-lime" : v >= 60 ? "text-neon-cyan" : "text-destructive";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <MicIcon className="w-8 h-8 text-neon-cyan" /> Wingman Mode
          </h1>
          <p className="text-muted-foreground mt-1">Real-Time Interview Coach</p>
        </div>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}>
          {voiceEnabled ? <MicIcon className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative glass-panel rounded-xl overflow-hidden aspect-video mb-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!streaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button whileHover={{ scale: 1.05 }} onClick={startCamera} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold neon-glow-lime">
                  <Camera className="w-5 h-5" /> Start Mock Interview
                </motion.button>
              </div>
            )}
            {/* Live tips overlay */}
            {streaming && (
              <div className="absolute bottom-4 left-4 right-4">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel px-4 py-2 rounded-lg text-sm">
                  💡 {tips[0]}
                </motion.div>
              </div>
            )}
            {recording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/80 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" /> REC
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {streaming && (
              <>
                <button onClick={stopCamera} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors"><Camera className="w-4 h-4" /> Stop</button>
                <button onClick={() => setAnalysisActive(!analysisActive)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">{analysisActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {analysisActive ? "Pause" : "Resume"}</button>
                <button onClick={recording ? stopRecording : startRecording} className={`flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors ${recording ? "border-destructive/50" : ""}`}>
                  <div className={`w-3 h-3 rounded-full ${recording ? "bg-destructive animate-pulse" : "bg-destructive/60"}`} /> {recording ? "Stop Rec" : "Record"}
                </button>
              </>
            )}
            {recordedUrl && <a href={recordedUrl} download="muses-interview.webm" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium text-neon-lime hover:bg-secondary/50 transition-colors"><Download className="w-4 h-4" /> Download</a>}
          </div>
        </div>

        {/* Scores panel */}
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-heading font-semibold mb-4">Performance Scores</h3>
            {Object.entries(scores).map(([key, val]) => (
              <div key={key} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key}</span>
                  <span className={`font-mono font-bold ${scoreColor(val)}`}>{val}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${val >= 80 ? "bg-neon-lime" : val >= 60 ? "bg-neon-cyan" : "bg-destructive"}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-heading font-semibold mb-3">Live Tips</h3>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-neon-cyan mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WingmanMode;
