"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
  birth_date: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullname, setFullname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setMessage("Error fetching user");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, role, birth_date")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setMessage("Error fetching profile");
      } else if (data) {
        setProfile(data);
        setFullname(data.full_name || "");
        setBirthDate(data.birth_date || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMessage("❌ You must be logged in");
      return;
    }

    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ fullname, birthDate }),
      });

      let result;
      try {
        result = await res.json();
      } catch {
        result = { error: "Invalid server response" };
      }

      if (res.ok && result.success) {
        setMessage("✅ Profile updated successfully!");
        setProfile(prev => prev ? { ...prev, full_name: fullname, birth_date: birthDate } : prev);
        setEditing(false);
      } else {
        setMessage(`❌ ${result.error || "Update failed"}`);
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message || "Update failed"}`);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!profile) return <p className="text-center mt-20 text-red-500">Profile not found</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Your Profile</h1>

        {/* Fullname */}
        <div className="mb-4">
          <label className="block text-black font-medium mb-1">Full Name</label>
          {editing ? (
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full border p-2 rounded text-black mb-2"
            />
          ) : (
            <p className="text-black">{profile.full_name || "Not set"}</p>
          )}
        </div>

        {/* Birth Date */}
        <div className="mb-4">
          <label className="block text-black font-medium mb-1">Birth Date</label>
          {editing ? (
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full border p-2 rounded text-black mb-1"
            />
          ) : (
            <p className="text-black">{profile.birth_date || "Not set"}</p>
          )}
        </div>

        {/* Email */}
        <p className="text-black"><strong>Email:</strong> {profile.email}</p>
        <p className="text-black"><strong>Role:</strong> {profile.role || "User"}</p>

        {message && (
          <p className={`mt-2 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {editing ? (
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
            <button onClick={() => { setEditing(false); setFullname(profile.full_name || ""); setBirthDate(profile.birth_date || ""); }} className="px-3 py-1 border rounded hover:bg-gray-200">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="mt-4 text-blue-600 hover:underline">Edit Profile</button>
        )}
      </div>
    </div>
  );
}
