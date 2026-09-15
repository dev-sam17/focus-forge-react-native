import type { AuthError, Session, User } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useEffect, useState } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const incomingUrl = Linking.useURL();

  // Listen for deep links globally to catch the OAuth redirect
  // even if the app was suspended or disconnected from Metro
  useEffect(() => {
    if (!incomingUrl) return;
    console.log("App woke up with deep link:", incomingUrl);

    try {
      const { params, errorCode } = QueryParams.getQueryParams(incomingUrl);
      if (errorCode) {
        console.error("OAuth error from URL:", errorCode);
        return;
      }

      const { access_token, refresh_token } = params;
      if (access_token && refresh_token) {
        console.log("Found tokens in deep link! Setting session...");
        supabase.auth.setSession({
          access_token,
          refresh_token,
        }).catch(console.error);
      }
    } catch (e) {
      console.error("Error parsing deep link URL:", e);
    }
  }, [incomingUrl]);

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
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Simplest possible redirect URI using Expo Auth Session defaults
      const redirectUrl = makeRedirectUri();

      console.log('Ensure this EXACT redirect URI is whitelisted in Supabase:', redirectUrl);

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
        // Open the browser and wait for it to be redirected back to our app
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === "success") {
          const url = result.url;
          console.log("Redirected back with URL:", url);

          // Parse the URL using Expo Auth Session's robust parser
          const { params, errorCode } = QueryParams.getQueryParams(url);

          if (errorCode) {
            console.error("OAuth returned error:", errorCode);
            throw new Error(errorCode);
          }

          const { access_token, refresh_token } = params;

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
          } else {
            console.warn('Redirected successfully but no tokens found in URL:', url);
          }
        } else if (result.type === "cancel") {
          console.log("User cancelled auth session");
        } else {
          console.log("Auth session closed with unexpected result:", result);
        }
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
