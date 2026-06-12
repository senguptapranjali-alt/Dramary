"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/useAuth";

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{ type: "error" | "success" | ""; text: string }>({
    type: "",
    text: "",
  });

  const authLockRef = useRef(false);
  const lastClickRef = useRef(0);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { user } = useAuth();

  function normalizeUsername(name: string) {
    return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  }

  function getEmail(username: string) {
    return `${normalizeUsername(username)}@dramaryapp.local`;
  }

  function canClick() {
    const now = Date.now();
    if (now - lastClickRef.current < 800) return false;
    lastClickRef.current = now;
    return true;
  }

  useEffect(() => {
    if (showModal) {
      setUsername("");
      setPassword("");
      setMode("login");
      setMessage({ type: "", text: "" });
    }
  }, [showModal]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowModal(false);
    }

    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  }

  async function handleAuth(type: "login" | "signup") {
    if (loading || authLockRef.current) return;
    if (!canClick()) return;

    if (!username || !password) {
      setMessage({ type: "error", text: "Please fill all fields" });
      return;
    }

    setLoading(true);
    authLockRef.current = true;
    setMessage({ type: "", text: "" });

    const email = getEmail(username);

    try {
      if (type === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage({
            type: "error",
            text: error.message,
          });
          return;
        }

        setMessage({
          type: "success",
          text: "Account created! You can now log in.",
        });

        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage({
            type: "error",
            text: "Invalid credentials or user not found",
          });
          return;
        }

        setMessage({
          type: "success",
          text: "Welcome back!",
        });

        setTimeout(() => setShowModal(false), 1200);
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
      authLockRef.current = false;
    }
  }

  return (
    <nav className="relative z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white">
        Dramary
      </h1>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-zinc-300 text-sm">
            Welcome, {user.email.split("@")[0]}
          </span>

          <button
            onClick={() => supabase.auth.signOut()}
            className="border border-white/20 bg-white/5 backdrop-blur-sm px-4 sm:px-5 py-2 rounded-full hover:bg-white hover:text-black transition duration-300 text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="border border-white/20 bg-white/5 backdrop-blur-sm px-4 sm:px-5 py-2 rounded-full hover:bg-white hover:text-black transition duration-300 text-sm sm:text-base"
        >
          Login
        </button>
      )}

      {showModal && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
        >
          <div
            ref={modalRef}
            className="bg-zinc-900 border border-zinc-700 p-5 sm:p-8 rounded-3xl w-[95%] sm:w-[450px] relative shadow-2xl"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-lg flex items-center justify-center transition"
            >
              ✕
            </button>

            <h2 className="text-2xl sm:text-3xl font-black mb-4 text-white">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>

            {message.text && (
              <p
                className={`mb-4 text-sm ${
                  message.type === "error"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {message.text}
              </p>
            )}

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 mb-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 focus:outline-none focus:border-pink-400 transition"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 focus:outline-none focus:border-pink-400 transition"
            />

            <button
              disabled={loading}
              onClick={() => handleAuth(mode)}
              className="w-full bg-white text-black py-3 rounded-2xl font-semibold hover:scale-[1.02] transition duration-300 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>

            <p className="text-center text-sm text-zinc-400 mt-5">
              {mode === "login" ? (
                <>
                  New here?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-white underline"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-white underline"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}