import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import { queueScan } from '../services/db';
import { syncPendingScans } from '../services/syncService';

export default function ScanAttendance() {
  const [sessionId, setSessionId] = useState('');
  const [status, setStatus] = useState('Enter the session ID given by your lecturer, then scan.');
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const sync = () =>
      syncPendingScans((result) => {
        setStatus((prev) => `${result.message} ${prev}`);
      });
    sync();                                   // when the page opens
    window.addEventListener('online', sync);  // and whenever the connection returns
    return () => window.removeEventListener('online', sync);
  }, []);

  function startScanner() {
    if (!sessionId) {
      setStatus('Please enter the session ID first.');
      return;
    }
    setScanning(true);
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    scanner.render(onScanSuccess, () => {});
    scannerRef.current = scanner;
  }

  function stopScanner() {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function onScanSuccess(decodedToken) {
    stopScanner();
    setStatus('Getting your location...');

    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          sessionId,
          scannedToken: decodedToken,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        if (!navigator.onLine) {
          await queueScan({ ...payload, offline: true });
          setStatus('You are offline. Scan saved and will submit automatically once you reconnect.');
          return;
        }

        try {
          const res = await api.post('/attendance/scan', payload);
          setStatus(res.data.message);
        } catch (err) {
          if (!err.response) {
            // The connection dropped while sending: save the scan instead of losing it
            await queueScan({ ...payload, offline: true });
            setStatus('Connection lost. Scan saved and will submit automatically once you reconnect.');
            return;
          }
          setStatus(err.response?.data?.error || 'Scan failed');
        }
      },
      () => setStatus('Could not get your location. Please enable location access and try again.')
    );
  }

  return (
    <div className="card">
      <h2>Scan Attendance</h2>
      <label>
        Session ID (given by your lecturer)
        <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} disabled={scanning} />
      </label>
      {!scanning ? (
        <button onClick={startScanner}>Start Scanning</button>
      ) : (
        <button onClick={stopScanner}>Stop Scanning</button>
      )}
      <div id="qr-reader" style={{ width: '100%', maxWidth: 400, marginTop: 16 }}></div>
      <p className="status-text">{status}</p>
    </div>
  );
}
