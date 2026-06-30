import { useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

const TOKENS_NEEDED = 4;

/**
 * Loyalty state comes from the signed-in customer's row in Supabase
 * (`loyalty_accounts`). The actual claim logic — the calendar-day limit
 * and the 4-token cap — is enforced inside the `claim_token(code)`
 * Postgres function (see supabase/daily_qr_migration.sql), not here.
 * This hook just calls that function and reflects whatever it returns;
 * it does not independently decide whether a claim is allowed.
 *
 * NOTE: "once per day" here means once per CALENDAR DATE (UTC), not a
 * rolling 24-hour window — claiming at 11pm and again at 1am the next
 * day is allowed, since those are different calendar dates.
 */
export function useLoyalty() {
  const { account, refreshAccount } = useAuth();

  const tokens = account?.tokens ?? 0;
  const lastClaimAt = account?.last_claim_at ? new Date(account.last_claim_at) : null;

  const alreadyClaimedToday = useMemo(() => {
    if (!lastClaimAt) return false;
    const today = new Date();
    return (
      lastClaimAt.getUTCFullYear() === today.getUTCFullYear() &&
      lastClaimAt.getUTCMonth() === today.getUTCMonth() &&
      lastClaimAt.getUTCDate() === today.getUTCDate()
    );
  }, [lastClaimAt]);

  const canClaim = tokens < TOKENS_NEEDED && !alreadyClaimedToday;

  const claimToken = useCallback(async (code) => {
    const { error } = await supabase.rpc("claim_token", { input_code: code });
    if (error) {
      return { success: false, message: error.message };
    }
    await refreshAccount();
    return { success: true, message: null };
  }, [refreshAccount]);

  const markRedeemed = useCallback(async () => {
    // Customers don't redeem themselves — staff do, via the /staff panel
    // and staff_redeem(). This is kept only so LoyaltyCard's "Redeem Now"
    // button can refresh local state after staff has redeemed in person.
    await refreshAccount();
  }, [refreshAccount]);

  return {
    tokens,
    tokensNeeded: TOKENS_NEEDED,
    isComplete: tokens >= TOKENS_NEEDED,
    canClaim,
    alreadyClaimedToday,
    claimToken,
    markRedeemed,
  };
}