"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/app/actions/events";

type Props = {
  event: {
    id: string;
    slug: string;
    name: string;
    event_date: string;
    venue: string;
    host: string | null;
  };
};

export default function EditEventForm({ event }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateEvent(event.id, formData);
      if (!result.ok) {
        setError(result.error || "Something went wrong.");
        return;
      }
      router.push(`/admin/events/${event.slug}`);
      router.refresh();
    });
  }

  return (
    <form
      action={handleSubmit}
      className="card-lg mt-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6"
    >
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="e-name" className="kicker">
          Event name
        </label>
        <input
          id="e-name"
          name="name"
          required
          defaultValue={event.name}
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="e-date" className="kicker">
          Date
        </label>
        <input
          id="e-date"
          name="event_date"
          type="date"
          required
          defaultValue={event.event_date}
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="e-venue" className="kicker">
          Venue
        </label>
        <input
          id="e-venue"
          name="venue"
          required
          defaultValue={event.venue}
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="e-host" className="kicker">
          Host (optional)
        </label>
        <input
          id="e-host"
          name="host"
          defaultValue={event.host ?? ""}
          className="field"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2.5 text-sm text-ember sm:col-span-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-gold px-6 py-3 text-sm"
        >
          {isPending ? "SAVING…" : "SAVE CHANGES"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => router.push(`/admin/events/${event.slug}`)}
          className="btn btn-outline px-6 py-3 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}