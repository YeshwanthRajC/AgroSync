import { supabase } from '../lib/supabase';

// ============================================
// DRONE MARKERS
// ============================================

export const saveMarker = async (markerData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('drone_markers')
    .insert([
      {
        user_id: user.id,
        area: markerData.area,
        location_name: markerData.locationName,
        coordinates: markerData.coordinates,
        latitude: markerData.position[0],
        longitude: markerData.position[1],
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMarkers = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('drone_markers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform data to match component format
  return data.map(marker => ({
    id: marker.id,
    position: [marker.latitude, marker.longitude],
    coordinates: marker.coordinates,
    locationName: marker.location_name,
    area: marker.area,
    date: new Date(marker.created_at).toLocaleDateString(),
    time: new Date(marker.created_at).toLocaleTimeString(),
  }));
};

export const deleteMarker = async (markerId) => {
  const { error } = await supabase
    .from('drone_markers')
    .delete()
    .eq('id', markerId);

  if (error) throw error;
};

export const clearAllMarkers = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('drone_markers')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
};

// ============================================
// IMAGE ANALYSES
// ============================================

export const saveImageAnalysis = async (analysisData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('image_analyses')
    .insert([
      {
        user_id: user.id,
        image_url: analysisData.imageUrl || '',
        analysis_result: analysisData.result,
        crop_health: analysisData.cropHealth,
        recommendations: analysisData.recommendations,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getImageAnalyses = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('image_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// USER PREFERENCES
// ============================================

export const saveUserPreferences = async (preferences) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert([
      {
        user_id: user.id,
        default_location: preferences.location,
        default_latitude: preferences.latitude,
        default_longitude: preferences.longitude,
        weather_alerts: preferences.weatherAlerts,
        theme: preferences.theme,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserPreferences = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
  return data;
};

// ============================================
// WEATHER HISTORY
// ============================================

export const saveWeatherData = async (weatherData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('weather_history')
    .insert([
      {
        user_id: user.id,
        location: weatherData.location,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        wind_speed: weatherData.windSpeed,
        weather_condition: weatherData.condition,
        data: weatherData.raw,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getWeatherHistory = async (limit = 10) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('weather_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};
