import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Tag, User, ShieldCheck, Sparkles, Send, CheckCircle, Phone, Mail, Trash2, Edit } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimAnswers, setClaimAnswers] = useState('');
  const [claimStatus, setClaimStatus] = useState(null); // null, success
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (item && (item.userId === user.id || user.role === 'admin')) {
      fetchClaims();
    }
  }, [item, user]);

  const fetchClaims = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/items/${id}/claims`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIncomingClaims(res.data);
    } catch (err) {
      console.error('Error fetching claims:', err);
    }
  };

  const handleRespondClaim = async (claimId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/items/claims/${claimId}`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchClaims();
      // Refresh item to show 'claimed' status if approved
      const res = await axios.get(`${API_BASE_URL}/api/items/${id}`);
      setItem(res.data);
    } catch (err) {
      console.error('Error responding to claim:', err);
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/items/${id}/claim`, { answers: claimAnswers }, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setClaimStatus('success');
    } catch (err) {
      console.error('Error submitting claim:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/items/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        navigate('/');
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading item details...</div>;
  if (!item) return <div className="text-center py-20 text-white">Item not found.</div>;

  const matches = item.status === 'lost' ? item.lostMatches : item.foundMatches;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative h-[500px] rounded-[40px] overflow-hidden bg-white border border-dashboard-border shadow-2xl shadow-primary-blue/5"
        >
          {item.imageUrl ? (
            <img 
              src={`${API_BASE_URL}${item.imageUrl}`} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-dashboard-bg text-text-muted">
              <Tag size={80} />
            </div>
          )}
          <div className={`absolute top-6 left-6 px-6 py-2 backdrop-blur-md rounded-full border text-white font-bold uppercase tracking-widest text-sm ${
            item.status === 'lost' 
              ? 'bg-red-500/20 border-red-500/30' 
              : item.status === 'claimed'
                ? 'bg-indigo-500/20 border-indigo-500/30'
                : 'bg-emerald-500/20 border-emerald-500/30'
          }`}>
            {item.status}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 text-primary-blue font-black tracking-wider uppercase text-sm mb-4">
            <span className="w-8 h-[2px] bg-primary-blue"></span>
            {item.category}
          </div>
          
          <h1 className="text-5xl font-black text-text-main mb-6 leading-tight tracking-tight">{item.title}</h1>
          
          <div className="space-y-6 mb-10">
            <p className="text-xl text-text-muted leading-relaxed font-medium">{item.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dashboard-bg border border-dashboard-border p-4 rounded-3xl flex items-center gap-4 transition-all hover:border-primary-blue/20">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-blue shadow-sm border border-dashboard-border">
                  <MapPin size={22} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Location</p>
                  <p className="font-bold text-text-main">{item.location?.placeName}</p>
                </div>
              </div>
              <div className="bg-dashboard-bg border border-dashboard-border p-4 rounded-3xl flex items-center gap-4 transition-all hover:border-primary-blue/20">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-blue shadow-sm border border-dashboard-border">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Reported on</p>
                  <p className="font-bold text-text-main">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            {item.location?.latitude && item.location?.longitude && (
              <div className="h-48 rounded-[32px] overflow-hidden border border-dashboard-border bg-white mt-6 relative z-0 shadow-inner">
                <MapContainer 
                  center={[item.location.latitude, item.location.longitude]} 
                  zoom={15} 
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[item.location.latitude, item.location.longitude]} />
                </MapContainer>
              </div>
            )}

            <div className="flex items-center gap-4 p-4 rounded-3xl border border-dashboard-border bg-dashboard-bg mt-6">
              <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center shadow-md">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest leading-none mb-1">Reported by</p>
                <p className="font-bold text-text-main">{item.user?.name}</p>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${item.user?.email}`} className="p-2.5 bg-white hover:bg-white text-text-muted hover:text-primary-blue rounded-xl border border-dashboard-border hover:border-primary-blue/30 transition-all shadow-sm" title="Email Reporter">
                  <Mail size={18} />
                </a>
                {item.contactPhone && (
                  <a href={`tel:${item.contactPhone}`} className="p-2.5 bg-white hover:bg-white text-text-muted hover:text-success-green rounded-xl border border-dashboard-border hover:border-success-green/30 transition-all shadow-sm" title="Call/Text Reporter">
                    <Phone size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            {item.userId === user.id ? (
              <>
                <Link 
                  to={`/edit/${item.id}`}
                  className="flex-1 py-4 bg-primary-blue hover:bg-primary-hover text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-blue/20"
                >
                  <Edit size={20} />
                  Edit Details
                </Link>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-100 hover:border-red-600 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Trash2 size={20} />
                  Delete Item
                </button>
              </>
            ) : null}
          </div>

          {/* Action Area */}
          {item.userId !== user.id ? (
            item.status === 'claimed' ? (
              <div className="p-10 bg-primary-blue/5 border-2 border-dashed border-primary-blue/20 rounded-[40px] text-center">
                <div className="w-20 h-20 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-blue/20 text-white">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-text-main mb-2 tracking-tight">Item Claimed</h3>
                <p className="text-text-muted font-medium mb-0">This item has been successfully returned to its owner.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {!claimStatus ? (
                  <div className="card-saas !p-10 !rounded-[40px] border-primary-blue/10 bg-white shadow-2xl shadow-primary-blue/5">
                    <h3 className="text-2xl font-black text-text-main mb-4 flex items-center gap-3 tracking-tight">
                      <ShieldCheck className="text-primary-blue" size={28} />
                      Verify Ownership
                    </h3>
                    <p className="text-text-muted font-medium mb-8">Describe an identifying mark or characteristic that only the owner would know.</p>
                    <form onSubmit={handleClaim} className="space-y-6">
                      <textarea 
                        required
                        value={claimAnswers}
                        onChange={(e) => setClaimAnswers(e.target.value)}
                        placeholder="e.g. There is a small scratch on the bottom right corner..."
                        className="w-full bg-dashboard-bg border border-dashboard-border rounded-2xl p-6 text-text-main focus:outline-none focus:border-primary-blue transition-all resize-none font-medium text-lg placeholder:text-text-muted/40"
                        rows="4"
                      ></textarea>
                      <button className="w-full py-5 bg-primary-blue hover:bg-primary-hover text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:shadow-2xl shadow-lg shadow-primary-blue/20 transition-all active:scale-[0.98]">
                        <Send size={24} />
                        Submit Claim Request
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-10 bg-success-green/5 border-2 border-dashed border-success-green/20 rounded-[40px] text-center">
                    <div className="w-20 h-20 bg-success-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success-green/20 text-white">
                      <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-text-main mb-2 tracking-tight">Claim Submitted!</h3>
                    <p className="text-text-muted font-medium mb-0">The reporter has been notified. They will review your verification answer.</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div className="p-8 border-2 border-dashed border-dashboard-border rounded-[32px] text-center bg-white shadow-sm">
                <p className="text-text-muted font-bold flex items-center justify-center gap-2">
                  <User size={18} className="text-primary-blue" />
                  You reported this item.
                </p>
              </div>
              
              {incomingClaims.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-text-main flex items-center gap-3">
                    <Send className="text-primary-blue" size={24} />
                    Pending Claims ({incomingClaims.filter(c => c.status === 'pending').length})
                  </h3>
                  <div className="space-y-4">
                    {incomingClaims.map(claim => (
                      <div key={claim.id} className="bg-white p-8 rounded-[32px] border border-dashboard-border shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-dashboard-bg rounded-2xl flex items-center justify-center text-primary-blue font-black text-xl border border-dashboard-border shadow-sm">
                              {claim.claimant.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-text-main text-lg leading-tight">{claim.claimant.name}</p>
                              <p className="text-sm text-text-muted font-medium italic">{claim.claimant.email}</p>
                            </div>
                          </div>
                          <span className={`badge-saas ${
                            claim.status === 'approved' ? 'badge-success' :
                            claim.status === 'rejected' ? 'badge-warning' :
                            'bg-blue-50 text-primary-blue'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                        <div className="text-md text-text-main bg-dashboard-bg p-6 rounded-2xl mb-6 border border-dashboard-border italic font-medium leading-relaxed">
                          "{claim.answers}"
                        </div>
                        {claim.status === 'pending' && (
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleRespondClaim(claim.id, 'approved')}
                              className="flex-1 py-3 bg-success-green hover:bg-green-600 text-white text-md font-black rounded-xl transition-all shadow-lg shadow-success-green/20"
                            >
                              Approve Claim
                            </button>
                            <button 
                              onClick={() => handleRespondClaim(claim.id, 'rejected')}
                              className="flex-1 py-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white text-md font-black border border-red-100 hover:border-red-600 rounded-xl transition-all shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Matches Section */}
      <AnimatePresence>
        {matches && matches.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pt-16 border-t border-dashboard-border"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-text-main flex items-center gap-4 tracking-tight">
                <Sparkles className="text-primary-blue animate-pulse" fill="currentColor" size={32} />
                AI Suggested Matches
              </h2>
              <span className="badge-saas bg-primary-blue text-white shadow-lg shadow-primary-blue/20 px-6 py-2 text-md">
                {matches.length} MATCHES FOUND
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {matches.map((match) => {
                const matchedItem = item.status === 'lost' ? match.foundItem : match.lostItem;
                return (
                  <Link 
                    key={match.id}
                    to={`/item/${matchedItem.id}`}
                    className="bg-white group rounded-3xl overflow-hidden border border-dashboard-border shadow-sm hover:shadow-2xl hover:shadow-primary-blue/10 transition-all hover:-translate-y-2 duration-500"
                  >
                    <div className="h-44 bg-dashboard-bg relative overflow-hidden">
                      {matchedItem.imageUrl ? (
                        <img src={`http://localhost:5000${matchedItem.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted"><Tag size={32} /></div>
                      )}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-primary-blue rounded-full text-[10px] font-black text-white shadow-lg">
                        {Math.round(match.similarityScore * 100)}% MATCH
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-black text-text-main text-lg mb-2 line-clamp-1 group-hover:text-primary-blue transition-colors">{matchedItem.title}</h4>
                      <p className="text-sm text-text-muted font-bold flex items-center gap-2">
                        <MapPin size={14} className="text-primary-blue" /> {matchedItem.location?.placeName || 'Campus'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemDetails;
