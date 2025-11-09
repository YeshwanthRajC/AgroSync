import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Radio, MapPin, Battery, Navigation, Wind, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const MQTTDroneConnector = ({ isOpen, onClose }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [mqttConfig, setMqttConfig] = useState({
    broker: 'broker.hivemq.com',
    port: '8000',
    topic: 'drone/telemetry',
    clientId: `agrosync_${Math.random().toString(16).slice(2, 8)}`
  });
  const [telemetryData, setTelemetryData] = useState(null);
  const [error, setError] = useState(null);

  // Simulated MQTT connection (in real implementation, use MQTT.js library)
  const connectToMQTT = async () => {
    setConnectionStatus('connecting');
    setError(null);

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, you would use:
      // import mqtt from 'mqtt';
      // const client = mqtt.connect(`wss://${mqttConfig.broker}:${mqttConfig.port}/mqtt`);
      
      // For now, simulate successful connection
      setConnectionStatus('connected');
      
      // Simulate receiving telemetry data
      startSimulatedTelemetry();
      
    } catch (err) {
      setConnectionStatus('error');
      setError(err.message || 'Failed to connect to MQTT broker');
    }
  };

  const disconnectFromMQTT = () => {
    setConnectionStatus('disconnected');
    setTelemetryData(null);
  };

  // Simulate real-time telemetry data
  const startSimulatedTelemetry = () => {
    const interval = setInterval(() => {
      if (connectionStatus !== 'connected') {
        clearInterval(interval);
        return;
      }

      const mockData = {
        timestamp: new Date().toISOString(),
        gps: {
          latitude: (11.0168 + Math.random() * 0.01).toFixed(6),
          longitude: (76.9558 + Math.random() * 0.01).toFixed(6),
          altitude: (100 + Math.random() * 50).toFixed(2),
          satellites: Math.floor(Math.random() * 5) + 10
        },
        battery: {
          level: Math.max(20, 100 - Math.random() * 80).toFixed(1),
          voltage: (22.2 + Math.random() * 2).toFixed(2),
          current: (2.5 + Math.random() * 1.5).toFixed(2)
        },
        flight: {
          speed: (5 + Math.random() * 15).toFixed(2),
          heading: Math.floor(Math.random() * 360),
          altitude: (100 + Math.random() * 50).toFixed(2),
          flightTime: Math.floor(Math.random() * 1800)
        },
        sensors: {
          temperature: (25 + Math.random() * 10).toFixed(1),
          humidity: (60 + Math.random() * 20).toFixed(1),
          windSpeed: (2 + Math.random() * 8).toFixed(1)
        },
        status: {
          mode: ['AUTO', 'MANUAL', 'RTH'][Math.floor(Math.random() * 3)],
          armed: Math.random() > 0.3,
          homeSet: true
        }
      };

      setTelemetryData(mockData);
    }, 2000);

    return () => clearInterval(interval);
  };

  const formatFlightTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-[900px] max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio size={32} className="text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Drone MQTT Connection</h2>
                  <p className="text-green-100 text-sm">Real-time telemetry data stream</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <XCircle size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Connection Settings */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">MQTT Configuration</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Broker Address</label>
                    <input
                      type="text"
                      value={mqttConfig.broker}
                      onChange={(e) => setMqttConfig({...mqttConfig, broker: e.target.value})}
                      disabled={connectionStatus === 'connected'}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Port</label>
                    <input
                      type="text"
                      value={mqttConfig.port}
                      onChange={(e) => setMqttConfig({...mqttConfig, port: e.target.value})}
                      disabled={connectionStatus === 'connected'}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Topic</label>
                    <input
                      type="text"
                      value={mqttConfig.topic}
                      onChange={(e) => setMqttConfig({...mqttConfig, topic: e.target.value})}
                      disabled={connectionStatus === 'connected'}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Client ID</label>
                    <input
                      type="text"
                      value={mqttConfig.clientId}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                    />
                  </div>
                </div>

                {/* Connection Button */}
                <button
                  onClick={connectionStatus === 'connected' ? disconnectFromMQTT : connectToMQTT}
                  disabled={connectionStatus === 'connecting'}
                  className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                    connectionStatus === 'connected' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } disabled:opacity-50`}
                >
                  {connectionStatus === 'connecting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : connectionStatus === 'connected' ? (
                    <>
                      <WifiOff size={20} />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Wifi size={20} />
                      Connect to Drone
                    </>
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {connectionStatus === 'connected' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <p className="text-green-700 text-sm">Successfully connected to drone telemetry stream</p>
                  </div>
                )}
              </div>

              {/* Telemetry Data Display */}
              {telemetryData && connectionStatus === 'connected' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* GPS Data */}
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin size={20} className="text-blue-600" />
                      GPS Location
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Latitude:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.gps.latitude}°</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Longitude:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.gps.longitude}°</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Altitude:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.gps.altitude}m</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Satellites:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.gps.satellites}</span>
                      </div>
                    </div>
                  </div>

                  {/* Battery Data */}
                  <div className="bg-yellow-50 rounded-2xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Battery size={20} className="text-yellow-600" />
                      Battery Status
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Level:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.battery.level}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Voltage:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.battery.voltage}V</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.battery.current}A</span>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          telemetryData.battery.level > 50 ? 'bg-green-500' : 
                          telemetryData.battery.level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${telemetryData.battery.level}%` }}
                      />
                    </div>
                  </div>

                  {/* Flight Data */}
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Navigation size={20} className="text-purple-600" />
                      Flight Data
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.flight.speed} m/s</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Heading:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.flight.heading}°</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Flight Time:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{formatFlightTime(telemetryData.flight.flightTime)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mode:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.status.mode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Environmental Data */}
                  <div className="bg-green-50 rounded-2xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Wind size={20} className="text-green-600" />
                      Environmental Sensors
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Temp:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.sensors.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Humidity:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.sensors.humidity}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Wind:</span>
                        <span className="font-mono font-semibold text-gray-800 ml-2">{telemetryData.sensors.windSpeed} m/s</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Last updated: {new Date(telemetryData.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MQTTDroneConnector;
