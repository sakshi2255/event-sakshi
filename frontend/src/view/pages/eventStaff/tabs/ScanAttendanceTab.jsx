import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const ScanAttendanceTab = ({ onBack }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const scannerId = "reader";
    
    // 1. Initialize the manual scanner instance
    qrScannerRef.current = new Html5Qrcode(scannerId);

    const startScanner = async () => {
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      };

      try {
        // Only start if the component is still mounted and not already scanning
        if (isMounted && !qrScannerRef.current.isScanning) {
          await qrScannerRef.current.start(
            { facingMode: "environment" }, 
            config, 
            onScanSuccess
          );
        }
      } catch (err) {
        console.error("Camera Start Error:", err);
        // Avoid showing toast for "already scanning" which happens in StrictMode
        if (!err.toString().includes("is already scanning")) {
          toast.error("Camera access denied or failed to initialize");
        }
      }
    };

    async function onScanSuccess(decodedText) {
      if (isProcessing) return;
      setIsProcessing(true);
      
      try {
        let token = decodedText;
        // Parse JSON if the QR contains a secure object
        if (decodedText.startsWith('{')) {
          try {
            const data = JSON.parse(decodedText);
            token = data.token;
          } catch (e) {
            console.error("JSON Parse Error", e);
          }
        }

        const response = await api.post('/events/verify-attendance', { token });
        
        setScanResult({ 
          success: true, 
          user: response.data.user 
        });
        toast.success("Check-in Successful!");

        setTimeout(() => {
          if (isMounted) {
            setScanResult(null);
            setIsProcessing(false);
          }
        }, 4000);

      } catch (err) {
        setScanResult({ 
          success: false, 
          message: err.response?.data?.message || "Invalid Ticket" 
        });
        toast.error("Access Denied");
        setTimeout(() => {
          if (isMounted) {
            setScanResult(null);
            setIsProcessing(false);
          }
        }, 4000);
      }
    }

    startScanner();

    // Cleanup: Properly stop and clear the scanner
    return () => {
      isMounted = false;
      if (qrScannerRef.current) {
        if (qrScannerRef.current.isScanning) {
          qrScannerRef.current.stop()
            .then(() => qrScannerRef.current.clear())
            .catch(err => console.error("Scanner Stop Error", err));
        } else {
          qrScannerRef.current.clear();
        }
      }
    };
  }, []);

  return (
    <div className="staff-container">
      <button onClick={onBack} className="staff-action-btn btn-tasks" style={{ marginBottom: '20px' }}>
        ← Exit Scanner
      </button>

      <div className="staff-stat-card" style={{ maxWidth: '500px', margin: '0 auto', border: '2px solid #e2e8f0', position: 'relative' }}>
        <h2 className="staff-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Field Operations: Live Scanner</h2>
        
        {/* The Camera Viewport */}
        <div id="reader" style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', minHeight: '300px' }}></div>
        
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          Scanning for Live Digital Passes...
        </div>
      </div>

      {scanResult && (
        <div className={`staff-stat-card ${scanResult.success ? 'green-border' : 'red-border'}`} 
             style={{ marginTop: '20px', textAlign: 'center', backgroundColor: scanResult.success ? '#f0fdf4' : '#fef2f2' }}>
          <h2 style={{ color: scanResult.success ? '#15803d' : '#b91c1c', margin: 0 }}>
            {scanResult.success ? '✅ VALID ENTRY' : '❌ REJECTED'}
          </h2>
          <p className="staff-stat-value" style={{ fontSize: '24px', margin: '10px 0' }}>
            {scanResult.success ? scanResult.user.name : scanResult.message}
          </p>
          {scanResult.success && <p className="staff-stat-label">{scanResult.user.event}</p>}
        </div>
      )}
    </div>
  );
};

export default ScanAttendanceTab;