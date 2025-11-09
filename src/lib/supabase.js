import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                        import.meta.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
} else {
  console.log('✅ Supabase initialized successfully');
  console.log('URL:', supabaseUrl);
  console.log('Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
