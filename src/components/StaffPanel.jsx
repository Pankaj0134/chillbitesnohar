import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";

/**
 * Staff/owner admin panel, meant to live on one trusted device at the
 * counter — not linked from the public nav or footer. PIN is entered each
 * session (held only in component state, never persisted) and is sent
 * with every lookup/redeem/generate call; the actual verification happens
 * inside the staff_lookup()/staff_redeem()/generate_claim_code() Postgres
 * functions, never client-side.
 */
export default function StaffPanel() {
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");

  // QR claim-code generation state
  const [qrCode, setQrCode] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [qrError, setQrError] = useState("");
  const [qrBusy, setQrBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const tickRef = useRef(null);
  const pinRef = useRef(pin);
  pinRef.current = pin; // so the auto-refresh timer always reads the latest PIN without re-subscribing

  async function generateCode() {
    if (!pinRef.current.trim()) {
      setQrError("Enter the staff PIN above first.");
      return null;
    }
    setQrError("");
    const { data, error } = await supabase.rpc("generate_claim_code", { input_pin: pinRef.current });

    if (error) {
      setQrError("Couldn't generate a code. Check the PIN.");
      return null;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setQrCode(row.code);
    setQrExpiresAt(new Date(row.expires_at).getTime());
    return row;
  }

  async function handleGenerateCode() {
    setQrBusy(true);
    await generateCode();
    setQrBusy(false);
  }

  // Drives both the visible countdown and, when autoRefresh is on, fetches
  // a new code automatically the moment the old one expires — so staff
  // never has to touch this again once it's running. Only fires exactly
  // at expiry, never early, so a customer mid-scan never has their code
  // invalidated ahead of its real 5-minute window.
  useEffect(() => {
    if (!qrExpiresAt) {
      setSecondsLeft(0);
      return;
    }
    function tick() {
      const remaining = Math.max(0, Math.round((qrExpiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        if (autoRefresh) {
          generateCode();
        } else {
          setQrCode(null);
          setQrExpiresAt(null);
        }
      }
    }
    tick();
    tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrExpiresAt, autoRefresh]);

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
const claimUrl = qrCode && qrExpiresAt
  ? `${window.location.origin}/?claim=${qrCode}&exp=${qrExpiresAt}`
  : null;

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

          {/* ---------------- QR claim code generator ---------------- */}
          <div className="rounded-2xl border border-hairline p-5 mb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-display font-semibold text-ink text-sm">
                Claim QR Code
              </p>
              <label className="flex items-center gap-1.5 text-xs text-ink/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="accent-amber-500"
                />
                Auto-refresh
              </label>
            </div>
            <p className="text-ink/45 text-xs mb-4">
              Customers scan this with their phone's camera to claim a
              token. Each code is valid for 5 minutes, one-time use.
              {autoRefresh && " With auto-refresh on, a new code appears by itself the moment this one expires — leave this screen open at the counter."}
            </p>

            {qrCode ? (
              <div className="text-center">
                <div className="bg-white border border-hairline rounded-2xl p-4 inline-block mb-3">
                  <QRCodeSVG value={claimUrl} size={220} level="M" fgColor="#111827" bgColor="#ffffff" />
                </div>
                <p className="font-mono font-bold text-2xl text-ink tracking-widest mb-1">
                  {qrCode}
                </p>
                <p
                  className={`text-sm font-medium ${secondsLeft <= 30 ? "text-red-500" : "text-ink/50"}`}
                >
                  {autoRefresh ? "Refreshes" : "Expires"} in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                </p>
                {!autoRefresh && (
                  <button
                    onClick={handleGenerateCode}
                    disabled={qrBusy}
                    className="mt-3 text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Generate a new code instead
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                disabled={qrBusy}
                className="w-full bg-ink text-white font-semibold py-3 rounded-full hover:bg-ink-soft transition-colors disabled:opacity-50"
              >
                {qrBusy ? "Generating…" : "Generate QR Code"}
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
