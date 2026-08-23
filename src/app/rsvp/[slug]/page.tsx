import { createClient } from "@/lib/supabase/server";
import RsvpForm from "./RsvpForm";

export default async function RsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, event_date, venue, host, is_active")
    .eq("slug", slug)
    .single();

  return (
    <main className="brick-bg grain relative min-h-dvh overflow-hidden">
      <div className="spotlight -left-20 -top-16" />
      <div className="spotlight -right-24 top-44" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-16">
        {!event ? (
          <div className="rise text-center">
            <p className="font-display balance text-3xl text-gold text-glow">
              EVENT NOT FOUND
            </p>
            <div className="ticket-rule mt-5 w-full max-w-[200px] text-[10px]">
              <span className="font-display">★</span>
            </div>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-cream-dim">
              This QR code does not match a live event. Check with the door
              for the right table code.
            </p>
          </div>
        ) : !event.is_active ? (
          <div className="rise text-center">
            <p className="font-display balance text-3xl text-gold text-glow">
              RSVPS CLOSED
            </p>
            <div className="ticket-rule mt-5 w-full max-w-[200px] text-[10px]">
              <span className="font-display">★</span>
            </div>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-cream-dim">
              This edition of Crack&apos;s &apos;n&apos; Laughs is no longer
              accepting RSVPs.
            </p>
          </div>
        ) : (
          <RsvpForm
            eventId={event.id}
            eventName={event.name}
            eventDate={event.event_date}
            venue={event.venue}
            host={event.host}
          />
        )}
      </div>
    </main>
  );
}