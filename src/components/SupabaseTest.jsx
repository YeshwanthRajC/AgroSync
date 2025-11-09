import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test 1: Check if client is initialized
      if (!supabase) {
        setStatus('❌ Supabase client not initialized');
        return;
      }

      // Test 2: Try to get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setStatus('❌ Session error: ' + sessionError.message);
        setDetails(sessionError);
        return;
      }

      // Test 3: Check auth settings
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Test 4: Check if we can query the database
      let dbTest = 'Not tested';
      try {
        const { data: tables, error: dbError } = await supabase
          .from('profiles')
          .select('count')
          .limit(0);
        
        if (dbError) {
          dbTest = '❌ ' + dbError.message;
        } else {
          dbTest = '✅ Database accessible';
        }
      } catch (e) {
        dbTest = '⚠️ Profile table not created yet';
      }
      
      setStatus('✅ Supabase Connected!');
      setDetails({
        sessionExists: !!sessionData.session,
        userExists: !!user,
        currentUser: user?.email || 'Not logged in',
        emailConfirmed: user?.email_confirmed_at ? '✅ Confirmed' : '❌ Not confirmed',
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        databaseTest: dbTest,
      });

    } catch (error) {
      setStatus('❌ Connection Error: ' + error.message);
      setDetails(error);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-xl max-w-sm z-50 border-2 border-green-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm">Supabase Status</h3>
        <button 
          onClick={testConnection}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Refresh
        </button>
      </div>
      <p className="text-xs mb-2 font-semibold">{status}</p>
      {details && (
        <div className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-48">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-semibold">{key}:</span>{' '}
              <span className="text-gray-700">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
