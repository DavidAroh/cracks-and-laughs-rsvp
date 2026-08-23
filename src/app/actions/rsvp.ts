"use server";

import { createClient } from "@/lib/supabase/server";

export type RsvpState = {
  ok: boolean;
  error?: string;
};

export async function submitRsvp(
  eventId: string,
  formData: FormData
): Promise<RsvpState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const source = String(formData.get("source") || "").trim();

  if (!name || !email || !phone) {
    return { ok: false, error: "All fields are required." };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("rsvps").insert({
    event_id: eventId,
    name,
    email,
    phone,
    source: source || null,
  });

  if (error) {
    console.error("RSVP insert error:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}
