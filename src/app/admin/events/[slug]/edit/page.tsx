import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditEventForm from "./EditEventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, slug, name, event_date, venue, host, is_active")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  return (
    <main className="brick-bg grain min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/admin/events/${slug}`}
          className="text-sm text-cream-dim hover:text-gold"
        >
          ← Back to event
        </Link>

        <h1 className="font-display mt-4 text-3xl text-gold text-glow">
          EDIT EVENT
        </h1>
        <p className="mt-1 text-sm text-cream-dim">
          The QR code and RSVP link keep working — only the details change.
        </p>

        <EditEventForm event={event} />
      </div>
    </main>
  );
}