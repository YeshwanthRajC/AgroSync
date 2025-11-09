import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Image, CloudSun, Map, BarChart3, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/analysis', icon: Image, label: t('analysis') },
    { path: '/weather', icon: CloudSun, label: t('weather') },
    { path: '/map', icon: Map, label: t('map') },
    { path: '/dashboard', icon: BarChart3, label: t('dashboard') },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 z-50 flex items-center gap-3"
      >
        <img 
          src="/logo.png" 
          alt="AgroSync Logo" 
          className="h-16 w-auto"
        />
      </motion.div>

      {/* User Profile - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3"
      >
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg px-4 py-2 hover:shadow-xl transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden md:block">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>
          </button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-semibold">{t('signOut')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Language Toggle */}
        <LanguageToggle />
      </motion.div>

      {/* Floating Cylindrical Menu */}
      <motion.nav
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 z-[60]"
        style={{ left: '40%', transform: 'translateX(-50%)' }}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-2xl px-5 py-3 flex gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-full transition-all ${
                    isActive
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                  }`}
                  title={item.label}
                >
                  <Icon size={24} />
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-green-500 rounded-full -z-10"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
};

export default Navigation;
