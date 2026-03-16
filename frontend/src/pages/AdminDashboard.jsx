import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { LayoutDashboard, TrendingUp, Package, CheckCircle2, AlertTriangle, User, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, management, users
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(statsRes.data);

      // Fetch items for management list
      const itemsRes = await axios.get(`${API_BASE_URL}/api/items`);
      setItems(itemsRes.data);

      // Fetch users
      const usersRes = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/items/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchData(); // Refresh data
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        alert(`Failed to delete item: ${msg}`);
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-white font-mono">Gathering campus intelligence...</div>;
  if (!stats) return <div className="text-white p-10">System error: Analytics unavailable.</div>;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryData = {
    labels: Object.keys(stats.categories),
    datasets: [{
      label: 'Items by Category',
      data: Object.values(stats.categories),
      backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-blue rounded-2xl flex items-center justify-center shadow-lg shadow-primary-blue/20">
            <LayoutDashboard className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-text-main tracking-tight">Admin <span className="text-text-muted text-3xl font-light">Console</span></h1>
            <p className="text-text-muted font-medium">Full administrative control over campus features.</p>
          </div>
        </div>

          <div className="flex p-1 bg-white rounded-2xl border border-dashboard-border shadow-sm">
            {['analytics', 'management', 'users'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-primary-blue text-white shadow-md shadow-primary-blue/20' : 'text-text-muted hover:text-text-main'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

      {activeTab === 'analytics' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { icon: Package, label: 'Reports', value: stats.items, color: 'blue' },
              { icon: AlertTriangle, label: 'Lost', value: stats.lost, color: 'red' },
              { icon: TrendingUp, label: 'Found', value: stats.found, color: 'success-green' },
              { icon: CheckCircle2, label: 'Claimed', value: stats.claimed, color: 'purple' },
              { icon: User, label: 'Users', value: stats.users, color: 'dashboard-border' },
            ].map((stat, i) => (
              <div key={i} className="card-saas group hover:border-primary-blue/30 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-dashboard-bg border border-dashboard-border group-hover:scale-110 transition-transform`}>
                  <stat.icon className={stat.color === 'success-green' ? 'text-success-green' : `text-${stat.color}-500`} size={20} />
                </div>
                <p className="text-text-muted text-xs font-bold tracking-wider uppercase">{stat.label}</p>
                <p className="text-3xl font-black text-text-main mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-saas">
              <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-3">
                <Package className="text-primary-blue" size={20} /> Category Distribution
              </h3>
              <div className="max-h-[300px] flex justify-center">
                <Pie data={categoryData} options={{ plugins: { legend: { position: 'right', labels: { color: '#64748b', font: { weight: 'bold', size: 11 } } } } }} />
              </div>
            </div>

            <div className="card-saas">
              <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-3">
                <TrendingUp className="text-success-green" size={20} /> Status Breakdown
              </h3>
              <Bar data={{
                labels: ['Lost', 'Found'],
                datasets: [{
                  data: [stats.lost, stats.found],
                  backgroundColor: ['#ef4444', '#22c55e'],
                  borderRadius: 8,
                  barThickness: 50
                }]
              }} options={{
                scales: { 
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } }, 
                  x: { grid: { display: false }, ticks: { color: '#1f2937', font: { weight: 'bold' } } } 
                },
                plugins: { legend: { display: false } }
              }} />
            </div>
          </div>
        </motion.div>
      ) : activeTab === 'management' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white border border-dashboard-border rounded-xl py-3 px-6 text-text-main focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all shadow-sm shadow-black/[0.02]"
            />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-dashboard-border rounded-xl py-3 px-6 text-text-main focus:outline-none focus:border-primary-blue transition-all shadow-sm shadow-black/[0.02]"
            >
              <option value="all">All Categories</option>
              {Object.keys(stats.categories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="card-saas !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-dashboard-bg border-b border-dashboard-border">
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Item</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashboard-border">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <img src={`http://localhost:5000${item.imageUrl}`} alt="" className="w-12 h-12 rounded-lg object-cover bg-dashboard-bg border border-dashboard-border shadow-sm" />
                          <div>
                            <p className="text-text-main font-bold">{item.title}</p>
                            <p className="text-text-muted text-xs">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium text-text-muted capitalize">{item.category}</td>
                      <td className="px-6 py-6">
                        <span className={`badge-saas ${
                          item.status === 'lost' ? 'badge-warning' : 
                          item.status === 'claimed' ? 'badge-success' :
                          'bg-blue-100 text-primary-blue'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/edit/${item.id}`)}
                            className="p-2.5 bg-dashboard-bg text-text-muted hover:text-primary-blue hover:bg-white rounded-lg border border-dashboard-border hover:border-primary-blue/30 transition-all shadow-sm"
                          >
                            <TrendingUp size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-100 hover:border-red-600 transition-all shadow-sm"
                          >
                            <AlertTriangle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card-saas !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-dashboard-bg border-b border-dashboard-border">
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Activity</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashboard-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-6">
                        <div>
                          <p className="text-text-main font-bold">{u.name}</p>
                          <p className="text-text-muted text-xs">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`badge-saas ${u.role === 'admin' ? 'bg-primary-blue text-white' : 'bg-dashboard-bg text-text-muted border border-dashboard-border'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex gap-4 text-xs">
                          <div><span className="text-slate-400">Items:</span> <span className="text-white font-bold">{u._count.items}</span></div>
                          <div><span className="text-slate-400">Claims:</span> <span className="text-white font-bold">{u._count.claimRequests}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        {u.id !== user.id && (
                          <button 
                            onClick={async () => {
                              if (window.confirm(`Delete user ${u.email}?`)) {
                                try {
                                  await axios.delete(`http://localhost:5000/api/admin/users/${u.id}`, {
                                    headers: { Authorization: `Bearer ${user.token}` }
                                  });
                                  fetchData();
                                } catch (err) { alert(err.response?.data?.message || err.message); }
                              }
                            }}
                            className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-100 transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
