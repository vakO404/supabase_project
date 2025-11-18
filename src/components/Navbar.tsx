'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Profile = {
  role: 'user' | 'admin';
  email: string | null;
};

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydration fix
  useEffect(() => setMounted(true), []);

  // Admin emails
  const adminEmails: string[] = [
    'vakobsns@gmail.com',
  ];

  // Ensure profile exists and assign admin role if needed
  const ensureProfileExists = async (user: any) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile);
        return;
      }

      const role: 'user' | 'admin' =
        user.email && adminEmails.includes(user.email) ? 'admin' : 'user';

      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email: user.email,
          role,
        },
      ]);

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log(`Profile created for ${user.email} with role: ${role}`);
        setProfile({ role, email: user.email });
      }
    } catch (err) {
      console.error('ensureProfileExists error:', err);
    }
  };

  // Fetch profile by userId
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .single();

      if (error) console.error('Profile fetch error:', error);
      else setProfile(data);
    } finally {
      setLoading(false);
    }
  };

  // Load session & listen for auth changes
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        setUser(session.user);
        await ensureProfileExists(session.user);
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await ensureProfileExists(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/auth/login');
  };

  // Google sign-in
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error('Google sign-in error:', error.message);
  };

  // Facebook sign-in
  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error('Facebook sign-in error:', error.message);
  };

  // Prevent hydration mismatch
  if (!mounted || loading) return null;

  return (
    <nav className="flex justify-between items-center bg-white shadow px-6 py-3">
      <Link href="/" className="text-lg font-semibold text-blue-600">
        MyApp
      </Link>

      <div className="flex gap-4">
        {user ? (
          <>
            <Link href="/dashboard" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Dashboard
            </Link>
            <Link href="/posts/new" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Create Post
            </Link>
            <Link href="/about" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              About
            </Link>
            <Link href="/profile" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Profile
            </Link>

            {profile?.role === 'admin' && (
              <Link href="/admin" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={signInWithGoogle} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Sign in with Google
            </button>
            <button onClick={signInWithFacebook} className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800">
              Sign in with Facebook
            </button>
            <Link href="/auth/login" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Login
            </Link>
            <Link href="/auth/register" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
