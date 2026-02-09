import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

type AnalysisMode = "future" | "coach" | "creator" | "wingman" | "inventor";

export function useMusesAnalysis(mode: AnalysisMode) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const captureFrame = useCallback((video: HTMLVideoElement): string => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Return base64 without the data URL prefix
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
  }, []);

  const imageToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const analyze = useCallback(async (imageBase64: string, extraText?: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/muses-analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            mode,
            image_base64: imageBase64,
            extra_text: extraText,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (e: any) {
      console.error("Analysis error:", e);
      toast({
        title: "Analysis failed",
        description: e.message || "Something went wrong",
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [mode]);

  return { analyzing, result, setResult, analyze, captureFrame, imageToBase64 };
}
