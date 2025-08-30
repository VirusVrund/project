import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { saveAs } from 'file-saver';

function csvFromIncidents(incidents) {
    if (!incidents.length) return '';
    const header = Object.keys(incidents[0]).join(',');
    const rows = incidents.map(obj => Object.values(obj).map(v => `"${v ?? ''}"`).join(','));
    return [header, ...rows].join('\n');
}

export default function GovernmentDashboard({ token }) {
    const [incidents, setIncidents] = useState([]);
    const [status, setStatus] = useState('verified');
    const [category, setCategory] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        async function fetchIncidents() {
            let url = `http://localhost:5000/api/incidents?status=${status}`;
            if (category) url += `&category=${category}`;
            if (from) url += `&from=${from}`;
            if (to) url += `&to=${to}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setIncidents(data.incidents || []);
            console.log('Fetched incidents:', data.incidents);
        }
        fetchIncidents();
    }, [status, category, from, to, token]);

    // For heatmap, collect [lat, lng, weight]
    const heatmapPoints = incidents.map(i => [i.latitude, i.longitude, 1]);

    function handleExport() {
        const csv = csvFromIncidents(incidents);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'incidents.csv');
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Verified Incidents Map</h2>
            <div className="flex gap-4 mb-4">
                <select value={status} onChange={e => setStatus(e.target.value)} className="p-2 border rounded">
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded">
                    <option value="">All Categories</option>
                    <option value="Illegal Cutting">Illegal Cutting</option>
                    <option value="Land Reclamation">Land Reclamation</option>
                    <option value="Pollution">Pollution</option>
                    <option value="Other">Other</option>
                </select>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-2 border rounded" />
                <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-2 border rounded" />
                <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded">Export CSV</button>
            </div>
            <MapContainer center={[19.1, 72.9]} zoom={10} style={{ height: '400px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {incidents.map(inc => (
                    <Marker key={inc.id} position={[inc.latitude, inc.longitude]} eventHandlers={{ click: () => setSelected(inc) }}>
                        <Popup>
                            <div>
                                <strong>{inc.category}</strong><br />
                                {inc.description}<br />
                                <a href={inc.photo_url} target="_blank" rel="noopener noreferrer">Photo</a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            {selected && (
                <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-lg p-4 overflow-y-auto z-50">
                    <button className="float-right text-xl" onClick={() => setSelected(null)}>×</button>
                    <h3 className="text-lg font-bold mb-2">Incident Details</h3>
                    <div><b>Category:</b> {selected.category}</div>
                    <div><b>Description:</b> {selected.description}</div>
                    <div><b>Status:</b> {selected.status}</div>
                    <div><b>Date:</b> {selected.created_at}</div>
                    <div><b>Location:</b> {selected.latitude}, {selected.longitude}</div>
                    <div><b>Photo:</b> <a href={selected.photo_url} target="_blank" rel="noopener noreferrer">View</a></div>
                    <div><b>Verifier Notes:</b> {selected.verifier_notes}</div>
                </div>
            )}
            <div className="mt-8">
                <h3 className="font-bold mb-2">Incidents Table</h3>
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Photo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map(inc => (
                            <tr key={inc.id}>
                                <td>{inc.description}</td>
                                <td>{inc.category}</td>
                                <td>{inc.status}</td>
                                <td>{inc.created_at}</td>
                                <td>{inc.latitude}, {inc.longitude}</td>
                                <td><a href={inc.photo_url} target="_blank" rel="noopener noreferrer">View</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
