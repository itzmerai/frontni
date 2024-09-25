import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QrScanner from 'react-qr-scanner';

function StudentDashboard() {
  const [message, setMessage] = useState('Scanning QR Code...');
  const [isDetecting, setIsDetecting] = useState(false);
  const studentId = '123'; // Assume you have the student ID available

  useEffect(() => {
    setMessage('Scanning QR Code...');
  }, []);

  const handleScan = (data: { text: string }| null) => {
    if (data) {
      const qrText = data.text || data;

      setIsDetecting(true);

      // Get the current location of the user
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const address = `${latitude},${longitude}`;
          // Proceed to handle the QR code and submit the data
          handleSubmit(qrText, address);
        },
        (error) => {
          console.error('Error fetching location:', error);
          setMessage('Unable to get location');
        }
      );
    } else {
      setIsDetecting(false);
    }
  };

  const handleError = (err: Error) => {
    console.error('QR code scan error:', err);
    setMessage('Error scanning QR Code');
  };

  const handleSubmit = async (scannedQr, address) => {
    const scanTime = new Date().toISOString();

    try {
      const response = await axios.post('http://localhost:5000/student/scan', {
        studentId,
        companyQr: scannedQr,
        scanTime,
        address, // Add the address (latitude, longitude)
      });

      setMessage(response.data.message || 'Time in done!');
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      setMessage('Error submitting timesheet');
    }
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      {message && <p>{message}</p>}

      {/* QR Scanner */}
      <div style={styles.scannerContainer}>
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={styles.scanner}
        />
      </div>
    </div>
  );
}

const styles = {
  scannerContainer: {
    position: 'relative' as const,
    width: '300px',
    height: '300px',
    margin: '0 auto',
  },
  scanner: {
    width: '100%',
    height: '100%',
  },
};

export default StudentDashboard;
