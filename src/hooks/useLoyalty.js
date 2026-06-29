import { useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

const TOKENS_NEEDED = 4;
const CLAIM_COOLDOWN_HOURS = 12;

/**
 * Loyalty state now comes from the signed-in customer's row in Supabase
 * (`loyalty_accounts`), not localStorage. The actual claim logic — the
 * cooldown and the 4-token cap — is enforced inside the `claim_token()`
 * Postgres function (see supabase/claim_token_function.sql), not here.
 * This hook just calls that function and reflects whatever it returns;
 * it does not independently decide whether a claim is allowed.
 */
export function useLoyalty() {
  const { account, refreshAccount } = useAuth();

  const tokens = account?.tokens ?? 0;
  const lastClaimAt = account?.last_claim_at ? new Date(account.last_claim_at).getTime() : null;

  const hoursUntilNextClaim = useMemo(() => {
    if (!lastClaimAt) return 0;
    const hoursSince = (Date.now() - lastClaimAt) / (1000 * 60 * 60);
    return Math.max(0, Math.ceil(CLAIM_COOLDOWN_HOURS - hoursSince));
  }, [lastClaimAt]);

  const canClaim = tokens < TOKENS_NEEDED && hoursUntilNextClaim === 0;

const claimToken = useCallback(async (code) => {
    console.log("[DEBUG] claimToken called with code:", JSON.stringify(code), "length:", code?.length);
    const { error } = await supabase.rpc("claim_token", { input_code: code });
    if (error) {
      console.log("[DEBUG] claim_token RPC error:", error.message);
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
    hoursUntilNextClaim,
    claimToken,
    markRedeemed,
  };
}
