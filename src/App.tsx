import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';


function App() {
  const role = localStorage.getItem('role');

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/student" 
            element={role === 'student' ? <StudentDashboard /> : <Navigate to="/login" replace />} 
          />
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
