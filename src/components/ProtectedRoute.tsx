import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // 1. Get the current active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/admin/login');
          return;
        }

        // 2. Cross-reference the logged-in user's ID with your admin whitelist table
        const { data: adminRecord, error: dbError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (dbError || !adminRecord) {
          console.warn("Unauthorized access attempt caught.");
          // Force sign out malicious or accidental non-admin users
          await supabase.auth.signOut();
          navigate('/admin/login');
          return;
        }

        // Both checks pass!
        setIsAuthorized(true);
      } catch (err) {
        console.error("Security Route Check Failure:", err);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth state changes (like logging out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setIsAuthorized(false);
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return null; // Or replace with your custom loading spinner component
  }

  // Only render admin components if explicitly authorized via database whitelist
  return isAuthorized ? <>{children}</> : null;
};