"use client";
import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "./googlesign";
import { signInWithFacebook } from "./facebooksign";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha | null>(null);
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");


    if (!captchaToken) {
      setError("Please complete the CAPTCHA first.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (error) {
      setError(error.message);
    } else {
        router.push("/")
    }

    captchaRef.current?.resetCaptcha();
    setCaptchaToken("");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Login</h1>
          {/* <button onClick={signInWithGoogle} className="btn text-black">
             Sign in with Google
          </button>
          <button onClick={signInWithFacebook} className="btn text-black">
             Sign in with FaceBook
          </button> */}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            <p className="text-black hover:text-gray-600 mt-3 block"><a href="/auth/reset-password">Reset Password</a></p>
          <a href="/auth/register" className="text-black hover:text-gray-600">
            Don’t have an account? Create now
          </a>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </div>
    </div>
  );
}
