import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import ItemDetails from './pages/ItemDetails';
import AdminDashboard from './pages/AdminDashboard';
import EditItem from './pages/EditItem';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dashboard-bg text-red-500 p-10 font-mono overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Runtime Error Detected:</h1>
          <pre className="bg-slate-900 p-6 rounded-xl border border-red-500/20 whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dashboard-bg text-primary-blue font-bold">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dashboard-bg text-primary-blue font-bold">Loading...</div>;
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-dashboard-bg">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/report" element={
                  <PrivateRoute>
                    <ReportItem />
                  </PrivateRoute>
                } />
                <Route path="/item/:id" element={
                  <PrivateRoute>
                    <ItemDetails />
                  </PrivateRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/edit/:id" element={
                  <PrivateRoute>
                    <EditItem />
                  </PrivateRoute>
                } />
                <Route path="/contact" element={<ContactUs />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
