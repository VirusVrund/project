import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';
import VerifierDashboard from './VerifierDashboard';
import GovernmentDashboard from './GovernmentDashboard';

function ReporterIncidentForm({ token }) {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [photo, setPhoto] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Try to get geolocation
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLatitude(pos.coords.latitude);
                    setLongitude(pos.coords.longitude);
                },
                () => setStatus('Could not get location')
            );
        } else {
            setStatus('Geolocation not supported');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');
        setLoading(true);
        const formData = new FormData();
        formData.append('description', description);
        formData.append('category', category);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('photo', photo);
        try {
            const res = await fetch('http://localhost:5000/api/incidents', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await res.json();
            setLoading(false);
            if (res.ok && result.success) {
                setStatus('Incident reported successfully!');
                setDescription('');
                setCategory('');
                setLatitude('');
                setLongitude('');
                setPhoto(null);
            } else {
                setStatus(result.error || 'Failed to report incident');
            }
        } catch (err) {
            setLoading(false);
            setStatus('Failed to report incident');
        }
    };

    return (
        <form className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4">Report Mangrove Incident</h2>
            <input className="w-full mb-2 p-2 border rounded" type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
            <select className="w-full mb-2 p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                <option value="Illegal Cutting">Illegal Cutting</option>
                <option value="Land Reclamation">Land Reclamation</option>
                <option value="Pollution">Pollution</option>
                <option value="Other">Other</option>
            </select>
            <div className="flex gap-2 mb-2">
                <input className="w-1/2 p-2 border rounded" type="number" step="any" placeholder="Latitude" value={latitude} onChange={e => setLatitude(e.target.value)} required />
                <input className="w-1/2 p-2 border rounded" type="number" step="any" placeholder="Longitude" value={longitude} onChange={e => setLongitude(e.target.value)} required />
                <button type="button" className="bg-blue-500 text-white px-2 rounded" onClick={getLocation}>Auto</button>
            </div>
            <input className="w-full mb-2" type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} required />
            <button className="w-full bg-green-700 text-white p-2 rounded mt-2" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Incident'}</button>
            {status && <div className="mt-2 text-center text-sm text-blue-700">{status}</div>}
        </form>
    );
}

function ReporterDashboard({ token }) {
    return <ReporterIncidentForm token={token} />;
}

function App() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);

    // Restore auth state from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        const savedRole = localStorage.getItem('role');
        if (savedToken && savedUser && savedRole) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setRole(savedRole);
        }
    }, []);

    const handleAuth = async (userObj, session) => {
        setUser(userObj);
        setToken(session.access_token);
        // Fetch user from backend to get full metadata (role)
        const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        setRole(data.user.user_metadata?.role);
        // Persist to localStorage
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('role', data.user.user_metadata?.role || '');
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    };

    if (!user || !role) {
        return <AuthForm onAuth={handleAuth} />;
    }

    return (
        <div>
            <button className="absolute top-2 right-2 bg-gray-200 px-3 py-1 rounded" onClick={handleLogout}>Logout</button>
            {role === 'Reporter' && <ReporterDashboard token={token} />}
            {role === 'Verifier' && <VerifierDashboard token={token} />}
            {role === 'Government' && <GovernmentDashboard token={token} />}
            {!['Reporter', 'Verifier', 'Government'].includes(role) && <div>Unknown role</div>}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
