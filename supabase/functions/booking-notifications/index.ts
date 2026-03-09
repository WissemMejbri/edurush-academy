import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  session_id: string;
  event_type: "booked" | "accepted" | "declined" | "cancelled";
  zoom_link?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    // Fetch student profile
    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", session.student_id)
      .single();

    // Fetch teacher profile
    const { data: teacherProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", session.teacher_id)
      .single();

    // Fetch student email from auth
    const { data: studentAuth } = await supabase.auth.admin.getUserById(
      session.student_id
    );
    const { data: teacherAuth } = await supabase.auth.admin.getUserById(
      session.teacher_id
    );

    const studentName = studentProfile?.full_name || "Student";
    const teacherName = teacherProfile?.full_name || "Tutor";
    const studentEmail = studentAuth?.user?.email;
    const teacherEmail = teacherAuth?.user?.email;

    const dateFormatted = new Date(session.requested_date).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const notifications: Array<{ to: string; subject: string; body: string }> =
      [];

    switch (event_type) {
      case "booked":
        // Notify teacher about new booking request
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
              footer:
                "Log in to your EduRush Academy dashboard to accept or decline this request.",
            }),
          });
        }
        // Confirm to student
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
              footer:
                "You will receive an email once the tutor responds to your request.",
            }),
          });
        }
        break;

      case "accepted":
        if (studentEmail) {
          notifications.push({
            to: studentEmail,
            subject: `Session Confirmed! - ${session.subject}`,
            body: buildEmail({
              heading: "Session Confirmed! 🎉",
              message: `Great news! ${teacherName} has accepted your tutoring session.`,
              details: [
                { label: "Tutor", value: teacherName },
                { label: "Subject", value: session.subject },
                { label: "Level", value: session.level },
                { label: "Date", value: dateFormatted },
                { label: "Time", value: session.requested_time },
                ...(zoom_link
                  ? [{ label: "Meeting Link", value: zoom_link }]
                  : []),
              ],
              footer: "We look forward to your session. Good luck!",
            }),
          });
        }
        break;

      case "declined":
        if (studentEmail) {
          notifications.push({
            to: studentEmail,
            subject: `Session Update - ${session.subject}`,
            body: buildEmail({
              heading: "Session Not Available",
              message: `Unfortunately, ${teacherName} is unable to accommodate your session request at this time.`,
              details: [
                { label: "Subject", value: session.subject },
                { label: "Date", value: dateFormatted },
                { label: "Time", value: session.requested_time },
              ],
              footer:
                "You can try booking a different time slot or another tutor from your dashboard.",
            }),
          });
        }
        break;

      case "cancelled":
        // Notify both parties
        const cancelRecipients = [
          studentEmail
            ? { email: studentEmail, name: studentName, isStudent: true }
            : null,
          teacherEmail
            ? { email: teacherEmail, name: teacherName, isStudent: false }
            : null,
        ].filter(Boolean);

        for (const r of cancelRecipients) {
          if (!r) continue;
          notifications.push({
            to: r.email,
            subject: `Session Cancelled - ${session.subject}`,
            body: buildEmail({
              heading: "Session Cancelled",
              message: `A tutoring session for ${session.subject} on ${dateFormatted} at ${session.requested_time} has been cancelled.`,
              details: [
                { label: "Subject", value: session.subject },
                { label: "Date", value: dateFormatted },
                { label: "Time", value: session.requested_time },
              ],
              footer: r.isStudent
                ? "You can book a new session from your dashboard."
                : "The time slot is now available for other bookings.",
            }),
          });
        }
        break;
    }

    // Log notifications (actual email sending would go through a provider)
    console.log(
      `Sending ${notifications.length} notification(s) for event: ${event_type}`
    );
    for (const n of notifications) {
      console.log(`→ To: ${n.to} | Subject: ${n.subject}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notifications.length,
        event_type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
        `<tr><td style="padding:8px 12px;font-weight:600;color:#1a2744;border-bottom:1px solid #eef1f6">${d.label}</td><td style="padding:8px 12px;color:#4a5568;border-bottom:1px solid #eef1f6">${d.value}</td></tr>`
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
<p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px">${opts.message}</p>
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