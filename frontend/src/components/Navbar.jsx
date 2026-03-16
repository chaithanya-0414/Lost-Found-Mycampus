import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 px-6 border-b border-dashboard-border mb-8 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-primary-blue tracking-tight">
          Lost&Found <span className="text-text-main">Campus</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-8 text-text-muted font-semibold">
            <Link to="/" className="flex items-center gap-2 hover:text-primary-blue transition-colors">
              <Search size={18} />
              <span>Browse</span>
            </Link>
            <Link to="/report" className="flex items-center gap-2 hover:text-primary-blue transition-colors">
              <PlusCircle size={18} />
              <span>Report Item</span>
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-2 hover:text-primary-blue transition-colors">
                <LayoutDashboard size={18} />
                <span>Admin</span>
              </Link>
            )}
            <Link to="/contact" className="hover:text-primary-blue transition-colors">
              Contact
            </Link>
            <div className="h-6 w-[1.5px] bg-dashboard-border mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-blue/10 flex items-center justify-center border border-primary-blue/20">
                <UserIcon size={20} className="text-primary-blue" />
              </div>
              <div className="flex flex-col">
                <span className="text-text-main leading-none">{user.name}</span>
                <span className="text-[10px] text-text-muted capitalize">{user.role}</span>
              </div>
              <button 
                onClick={logout}
                className="ml-2 p-2 hover:bg-red-50 rounded-full text-text-muted hover:text-red-500 transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 font-bold text-text-muted hover:text-primary-blue transition-colors">Login</Link>
            <Link to="/register" className="btn-primary-saas">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
