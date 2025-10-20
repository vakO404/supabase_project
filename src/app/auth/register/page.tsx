"use client";
import { redirect } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!captchaToken) {
    setError("Please complete the CAPTCHA first.");
    return;
  }

  // Step 1: Sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      captchaToken,
      data: { full_name: fullName }, // 👈 optional: also store in user metadata
    },
  });

  if (error) {
    if (
      error.message.includes("User already registered") ||
      error.message.includes("A user with this email already exists")
    ) {
      setError("This email is already registered");
    } else {
      setError(error.message);
    }
    captchaRef.current?.resetCaptcha();
    setCaptchaToken("");
    return;
  }

  // Step 2: Insert into profiles (after sign-up)
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

  redirect("/auth/login");
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
            onVerify={(token) => {
              setCaptchaToken(token);
            }}
          />

          <a href="/auth/login" className="text-black hover:text-gray-600">
            Already have an account? Log in
          </a>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create Account
          </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
