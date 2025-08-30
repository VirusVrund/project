import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthForm({ onAuth }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Reporter');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (isLogin) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            setLoading(false);
            if (error) setError(error.message);
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
                if (!res.ok) setError(result.error || 'Registration failed');
                else setIsLogin(true);
            } catch (err) {
                setLoading(false);
                setError('Registration failed');
            }
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    className="w-full mb-2 p-2 border rounded"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full mb-2 p-2 border rounded"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                {!isLogin && (
                    <select
                        className="w-full mb-2 p-2 border rounded"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                    >
                        <option value="Reporter">Reporter</option>
                        <option value="Verifier">Verifier</option>
                        <option value="Government">Government</option>
                    </select>
                )}
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <button
                    className="w-full bg-green-700 text-white p-2 rounded mt-2"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                </button>
            </form>
            <button
                className="text-blue-600 mt-4 underline"
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
        </div>
    );
}
