"use client";

import { useState, useTransition } from "react";
import { submitRsvp } from "@/app/actions/rsvp";

type Props = {
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  host: string | null;
};

// Parse "YYYY-MM-DD" manually (local midnight) so the same calendar
// date renders on server and client regardless of timezone.
const dateParts = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(y, m - 1, day);
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    month: date.toLocaleDateString("en-US", { month: "long" }),
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
    full: date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
  };
};

export default function RsvpForm({
  eventId,
  eventName,
  eventDate,
  venue,
  host,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [guestName, setGuestName] = useState("");
  const { weekday, month, day, full } = dateParts(eventDate);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitRsvp(eventId, formData);
      if (!result.ok) {
        setError(result.error || "Something went wrong.");
        return;
      }
      setGuestName(String(formData.get("name") || ""));
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rise flex w-full flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-4xl tab-nums">
          🎤
        </div>

        <h1 className="font-display balance mt-5 text-3xl text-gold text-glow">
          YOU&apos;RE ON THE LIST
        </h1>

        <div className="ticket-rule mt-5 w-full max-w-[260px] text-[10px]">
          <span className="font-display">★</span>
        </div>

        <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-cream-dim">
          Nice one{guestName ? `, ${guestName.split(" ")[0]}` : ""}. Your spot
          is booked — grab a drink at the bar and get ready to laugh.
        </p>

        <div className="relative mt-7 w-full overflow-hidden rounded-xl border-2 border-dashed border-gold/40 bg-brick/60 p-5">
          <span className="absolute inset-x-0 -top-0.5 py-px text-center font-display text-[9px] tracking-[0.4em] text-gold/80">
            ADMIT ONE
          </span>
          <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-ink" />
          <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-ink" />

          <p className="font-display mt-3 text-base leading-snug text-gold">
            {eventName}
          </p>
          <p className="mt-1.5 text-sm text-cream-dim">
            {full} · {venue}
          </p>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-cream-dim/60">
          Access is free — see you at the mic
        </p>
      </div>
    );
  }

  return (
    <div className="rise w-full">
      <header className="text-center">
        {host && (
          <p className="kicker">Hosted by {host}</p>
        )}

        <h1 className="font-display balance mt-3 text-4xl leading-[1.05] text-gold text-glow sm:text-5xl">
          {eventName}
        </h1>

        <div className="ticket-rule mt-5">
          <span className="font-display text-xs">★</span>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <div className="text-right">
            <p className="kicker !text-[0.6rem]">{weekday}</p>
            <p className="kicker mt-1 !text-[0.6rem]">{month}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gold/40 bg-gold/10">
            <span className="font-display tab-nums text-3xl text-gold text-glow-soft">
              {day}
            </span>
          </div>
          <div className="text-left">
            <p className="kicker !text-[0.6rem]">{venue.split(",")[0]}</p>
            <p className="mt-1 max-w-[90px] text-[10px] leading-tight text-cream-dim/70">
              {venue}
            </p>
          </div>
        </div>
      </header>

      <form action={handleSubmit} className="mt-9 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="kicker">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Ada Obi"
            className="field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="kicker">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ada@email.com"
            className="field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="kicker">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="0803 000 0000"
            className="field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="source" className="kicker">
            Where did you hear about this event?
          </label>
          <select id="source" name="source" defaultValue="" className="field">
            <option value="" disabled>
              Select one
            </option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="a friend">A friend</option>
          </select>
        </div>

        {error && (
          <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2.5 text-sm text-ember">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-gold mt-1 w-full py-3.5 text-lg"
        >
          {isPending ? "SAVING YOUR SEAT…" : "RSVP NOW"}
        </button>
      </form>
    </div>
  );
}