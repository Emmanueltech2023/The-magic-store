import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Authenticate user credentials against Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Query the admin whitelist table to confirm their role assignment
        const { data: adminRecord, error: dbError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        // If user isn't matching inside the admin table, intercept access and sign them out
        if (dbError || !adminRecord) {
          await supabase.auth.signOut();
          throw new Error('Access Denied: Your account is not authorized as an administrator.');
        }

        // 3. Success! Route them into the secure administrative panel space
        navigate('/admin'); 
      }
    } catch (error: any) {
      console.error("Authentication Gate Error:", error.message);
      setErrorMsg(error.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Magic Command</h1>
          <p className="text-slate-400 text-sm">Restricted access only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" placeholder="Admin Email" required
            value={email}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none text-slate-900"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required
            value={password}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none text-slate-900"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Display error message to user if authentication checks fail */}
          {errorMsg && (
            <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 leading-normal">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white h-14 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enter Hub"}
          </button>
        </form>
      </div>
    </div>
  );
};