"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (!result.ok) {
        setError(result.error || "Something went wrong.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    });
  }

  return (
    <main className="brick-bg grain relative min-h-dvh overflow-hidden">
      <div className="spotlight -left-20 -top-16" />
      <div className="spotlight -right-24 top-44" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-16">
        <div className="rise w-full">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 font-display text-2xl text-gold text-glow-soft">
              ★
            </div>
          </div>

          <h1 className="font-display mt-4 text-center text-4xl text-gold text-glow">
            ADMIN
          </h1>
          <p className="mt-2 text-center text-sm text-cream-dim">
            Crack&apos;s &apos;n&apos; Laughs — backstage door
          </p>

          <div className="ticket-rule mt-6">
            <span className="font-display text-[10px]">★</span>
          </div>

          <form action={handleSubmit} className="mt-8 flex flex-col gap-5">
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
                className="field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="kicker">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="field"
              />
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
              {isPending ? "SIGNING IN…" : "SIGN IN"}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] uppercase tracking-[0.25em] text-cream-dim/60">
            Restricted — crew only
          </p>
        </div>
      </div>
    </main>
  );
}