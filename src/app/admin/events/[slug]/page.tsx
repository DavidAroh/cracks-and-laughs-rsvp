import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import EventQr from "./EventQr";
import RsvpTable from "./RsvpTable";
import ActiveToggle from "./ActiveToggle";
import EventActions from "./EventActions";
import CopyLink from "./CopyLink";

export default async function EventDetailPage({
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

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("id, name, email, phone, birthday, source, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "https";

  const rawSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (host ? `${proto}://${host}` : "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  const siteUrl = rawSiteUrl.replace(/\/+$/, "");
  const rsvpUrl = `${siteUrl}/rsvp/${event.slug}`;

  return (
    <main className="brick-bg grain min-h-dvh px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/dashboard"
          className="btn btn-ghost px-1 py-1 text-sm font-medium"
        >
          ← All editions
        </Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display balance break-words text-3xl text-gold text-glow sm:text-4xl">
              {event.name}
            </h1>
            <p className="mt-2 text-sm text-cream-dim">
              {new Date(event.event_date + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}{" "}
              · {event.venue}
              {event.host ? ` · hosted by ${event.host}` : ""}
            </p>
          </div>
          <ActiveToggle eventId={event.id} isActive={event.is_active} />
        </header>

        <div className="rise mt-10 grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]">
          <EventQr
            url={rsvpUrl}
            eventName={event.name}
            eventDate={event.event_date}
            venue={event.venue}
            host={event.host}
            slug={event.slug}
          />

          <div className="card p-5 sm:p-6">
            <p className="kicker">Table QR points to</p>
            <div className="mt-2">
              <CopyLink url={rsvpUrl} />
            </div>
            <ol className="mt-5 flex flex-col gap-3 text-sm text-cream-dim">
              <li className="flex gap-3">
                <span className="font-display shrink-0 text-gold">1</span>
                Print the QR code and place it on a table.
              </li>
              <li className="flex gap-3">
                <span className="font-display shrink-0 text-gold">2</span>
                Guests scan → fill name, email, phone.
              </li>
              <li className="flex gap-3">
                <span className="font-display shrink-0 text-gold">3</span>
                They show up here instantly — and you get an email per
                submission.
              </li>
            </ol>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl text-gold">RSVPS</h2>
              <span className="pill pill-gold tab-nums">
                {rsvps?.length ?? 0}
              </span>
            </div>
          </div>
          <RsvpTable rsvps={rsvps || []} eventName={event.name} />
        </section>

        <EventActions
          eventId={event.id}
          slug={event.slug}
          isActive={event.is_active}
        />
      </div>
    </main>
  );
}