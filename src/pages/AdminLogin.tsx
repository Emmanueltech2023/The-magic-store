import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Added missing error state
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null); // Reset error on new attempt

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Supabase Auth Error:", error.message, error.status);
      setErrorMsg(error.message); // Updated variable name to match state
      setLoading(false);
    } else {
      // Logic for successful login
      navigate('/admin'); 
    }
  }; // Added missing closing brace for handleLogin

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
            value={email} // Added value for controlled component
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required
            value={password} // Added value for controlled component
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Display error message to user if login fails */}
          {errorMsg && (
            <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" // Explicitly set type to submit
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