import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, MapPin, Tag, Type, FileText, Send, AlertCircle, ArrowLeft, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
};

const EditItem = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    status: 'lost',
    placeName: '',
    latitude: '0',
    longitude: '0',
    contactPhone: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPosition(newPos);
          
          try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            if (res.data && res.data.display_name) {
              setFormData(prev => ({ ...prev, placeName: res.data.display_name }));
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Could not get your location. Please check your browser permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${id}`);
        const item = res.data;
        
        if (item.userId !== user.id && user.role !== 'admin') {
            navigate('/');
            return;
        }

        setFormData({
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          placeName: item.location?.placeName || '',
          latitude: item.location?.latitude?.toString() || '0',
          longitude: item.location?.longitude?.toString() || '0',
          contactPhone: item.contactPhone || '',
        });
        
        if (item.location?.latitude && item.location?.longitude) {
            setPosition({ lat: item.location.latitude, lng: item.location.longitude });
        }
        
        if (item.imageUrl) {
            setPreview(`http://localhost:5000${item.imageUrl}`);
        }
      } catch (err) {
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, user.id, navigate]);

  useEffect(() => {
    if (position) {
      setFormData(prev => ({ 
        ...prev, 
        latitude: position.lat.toString(), 
        longitude: position.lng.toString() 
      }));
    }
  }, [position]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append('image', image);

    try {
      await axios.put(`http://localhost:5000/api/items/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
        }
      });
      navigate(`/item/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-white font-mono">Loading item data...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 group font-medium">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
           </button>
           <h1 className="text-4xl font-extrabold text-text-main mb-2 tracking-tight">Edit <span className="text-primary-blue font-light">Report</span></h1>
           <p className="text-text-muted font-medium">Update the details of your submitted item.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <label className="block text-sm font-bold text-text-muted ml-1 uppercase tracking-wider">Update Photo</label>
          <div 
            onClick={() => document.getElementById('imageInput').click()}
            className="aspect-square bg-white rounded-3xl border-2 border-dashed border-dashboard-border hover:border-primary-blue/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group shadow-sm shadow-black/[0.02]"
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={32} />
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-dashboard-bg rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-dashboard-border shadow-sm">
                  <Camera className="text-text-muted" size={32} />
                </div>
                <p className="text-sm text-text-muted font-bold">Click to change photo</p>
              </div>
            )}
            <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card-saas space-y-8 shadow-2xl shadow-primary-blue/5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 p-1 bg-dashboard-bg rounded-xl border border-dashboard-border w-fit shadow-sm">
              {['lost', 'found'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`px-8 py-2.5 rounded-lg text-sm font-black capitalize transition-all ${
                    formData.status === s 
                      ? (s === 'lost' ? 'bg-red-500 text-white shadow-md' : 'bg-success-green text-white shadow-md') 
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-text-muted ml-1 flex items-center gap-2 uppercase tracking-widest">
                  <Type size={14} className="text-primary-blue" /> Title
                </label>
                <input name="title" type="text" required value={formData.title} onChange={handleChange} className="w-full bg-white border border-dashboard-border rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-primary-blue transition-all font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-text-muted ml-1 flex items-center gap-2 uppercase tracking-widest">
                  <Tag size={14} className="text-primary-blue" /> Category
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white border border-dashboard-border rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-primary-blue transition-all font-medium">
                  <option value="electronics">Electronics</option>
                  <option value="wallet">Wallet/Card</option>
                  <option value="keys">Keys</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted ml-1 flex items-center gap-2 uppercase tracking-widest">
                <FileText size={14} className="text-primary-blue" /> Description
              </label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows="4" className="w-full bg-white border border-dashboard-border rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-primary-blue transition-all resize-none font-medium"></textarea>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-text-muted ml-1 flex items-center gap-2 uppercase tracking-widest">
                <MapPin size={14} className="text-primary-blue" /> Location & Contact
              </label>
              <input name="placeName" type="text" required value={formData.placeName} onChange={handleChange} placeholder="Place Name" className="w-full bg-white border border-dashboard-border rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-primary-blue transition-all mb-4 font-medium" />
              
              <div className="space-y-2 mb-4">
                <input
                  name="contactPhone"
                  type="text"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Contact Phone (Optional)"
                  className="w-full bg-white border border-dashboard-border rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-primary-blue transition-all placeholder:text-text-muted/40 font-medium"
                />
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-dashboard-border bg-dashboard-bg relative group/map shadow-inner">
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="absolute top-4 right-4 z-[1000] p-3 bg-primary-blue text-white rounded-xl shadow-xl shadow-primary-blue/20 hover:bg-primary-hover transition-all flex items-center gap-2 font-black text-xs uppercase tracking-tighter disabled:opacity-50"
                  title="Locate Me"
                >
                  <Navigation size={18} className={isLocating ? "animate-pulse" : ""} />
                  {isLocating ? 'Locating...' : 'Locate Me'}
                </button>
                <div className="absolute bottom-4 left-4 z-[1000] bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-dashboard-border pointer-events-none shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest font-black text-text-muted">Interactive Map</p>
                  <p className="text-xs text-primary-blue font-bold whitespace-nowrap">Click anywhere to change location</p>
                </div>
                <MapContainer center={position || [51.505, -0.09]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={position} setPosition={setPosition} />
                  <MapController center={position} />
                </MapContainer>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary-blue hover:bg-primary-hover rounded-xl font-black text-white text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-primary-blue/20">
              <Send size={20} />
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
