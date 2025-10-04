"use client";
import { redirect } from 'next/navigation'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import React,{ useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";





export default function registepage(){

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const captcha = useRef("");


    const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { data, error } = await supabase.auth.signUp({ 
        email,
        password,
        options: { captchaToken },
    });

    captcha.current.resetCaptcha();

    if (error) {
      setError(error.message);
    } else {
      redirect('/auth/login');
      
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Sign up</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            className="p-2 border rounded, text-black"
            required
          />
          <HCaptcha
            ref = {captcha}
            sitekey= "b4862640-d3ce-4d98-84ae-c3f6d164bcfe"
            onVerify={(token) => {
            setCaptchaToken(token)
            }}
          />

          <a  href='/auth/login' className='text-black hover:text-gray-600'>Already Have An Account? Log in</a>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create Account
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </div>
    </div>
  );

}