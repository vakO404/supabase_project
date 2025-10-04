"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Valeri</div>
      <div className="flex gap-4">
        <Link href="/" className="hover:text-gray-300">
          Home
        </Link>
        <Link href="/auth/login" className="hover:text-gray-300">
          Login
        </Link>
        <Link href="/auth/register" className="hover:text-gray-300">
          Sign Up
        </Link>
        <Link href="/dashboard" className="hover:text-gray-300">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
