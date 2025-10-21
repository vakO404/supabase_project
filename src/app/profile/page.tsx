"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullname, setFullname] = useState("");
  const [message, setMessage] = useState("");

  // Fetch profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (error) console.error("Error fetching profile:", error);
      else {
        setProfile(data);
        setFullname(data.full_name || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Save fullname
  const handleSave = async () => {
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setMessage("❌ You must be logged in to update your profile");
      return;
    }

    const res = await fetch("/api/update-fullname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ fullname }),
    });

    const result = await res.json();

    if (res.ok) {
      setMessage("✅ Fullname updated successfully!");
      setEditing(false);
      setProfile((prev) => (prev ? { ...prev, full_name: fullname } : prev));
    } else {
      setMessage(`❌ ${result.error || "Update failed"}`);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Profile not found</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Your Profile</h1>

        {/* Fullname section */}
        <div className="mb-4">
          <label className="block text-black font-medium mb-1">Full Name</label>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full border p-2 rounded text-black"
                placeholder="Enter new fullname"
              />
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFullname(profile.full_name || "");
                }}
                className="text-black-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-black">{profile.full_name || "Not set"}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:underline text-black"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <p className="text-black">
          <strong>Email:</strong> {profile.email}
        </p>

        {/* Role */}
        <p className="text-black">
          <strong>Role:</strong> {profile.role || "User"}
        </p>

        {/* Status message */}
        {message && (
          <p
            className={`mt-2 text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <a
          href="/"
          className="block text-center mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
