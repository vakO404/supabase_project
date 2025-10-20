import { supabase } from "@/lib/supabaseClient";


export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: "https://pfeincxsyjfpncmestqd.supabase.co/auth/v1/callback",
    },
  });

  if (error) console.error('Google sign-in error:', error.message);
};
