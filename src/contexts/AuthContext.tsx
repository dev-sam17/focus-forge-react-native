import type { AuthError, Session, User } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 * Parse tokens from a Supabase OAuth deep link URL.
 * Supabase returns tokens in the hash fragment: focus-forge://#access_token=...
 * or in query params: focus-forge://?access_token=...
 */
function extractTokensFromUrl(url: string): {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
} {
  try {
    // Normalize: handle URLs with hash fragments
    // e.g. "focus-forge://#access_token=..." or "exp://...#access_token=..."
    const hashIndex = url.indexOf("#");
    const queryIndex = url.indexOf("?");

    let paramString = "";
    if (hashIndex !== -1) {
      paramString = url.substring(hashIndex + 1);
    } else if (queryIndex !== -1) {
      paramString = url.substring(queryIndex + 1);
    }

    if (!paramString) return {};

    const params: Record<string, string> = {};
    paramString.split("&").forEach((part) => {
      const [key, ...rest] = part.split("=");
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(
          rest.join("=").replace(/\+/g, " ")
        );
      }
    });

    return {
      access_token: params["access_token"],
      refresh_token: params["refresh_token"],
      error: params["error"],
      error_description: params["error_description"],
    };
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const incomingUrl = Linking.useURL();
  // Track URLs we've already processed to avoid double-handling
  const processedUrl = useRef<string | null>(null);

  // Handle incoming deep links (OAuth redirects)
  useEffect(() => {
    if (!incomingUrl) return;
    if (processedUrl.current === incomingUrl) return; // Already handled
    processedUrl.current = incomingUrl;

    console.log("App woke up with deep link:", incomingUrl);

    const { access_token, refresh_token, error, error_description } =
      extractTokensFromUrl(incomingUrl);

    if (error) {
      console.error("OAuth error from URL:", error, error_description);
      return;
    }

    if (access_token && refresh_token) {
      console.log("Found tokens in deep link! Setting session...");
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            console.error("Error setting session:", error);
          } else {
            console.log("Session set successfully!");
          }
        });
    }
  }, [incomingUrl]);

  // Listen to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      // Ignore TOKEN_REFRESHED and other non-critical events that might
      // briefly flash null session
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }

      // Handle user upsert asynchronously without blocking auth state
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        import('../lib/env').then(({ API_URL }) => {
          const serverUrl = API_URL.replace(/\/+$/, '');
          fetch(`${serverUrl}/api/webhook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username || session.user.email?.split("@")[0],
              firstName: session.user.user_metadata?.full_name?.split(" ")[0] || "",
              lastName: session.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
              avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
              provider: session.user.app_metadata?.provider || "email",
              emailVerified: session.user.email_confirmed_at ? true : false,
              isActive: true,
            }),
          }).catch((err) => console.error("Failed to sync user from mobile:", err));
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = makeRedirectUri();
      console.log(
        "Redirect URI (whitelist this EXACT value in Supabase):",
        redirectUrl
      );

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        return { error };
      }

      if (data?.url) {
        // Open in system browser so it can deep link back via the OS
        await Linking.openURL(data.url);
      }

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
