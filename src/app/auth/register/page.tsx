"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!captchaToken) {
      setError("⚠️ Please complete the CAPTCHA first.");
      setLoading(false);
      return;
    }

    // Step 1️⃣ — Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: { full_name: fullName },
      },
    });

    // Step 2️⃣ — Handle errors (especially duplicate email)
    if (error) {
      if (
        error.message.includes("User already registered") ||
        error.message.includes("A user with this email already exists")
      ) {
        setError("❌ This email is already registered. Try logging in instead.");
      } else {
        setError(`❌ ${error.message}`);
      }
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
      setLoading(false);
      return;
    }

    // Step 3️⃣ — Insert into profiles table
    if (data?.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      });

      if (profileError) {
        console.error("Profile insert error:", profileError);
      }
    }

    // Step 4️⃣ — Ask user to verify and go to login page
    alert("✅ Account created! Please check your email to verify before logging in.");

    captchaRef.current?.resetCaptcha();
    setCaptchaToken("");
    setLoading(false);

    // ✅ Client-safe navigation
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Sign Up</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 border rounded text-black"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded text-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded text-black"
            required
          />

          <HCaptcha
            ref={captchaRef}
            sitekey="b4862640-d3ce-4d98-84ae-c3f6d164bcfe"
            onVerify={(token) => setCaptchaToken(token)}
          />

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className={`p-2 rounded text-white transition ${
              loading || !captchaToken
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

        <a
          href="/auth/login"
          className="block text-center mt-3 text-black hover:text-gray-600"
        >
          Already have an account? Log in
        </a>
      </div>
    </div>
  );
}
