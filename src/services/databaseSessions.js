import { supabase } from '../lib/supabase';

// ============================================
// DRONE OPERATION SESSIONS
// ============================================

// Create a new drone operation session
export const createSession = async (sessionName) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('drone_sessions')
    .insert([
      {
        user_id: user.id,
        session_name: sessionName || `Operation ${new Date().toLocaleDateString()}`,
        status: 'active',
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all sessions for current user
export const getSessions = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('drone_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get active session (or create if none exists)
export const getActiveSession = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Check for active session
  const { data: activeSessions, error: fetchError } = await supabase
    .from('drone_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError) throw fetchError;

  // If active session exists, return it
  if (activeSessions && activeSessions.length > 0) {
    return activeSessions[0];
  }

  // Otherwise, create a new session
  return await createSession(`Operation ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
};

// Complete a session (mark as completed)
export const completeSession = async (sessionId) => {
  const { data, error } = await supabase
    .from('drone_sessions')
    .update({ 
      status: 'completed',
      end_time: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a session (and all its markers via CASCADE)
export const deleteSession = async (sessionId) => {
  const { error } = await supabase
    .from('drone_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
};

// Update session name or notes
export const updateSession = async (sessionId, updates) => {
  const { data, error } = await supabase
    .from('drone_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// SESSION MARKERS
// ============================================

// Add marker to a session
export const addMarkerToSession = async (sessionId, markerData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Get current marker count for this session to set order
  const { count } = await supabase
    .from('session_markers')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  const { data, error } = await supabase
    .from('session_markers')
    .insert([
      {
        session_id: sessionId,
        user_id: user.id,
        area_name: markerData.areaName,
        location_name: markerData.locationName,
        coordinates: markerData.coordinates,
        latitude: markerData.position[0],
        longitude: markerData.position[1],
        marker_order: (count || 0) + 1,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all markers for a specific session
export const getSessionMarkers = async (sessionId) => {
  const { data, error } = await supabase
    .from('session_markers')
    .select('*')
    .eq('session_id', sessionId)
    .order('marker_order', { ascending: true });

  if (error) throw error;
  
  return data.map(marker => ({
    id: marker.id,
    position: [marker.latitude, marker.longitude],
    coordinates: marker.coordinates,
    locationName: marker.location_name,
    areaName: marker.area_name,
    order: marker.marker_order,
    createdAt: marker.created_at,
  }));
};

// Get all markers for current active session
export const getActiveSessionMarkers = async () => {
  const activeSession = await getActiveSession();
  return await getSessionMarkers(activeSession.id);
};

// Delete a specific marker
export const deleteMarker = async (markerId) => {
  const { error } = await supabase
    .from('session_markers')
    .delete()
    .eq('id', markerId);

  if (error) throw error;
};

// Clear all markers in a session
export const clearSessionMarkers = async (sessionId) => {
  const { error } = await supabase
    .from('session_markers')
    .delete()
    .eq('session_id', sessionId);

  if (error) throw error;
};

// ============================================
// SESSION HISTORY WITH MARKERS
// ============================================

// Get all sessions with their markers (for history view)
export const getSessionsWithMarkers = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Get all sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('drone_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (sessionsError) throw sessionsError;

  // Get markers for each session
  const sessionsWithMarkers = await Promise.all(
    sessions.map(async (session) => {
      const { data: markers, error: markersError } = await supabase
        .from('session_markers')
        .select('*')
        .eq('session_id', session.id)
        .order('marker_order', { ascending: true });

      if (markersError) throw markersError;

      return {
        ...session,
        markers: markers.map(marker => ({
          id: marker.id,
          position: [marker.latitude, marker.longitude],
          coordinates: marker.coordinates,
          locationName: marker.location_name,
          areaName: marker.area_name,
          order: marker.marker_order,
        }))
      };
    })
  );

  return sessionsWithMarkers;
};

// ============================================
// IMAGE ANALYSES
// ============================================

export const saveImageAnalysis = async (analysisData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Try to get active session to link analysis
  let sessionId = null;
  try {
    const activeSession = await getActiveSession();
    sessionId = activeSession.id;
  } catch (e) {
    // If no session, that's okay, analysis can be standalone
    console.warn('No active session for image analysis');
  }

  const { data, error } = await supabase
    .from('image_analyses')
    .insert([
      {
        user_id: user.id,
        session_id: sessionId,
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

  if (error && error.code !== 'PGRST116') throw error;
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
