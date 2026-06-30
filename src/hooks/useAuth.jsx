import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

// Supabase's JS client expects an email-shaped string even when you're
// really authenticating by phone number — there's no separate "phone as
// username" field for password auth in the client SDK. The fix used here
// is a fake-but-valid email built from the digits of the phone number
// (e.g. 9876543210 -> 9876543210@chillbitesnohar.phone). This is purely an
// internal identifier; it's never shown to the customer and no email is
// ever sent to it.
function phoneToPseudoEmail(phone) {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@chillbitesnohar.phone`;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [account, setAccount] = useState(null); // row from loyalty_accounts
  const [loading, setLoading] = useState(true);

  const loadAccount = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("loyalty_accounts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load loyalty account:", error.message);
      return null;
    }
    return data;
  }, []);

useEffect(() => {
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          const acc = await loadAccount(session.user.id);
          setAccount(acc);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch initial session:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const acc = await loadAccount(session.user.id);
        setAccount(acc);
      } else {
        setAccount(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadAccount]);

  /**
   * New customer: create an account with phone + password. No SMS, no
   * OTP, no verification that the phone number is real — by design, per
   * project scope. Creates the loyalty_accounts row immediately; every
   * new account starts at 0 tokens (no localStorage migration, per spec).
   */
  const signUp = useCallback(async (phone, password) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return { error: { message: "Enter a valid 10-digit phone number." } };
    }

    const pseudoEmail = phoneToPseudoEmail(phone);
    const { data, error } = await supabase.auth.signUp({
      email: pseudoEmail,
      password,
    });

    if (error) {
      if (error.message?.toLowerCase().includes("already registered")) {
        return { error: { message: "An account with this phone number already exists. Try signing in instead." } };
      }
      return { error };
    }

    if (!data.session) {
      // Project has "Confirm email" turned on, which doesn't apply here
      // since there's no real email to confirm. See README — this should
      // be disabled in Supabase Auth settings for this project.
      return {
        error: {
          message: "Account created, but sign-in didn't complete automatically. Try signing in.",
        },
      };
    }

    const userId = data.session.user.id;
    const { data: inserted, error: insertError } = await supabase
      .from("loyalty_accounts")
      .insert({ user_id: userId, phone: digits })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return {
          error: {
            message: "That phone number is already linked to another account.",
          },
        };
      }
      return { error: insertError };
    }

    setAccount(inserted);
    return { error: null };
  }, []);

  /** Returning customer: phone + password sign-in. */
  const signIn = useCallback(async (phone, password) => {
    const pseudoEmail = phoneToPseudoEmail(phone);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: pseudoEmail,
      password,
    });

    if (error) {
      return { error: { message: "Incorrect phone number or password." } };
    }

    const acc = await loadAccount(data.session.user.id);
    setAccount(acc);
    return { error: null };
  }, [loadAccount]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAccount(null);
  }, []);

  const refreshAccount = useCallback(async () => {
    if (!session?.user) return;
    const acc = await loadAccount(session.user.id);
    setAccount(acc);
  }, [session, loadAccount]);

  return (
    <AuthContext.Provider
      value={{ session, account, loading, signUp, signIn, signOut, refreshAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
