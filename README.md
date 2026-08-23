# GhostRSVP — Crack's 'n' Laughs table RSVP system

QR-on-the-table RSVP system: admin creates an event, prints its QR code,
guests scan → fill name/email/phone → admin sees it live on a dashboard
and gets an email per submission. Built to be reused every first Friday.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres + Auth + RLS)
- `qrcode.react` for the printable QR
- Supabase Edge Function + Resend for the email-per-RSVP notification

## 1. Supabase setup
1. Create a project at supabase.com.
2. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
   (Leave the trigger/email part until step 3 — it references a URL you don't have yet.)
3. Go to **Authentication → Users** and manually create your admin user
   (email + password). This is the only account that can log into `/admin`.
4. Go to **Project Settings → API** and copy the Project URL and anon public key.

## 2. Local setup
```bash
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```
Visit `http://localhost:3000` — it redirects to `/admin/login`.

## 3. Email-per-RSVP (optional but requested)
1. Sign up at resend.com and get an API key, verify a sending domain (or use
   their test domain while developing).
2. Install the Supabase CLI, then from the project root:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy notify-rsvp
   supabase secrets set RESEND_API_KEY=your_resend_key
   supabase secrets set ADMIN_EMAIL=you@example.com
   supabase secrets set SUPABASE_URL=https://<your-project-ref>.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. In `supabase/schema.sql`, replace `<YOUR_PROJECT_REF>` and
   `<YOUR_SUPABASE_ANON_KEY>` in the `notify_new_rsvp()` function with your
   real values, then re-run just that function + trigger block in the SQL Editor.
4. Update the `from:` address in `supabase/functions/notify-rsvp/index.ts`
   to a domain you've verified in Resend.

Skip this section entirely and the app still works fine — RSVPs will just
show up on the dashboard without triggering an email.

## 4. Deploy
1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add the same env vars from `.env.local`, plus set
   `NEXT_PUBLIC_SITE_URL` to your real production URL (e.g.
   `https://rsvp.yourdomain.com`) — this is what gets encoded into the QR code.
4. Deploy.

## 5. Running an event night
1. Log into `/admin/login`.
2. Create the event (name, date, venue, host) on the dashboard.
3. Open that event, click **Print QR**, put it on tables.
4. Watch RSVPs land in real time on the event page; export CSV whenever you want a copy.
5. Toggle the event to "Closed" once the night's over — old data stays for your records.

## Notes
- RLS is configured so the public can only insert RSVPs and read event
  names — they can never read the RSVP list. Only your authenticated admin
  account can.
- The QR always points to `/rsvp/[event-slug]`, so each edition gets a
  fresh code without you touching any code.
