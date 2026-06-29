# Supabase Setup — From Scratch

Follow these in order. Total time: ~15 minutes.

## 1. Create your Supabase project

1. Go to https://supabase.com and click **Start your project**.
2. Sign up (GitHub login is fastest) — this is free, no card required for the free tier.
3. Click **New Project**.
4. Pick an organization (it'll create a default one for you), name the project (e.g. `chill-bites-nohar`), set a **database password** (save this somewhere — you won't need it day-to-day, but you'll need it if you ever connect directly to Postgres).
5. Pick the region closest to your customers (e.g. **Mumbai (ap-south-1)** for Rajasthan).
6. Click **Create new project** and wait ~2 minutes while it provisions.

## 2. Turn off email confirmation

This app authenticates with phone number + password, not real email — but the Supabase client requires an email-shaped field under the hood (see the comment in `src/hooks/useAuth.jsx` for why). Since there's no real email to confirm, you must disable confirmation or sign-up will get stuck.

1. In your project, go to **Authentication → Providers → Email**.
2. Find **Confirm email** and turn it **off**.
3. Save.

## 3. Run the database schema

1. Go to **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this project, copy all of it, paste it in, and click **Run**.
4. Open a second new query, copy all of `supabase/claim_token_function.sql`, paste, and **Run**.
5. Open a third new query, copy all of `supabase/claim_codes_migration.sql`, paste, and **Run**. This adds the rotating QR claim codes — without it, the staff panel's "Generate QR Code" button and customer claims will both fail.

You should see "Success" for all three.

**If you later see an error like `function crypt(text, text) does not exist`** when generating a QR code or setting a staff PIN: newer Supabase projects install the `pgcrypto` extension into a schema called `extensions` rather than `public`. Run this once to fix it:

```sql
create extension if not exists pgcrypto;
```

The functions in this project already look in both `public` and `extensions` (see `set search_path = public, extensions` in each `.sql` file), so once the extension exists anywhere reachable, this resolves itself — you don't need to edit any code.

## 4. Create your first staff PIN

Still in the SQL Editor, run this (replace `123456` with a real PIN you'll remember, and pick a real name):

```sql
insert into public.staff (name, pin_hash)
values ('Counter Staff', crypt('123456', gen_salt('bf')));
```

This is the PIN you'll type into `/staff` at the counter. You can add more rows later for more staff members, each with their own PIN.

## 5. Get your API keys

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon public** key (NOT the `service_role` key — never put that one in frontend code).

## 6. Configure the app

1. In the project folder, copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Restart the dev server if it's running (`Ctrl+C` then `npm run dev` again) — Vite only reads `.env` at startup.

## 7. Test it

1. Open the site, scroll to the loyalty section, click **Create Account**.
2. Enter a phone number and password, submit.
3. You should land on the "0/4 Visits Completed" screen — it will say **"Scan the QR code at the counter"** since there's no claim code in the URL yet.
4. Open `yoursite.com/staff` in a second tab (or a second device), enter your PIN, and click **Generate QR Code**.
5. With your phone's camera (or by copying the QR's URL manually for a quick desktop test), open the link the QR points to — it looks like `yoursite.com/?claim=482917`.
6. Back on the loyalty section, you should now see the real **"Claim Today's Token"** button. Click it — it should animate to 1/4.
7. Go to **Table Editor → loyalty_accounts** in Supabase and confirm you see a row with `tokens = 1`.
8. Try opening the same `?claim=482917` link again (e.g. from browser history) — it should fail with "already used."
9. In the staff panel, enter the phone number you signed up with under **Look Up Customer** — you should see the same token count.

## Notes on what's NOT verified

- **No OTP**: anyone can type any phone number when signing up. There's no proof the number is real or belongs to them. This was a deliberate choice to avoid SMS costs — see the main README for the tradeoff.
- **Phone number reuse risk**: telecom companies eventually recycle abandoned numbers. If a customer's old number gets reassigned to someone else, that person could theoretically try the password-reset flow (not yet built) against the old account. Low stakes here (worst case: a stranger sees a token count), but worth knowing.

## Going further (optional, not built here)

- **Password reset flow**: currently there's no "forgot password" — if a customer forgets theirs, you'd need to manually reset it via the Supabase dashboard (Authentication → Users → find by the pseudo-email → reset password) or build a reset UI.
- **Rate limiting on sign-up**: nothing currently stops someone from scripting hundreds of fake sign-ups. Supabase has built-in abuse protection on auth endpoints, but for serious abuse-resistance you'd want CAPTCHA (Supabase supports hCaptcha/Turnstile on auth forms).
