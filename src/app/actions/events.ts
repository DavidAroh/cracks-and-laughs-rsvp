"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type EventState = {
  ok: boolean;
  error?: string;
};

function slugify(name: string, date: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${date}`;
}

export async function createEvent(formData: FormData): Promise<EventState> {
  const name = String(formData.get("name") || "").trim();
  const event_date = String(formData.get("event_date") || "").trim();
  const venue = String(formData.get("venue") || "").trim();
  const host = String(formData.get("host") || "").trim();

  if (!name || !event_date || !venue) {
    return { ok: false, error: "Name, date, and venue are required." };
  }

  const supabase = await createClient();
  const slug = slugify(name, event_date);

  const { error } = await supabase.from("events").insert({
    name,
    event_date,
    venue,
    host: host || null,
    slug,
    is_active: true,
  });

  if (error) {
    return {
      ok: false,
      error: error.message.includes("duplicate")
        ? "An event with this name and date already exists."
        : "Something went wrong creating the event.",
    };
  }

  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function toggleEventActive(eventId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase
    .from("events")
    .update({ is_active: isActive })
    .eq("id", eventId);
  revalidatePath("/admin/dashboard");
}

export async function updateEvent(
  eventId: string,
  formData: FormData
): Promise<EventState> {
  const name = String(formData.get("name") || "").trim();
  const event_date = String(formData.get("event_date") || "").trim();
  const venue = String(formData.get("venue") || "").trim();
  const host = String(formData.get("host") || "").trim();

  if (!name || !event_date || !venue) {
    return { ok: false, error: "Name, date, and venue are required." };
  }

  const supabase = await createClient();

  // Slug intentionally stays unchanged — printed QR codes point at it,
  // and changing it would break codes already on tables.
  const { error } = await supabase
    .from("events")
    .update({ name, event_date, venue, host: host || null })
    .eq("id", eventId);

  if (error) {
    return { ok: false, error: "Something went wrong updating the event." };
  }

  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function endEvent(eventId: string) {
  const supabase = await createClient();
  await supabase.from("events").update({ is_active: false }).eq("id", eventId);
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}
