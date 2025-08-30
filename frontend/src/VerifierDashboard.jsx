import React, { useEffect, useState } from 'react';

export default function VerifierDashboard({ token }) {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState('');

    useEffect(() => {
        async function fetchIncidents() {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/incidents?status=pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setIncidents(data.incidents || []);
            setLoading(false);
        }
        fetchIncidents();
    }, [token, actionStatus]);

    async function handleAction(id, action) {
        const notes = prompt(`Add notes for this ${action}:`, '');
        setActionStatus('');
        const res = await fetch(`http://localhost:5000/api/incidents/${id}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ notes })
        });
        const result = await res.json();
        if (res.ok && result.success) {
            setActionStatus(`${action}d`);
        } else {
            setActionStatus(result.error || 'Failed');
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 mt-8 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Pending Incidents</h2>
            {loading ? <div>Loading...</div> : (
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Photo</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.length === 0 ? (
                            <tr><td colSpan={5} className="text-center">No pending incidents</td></tr>
                        ) : incidents.map(inc => (
                            <tr key={inc.id}>
                                <td>{inc.description}</td>
                                <td>{inc.category}</td>
                                <td>{inc.latitude}, {inc.longitude}</td>
                                <td><a href={inc.photo_url} target="_blank" rel="noopener noreferrer">View</a></td>
                                <td>
                                    <button className="bg-green-600 text-white px-2 py-1 rounded mr-2" onClick={() => handleAction(inc.id, 'verify')}>Verify</button>
                                    <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleAction(inc.id, 'reject')}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {actionStatus && <div className="mt-4 text-blue-700">{actionStatus}</div>}
        </div>
    );
}
