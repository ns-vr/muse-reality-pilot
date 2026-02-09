import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Camera, Upload, Pause, Play, Eye, EyeOff, Download, Star, Mic, MicOff } from "lucide-react";

const drillTypes = ["Posture Correction", "Balance Training", "Range of Motion", "Strength Building", "Speed Drills"];

const CoachMode = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedVideo(URL.createObjectURL(file));
  };

  const toggleDrill = (drill: string) => {
    setSelectedDrills(prev => prev.includes(drill) ? prev.filter(d => d !== drill) : [...prev, drill]);
  };

  useEffect(() => {
    if (!voiceEnabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (t.includes("start camera")) startCamera();
      if (t.includes("stop camera")) stopCamera();
    };
    r.start();
    return () => r.stop();
  }, [voiceEnabled, startCamera, stopCamera]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-neon-lime" /> Coach Mode
          </h1>
          <p className="text-muted-foreground mt-1">Live Skill Trainer — Analyze posture & technique</p>
        </div>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg glass-panel ${voiceEnabled ? "border-neon-lime/50" : ""}`}>
          {voiceEnabled ? <Mic className="w-5 h-5 text-neon-lime" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video area */}
        <div className="lg:col-span-2">
          <div className="relative glass-panel rounded-xl overflow-hidden aspect-video mb-4">
            {uploadedVideo ? (
              <video src={uploadedVideo} controls className="w-full h-full object-cover" />
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}

            {!streaming && !uploadedVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <motion.button whileHover={{ scale: 1.05 }} onClick={startCamera} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold neon-glow-lime">
                  <Camera className="w-5 h-5" /> Start Camera
                </motion.button>
                <label className="flex items-center gap-3 px-6 py-3 rounded-xl glass-panel border-glow cursor-pointer font-heading font-semibold hover:bg-secondary/50 transition-colors">
                  <Upload className="w-5 h-5" /> Upload Video
                  <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            )}

            {overlayVisible && streaming && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="50%" y1="20%" x2="50%" y2="45%" stroke="hsl(85,100%,50%)" strokeWidth="2" opacity="0.7" />
                <line x1="50%" y1="45%" x2="35%" y2="70%" stroke="hsl(187,100%,45%)" strokeWidth="2" opacity="0.7" />
                <line x1="50%" y1="45%" x2="65%" y2="70%" stroke="hsl(187,100%,45%)" strokeWidth="2" opacity="0.7" />
                <circle cx="50%" cy="18%" r="12" fill="none" stroke="hsl(85,100%,50%)" strokeWidth="2" opacity="0.7" />
              </svg>
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
                <button onClick={() => setOverlayVisible(!overlayVisible)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">{overlayVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} Overlay</button>
                <button onClick={recording ? stopRecording : startRecording} className={`flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors ${recording ? "border-destructive/50" : ""}`}>
                  <div className={`w-3 h-3 rounded-full ${recording ? "bg-destructive animate-pulse" : "bg-destructive/60"}`} /> {recording ? "Stop Rec" : "Record"}
                </button>
              </>
            )}
            {uploadedVideo && <button onClick={() => setUploadedVideo(null)} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium hover:bg-secondary/50 transition-colors">Clear Video</button>}
            {recordedUrl && <a href={recordedUrl} download="muses-coach-recording.webm" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-sm font-medium text-neon-lime hover:bg-secondary/50 transition-colors"><Download className="w-4 h-4" /> Download</a>}
          </div>
        </div>

        {/* Drills & Feedback panel */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-heading font-semibold mb-3">Select Drills</h3>
            <div className="space-y-2">
              {drillTypes.map(drill => (
                <button key={drill} onClick={() => toggleDrill(drill)} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedDrills.includes(drill) ? "bg-primary/20 border border-primary/50 text-foreground" : "glass-panel hover:bg-secondary/50 text-muted-foreground"}`}>
                  {drill}
                </button>
              ))}
            </div>
            {selectedDrills.length > 0 && (
              <motion.button whileHover={{ scale: 1.02 }} className="w-full mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
                Generate {selectedDrills.length} Drill{selectedDrills.length > 1 ? "s" : ""}
              </motion.button>
            )}
          </div>

          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-heading font-semibold mb-3">Rate Guidance</h3>
            <p className="text-sm text-muted-foreground mb-3">How helpful were the drills and voice guidance?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setFeedbackRating(n)}>
                  <Star className={`w-6 h-6 transition-colors ${n <= feedbackRating ? "text-neon-lime fill-neon-lime" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachMode;
