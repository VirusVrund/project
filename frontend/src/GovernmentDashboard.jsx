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

  const defaultCenter = incidents.length > 0
    ? [incidents[0].latitude, incidents[0].longitude]
    : [19.1, 72.9];

  return (
    <div className="max-w-6xl mx-auto p-8 mt-8 bg-white rounded-xl shadow-lg border border-green-100">
      <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">Verified Incidents Map</h2>
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <select value={status} onChange={e => setStatus(e.target.value)} className="p-2 border border-green-200 rounded">
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border border-green-200 rounded">
          <option value="">All Categories</option>
          <option value="Illegal Cutting">Illegal Cutting</option>
          <option value="Land Reclamation">Land Reclamation</option>
          <option value="Pollution">Pollution</option>
          <option value="Other">Other</option>
        </select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="p-2 border border-green-200 rounded" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="p-2 border border-green-200 rounded" />
        <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Export CSV</button>
      </div>
      <div className="mb-8 rounded-xl overflow-hidden border border-green-200">
        <MapContainer center={defaultCenter} zoom={10} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {incidents.map(inc => (
            <Marker key={inc.id} position={[inc.latitude, inc.longitude]} eventHandlers={{ click: () => setSelected(inc) }}>
              <Popup>
                <div>
                  <strong>{inc.category}</strong><br />
                  {inc.description}<br />
                  <a href={inc.photo_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Photo</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {selected && (
        <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-lg p-4 overflow-y-auto z-50 border-l border-green-200">
          <button className="float-right text-xl text-green-700" onClick={() => setSelected(null)}>×</button>
          <h3 className="text-lg font-bold mb-2 text-green-800">Incident Details</h3>
          <div className="mb-2"><b>Category:</b> {selected.category}</div>
          <div className="mb-2"><b>Description:</b> {selected.description}</div>
          <div className="mb-2"><b>Status:</b> {selected.status}</div>
          <div className="mb-2"><b>Date:</b> {selected.created_at}</div>
          <div className="mb-2"><b>Location:</b> {selected.latitude}, {selected.longitude}</div>
          <div className="mb-2"><b>Photo:</b> <a href={selected.photo_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">View</a></div>
          <div className="mb-2"><b>Verifier Notes:</b> {selected.verifier_notes}</div>
        </div>
      )}
      <div className="mt-8">
        <h3 className="font-bold mb-2 text-green-800">Incidents Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-green-200 rounded-lg">
            <thead className="bg-green-50">
              <tr>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Photo</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id} className="border-t">
                  <td className="p-3">{inc.description}</td>
                  <td className="p-3">{inc.category}</td>
                  <td className="p-3">{inc.status}</td>
                  <td className="p-3">{inc.created_at}</td>
                  <td className="p-3">{inc.latitude}, {inc.longitude}</td>
                  <td className="p-3"><a href={inc.photo_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
