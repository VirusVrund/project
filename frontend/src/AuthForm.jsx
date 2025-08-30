import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Reporter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function getFriendlyError(msg) {
    if (!msg) return '';
    if (msg.toLowerCase().includes('invalid login credentials')) return 'Incorrect email or password.';
    if (msg.toLowerCase().includes('invalid email')) return 'Please enter a valid email address.';
    if (msg.toLowerCase().includes('password')) return 'Password must be at least 6 characters.';
    if (msg.toLowerCase().includes('user already registered')) return 'User already registered. Please login.';
    if (msg.toLowerCase().includes('network')) return 'Network error. Please try again.';
    return msg;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(getFriendlyError(error.message));
      else if (!data.user) setError('Login failed. Please check your credentials.');
      else onAuth(data.user, data.session);
    } else {
      // Register via backend to set role
      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });
        const result = await res.json();
        setLoading(false);
        if (!res.ok) setError(getFriendlyError(result.error || 'Registration failed'));
        else setIsLogin(true);
      } catch (err) {
        setLoading(false);
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-200">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-green-100">
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <select
              className="w-full p-3 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="Reporter">Reporter</option>
              <option value="Verifier">Verifier</option>
              <option value="Government">Government</option>
            </select>
          )}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold p-3 rounded transition duration-150"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          className="w-full mt-6 text-green-700 hover:text-green-900 underline text-sm"
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
