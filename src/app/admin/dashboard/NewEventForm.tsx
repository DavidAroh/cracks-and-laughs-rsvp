"use client";

import { useState, useTransition, useRef } from "react";
import { createEvent } from "@/app/actions/events";

export default function NewEventForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createEvent(formData);
      if (!result.ok) {
        setError(result.error || "Something went wrong.");
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="card-lg mt-5 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6"
    >
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="ne-name" className="kicker">
          Event name
        </label>
        <input
          id="ne-name"
          name="name"
          required
          placeholder={"Crack's 'n' Laughs — Sept Edition"}
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ne-date" className="kicker">
          Date
        </label>
        <input id="ne-date" name="event_date" type="date" required className="field" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ne-venue" className="kicker">
          Venue
        </label>
        <input
          id="ne-venue"
          name="venue"
          required
          placeholder="Maps Hotel, Ozuoba"
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="ne-host" className="kicker">
          Host (optional)
        </label>
        <input
          id="ne-host"
          name="host"
          placeholder="e.g. Soundmouth"
          className="field"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2.5 text-sm text-ember sm:col-span-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-gold py-3 sm:col-span-2"
      >
        {isPending ? "CREATING…" : "CREATE EVENT"}
      </button>
    </form>
  );
}