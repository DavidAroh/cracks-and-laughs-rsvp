"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteEvent, endEvent } from "@/app/actions/events";

type Props = {
  eventId: string;
  slug: string;
  isActive: boolean;
};

export default function EventActions({ eventId, slug, isActive }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleEnd() {
    if (!window.confirm("End this event? RSVPs will close immediately.")) return;
    startTransition(async () => {
      await endEvent(eventId);
      router.refresh();
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        "Delete this event and ALL its RSVPs? This cannot be undone."
      )
    )
      return;
    startTransition(async () => {
      await deleteEvent(eventId);
    });
  }

  return (
    <section className="mt-12 rounded-xl border border-ember/25 bg-brick-light/30 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg text-ember">MANAGE EVENT</h2>
        <span className="kicker !text-[0.55rem]">Danger zone</span>
      </div>
      <p className="mt-1.5 text-sm text-cream-dim">
        Edit the details, close RSVPs for good, or remove this edition along
        with all its RSVPs.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/events/${slug}/edit`}
          className="btn btn-outline px-4 py-2 text-xs"
        >
          EDIT EVENT
        </Link>

        {isActive && (
          <button
            onClick={handleEnd}
            disabled={isPending}
            className="btn btn-danger px-4 py-2 text-xs"
          >
            END EVENT
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="btn btn-danger bg-ember/15 px-4 py-2 text-xs hover:bg-ember/25"
        >
          DELETE EVENT
        </button>
      </div>
    </section>
  );
}