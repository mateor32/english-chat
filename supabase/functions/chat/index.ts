import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CORRECTION_INSTRUCTIONS = `
For every user message:
1. Detect mistakes
2. If there are mistakes:
   - Show the incorrect sentence
   - Provide a corrected version
   - Give a short explanation (simple English)
3. If there are no mistakes:
   - Say it's correct briefly

Format your correction like this:

❌ Error: [original sentence]
✅ Correction: [correct sentence]
💡 Explanation: [short explanation]

OR (if correct):
✅ Correct! Good job!

Then continue the conversation normally.`;

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are a friendly English conversation partner and tutor.

Rules:
- Speak naturally like a real person
- Keep responses short and clear (2-4 sentences after the correction)
- Ask questions to continue the conversation
- Adapt to a basic English level (A2)
- Be engaging and friendly
- Never switch to another language unless asked

${CORRECTION_INSTRUCTIONS}

Goal:
Help the user improve their English through natural conversation while correcting their mistakes.`,

  es: `You are a friendly Spanish conversation partner and tutor. Speak only in Spanish.

Rules:
- Speak naturally like a real person, always in Spanish
- Keep responses short and clear (2-4 sentences after the correction)
- Ask questions to continue the conversation
- Adapt to a basic Spanish level (A2)
- Be engaging and friendly
- Never switch to another language unless asked

${CORRECTION_INSTRUCTIONS}

Goal:
Help the user improve their Spanish through natural conversation while correcting their mistakes.`,

  pt: `You are a friendly Portuguese conversation partner and tutor. Speak only in Portuguese.

Rules:
- Speak naturally like a real person, always in Portuguese
- Keep responses short and clear (2-4 sentences after the correction)
- Ask questions to continue the conversation
- Adapt to a basic Portuguese level (A2)
- Be engaging and friendly
- Never switch to another language unless asked

${CORRECTION_INSTRUCTIONS}

Goal:
Help the user improve their Portuguese through natural conversation while correcting their mistakes.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = (language && SYSTEM_PROMPTS[language]) ? language : "en";
    const systemPrompt = SYSTEM_PROMPTS[lang];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
