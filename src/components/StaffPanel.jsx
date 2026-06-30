import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";

/**
 * Staff/owner admin panel, meant to live on one trusted device at the
 * counter — not linked from the public nav or footer. PIN is entered each
 * session (held only in component state, never persisted) and is sent
 * with every lookup/redeem/generate call; the actual verification happens
 * inside the staff_lookup()/staff_redeem()/generate_daily_code() Postgres
 * functions, never client-side.
 */
export default function StaffPanel() {
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");

  // Daily QR code state. Unlike the old rotating system, this is
  // generated once per calendar day and stays valid all day — calling
  // generate again the same day just returns the same code, so it's
  // safe for staff to print this and tape it to the counter.
  const [qrCode, setQrCode] = useState(null);
  const [qrDate, setQrDate] = useState(null);
  const [qrError, setQrError] = useState("");
  const [qrBusy, setQrBusy] = useState(false);

  async function handleGenerateCode() {
    if (!pin.trim()) {
      setQrError("Enter the staff PIN above first.");
      return;
    }
    setQrBusy(true);
    setQrError("");
    const { data, error } = await supabase.rpc("generate_daily_code", { input_pin: pin });
    setQrBusy(false);

    if (error) {
      setQrError("Couldn't generate a code. Check the PIN.");
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setQrCode(row.code);
    setQrDate(row.claim_date);
  }

  async function handleLookup(e) {
    e.preventDefault();
    setError("");
    setRedeemMsg("");
    setResult(null);

    if (!phone.trim()) {
      setError("Enter a customer phone number.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.rpc("staff_lookup", {
      input_pin: pin,
      customer_phone: phone.trim(),
    });
    setBusy(false);

    if (error) {
      // A failed PIN also surfaces here — treat any RPC error as
      // "PIN rejected or lookup failed" without distinguishing further,
      // so we don't leak whether a phone number exists vs PIN is wrong.
      setError("Lookup failed. Check the PIN and phone number.");
      return;
    }

    if (!data || data.length === 0) {
      setError("No loyalty account found for this phone number.");
      return;
    }
    setResult(data[0]);
  }

  async function handleRedeem() {
    setBusy(true);
    setError("");
    const { error } = await supabase.rpc("staff_redeem", {
      input_pin: pin,
      customer_phone: phone.trim(),
    });
    setBusy(false);

    if (error) {
      setError("Redeem failed. Check the PIN.");
      return;
    }
    setRedeemMsg("Reward redeemed — tokens reset to 0.");
    setResult((prev) => (prev ? { ...prev, tokens: 0 } : prev));
  }

  const claimUrl = qrCode ? `${window.location.origin}/?claim=${qrCode}` : null;

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-card p-7"
        >
          <h1 className="font-display font-bold text-xl text-ink mb-1">Staff Panel</h1>
          <p className="text-ink/50 text-sm mb-6">Chill Bites Nohar — counter</p>

          <label className="block text-xs font-semibold text-ink/60 mb-1.5">Staff PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••"
            className="w-full mb-5 px-4 py-3 rounded-xl border border-hairline focus:border-amber-400 outline-none text-ink"
          />

          {/* ---------------- Daily QR code ---------------- */}
          <div className="rounded-2xl border border-hairline p-5 mb-2">
            <p className="font-display font-semibold text-ink text-sm mb-1">
              Today's Claim QR
            </p>
            <p className="text-ink/45 text-xs mb-4">
              Generate once per day — this code stays valid until midnight,
              so you can print it and tape it at the counter. Customers
              scan it with their phone's camera, then tap Claim to get
              today's token.
            </p>

            {qrCode ? (
              <div className="text-center">
                <div className="bg-white border border-hairline rounded-2xl p-4 inline-block mb-3">
                  <QRCodeSVG value={claimUrl} size={220} level="M" fgColor="#111827" bgColor="#ffffff" />
                </div>
                <p className="font-mono font-bold text-2xl text-ink tracking-widest mb-1">
                  {qrCode}
                </p>
                <p className="text-sm text-ink/50">Valid for {qrDate}</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                disabled={qrBusy}
                className="w-full bg-ink text-white font-semibold py-3 rounded-full hover:bg-ink-soft transition-colors disabled:opacity-50"
              >
                {qrBusy ? "Generating…" : "Generate Today's QR Code"}
              </button>
            )}
            {qrError && <p className="text-red-500 text-sm text-center mt-3">{qrError}</p>}
          </div>
        </motion.div>

        {/* ---------------- Customer lookup / redeem ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-card p-7"
        >
          <p className="font-display font-semibold text-ink text-sm mb-1">Look Up Customer</p>
          <p className="text-ink/45 text-xs mb-4">
            Check a customer's progress or mark a completed reward as redeemed.
          </p>

          <form onSubmit={handleLookup}>
            <label className="block text-xs font-semibold text-ink/60 mb-1.5">Customer Phone Number</label>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="w-full mb-2 px-4 py-3 rounded-xl border border-hairline focus:border-amber-400 outline-none text-ink"
            />

            {error && <p className="text-red-500 text-sm mt-2 mb-1">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-ink text-white font-semibold py-3.5 rounded-full mt-4 hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {busy ? "Looking up…" : "Look Up Customer"}
            </button>
          </form>

          {result && (
            <div className="mt-6 pt-6 border-t border-hairline">
              <p className="text-sm text-ink/50 mb-1">Phone</p>
              <p className="font-semibold text-ink mb-4">{result.phone}</p>

              <p className="text-sm text-ink/50 mb-1">Tokens</p>
              <p className="font-display font-bold text-3xl text-ink mb-4">
                {result.tokens} / 4
              </p>

              <p className="text-sm text-ink/50 mb-1">Total Redeemed</p>
              <p className="font-semibold text-ink mb-5">{result.redeemed_count}</p>

              {redeemMsg ? (
                <p className="text-success font-semibold text-sm">{redeemMsg}</p>
              ) : (
                <button
                  onClick={handleRedeem}
                  disabled={busy || result.tokens < 4}
                  className="w-full bg-success text-white font-semibold py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {result.tokens >= 4 ? "Mark Reward Redeemed" : "Not enough tokens yet"}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}