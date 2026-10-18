import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import api from '../services/api';

export default function SessionControl() {
  const [courseCode, setCourseCode] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState(15);
  const [session, setSession] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [message, setMessage] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude.toFixed(6));
      setLng(pos.coords.longitude.toFixed(6));
    });
  }

  async function startSession() {
    setMessage('');
    try {
      const res = await api.post('/sessions/start', {
        courseCode,
        geofenceCenter: { lat: Number(lat), lng: Number(lng) },
        geofenceRadius: Number(radius),
      });
      setSession(res.data);
      await renderQr(res.data.currentToken);
      startPolling(res.data.sessionId);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not start session');
    }
  }

  async function renderQr(token) {
    const url = await QRCode.toDataURL(token);
    setQrDataUrl(url);
  }

  function startPolling(sessionId) {
    pollRef.current = setInterval(async () => {
      const res = await api.get(`/sessions/${sessionId}/token`);
      if (res.data.status === 'closed') {
        stopPolling();
        return;
      }
      await renderQr(res.data.token);
    }, 3000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function endSession() {
    stopPolling();
    try {
      await api.post(`/sessions/${session.sessionId}/end`);
      setMessage('Session ended. Attendance analytics updated.');
      setSession(null);
      setQrDataUrl('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not end session');
    }
  }

  if (session) {
    return (
      <div className="card">
        <h2>Session Active — {session.courseCode}</h2>
        <p>Session ID (share verbally with students): <strong>{session.sessionId}</strong></p>
        {qrDataUrl && <img src={qrDataUrl} alt="Live QR code" style={{ width: 250, height: 250 }} />}
        <p className="status-text">QR code refreshes automatically every few seconds.</p>
        <button onClick={endSession}>End Session</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Start Attendance Session</h2>
      <label>Course Code
        <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CSC 311" />
      </label>
      <button type="button" onClick={useMyLocation}>Use My Current Location as Classroom Centre</button>
      <label>Latitude<input value={lat} onChange={(e) => setLat(e.target.value)} /></label>
      <label>Longitude<input value={lng} onChange={(e) => setLng(e.target.value)} /></label>
      <label>Geofence Radius (metres)<input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} /></label>
      <button onClick={startSession}>Start Session</button>
      {message && <p className="status-text">{message}</p>}
    </div>
  );
}
