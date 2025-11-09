import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Battery,
  Clock,
  Gauge,
  Thermometer,
  Satellite,
  Signal,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDroneData } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const DroneDashboard = () => {
  const { t } = useLanguage();
  const [droneData, setDroneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const fetchDroneData = async () => {
    setLoading(true);
    try {
      const data = await getDroneData();
      setDroneData(data);
      setShowAlert(data.low_battery_alert);
    } catch (err) {
      console.error('Failed to fetch drone data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDroneData();
    // Refresh every 10 seconds
    const interval = setInterval(fetchDroneData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBatteryColor = (battery) => {
    if (battery < 20) return 'from-red-500 to-red-600';
    if (battery < 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getBatteryIcon = (battery) => {
    if (battery < 20) return '🔴';
    if (battery < 50) return '🟡';
    return '🟢';
  };

  if (loading && !droneData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {t('droneDashboard')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('comprehensiveOverview')}
          </p>
        </motion.div>

        {/* Low Battery Alert */}
        {showAlert && droneData?.low_battery_alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 mb-8 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <AlertTriangle size={48} className="animate-pulse" />
              <div>
                <h3 className="text-2xl font-bold mb-1">⚠️ Battery Low!</h3>
                <p className="text-lg">
                  Please return drone to base immediately. Battery at {droneData.battery_percentage}%
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="ml-auto bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {droneData && (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Battery Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${getBatteryColor(droneData.battery_percentage)} rounded-full flex items-center justify-center`}>
                    <Battery className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Battery</h3>
                    <p className="text-sm text-gray-500">Current Level</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-gray-800">
                      {droneData.battery_percentage}
                    </span>
                    <span className="text-3xl text-gray-600">%</span>
                    <span className="text-2xl ml-2">{getBatteryIcon(droneData.battery_percentage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${droneData.battery_percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${getBatteryColor(droneData.battery_percentage)}`}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold">{droneData.status}</span>
                </p>
              </motion.div>

              {/* Flight Time Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Flight Time</h3>
                    <p className="text-sm text-gray-500">Predicted Remaining</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-800">
                    {droneData.predicted_flight_time}
                  </span>
                  <span className="text-2xl text-gray-600">min</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  ⏱️ Based on current battery level
                </p>
              </motion.div>

              {/* Altitude Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Gauge className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Altitude</h3>
                    <p className="text-sm text-gray-500">Above Ground</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-800">
                    {droneData.altitude}
                  </span>
                  <span className="text-2xl text-gray-600">m</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  📏 Optimal range: 50-150m
                </p>
              </motion.div>

              {/* Speed Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <TrendingDown className="text-white rotate-90" size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Speed</h3>
                    <p className="text-sm text-gray-500">Current Velocity</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-800">
                    {droneData.speed}
                  </span>
                  <span className="text-2xl text-gray-600">m/s</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  🚀 Max speed: 25 m/s
                </p>
              </motion.div>

              {/* Temperature Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <Thermometer className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Temperature</h3>
                    <p className="text-sm text-gray-500">Motor/Battery</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-800">
                    {droneData.temperature}
                  </span>
                  <span className="text-2xl text-gray-600">°C</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  🌡️ Normal operating range
                </p>
              </motion.div>

              {/* GPS Satellites Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Satellite className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">GPS</h3>
                    <p className="text-sm text-gray-500">Satellites Locked</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-800">
                    {droneData.gps_satellites}
                  </span>
                  <span className="text-2xl text-gray-600">/12</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Signal size={16} className="text-green-600" />
                  <p className="text-sm text-gray-600">
                    Signal: {droneData.signal_strength}%
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Battery History Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Battery className="text-green-600" />
                Battery Drain Over Time
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={droneData.battery_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      style={{ fontSize: '14px' }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: '14px' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="battery"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                📊 Real-time battery consumption monitoring
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default DroneDashboard;
