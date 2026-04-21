import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const ACADEMY_EMAIL = "info.edurushacademy@gmail.com";
// Resend's onboarding sender works without domain verification (good for now).
// Once a domain is verified, swap to e.g. "EduRush Academy <noreply@yourdomain.com>".
const FROM_ADDRESS = "EduRush Academy <onboarding@resend.dev>";

type InquiryType = "consultation" | "session_booking" | "guest_session_booking";

interface InquiryPayload {
  type: InquiryType;
  data: Record<string, unknown>;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function sanitizeText(value: unknown, maxLen = 2000): string {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLen).trim();
}

function buildEmail(opts: {
  heading: string;
  intro: string;
  details: Array<{ label: string; value: string }>;
  notes?: string | null;
  footer: string;
}): string {
  const rows = opts.details
    .filter((d) => d.value && d.value.length > 0)
    .map(
      (d) =>
        `<tr><td style="padding:10px 14px;font-weight:600;color:#1a2744;border-bottom:1px solid #eef1f6;width:38%;vertical-align:top">${escapeHtml(
          d.label
        )}</td><td style="padding:10px 14px;color:#4a5568;border-bottom:1px solid #eef1f6">${escapeHtml(
          d.value
        )}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:600px;width:100%">
<tr><td style="background:linear-gradient(135deg,#1a2744,#2d3f63);padding:28px 32px;text-align:center">
<h1 style="color:#c8933f;font-size:22px;margin:0 0 4px;font-weight:700">EduRush Academy</h1>
<p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0;letter-spacing:0.5px">INTERNATIONAL ACADEMIC EXCELLENCE</p>
</td></tr>
<tr><td style="padding:32px">
<h2 style="color:#1a2744;font-size:20px;margin:0 0 12px">${escapeHtml(opts.heading)}</h2>
<p style="color:#4a5568;font-size:14px;line-height:1.6;margin:0 0 20px">${escapeHtml(opts.intro).replace(/\n/g, "<br>")}</p>
<table width="100%" style="border-radius:12px;overflow:hidden;border:1px solid #eef1f6;margin-bottom:20px" cellpadding="0" cellspacing="0">${rows}</table>
${opts.notes ? `<div style="background:#fef9f0;border-left:4px solid #c8933f;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px"><p style="color:#92631e;font-size:13px;margin:0;line-height:1.5"><strong>Notes:</strong> ${escapeHtml(opts.notes)}</p></div>` : ""}
<p style="color:#718096;font-size:13px;line-height:1.6;margin:0">${escapeHtml(opts.footer)}</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #eef1f6">
<p style="color:#a0aec0;font-size:11px;margin:0">© ${new Date().getFullYear()} EduRush Academy · Tunis, Tunisia</p>
<p style="color:#a0aec0;font-size:11px;margin:4px 0 0">info.edurushacademy@gmail.com · +216 48 044 486</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
}): Promise<{ ok: boolean; status: number; body: unknown }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const payload: Record<string, unknown> = {
    from: FROM_ADDRESS,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.reply_to) payload.reply_to = opts.reply_to;

  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as InquiryPayload;
    if (!payload?.type || !payload?.data) {
      return new Response(
        JSON.stringify({ error: "Missing type or data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Africa/Tunis",
    });

    let adminSubject = "";
    let adminHeading = "";
    let adminIntro = "";
    let details: Array<{ label: string; value: string }> = [];
    let notes: string | null = null;
    let userEmail = "";
    let userName = "";
    let userAutoReplySubject = "We Received Your Request";
    let userAutoReplyContext = "";

    if (payload.type === "consultation") {
      const d = payload.data;
      const fullName = sanitizeText(d.full_name, 100);
      userEmail = sanitizeText(d.email, 255).toLowerCase();
      const phone = sanitizeText(d.phone, 30);
      const curriculum = sanitizeText(d.curriculum, 50);
      const message = sanitizeText(d.message, 2000);

      if (!fullName || !isValidEmail(userEmail) || !message) {
        return new Response(
          JSON.stringify({ error: "Invalid consultation payload" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userName = fullName;
      adminSubject = "New Free Consultation Request – EduRush";
      adminHeading = "New Free Consultation Request";
      adminIntro = `${fullName} just submitted a consultation request through the EduRush website.`;
      details = [
        { label: "Full Name", value: fullName },
        { label: "Email", value: userEmail },
        { label: "Phone", value: phone || "—" },
        { label: "Curriculum", value: curriculum || "—" },
        { label: "Submitted", value: submittedAt },
      ];
      notes = message;
      userAutoReplyContext = "your free consultation request";
    } else if (payload.type === "session_booking" || payload.type === "guest_session_booking") {
      const d = payload.data;
      const fullName = sanitizeText(d.full_name, 100);
      userEmail = sanitizeText(d.email, 255).toLowerCase();
      const phone = sanitizeText(d.phone, 30);
      const subject = sanitizeText(d.subject, 100);
      const level = sanitizeText(d.level, 100);
      const requestedDate = sanitizeText(d.requested_date, 30);
      const requestedTime = sanitizeText(d.requested_time, 30);
      const sessionNotes = sanitizeText(d.notes, 2000);

      if (!fullName || !isValidEmail(userEmail) || !subject || !level) {
        return new Response(
          JSON.stringify({ error: "Invalid booking payload" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userName = fullName;
      const requestType =
        payload.type === "guest_session_booking" ? "Guest Booking" : "Registered Student Booking";

      adminSubject = "New Tutoring Session Request – EduRush";
      adminHeading = "New Tutoring Session Request";
      adminIntro = `${fullName} just requested a tutoring session through the EduRush website.`;
      details = [
        { label: "Student Name", value: fullName },
        { label: "Email", value: userEmail },
        { label: "Phone", value: phone || "—" },
        { label: "Subject", value: subject },
        { label: "Level", value: level },
        { label: "Preferred Date", value: requestedDate || "—" },
        { label: "Preferred Time", value: requestedTime || "—" },
        { label: "Request Type", value: requestType },
        { label: "Submitted", value: submittedAt },
      ];
      notes = sessionNotes || null;
      userAutoReplyContext = "your tutoring session request";
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown inquiry type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1) Notify the academy
    const adminHtml = buildEmail({
      heading: adminHeading,
      intro: adminIntro,
      details,
      notes,
      footer: "Please log in to the Admin Dashboard to manage this request.",
    });

    const adminResult = await sendEmail({
      to: ACADEMY_EMAIL,
      subject: adminSubject,
      html: adminHtml,
      reply_to: userEmail || undefined,
    });

    if (!adminResult.ok) {
      console.error("Academy notification failed:", adminResult.status, adminResult.body);
    } else {
      console.log("Academy notification sent for", payload.type);
    }

    // 2) Auto-reply to the user (best effort — does not fail the request)
    let userResult: { ok: boolean; status: number; body: unknown } | null = null;
    if (userEmail) {
      const userHtml = buildEmail({
        heading: `Thank you${userName ? `, ${userName}` : ""}!`,
        intro:
          `Thank you for contacting EduRush Academy.\n\nOur team has received ${userAutoReplyContext} and will contact you shortly to confirm the details.`,
        details: [
          { label: "Submitted", value: submittedAt },
        ],
        footer:
          "If you need to reach us in the meantime, reply to this email or call +216 48 044 486.",
      });

      try {
        userResult = await sendEmail({
          to: userEmail,
          subject: userAutoReplySubject,
          html: userHtml,
        });
        if (!userResult.ok) {
          console.error("Auto-reply failed:", userResult.status, userResult.body);
        }
      } catch (err) {
        console.error("Auto-reply error:", err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        admin_sent: adminResult.ok,
        admin_status: adminResult.status,
        user_sent: userResult?.ok ?? false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-inquiry-email error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
