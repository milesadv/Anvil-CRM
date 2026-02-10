"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserClient();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // If email confirmation is required, session will be null
      if (!data.session) {
        setConfirmEmail(true);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[320px]">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold tracking-[0.2em] text-white/80">
            anvil.
          </span>
        </div>

        {confirmEmail ? (
          <div className="text-center">
            <p className="text-sm text-foreground">Check your email</p>
            <p className="mt-2 text-xs text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="text-foreground">{email}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmEmail(false);
                setIsSignUp(false);
                setError("");
              }}
              className="mt-6 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs text-muted-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-sm text-background hover:bg-foreground/90"
              >
                {loading
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {isSignUp
                ? "Already have an account?"
                : "Don\u2019t have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-foreground underline underline-offset-2 hover:text-foreground/80"
              >
                {isSignUp ? "Sign in" : "Create account"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
