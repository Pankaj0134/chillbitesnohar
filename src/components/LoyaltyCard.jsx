import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useLoyalty } from "../hooks/useLoyalty";
import { useAuth } from "../hooks/useAuth";
import { BRAND } from "../data/content";
import SignInPanel from "./SignInPanel";

function fireConfetti() {
  const colors = ["#F59E0B", "#10B981", "#111827", "#FDE68A"];
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors });
  confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors, angle: 60, decay: 0.92 });
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors, angle: 120, decay: 0.92 });
  }, 150);
}

export default function LoyaltyCard() {
  const { session, account, loading: authLoading, signOut } = useAuth();
  const loyalty = useLoyalty();
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(loyalty.isComplete);
  const [claimCode, setClaimCode] = useState(null);
  const [claimError, setClaimError] = useState("");

  // The counter QR points at e.g. chillbitesnohar.com/?claim=482917 — pick
  // that code up from the URL once on load. Unlike the old system, this
  // code has no expiry timer on the client: it's valid for the whole
  // calendar day, and the server is the source of truth for that.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("claim")?.trim();
    if (code) {
      setClaimCode(code);
      // Clean the code out of the visible URL so it can't be trivially
      // copied from the address bar and reused later from outside the
      // cafe — claiming still always requires having scanned today's
      // physical QR in the first place.
      params.delete("claim");
      const newSearch = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (newSearch ? `?${newSearch}` : "") + "#loyalty"
      );
    }
  }, []);

  async function handleClaim() {
    if (!claimCode) return;
    setClaiming(true);
    setClaimError("");

    // Capture the count BEFORE claiming. Reading loyalty.tokens after the
    // await can be stale — refreshAccount() updates state asynchronously,
    // and this check would sometimes run before that re-render lands,
    // silently skipping the unlock animation on the 4th claim.
    const tokensBeforeClaim = loyalty.tokens;
    const result = await loyalty.claimToken(claimCode);
    setClaiming(false);

    // The code is single-use per session either way — burn it locally
    // now so a double-click or retry can't resend the same attempt.
    setClaimCode(null);

    if (!result.success) {
      setClaimError(result.message);
      return;
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1800);

    if (tokensBeforeClaim + 1 >= loyalty.tokensNeeded) {
      setTimeout(() => {
        setJustUnlocked(true);
        fireConfetti();
      }, 600);
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(BRAND.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const showUnlockedState = loyalty.isComplete && justUnlocked;

  return (
    <section id="loyalty" className="px-5 sm:px-8 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-3xl text-ink">⭐ Loyalty Progress</h2>
        </div>

        {authLoading ? (
          <div className="text-center text-ink/40 py-12">Loading…</div>
        ) : !session ? (
          <SignInPanel hasPendingClaim={!!claimCode} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-sm text-ink/50">
                Signed in as <span className="font-semibold text-ink/70">{account?.phone}</span>
              </p>
              <button onClick={signOut} className="text-sm font-medium text-ink/40 hover:text-ink/70">
                Sign out
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl bg-white shadow-card border border-hairline p-7 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {!showUnlockedState ? (
                  <motion.div
                    key="progress"
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Token slots */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                      {Array.from({ length: loyalty.tokensNeeded }).map((_, i) => {
                        const filled = i < loyalty.tokens;
                        return (
                          <motion.div
                            key={i}
                            className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                            style={{
                              background: filled ? "#10B981" : "#F1F5F9",
                              border: filled ? "none" : "2px dashed #CBD5E1",
                            }}
                            animate={filled ? { scale: [0.6, 1.15, 1] } : {}}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          >
                            {filled ? "🟢" : "⚪"}
                          </motion.div>
                        );
                      })}
                    </div>

                    <p className="text-center font-display font-semibold text-lg text-ink mb-1">
                      {loyalty.tokens} / {loyalty.tokensNeeded} Visits Completed
                    </p>
                    <p className="text-center text-ink/50 text-sm mb-6">
                      Collect {loyalty.tokensNeeded - loyalty.tokens} more to unlock 🎁 50% OFF
                    </p>

                    {loyalty.alreadyClaimedToday ? (
                      <div className="text-center bg-amber-soft/40 border border-amber-200 rounded-2xl py-4 px-4">
                        <p className="font-display font-semibold text-ink text-sm mb-1">
                          ✅ Already claimed today
                        </p>
                        <p className="text-ink/50 text-xs">
                          Come back tomorrow and scan the QR code again.
                        </p>
                      </div>
                    ) : claimCode ? (
                      <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full bg-ink text-white font-semibold py-3.5 rounded-full transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-ink"
                      >
                        {claiming ? "Claiming…" : "Claim Today's Token"}
                      </button>
                    ) : (
                      <div className="text-center bg-bg border border-hairline rounded-2xl py-4 px-4">
                        <p className="font-display font-semibold text-ink text-sm mb-1">
                          📷 Scan the QR code at the counter
                        </p>
                        <p className="text-ink/50 text-xs">
                          Ask staff to show today's code — tokens can only be claimed in person.
                        </p>
                      </div>
                    )}

                    {claimError && (
                      <p className="text-red-500 text-sm text-center mt-3">{claimError}</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="unlocked"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                      className="text-6xl mb-3"
                    >
                      🎉
                    </motion.div>
                    <h3 className="font-display font-bold text-2xl text-ink mb-1">Congratulations!</h3>
                    <p className="text-ink/60 mb-5">You've unlocked</p>

                    <div className="bg-success/10 border border-success/30 rounded-2xl py-4 mb-5">
                      <p className="font-display font-bold text-3xl text-success">🎁 50% OFF</p>
                    </div>

                    <div className="bg-bg border-2 border-dashed border-ink/20 rounded-xl py-3 px-4 mb-5 flex items-center justify-between">
                      <span className="font-mono font-bold text-ink tracking-widest">{BRAND.couponCode}</span>
                      <button
                        onClick={handleCopy}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <p className="text-ink/50 text-sm mb-2">
                      Show this screen to staff at the counter to redeem.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success toast for single-token claim */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-4 left-4 right-4 bg-ink text-white text-sm font-semibold py-3 rounded-xl text-center shadow-lg"
                  >
                    🎉 Token Collected Successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}