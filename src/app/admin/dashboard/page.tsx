import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import NewEventForm from "./NewEventForm";

const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, slug, name, event_date, venue, host, is_active")
    .order("event_date", { ascending: false });

  const eventIds = events?.map((e) => e.id) ?? [];
  const { data: rsvpCounts } = eventIds.length
    ? await supabase.from("rsvps").select("event_id")
    : { data: [] as { event_id: string }[] };

  const countByEvent = new Map<string, number>();
  rsvpCounts?.forEach((r) => {
    countByEvent.set(r.event_id, (countByEvent.get(r.event_id) || 0) + 1);
  });

  const totalRsvps = [...countByEvent.values()].reduce((a, b) => a + b, 0);
  const openEvents = events?.filter((e) => e.is_active).length ?? 0;

  return (
    <main className="brick-bg grain min-h-dvh px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">RSVP</p>
            <h1 className="font-display mt-2 text-3xl text-gold text-glow sm:text-4xl">
              EVENTS
            </h1>
            <p className="mt-1 text-sm text-cream-dim">
              Crack&apos;s &apos;n&apos; Laughs — night-runner console
            </p>
          </div>
          <form action={signOut}>
            <button className="btn btn-ghost py-2 text-sm font-medium">
              Sign out
            </button>
          </form>
        </header>

        <div className="rise mt-10 grid grid-cols-3 gap-3">
          <div className="card flex flex-col items-center px-3 py-4 text-center">
            <span className="font-display tab-nums text-2xl text-gold">
              {events?.length ?? 0}
            </span>
            <span className="kicker mt-1.5 !text-[0.55rem]">Editions</span>
          </div>
          <div className="card flex flex-col items-center px-3 py-4 text-center">
            <span className="font-display tab-nums text-2xl text-gold">
              {openEvents}
            </span>
            <span className="kicker mt-1.5 !text-[0.55rem]">Open now</span>
          </div>
          <div className="card flex flex-col items-center px-3 py-4 text-center">
            <span className="font-display tab-nums text-2xl text-gold">
              {totalRsvps}
            </span>
            <span className="kicker mt-1.5 !text-[0.55rem]">RSVPs in</span>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl text-gold">NEW EDITION</h2>
          <p className="mt-1 text-sm text-cream-dim">
            Schedule the next night — a fresh QR gets printed per event.
          </p>
          <NewEventForm />
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl text-gold">ALL EDITIONS</h2>
            <span className="kicker !text-[0.55rem]">
              {events?.length ?? 0} total
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {!events?.length && (
              <div className="card-lg px-5 py-10 text-center">
                <p className="font-display text-lg text-gold">
                  THE STAGE IS EMPTY
                </p>
                <p className="mt-2 text-sm text-cream-dim">
                  Create your first edition above and it will show up here
                  with its QR code.
                </p>
              </div>
            )}

            {events?.map((event) => {
              const d = new Date(event.event_date + "T00:00:00");
              const day = d.toLocaleDateString("en-US", { day: "numeric" });
              const month = d
                .toLocaleDateString("en-US", { month: "short" })
                .toUpperCase();
              const count = countByEvent.get(event.id) || 0;

              return (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.slug}`}
                  className="card-lg group flex items-center gap-4 px-4 py-4 transition duration-150 hover:border-gold/50 hover:bg-brick-light/60 active:bg-brick-light/80 sm:gap-5 sm:px-5"
                >
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-gold/25 bg-ink/50 py-2">
                    <span className="kicker !text-[0.55rem]">{month}</span>
                    <span className="font-display tab-nums mt-0.5 text-xl leading-none text-gold">
                      {day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-display truncate text-base text-cream group-hover:text-gold-bright sm:text-lg">
                      {event.name}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-cream-dim">
                      {formatDate(event.event_date)} · {event.venue}
                      {event.host ? ` · hosted by ${event.host}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="pill pill-gold">{count} RSVPs</span>
                    <span
                      className={`pill ${
                        event.is_active ? "pill-open" : "pill-closed"
                      }`}
                    >
                      {event.is_active ? (
                        <span className="dot-gold" />
                      ) : (
                        <span className="dot-dim" />
                      )}
                      {event.is_active ? "Open" : "Closed"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}