import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic as MicIcon, MicOff, Camera, Download, Pause, Play, Loader2 } from "lucide-react";
import { useMusesAnalysis } from "@/hooks/useMusesAnalysis";

const WingmanMode = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [scores, setScores] = useState({ confidence: 0, clarity: 0, communication: 0, body_language: 0 });
  const [tips, setTips] = useState<string[]>([]);
  const [observations, setObservations] = useState<string[]>([]);
  const [overallFeedback, setOverallFeedback] = useState("");

  const { analyzing, analyze, captureFrame } = useMusesAnalysis("wingman");

  const runAnalysis = useCallback(async () => {
    if (!videoRef.current) return;
    const base64 = captureFrame(videoRef.current);
    const result = await analyze(base64, "This is a mock interview. Analyze my body language and presence.");
    if (result && !result.error) {
      setScores({
        confidence: result.confidence_score || 0,
        clarity: result.clarity_score || 0,
        communication: result.communication_score || 0,
        body_language: result.body_language_score || 0,
      });
      if (result.tips) setTips(result.tips);
      if (result.observations) setObservations(result.observations);
      if (result.overall_feedback) {
        setOverallFeedback(result.overall_feedback);
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(result.overall_feedback);
          u.rate = 1.1;
          speechSynthesis.speak(u);
        }
      }
    }
  }, [analyze, captureFrame]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true); }
    } catch { console.error("Camera denied"); }
  }, []);

  useEffect(() => {
    if (streaming && analysisActive) {
      const t = setTimeout(runAnalysis, 3000);
      const i = setInterval(runAnalysis, 12000);
      return () => { clearTimeout(t); clearInterval(i); };
    }
  }, [streaming, analysisActive, runAnalysis]);

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
    const r = new SR(); r.continuous = true;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (t.includes("start")) startCamera();
      if (t.includes("stop")) stopCamera();
      if (t.includes("analyze")) runAnalysis();
    };
    r.start();
    return () => r.stop();
  }, [voiceEnabled, startCamera, stopCamera, runAnalysis]);

  const scoreColor = (v: number) => v >= 80 ? "bg-neon-lime" : v >= 60 ? "bg-neon-cyan" : "bg-destructive";
  const scoreTextColor = (v: number) => v >= 80 ? "text-neon-lime" : v >= 60 ? "text-neon-cyan" : "text-destructive";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <MicIcon className="w-8 h-8 text-neon-cyan" /> Wingman Mode
            {analyzing && <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />}
          </h1>
          <p className="text-muted-foreground mt-1">Real-Time Interview Coach — AI analyzes your presence</p>
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
            {streaming && tips.length > 0 && (
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
                <button onClick={runAnalysis} disabled={analyzing} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium text-neon-cyan hover:bg-secondary/50 transition-colors disabled:opacity-50">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MicIcon className="w-4 h-4" />} Analyze Now
                </button>
                <button onClick={recording ? stopRecording : startRecording} className={`flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors ${recording ? "border-destructive/50" : ""}`}>
                  <div className={`w-3 h-3 rounded-full ${recording ? "bg-destructive animate-pulse" : "bg-destructive/60"}`} /> {recording ? "Stop Rec" : "Record"}
                </button>
              </>
            )}
            {recordedUrl && <a href={recordedUrl} download="muses-interview.webm" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium text-neon-lime"><Download className="w-4 h-4" /> Download</a>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-heading font-semibold mb-4">Performance Scores</h3>
            {Object.entries(scores).map(([key, val]) => (
              <div key={key} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key.replace("_", " ")}</span>
                  <span className={`font-mono font-bold ${scoreTextColor(val)}`}>{val}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${scoreColor(val)}`} />
                </div>
              </div>
            ))}
          </div>

          {observations.length > 0 && (
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="font-heading font-semibold mb-3">Observations</h3>
              <ul className="space-y-2">
                {observations.map((o, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-neon-cyan mt-0.5">•</span> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tips.length > 0 && (
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="font-heading font-semibold mb-3">Live Tips</h3>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-neon-lime mt-0.5">→</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {overallFeedback && (
            <div className="glass-panel p-5 rounded-xl border border-neon-cyan/30">
              <h3 className="font-heading font-semibold mb-2 text-neon-cyan">AI Feedback</h3>
              <p className="text-sm text-muted-foreground">{overallFeedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WingmanMode;
