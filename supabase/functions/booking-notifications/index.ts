import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationPayload {
  session_id: string;
  event_type: "booked" | "application_received" | "accepted" | "declined" | "cancelled" | "tutor_assigned" | "scheduled";
  zoom_link?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: claimsData, error: claimsError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.user.id;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { session_id, event_type, zoom_link } =
      (await req.json()) as NotificationPayload;

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    // Verify caller is a participant or admin
    const isParticipant = callerId === session.student_id || callerId === session.teacher_id;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!isParticipant && !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch student profile
    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", session.student_id)
      .single();

    // Fetch student email from auth
    const { data: studentAuth } = await supabase.auth.admin.getUserById(
      session.student_id
    );

    const studentName = studentProfile?.full_name || "Student";
    const studentEmail = studentAuth?.user?.email;

    const dateFormatted = new Date(session.requested_date).toLocaleDateString(
      "en-US",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );

    const notifications: Array<{ to: string; subject: string; body: string }> = [];

    switch (event_type) {
      case "application_received":
        // Confirmation email to student
        if (studentEmail) {
          notifications.push({
            to: studentEmail,
            subject: "EduRush Tutoring Request Received",
            body: buildEmail({
              heading: "Tutoring Request Received",
              message: `Thank you for applying for tutoring with EduRush Academy.\n\nWe have received your request and our team will review it shortly. You will receive a confirmation once a tutor has been assigned.`,
              details: [
                { label: "Program Requested", value: `${session.subject} — ${session.level}` },
                { label: "Preferred Date", value: dateFormatted },
                { label: "Preferred Time", value: session.requested_time },
              ],
              notes: session.notes,
              footer: "Our team will be in touch soon. Thank you for choosing EduRush Academy!",
            }),
          });
        }
        break;

      case "booked":
        // Legacy support — notify teacher about new booking request
        {
          const { data: teacherProfile } = await supabase
            .from("profiles").select("full_name").eq("user_id", session.teacher_id).single();
          const { data: teacherAuth } = await supabase.auth.admin.getUserById(session.teacher_id);
          const teacherName = teacherProfile?.full_name || "Tutor";
          const teacherEmail = teacherAuth?.user?.email;

          if (teacherEmail) {
            notifications.push({
              to: teacherEmail,
              subject: `New Session Request - ${session.subject}`,
              body: buildEmail({
                heading: "New Session Request",
                message: `${studentName} has requested a tutoring session with you.`,
                details: [
                  { label: "Subject", value: session.subject },
                  { label: "Level", value: session.level },
                  { label: "Date", value: dateFormatted },
                  { label: "Time", value: session.requested_time },
                ],
                notes: session.notes,
                footer: "Log in to your EduRush Academy dashboard to accept or decline this request.",
              }),
            });
          }
          if (studentEmail) {
            notifications.push({
              to: studentEmail,
              subject: `Session Requested - ${session.subject}`,
              body: buildEmail({
                heading: "Session Request Sent",
                message: `Your tutoring session request with ${teacherName} has been submitted.`,
                details: [
                  { label: "Tutor", value: teacherName },
                  { label: "Subject", value: session.subject },
                  { label: "Level", value: session.level },
                  { label: "Date", value: dateFormatted },
                  { label: "Time", value: session.requested_time },
                ],
                notes: session.notes,
                footer: "You will receive an email once the tutor responds to your request.",
              }),
            });
          }
        }
        break;

      case "accepted":
        if (studentEmail) {
          notifications.push({
            to: studentEmail,
            subject: `Session Confirmed! - ${session.subject}`,
            body: buildEmail({
              heading: "Session Confirmed! 🎉",
              message: `Great news! Your tutoring session has been confirmed.`,
              details: [
                { label: "Subject", value: session.subject },
                { label: "Level", value: session.level },
                { label: "Date", value: dateFormatted },
                { label: "Time", value: session.requested_time },
                ...(zoom_link ? [{ label: "Meeting Link", value: zoom_link }] : []),
              ],
              footer: "We look forward to your session. Good luck!",
            }),
          });
        }
        break;

      case "tutor_assigned":
        if (studentEmail) {
          notifications.push({
            to: studentEmail,
            subject: `Tutor Assigned - ${session.subject}`,
            body: buildEmail({
              heading: "A Tutor Has Been Assigned",
              message: `We've assigned a tutor to your ${session.subject} request. You will receive scheduling details soon.`,
              details: [
                { label: "Subject", value: session.subject },
                { label: "Level", value: session.level },
                { label: "Preferred Date", value: dateFormatted },
                { label: "Preferred Time", value: session.requested_time },
              ],
              footer: "Our team will confirm the final session schedule shortly.",
            }),
          });
        }
        break;

      case "declined":
      case "scheduled":
      case "cancelled":
        // Keep existing behavior for these
        if (studentEmail) {
          const headings: Record<string, string> = {
            declined: "Request Not Approved",
            scheduled: "Session Scheduled",
            cancelled: "Session Cancelled",
          };
          const messages: Record<string, string> = {
            declined: "Unfortunately, we are unable to accommodate your tutoring request at this time.",
            scheduled: `Your tutoring session for ${session.subject} has been scheduled.`,
            cancelled: `Your tutoring session for ${session.subject} has been cancelled.`,
          };
          notifications.push({
            to: studentEmail,
            subject: `${headings[event_type]} - ${session.subject}`,
            body: buildEmail({
              heading: headings[event_type],
              message: messages[event_type],
              details: [
                { label: "Subject", value: session.subject },
                { label: "Date", value: dateFormatted },
                { label: "Time", value: session.requested_time },
              ],
              footer: event_type === "declined"
                ? "You can submit a new request from your dashboard."
                : "Check your dashboard for more details.",
            }),
          });
        }
        break;
    }

    console.log(`Sending ${notifications.length} notification(s) for event: ${event_type}`);
    for (const n of notifications) {
      console.log(`→ To: ${n.to} | Subject: ${n.subject}`);
    }

    return new Response(
      JSON.stringify({ success: true, notifications_sent: notifications.length, event_type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Notification error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail(opts: {
  heading: string;
  message: string;
  details: Array<{ label: string; value: string }>;
  notes?: string | null;
  footer: string;
}): string {
  const rows = opts.details
    .map(
      (d) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#1a2744;border-bottom:1px solid #eef1f6">${escapeHtml(d.label)}</td><td style="padding:8px 12px;color:#4a5568;border-bottom:1px solid #eef1f6">${escapeHtml(d.value)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
<tr><td style="background:linear-gradient(135deg,#1a2744,#2d3f63);padding:32px 40px;text-align:center">
<h1 style="color:#c8933f;font-size:24px;margin:0 0 4px">EduRush Academy</h1>
<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0">International Academic Excellence</p>
</td></tr>
<tr><td style="padding:40px">
<h2 style="color:#1a2744;font-size:22px;margin:0 0 16px">${opts.heading}</h2>
<p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px">${opts.message.replace(/\n/g, "<br>")}</p>
<table width="100%" style="border-radius:12px;overflow:hidden;border:1px solid #eef1f6;margin-bottom:24px" cellpadding="0" cellspacing="0">
${rows}
</table>
${opts.notes ? `<div style="background:#fef9f0;border-left:4px solid #c8933f;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px"><p style="color:#92631e;font-size:14px;margin:0"><strong>Notes:</strong> ${opts.notes}</p></div>` : ""}
<p style="color:#718096;font-size:14px;line-height:1.6;margin:0">${opts.footer}</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #eef1f6">
<p style="color:#a0aec0;font-size:12px;margin:0">© ${new Date().getFullYear()} EduRush Academy · Tunis, Tunisia</p>
<p style="color:#a0aec0;font-size:12px;margin:4px 0 0">info.edurushacademy@gmail.com · +216 48 044 486</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
