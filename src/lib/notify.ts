// Free-tier notification using FormSubmit (https://formsubmit.co)
// No API key required. First-ever submission to a new email triggers a one-time
// confirmation link sent to that inbox by FormSubmit — click it once and all
// subsequent submissions arrive directly.
//
// All inquiries are routed to the academy inbox below. Submissions are also
// persisted in the database by the calling component, so a network failure
// here never loses data.

const ACADEMY_EMAIL = "support@infoedurushacademy.com";
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${ACADEMY_EMAIL}`;

export type InquiryKind = "consultation" | "session_booking" | "guest_session_booking";

interface NotifyPayload {
  kind: InquiryKind;
  subject: string; // Email subject line shown in the academy inbox
  visitorName: string;
  visitorEmail: string;
  fields: Record<string, string | undefined | null>;
  // Optional auto-reply text sent by FormSubmit to the visitor's email
  autoReplyMessage?: string;
}

function sanitize(value: unknown, max = 2000): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[\r\n]+/g, " ").slice(0, max).trim();
}

/**
 * Send a notification email via FormSubmit. Best-effort: returns true on success,
 * false on failure. The caller MUST also persist the submission to the database
 * so that data is never lost if FormSubmit is unreachable.
 */
export async function sendInquiryNotification(payload: NotifyPayload): Promise<boolean> {
  try {
    const body: Record<string, string> = {
      _subject: sanitize(payload.subject, 200),
      _template: "table",
      _captcha: "false",
      name: sanitize(payload.visitorName, 100),
      email: sanitize(payload.visitorEmail, 255),
      inquiry_type: payload.kind,
    };

    for (const [k, v] of Object.entries(payload.fields)) {
      if (v === undefined || v === null || v === "") continue;
      body[k] = sanitize(v);
    }

    if (payload.autoReplyMessage) {
      body._autoresponse = sanitize(payload.autoReplyMessage, 1500);
    }

    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("FormSubmit failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("FormSubmit error:", err);
    return false;
  }
}
