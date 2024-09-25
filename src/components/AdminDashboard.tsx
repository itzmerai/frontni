import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


interface Company {
  company_id: number;
  company_name: string;
  company_qr: string;
}

function AdminDashboard() {
  const [companyName, setCompanyName] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentUsername, setStudentUsername] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [randomString, setRandomString] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);

  const [timesheets, setTimesheets] = useState<any[]>([]);

  // State for Leaflet map
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);
  const someNumberAsString = someNumber.toString();
  // Convert string to number

  const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const generateQrCode = () => {
    const randomStr = generateRandomString(10);
    setRandomString(randomStr);
    setQrCode(randomStr);
    setMessage('QR Code generated. You can now add the company.');
  };

  const addCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!qrCode) {
      setMessage('Please generate a QR code first.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/admin/company', { companyName, qrCode });
      setMessage('Company added successfully');
      setQrCode('');
      setRandomString('');
      setCompanyName('');
      fetchCompanies();
    } catch (error) {
      setMessage('Error adding company');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const addStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/admin/student', 
        { name: studentName, username: studentUsername, password: studentPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Student added successfully');
      setStudentName('');
      setStudentUsername('');
      setStudentPassword('');
    } catch (error) {
      setMessage('Error adding student');
    }
  };

  const downloadQrCode = (qrValue: string, companyName: string) => {
    const canvas = document.getElementById(qrValue) as HTMLCanvasElement | null;
    if (!canvas) {
      setMessage('Canvas not found');
      return;
    }
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${companyName}_qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };


  const fetchTimesheets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/timesheets');
      setTimesheets(response.data);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    }
  };

  // Open modal to display Leaflet map
  const openMapModal = (address: string) => {
    // Convert address to coordinates (basic geocoding example)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setMapCoords([parseFloat(lat), parseFloat(lon)]);
          setSelectedAddress(address);
          setShowMapModal(true);
        } else {
          setMessage('Location not found');
        }
      })
      .catch(() => setMessage('Error finding location'));
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedAddress('');
    setMapCoords(null);
  };

  useEffect(() => {
    fetchCompanies();
    fetchTimesheets();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {message && <p>{message}</p>}

      {/* Add Company Form */}
      <form onSubmit={addCompany}>
        <h3>Add Company</h3>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company Name"
          required
        />
        <button type="button" onClick={generateQrCode}>Generate QR Code</button>
        {qrCode && (
          <div>
            <h4>Generated QR Code (Random String: {randomString}):</h4>
            <QRCodeCanvas id={qrCode} value={qrCode} />
          </div>
        )}
        <button type="submit" disabled={!qrCode}>Add Company</button>
      </form>

      {/* Add Student Form */}
      <form onSubmit={addStudent}>
        <h3>Add Student</h3>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Student Name"
          required
        />
        <input
          type="text"
          value={studentUsername}
          onChange={(e) => setStudentUsername(e.target.value)}
          placeholder="Student Username"
          required
        />
        <input
          type="password"
          value={studentPassword}
          onChange={(e) => setStudentPassword(e.target.value)}
          placeholder="Student Password"
          required
        />
        <button type="submit">Add Student</button>
      </form>


      {/* Display Companies */}
      <h3>Companies</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>QR Code</th>
            <th>Download QR Code</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.company_id}>
              <td>{company.company_name}</td>
              <td>
                <QRCodeCanvas id={company.company_qr} value={company.company_qr} size={100} />
              </td>
              <td>
                <button onClick={() => downloadQrCode(company.company_qr, company.company_name)}>
                  Download QR Code
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display Timesheets */}
      <h3>Timesheets</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Company ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map((timesheet) => (
            <tr key={timesheet.time_id}>
              <td>{timesheet.student_id}</td>
              <td>{timesheet.company_id}</td>
              <td>{timesheet.date}</td>
              <td>{timesheet.time}</td>
              <td>
                <button onClick={() => openMapModal(timesheet.adress)}>
                  {timesheet.adress}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal to display Leaflet map */}
      {showMapModal && mapCoords && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeMapModal}>
              &times;
            </span>
            <h3>Location: {selectedAddress}</h3>
            <MapContainer center={mapCoords} zoom={13} style={{ height: '400px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={mapCoords}>
                <Popup>{selectedAddress}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Embedded CSS for Modal */}
      <style >{`
        .modal {
          display: block;
          position: fixed;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
          background-color: #fff;
          margin: 15% auto;
          padding: 20px;
          border: 1px solid #888;
          width: 80%;
        }

        .close-button {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
        }

        .close-button:hover,
        .close-button:focus {
          color: black;
          text-decoration: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
