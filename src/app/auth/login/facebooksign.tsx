import { supabase } from '@/lib/supabaseClient';

export const signInWithFacebook = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: "https://pfeincxsyjfpncmestqd.supabase.co/auth/v1/callback",
    },
  });

  if (error) console.error('Facebook sign-in error:', error.message);
};
