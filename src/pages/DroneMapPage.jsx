import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Tooltip } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trash2, Navigation, Satellite, Map as MapIcon, Globe, History, X, Loader, Check, Edit2, Save, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  getActiveSession,
  addMarkerToSession,
  getActiveSessionMarkers,
  deleteMarker,
  clearSessionMarkers,
  getSessionsWithMarkers,
  completeSession,
  updateSession,
  createSession
} from '../services/databaseSessions';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green marker
const droneIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapEventHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Map styles
const mapStyles = [
  {
    id: 'satellite',
    name: 'Satellite',
    icon: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  },
  {
    id: 'street',
    name: 'Street Map',
    icon: MapIcon,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    id: 'terrain',
    name: 'Terrain',
    icon: Globe,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    icon: MapIcon,
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
  }
];

const DroneMapPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [center] = useState([13.1402, 79.9094]);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [markers, setMarkers] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingSessionName, setEditingSessionName] = useState(false);
  const [tempSessionName, setTempSessionName] = useState('');

  // Cleanup map
  useEffect(() => {
    return () => {
      const containers = document.querySelectorAll('.leaflet-container');
      containers.forEach(container => {
        if (container._leaflet_id) {
          delete container._leaflet_id;
        }
      });
    };
  }, []);

  // Load active session and markers
  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await getActiveSession();
      setCurrentSession(session);
      setTempSessionName(session.session_name);
      
      const sessionMarkers = await getActiveSessionMarkers();
      setMarkers(sessionMarkers);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load operation session.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllSessions = async () => {
    try {
      const sessions = await getSessionsWithMarkers();
      setAllSessions(sessions);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const currentMapStyle = mapStyles.find(style => style.id === mapStyle) || mapStyles[0];

  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return `Location at ${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
    } catch (error) {
      console.error('Geocoding error:', error);
      return `Location at ${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
    }
  };

  const handleMapClick = async (latlng) => {
    if (!currentSession) return;
    
    setLoading(true);
    setSaving(true);
    setError(null);
    
    try {
      const latDir = latlng.lat >= 0 ? 'N' : 'S';
      const lngDir = latlng.lng >= 0 ? 'E' : 'W';
      const formattedCoords = `${Math.abs(latlng.lat).toFixed(6)}°${latDir}, ${Math.abs(latlng.lng).toFixed(6)}°${lngDir}`;
      
      const locationName = await getLocationName(latlng.lat, latlng.lng);
      
      const markerData = {
        position: [latlng.lat, latlng.lng],
        coordinates: formattedCoords,
        locationName: locationName,
        areaName: `Area ${markers.length + 1}`,
      };
      
      const savedMarker = await addMarkerToSession(currentSession.id, markerData);
      
      const newMarker = {
        id: savedMarker.id,
        position: [latlng.lat, latlng.lng],
        coordinates: formattedCoords,
        locationName: locationName,
        areaName: savedMarker.area_name,
        order: savedMarker.marker_order,
        createdAt: savedMarker.created_at,
      };
      
      setMarkers([...markers, newMarker]);
    } catch (err) {
      console.error('Error saving marker:', err);
      setError('Failed to save marker. Please try again.');
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleClearMarkers = async () => {
    if (window.confirm('Clear all markers in this operation? This cannot be undone.')) {
      try {
        setSaving(true);
        setError(null);
        await clearSessionMarkers(currentSession.id);
        setMarkers([]);
      } catch (err) {
        console.error('Error clearing markers:', err);
        setError('Failed to clear markers.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteMarker = async (id) => {
    if (window.confirm('Delete this marker?')) {
      try {
        setSaving(true);
        setError(null);
        await deleteMarker(id);
        setMarkers(markers.filter(marker => marker.id !== id));
      } catch (err) {
        console.error('Error deleting marker:', err);
        setError('Failed to delete marker.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCompleteSession = async () => {
    if (window.confirm(`Complete "${currentSession.session_name}"? A new operation will be started.`)) {
      try {
        setSaving(true);
        await completeSession(currentSession.id);
        // Create new session
        await loadCurrentSession();
      } catch (err) {
        console.error('Error completing session:', err);
        setError('Failed to complete operation.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveSessionName = async () => {
    try {
      setSaving(true);
      await updateSession(currentSession.id, { session_name: tempSessionName });
      setCurrentSession({ ...currentSession, session_name: tempSessionName });
      setEditingSessionName(false);
    } catch (err) {
      console.error('Error updating session name:', err);
      setError('Failed to update operation name.');
    } finally {
      setSaving(false);
    }
  };

  const handleShowHistory = async () => {
    setShowHistory(true);
    if (allSessions.length === 0) {
      await loadAllSessions();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Drone Operation Map
          </h1>
          <p className="text-xl text-gray-600">
            Session-based operation tracking - All areas grouped by operation
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X size={20} />
            </button>
          </motion.div>
        )}

        {/* Current Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                {saving ? <Loader className="text-white animate-spin" size={32} /> : <MapPin className="text-white" size={32} />}
              </div>
              <div className="flex-1">
                {editingSessionName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempSessionName}
                      onChange={(e) => setTempSessionName(e.target.value)}
                      className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 focus:outline-none bg-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveSessionName}
                      disabled={saving}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Save size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingSessionName(false);
                        setTempSessionName(currentSession?.session_name || '');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {currentSession?.session_name || 'Loading...'}
                    </h3>
                    <button
                      onClick={() => setEditingSessionName(true)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                )}
                <p className="text-gray-600">
                  {markers.length} area{markers.length !== 1 ? 's' : ''} marked • Status: {currentSession?.status || 'active'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleShowHistory}
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg"
              >
                <History size={20} />
                View History
              </button>
              
              {markers.length > 0 && (
                <>
                  <button
                    onClick={handleCompleteSession}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg disabled:opacity-50"
                  >
                    <Check size={20} />
                    Complete Operation
                  </button>
                  
                  <button
                    onClick={handleClearMarkers}
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Map Style Selector */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Map Style</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mapStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <button
                    key={style.id}
                    onClick={() => setMapStyle(style.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      mapStyle === style.id
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{style.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
        >
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '600px', width: '100%' }}
            className="z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              key={mapStyle}
              url={currentMapStyle.url}
              attribution={currentMapStyle.attribution}
            />
            <MapEventHandler onMapClick={handleMapClick} />
            
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={droneIcon}
              >
                <Tooltip 
                  permanent 
                  direction="top" 
                  offset={[0, -40]}
                  className="area-label"
                >
                  <div className="font-bold text-sm">
                    {marker.areaName}
                  </div>
                </Tooltip>
                <Popup>
                  <div className="p-2 min-w-[280px]">
                    <h3 className="font-bold text-lg text-green-700 mb-3 border-b pb-2">
                      {marker.areaName}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Location</p>
                        <p className="text-sm text-gray-700">{marker.locationName}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Coordinates</p>
                        <p className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                          {marker.coordinates}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteMarker(marker.id)}
                      disabled={saving}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-all w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete Marker
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
              />
              
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <History size={28} />
                      Operation History
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      {allSessions.length} operation{allSessions.length !== 1 ? 's' : ''} saved
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {allSessions.length === 0 ? (
                    <div className="text-center py-12">
                      <History size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">No operations yet</p>
                      <p className="text-gray-400 text-sm mt-2">Start marking areas on the map</p>
                    </div>
                  ) : (
                    allSessions.map((session, sessionIdx) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sessionIdx * 0.1 }}
                        className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200"
                      >
                        {/* Session Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                              {session.session_name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {session.total_areas} area{session.total_areas !== 1 ? 's' : ''}
                              </span>
                              <span>•</span>
                              <span>{new Date(session.created_at).toLocaleDateString()}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                session.status === 'completed' ? 'bg-green-200 text-green-800' :
                                session.status === 'active' ? 'bg-blue-200 text-blue-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Markers List */}
                        {session.markers && session.markers.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Areas Covered:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {session.markers.map((marker, idx) => (
                                <div
                                  key={marker.id}
                                  className="bg-white rounded-lg p-3 hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-800 text-sm">{marker.areaName}</p>
                                      <p className="text-xs text-gray-600 truncate">{marker.locationName}</p>
                                      <p className="text-xs font-mono text-gray-500 mt-1">{marker.coordinates}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {session.notes && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-gray-600">{session.notes}</p>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {markers.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center"
          >
            <MapPin size={64} className="mx-auto text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Areas Marked Yet
            </h3>
            <p className="text-gray-600">
              Click anywhere on the map to mark drone operation areas.<br />
              All markers in this session will be saved together.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DroneMapPage;
