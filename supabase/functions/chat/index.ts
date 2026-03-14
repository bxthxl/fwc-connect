import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the FWC Worship Team Assistant — a friendly, concise helper embedded in the FWC Worship Team app.

About the app:
- This is a choir management platform for the FWC (Faith World Church) Worship Team.
- Members can view upcoming meetings, events, songs for the week, meeting minutes, birthdays, and participate in discussions.
- Members have profiles with voice group (soprano, alto, tenor, bass, instrumentalist), instruments, and contact info.
- Admins (Branch Admins) can create meetings, events, announcements, manage songs, take attendance, and assign roles.
- General Admins (Super Admins) can manage all branches, assign admin roles, and view cross-branch data.
- The app has a sidebar navigation with sections for Members and Admin.

Key features:
- **Home/Dashboard**: Overview with announcements, upcoming meetings/events, and birthday celebrations.
- **Meetings**: View upcoming and past choir meetings with details.
- **Events**: View upcoming events with dress codes and BGV (backup vocalist) assignments.
- **Songs**: Browse the song library and see weekly song assignments.
- **Minutes**: Read published meeting minutes.
- **Birthdays**: See whose birthday is today or coming up.
- **Discussions**: Community discussion forum for choir members.
- **Profile**: Update personal info, avatar, voice group, instruments, and password.

Admin features:
- Members management, role assignment, attendance tracking, minutes writing, song management, announcements, event management, onboarding content, BGV selector, and branch settings.

Answer user questions about how to use the app, where to find features, and general guidance. Be warm, helpful, and brief. If you don't know something specific, say so honestly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
