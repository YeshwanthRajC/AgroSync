import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg px-4 py-2 hover:shadow-xl transition-all"
      title={language === 'en' ? 'Switch to Tamil' : 'ஆங்கிலத்திற்கு மாறவும்'}
    >
      <Languages size={20} className="text-green-600" />
      <span className="font-semibold text-gray-700">
        {language === 'en' ? 'தமிழ்' : 'EN'}
      </span>
    </motion.button>
  );
};

export default LanguageToggle;
