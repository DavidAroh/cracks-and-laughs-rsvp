"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleEventActive } from "@/app/actions/events";

export default function ActiveToggle({
  eventId,
  isActive,
}: {
  eventId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await toggleEventActive(eventId, !isActive);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isActive}
      title={isActive ? "RSVPs are open — click to close" : "Closed — click to reopen"}
      className="group flex items-center gap-3 rounded-lg border border-gold/25 bg-brick-light/50 px-4 py-2.5 transition duration-150 hover:border-gold/50 disabled:opacity-60"
    >
      <span className="kicker !text-[0.6rem]">
        {isPending ? "…" : isActive ? "Accepting RSVPs" : "RSVPs closed"}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ${
          isActive ? "bg-gold" : "bg-cream-dim/25"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-150 ${
            isActive ? "left-[18px] bg-ink" : "left-0.5 bg-cream-dim"
          }`}
        />
      </span>
    </button>
  );
}