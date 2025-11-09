import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Thermometer,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { getWeather } from '../services/api';
import { saveWeatherData } from '../services/database';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const WeatherPage = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeather();
      setWeather(data);
      setLastUpdate(new Date());

      // Save to database
      try {
        await saveWeatherData({
          location: data.name || 'Thiruvallur',
          temperature: data.main?.temp,
          humidity: data.main?.humidity,
          windSpeed: data.wind?.speed,
          condition: data.weather?.[0]?.main,
          raw: data
        });
        console.log('✅ Weather data saved to database');
      } catch (dbError) {
        console.error('Failed to save weather to database:', dbError);
        // Don't show error to user - weather still displayed
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to fetch weather data. Please check your API key configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'drizzle':
        return '🌦️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };

  if (loading && !weather) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {t('weatherForecast')}
          </h1>
          <p className="text-xl text-gray-600">Thiruvallur, India</p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">
              {t('loading')}: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center"
          >
            <p className="text-red-700 text-lg">{error}</p>
            <button
              onClick={fetchWeather}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {weather && weather.success && (
          <>
            {/* Main Weather Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl shadow-2xl p-12 mb-8 text-white"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-6xl font-bold mb-2">
                    {weather.temperature}°C
                  </h2>
                  <p className="text-2xl opacity-90">
                    {t('feelsLike')} {weather.feels_like}°C
                  </p>
                  <p className="text-xl mt-4 capitalize">
                    {weather.weather_description}
                  </p>
                </div>
                <div className="text-9xl">
                  {getWeatherIcon(weather.weather_condition)}
                </div>
              </div>

              <button
                onClick={fetchWeather}
                disabled={loading}
                className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-all"
              >
                <RefreshCw
                  size={20}
                  className={loading ? 'animate-spin' : ''}
                />
                {t('getWeather')}
              </button>
            </motion.div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Droplets className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {t('humidity')}
                  </h3>
                </div>
                <p className="text-4xl font-bold text-gray-800">
                  {weather.humidity}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Wind className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {t('windSpeed')}
                  </h3>
                </div>
                <p className="text-4xl font-bold text-gray-800">
                  {weather.wind_speed}
                  <span className="text-2xl"> km/h</span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Thermometer className="text-purple-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {t('pressure')}
                  </h3>
                </div>
                <p className="text-4xl font-bold text-gray-800">
                  {weather.pressure}
                  <span className="text-2xl"> hPa</span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Sunrise className="text-orange-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Sunrise
                  </h3>
                </div>
                <p className="text-4xl font-bold text-gray-800">
                  {formatTime(weather.sunrise)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Sunset className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Sunset
                  </h3>
                </div>
                <p className="text-4xl font-bold text-gray-800">
                  {formatTime(weather.sunset)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Eye className="text-cyan-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Cloud Cover
                  </h3>
                </div>
                <p className="text-4xl font-bold text-gray-800">
                  {weather.clouds}%
                </p>
              </motion.div>
            </div>

            {/* Rain Forecast */}
            {weather.rain_forecast > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-8 text-white"
              >
                <div className="flex items-center gap-4 mb-4">
                  <CloudRain size={48} />
                  <div>
                    <h3 className="text-2xl font-bold">Rain Expected</h3>
                    <p className="text-lg opacity-90">
                      {weather.rain_forecast} mm in the last hour
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherPage;
