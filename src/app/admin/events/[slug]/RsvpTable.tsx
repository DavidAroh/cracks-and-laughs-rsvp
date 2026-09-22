"use client";

type Rsvp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  source: string | null;
  created_at: string;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Deterministic across server + client: fixed locale, fixed timezone,
// fixed hour cycle — no hydration mismatches.
const formatSubmitted = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export default function RsvpTable({
  rsvps,
  eventName,
}: {
  rsvps: Rsvp[];
  eventName: string;
}) {
  function exportCsv() {
    const header = ["Name", "Email", "Phone", "Birthday", "Heard Via", "Submitted At"];
    const rows = rsvps.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.birthday || "",
      r.source ? capitalize(r.source) : "",
      formatSubmitted(r.created_at),
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventName.replace(/\s+/g, "-").toLowerCase()}-rsvps.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-5">
      <div className="flex justify-end">
        <button
          onClick={exportCsv}
          disabled={!rsvps.length}
          className="btn btn-outline px-4 py-2 text-xs"
        >
          {rsvps.length ? "EXPORT CSV" : "EXPORT CSV"}
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-gold/20">
        {!rsvps.length ? (
          <div className="bg-brick-light/40 px-5 py-10 text-center">
            <p className="font-display text-lg text-gold">
              NOBODY&apos;S HERE YET
            </p>
            <p className="mt-2 text-sm text-cream-dim">
              Once guests scan the QR and submit, they&apos;ll land in this
              table in real time — and in your inbox.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-ink/50">
              <tr>
                <th className="kicker !text-[0.55rem] px-4 py-3">Name</th>
                <th className="kicker !text-[0.55rem] px-4 py-3">Email</th>
                <th className="kicker !text-[0.55rem] px-4 py-3">Phone</th>
                <th className="kicker !text-[0.55rem] px-4 py-3">Birthday</th>
                <th className="kicker !text-[0.55rem] px-4 py-3">Heard via</th>
                <th className="kicker !text-[0.55rem] px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r, i) => (
                <tr
                  key={r.id}
                  className={`transition-colors duration-100 hover:bg-gold/[0.06] ${
                    i % 2 === 0 ? "bg-brick-light/25" : "bg-transparent"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-cream">{r.name}</td>
                  <td className="px-4 py-3 text-cream-dim">
                    <a
                      href={`mailto:${r.email}`}
                      className="transition-colors hover:text-gold"
                    >
                      {r.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 tab-nums text-cream-dim">
                    {r.phone}
                  </td>
                  <td className="px-4 py-3 tab-nums text-cream-dim">
                    {r.birthday ? new Date(`${r.birthday}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.source ? (
                      <span className="rounded-sm border border-gold/25 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                        {capitalize(r.source)}
                      </span>
                    ) : (
                      <span className="text-cream-dim/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tab-nums text-cream-dim/80">
                    {formatSubmitted(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}