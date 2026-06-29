import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function SignInPanel({ hasPendingClaim = false }) {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    const { error } = mode === "signup" ? await signUp(phone, password) : await signIn(phone, password);
    setBusy(false);

    if (error) setError(error.message);
    // On success, AuthProvider's session/account state updates and
    // LoyaltyCard re-renders past the sign-in gate automatically.
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white border border-hairline shadow-card p-7"
    >
      {hasPendingClaim && (
        <div className="bg-amber-soft/50 rounded-xl px-4 py-2.5 mb-5">
          <p className="text-xs font-semibold text-amber-700">
            ⏱️ You scanned a code — sign in within a few minutes so it doesn't expire.
          </p>
        </div>
      )}

      <div className="flex gap-1 bg-bg rounded-full p-1 mb-6">
        <button
          type="button"
          onClick={() => { setMode("signin"); setError(""); }}
          className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors ${
            mode === "signin" ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(""); }}
          className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors ${
            mode === "signup" ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          Create Account
        </button>
      </div>

      <h3 className="font-display font-semibold text-lg text-ink mb-1">
        {mode === "signup" ? "Start earning rewards" : "Welcome back"}
      </h3>
      <p className="text-ink/50 text-sm mb-6">
        {mode === "signup"
          ? "Create an account with your phone number so your progress follows you, even on a new device."
          : "Sign in with your phone number to see your loyalty progress."}
      </p>

      <form onSubmit={handleSubmit}>
        <label className="block text-xs font-semibold text-ink/60 mb-1.5">Phone Number</label>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="98765 43210"
          autoComplete="tel"
          className="w-full mb-4 px-4 py-3 rounded-xl border border-hairline focus:border-amber-400 outline-none text-ink"
        />

        <label className="block text-xs font-semibold text-ink/60 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="w-full mb-2 px-4 py-3 rounded-xl border border-hairline focus:border-amber-400 outline-none text-ink"
        />

        {error && <p className="text-red-500 text-sm mt-2 mb-1">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-white font-semibold py-3.5 rounded-full mt-4 transition-colors hover:bg-ink-soft disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
        </button>
      </form>

      <p className="text-ink/35 text-xs text-center mt-5 leading-relaxed">
        We don't verify this phone number with an OTP. Choose a password you
        haven't reused on important accounts.
      </p>
    </motion.div>
  );
}
