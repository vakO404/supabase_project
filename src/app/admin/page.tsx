'use client';

import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabaseClient";import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return router.push('/auth/login');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || data.role !== 'admin') {
        router.push('/'); // redirect non-admins
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    
    <div className="p-6">
      
    <a href="/admin/users" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">User List</a>

      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p>Welcome, {profile?.email}!</p>
      
      {/* admin permisions */}
    </div>
    
  );
}
