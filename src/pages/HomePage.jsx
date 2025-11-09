import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Plane, Brain, CloudRain, MapPin, TrendingUp, Radio } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import MQTTDroneConnector from '../components/MQTTDroneConnector';

const HomePage = () => {
  const { t } = useLanguage();
  const [isMQTTModalOpen, setIsMQTTModalOpen] = useState(false);
  
  const features = [
    {
      icon: Brain,
      title: t('aiPoweredAnalysis'),
      description: t('advancedImageRecognition'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Plane,
      title: t('droneIntegration'),
      description: t('realTimeMonitoringDesc'),
      color: 'from-green-500 to-green-600',
    },
    {
      icon: CloudRain,
      title: t('weatherInsights'),
      description: t('liveWeatherData'),
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: MapPin,
      title: t('fieldMapping'),
      description: t('interactiveMaps'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrendingUp,
      title: t('smartAnalytics'),
      description: t('comprehensiveDashboard'),
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Sprout,
      title: t('replantingAssistant'),
      description: t('intelligentRecommendations'),
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/templateVideo.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-transparent to-green-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-20 px-6"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center shadow-2xl">
              <Sprout size={48} className="text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
          >
            AgroSync
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white mb-8 max-w-4xl mx-auto leading-relaxed drop-shadow-lg"
          >
            {t('agroSyncTagline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <span className="text-gray-700">🌾 {t('smartAgriculture')}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <span className="text-gray-700">🤖 {t('aiDriven')}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <span className="text-gray-700">📡 {t('realTimeMonitoring')}</span>
            </div>
          </motion.div>

          {/* MQTT Connection Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={() => setIsMQTTModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            <Radio size={24} />
            Connect Drone Telemetry
          </motion.button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
              >
                <feature.icon size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="max-w-6xl mx-auto px-6 pb-20"
      >
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl p-12 shadow-2xl text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-3 text-center">
              🚀 Powering Smart Agriculture
            </h2>
            <p className="text-xl mb-10 opacity-90 text-center max-w-2xl mx-auto">
              Join thousands of farmers revolutionizing their farming with AI-powered insights
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">10K+</div>
                <div className="text-green-100 text-sm">Active Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">50K+</div>
                <div className="text-green-100 text-sm">Acres Monitored</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">95%</div>
                <div className="text-green-100 text-sm">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">24/7</div>
                <div className="text-green-100 text-sm">Real-Time Support</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="bg-green-800 text-white py-8 text-center">
        <p className="text-lg">
          © 2025 AgroSync. {t('empoweringFarmers')}
        </p>
        </div>
      </div>

      {/* MQTT Connection Modal */}
      <MQTTDroneConnector 
        isOpen={isMQTTModalOpen} 
        onClose={() => setIsMQTTModalOpen(false)} 
      />
    </div>
  );
};

export default HomePage;