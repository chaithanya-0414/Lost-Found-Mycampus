import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 border border-dashboard-border shadow-2xl shadow-primary-blue/5"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-text-main mb-2 tracking-tight">Create Account</h1>
          <p className="text-text-muted font-medium">Join the campus-wide social network for lost items</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-text-muted ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-blue transition-colors" size={20} />
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-white border border-dashboard-border rounded-2xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-text-muted ml-1">College Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-blue transition-colors" size={20} />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.name@college.edu"
                className="w-full bg-white border border-dashboard-border rounded-2xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-text-muted ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-blue transition-colors" size={20} />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border border-dashboard-border rounded-2xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 mt-4"
          >
            {isSubmitting ? 'Onboarding...' : 'Create Account'}
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dashboard-border text-center">
          <p className="text-text-muted font-medium text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-blue font-black hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
