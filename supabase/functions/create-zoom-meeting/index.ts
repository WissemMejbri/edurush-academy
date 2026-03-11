import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { session_id, zoom_link } = await req.json();

    // Check if Zoom API key is configured for automatic meeting creation
    const zoomApiKey = Deno.env.get("ZOOM_API_KEY");
    const zoomApiSecret = Deno.env.get("ZOOM_API_SECRET");
    const zoomAccountId = Deno.env.get("ZOOM_ACCOUNT_ID");

    let finalZoomLink = zoom_link || null;

    if (zoomApiKey && zoomApiSecret && zoomAccountId && !zoom_link) {
      // Fetch session details
      const { data: session } = await supabase
        .from("booking_sessions")
        .select("*")
        .eq("id", session_id)
        .single();

      if (session) {
        // Get access token using Server-to-Server OAuth
        const tokenResponse = await fetch(
          `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(`${zoomApiKey}:${zoomApiSecret}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const tokenData = await tokenResponse.json();

        if (tokenData.access_token) {
          // Create Zoom meeting
          const meetingResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic: `EduRush: ${session.subject} - ${session.level}`,
              type: 2, // Scheduled meeting
              start_time: `${session.requested_date}T${session.requested_time}:00`,
              duration: session.duration_minutes,
              timezone: "UTC",
              settings: {
                join_before_host: true,
                waiting_room: false,
                auto_recording: "none",
              },
            }),
          });

          const meetingData = await meetingResponse.json();
          if (meetingData.join_url) {
            finalZoomLink = meetingData.join_url;
          }
        }
      }
    }

    // Update session with zoom link
    if (finalZoomLink) {
      await supabase
        .from("booking_sessions")
        .update({ zoom_link: finalZoomLink })
        .eq("id", session_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        zoom_link: finalZoomLink,
        auto_generated: !zoom_link && !!finalZoomLink,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Zoom meeting error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
