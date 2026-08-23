// Supabase Edge Function: notify-rsvp
// Deploy with: supabase functions deploy notify-rsvp
// Set secrets with:
//   supabase secrets set RESEND_API_KEY=your_resend_key
//   supabase secrets set ADMIN_EMAIL=you@example.com
//   supabase secrets set SUPABASE_URL=https://<ref>.supabase.co
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { event_id, name, email, phone, source } = payload;

    const { data: event } = await supabase
      .from("events")
      .select("name, event_date, venue")
      .eq("id", event_id)
      .single();

    const eventLabel = event
      ? `${event.name} — ${event.event_date} @ ${event.venue}`
      : "your event";

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RSVP <rsvp@yourdomain.com>",
        to: [ADMIN_EMAIL],
        subject: `New RSVP: ${name} — ${eventLabel}`,
        html: `
          <h2>New RSVP received</h2>
          <p><strong>Event:</strong> ${eventLabel}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Heard via:</strong> ${source || "—"}</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      return new Response(JSON.stringify({ ok: false, error: errText }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
    });
  }
});
