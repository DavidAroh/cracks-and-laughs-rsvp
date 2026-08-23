import Link from "next/link";

export default function NotFound() {
  return (
    <main className="brick-bg grain relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
      <div className="spotlight -left-20 -top-16" />
      <div className="spotlight -right-24 top-44" />

      <div className="rise relative z-10 text-center">
        <p className="font-display tab-nums text-7xl text-gold text-glow sm:text-8xl">
          404
        </p>
        <div className="ticket-rule mt-6 w-full max-w-[220px] text-[10px]">
          <span className="font-display">★</span>
        </div>
        <h1 className="font-display balance mt-5 text-2xl text-cream">
          THIS JOKE FIZZLED
        </h1>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-cream-dim">
          The page you&apos;re looking for got heckled off stage. It never
          made it to the mic.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/admin/dashboard" className="btn btn-gold px-6 py-3 text-sm">
            BACKSTAGE → DASHBOARD
          </Link>
          <Link href="/" className="btn btn-outline px-6 py-3 text-sm">
            FRONT DOOR
          </Link>
        </div>
        <p className="mt-10 text-[11px] uppercase tracking-[0.25em] text-cream-dim/60">
          RSVP · Crack&apos;s &apos;n&apos; Laughs
        </p>
      </div>
    </main>
  );
}