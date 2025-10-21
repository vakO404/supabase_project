"use client";

import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false); // show captcha only on submit
  const captchaRef = useRef<HCaptcha | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!showCaptcha) {
      // First click, show the captcha
      setShowCaptcha(true);
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA first.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
      captchaToken, // send captcha to Supabase
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email for a password reset link.");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
      setShowCaptcha(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Reset Password</h1>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded text-black"
            required
          />

          {showCaptcha && (
            <HCaptcha
              ref={captchaRef}
              sitekey="b4862640-d3ce-4d98-84ae-c3f6d164bcfe"
              onVerify={(token) => setCaptchaToken(token)}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className={`p-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}

        <a
          href="/auth/login"
          className="text-black hover:text-gray-600 mt-3 block text-center"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}
