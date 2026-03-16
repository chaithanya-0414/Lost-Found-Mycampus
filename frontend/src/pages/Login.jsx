import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-dashboard-border shadow-2xl shadow-primary-blue/5"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-text-main mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-text-muted font-medium">Login to find your lost campus items</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted ml-1">College Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-blue transition-colors" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@college.edu"
                className="w-full bg-white border border-dashboard-border rounded-2xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-blue transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-dashboard-border rounded-2xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-dashboard-border text-center">
          <p className="text-text-muted font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-blue font-black hover:underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
