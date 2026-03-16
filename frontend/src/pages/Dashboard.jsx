import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { Search, MapPin, Calendar, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, lost, found
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/items`);
        setItems(res.data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight">
            Discover <span className="text-primary-blue font-light">Items</span>
          </h1>
          <p className="text-text-muted mt-2 font-medium">Browse lost and found items across the campus.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-dashboard-border rounded-xl py-2 pl-10 pr-4 text-text-main focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white border border-dashboard-border rounded-xl p-1 shadow-sm">
            {['all', 'lost', 'found'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                  filter === f ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative bg-white rounded-3xl overflow-hidden border border-dashboard-border shadow-sm hover:shadow-xl hover:shadow-primary-blue/5 transition-all duration-300"
            >
              <div className="h-48 overflow-hidden bg-dashboard-bg relative">
                {item.imageUrl ? (
                  <img 
                    src={`${API_BASE_URL}${item.imageUrl}`} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Tag size={48} />
                  </div>
                )}
                <div className={`absolute top-4 right-4 badge-saas shadow-lg ${
                  item.status === 'lost' 
                    ? 'badge-warning' 
                    : item.status === 'claimed'
                      ? 'badge-success'
                      : 'bg-primary-blue text-white'
                }`}>
                  {item.status}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-text-main mb-2 line-clamp-1">{item.title}</h3>
                <p className="text-text-muted text-sm line-clamp-2 mb-4 h-10 leading-relaxed font-medium">{item.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-text-muted font-bold">
                    <MapPin size={14} className="text-primary-blue" />
                    <span>{item.location?.placeName || 'Unknown Location'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted font-bold">
                    <Calendar size={14} className="text-primary-blue" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link 
                  to={`/item/${item.id}`}
                  className="w-full py-3 bg-dashboard-bg hover:bg-white border border-dashboard-border rounded-xl flex items-center justify-center gap-2 text-text-main font-bold transition-all group-hover:border-primary-blue/30 group-hover:shadow-sm"
                >
                  View Details
                  <ArrowRight size={18} className="text-primary-blue group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-dashboard-border shadow-sm">
          <p className="text-text-muted mb-2 font-bold">No items found matching your criteria.</p>
          <Link to="/report" className="text-primary-blue font-bold hover:underline">Report an item now</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
