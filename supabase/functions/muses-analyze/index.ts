import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  future: `You are MUSES Future Mode — a world simulator AI. Analyze the image and:
1. Identify all objects, people, vehicles, and environmental elements
2. Predict what might happen next (risks, events, outcomes)
3. Rate each prediction's risk level as "high", "medium", or "low"
4. Suggest optimal actions

Return JSON with this exact structure:
{
  "scene_description": "Brief description of the scene",
  "predictions": [
    { "label": "description of prediction", "risk": "high|medium|low", "x": 0-100, "y": 0-100, "w": 5-40, "h": 5-40 }
  ],
  "suggested_actions": ["action 1", "action 2"],
  "narration": "A spoken narration describing the risks and predictions"
}
Positions (x,y,w,h) are percentages of the image dimensions. Return ONLY valid JSON, no markdown.`,

  coach: `You are MUSES Coach Mode — a live sports and skill trainer AI. Analyze the image/video frame showing a person performing physical activity and:
1. Evaluate posture and body alignment
2. Identify technique issues
3. Provide specific improvement tips
4. Suggest drills

Return JSON with this exact structure:
{
  "activity_detected": "what activity the person is doing",
  "posture_score": 0-100,
  "issues": [
    { "body_part": "e.g. shoulders", "issue": "description", "fix": "how to fix" }
  ],
  "drills": [
    { "name": "drill name", "description": "how to do it", "duration": "time" }
  ],
  "voice_feedback": "Spoken coaching feedback"
}
Return ONLY valid JSON, no markdown.`,

  creator: `You are MUSES Creator Mode — a sketch-to-game AI. Analyze the sketch/drawing and:
1. Identify what is drawn
2. Describe a game concept based on the sketch
3. Generate a simple playable HTML/JS game

Return JSON with this exact structure:
{
  "sketch_description": "what you see in the sketch",
  "game_concept": "description of the game",
  "game_html": "<html>...</html>"
}
The game_html should be a complete, self-contained HTML page with inline CSS and JS that creates a simple playable game based on the sketch. Return ONLY valid JSON, no markdown.`,

  wingman: `You are MUSES Wingman Mode — a real-time interview coach AI. Analyze the image of a person in an interview setting and:
1. Evaluate body language and facial expression
2. Assess confidence and professionalism
3. Give improvement tips

Return JSON with this exact structure:
{
  "body_language_score": 0-100,
  "confidence_score": 0-100,
  "clarity_score": 0-100,
  "communication_score": 0-100,
  "observations": ["observation 1", "observation 2"],
  "tips": ["tip 1", "tip 2", "tip 3"],
  "overall_feedback": "Spoken feedback summary"
}
Return ONLY valid JSON, no markdown.`,

  inventor: `You are MUSES Inventor Mode — a multimodal recipe and AR creator AI. Analyze the image of ingredients/fridge and the user's dietary preference to:
1. Identify visible ingredients
2. Create a fusion recipe
3. Provide step-by-step cooking instructions

The user may include a dietary preference in their message.

Return JSON with this exact structure:
{
  "identified_ingredients": ["ingredient 1", "ingredient 2"],
  "recipe_name": "Name of the dish",
  "cuisine_style": "e.g. Karnataka-style fusion",
  "prep_time": "time",
  "cook_time": "time",
  "steps": [
    { "step": 1, "instruction": "what to do", "highlight": "key action verb" }
  ],
  "nutrition_notes": "brief nutrition info"
}
Return ONLY valid JSON, no markdown.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, image_base64, extra_text } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = systemPrompts[mode];
    if (!systemPrompt) {
      throw new Error(`Unknown mode: ${mode}`);
    }

    const userContent: any[] = [];
    
    if (image_base64) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${image_base64}` },
      });
    }

    const textMessage = extra_text
      ? `Analyze this image. Additional context: ${extra_text}`
      : "Analyze this image.";
    
    userContent.push({ type: "text", text: textMessage });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let parsed;
    try {
      // Remove markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw_response: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("muses-analyze error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
