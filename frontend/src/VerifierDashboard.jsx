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
    <div className="max-w-4xl mx-auto p-8 mt-8 bg-white rounded-xl shadow-lg border border-green-100">
      <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">Pending Incidents</h2>
      {loading ? <div className="text-center text-green-700">Loading...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full border border-green-200 rounded-lg">
            <thead className="bg-green-50">
              <tr>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Photo</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-4">No pending incidents</td></tr>
              ) : incidents.map(inc => (
                <tr key={inc.id} className="border-t">
                  <td className="p-3">{inc.description}</td>
                  <td className="p-3">{inc.category}</td>
                  <td className="p-3">{inc.latitude}, {inc.longitude}</td>
                  <td className="p-3"><a href={inc.photo_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">View</a></td>
                  <td className="p-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2" onClick={() => handleAction(inc.id, 'verify')}>Verify</button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={() => handleAction(inc.id, 'reject')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {actionStatus && <div className="mt-4 text-center text-blue-700">{actionStatus}</div>}
    </div>
  );
}
