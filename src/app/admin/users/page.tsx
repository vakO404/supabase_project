"use client";

import { useEffect, useState } from "react";

type UserProfile = {
  id: string;
  email: string | null;
  role: string | null;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Get current user's role from client-side auth
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const res = await fetch("/api/users"); // you can also have a separate endpoint for current user role
      if (!res.ok) return;

      const data = await res.json();
      // assume your logged-in user is admin for now
      setCurrentUserRole("admin");
    };
    fetchCurrentUserRole();
  }, []);

  // Fetch all users from server-side endpoint
  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUserRole !== "admin") return;
      setLoading(true);

      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        if (data.users) setUsers(data.users);
        else console.error("Error fetching users:", data.error || "Unknown error");
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserRole]);

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete user");

      alert("User deleted successfully!");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;

  if (currentUserRole !== "admin")
    return (
      <div className="p-6 text-red-600 font-medium">
        ❌ Access denied — Admins only.
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full border border-gray-400 rounded-lg text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border-b text-black">Email</th>
              <th className="p-2 border-b text-black">Role</th>
              <th className="p-2 border-b text-center text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-600">
                <td className="p-2">{user.email || "No email"}</td>
                <td className="p-2">{user.role || "user"}</td>
                <td className="p-2 text-center">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
