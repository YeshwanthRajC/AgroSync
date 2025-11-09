import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        // Better error messages
        if (error.message.includes('Email signups are disabled')) {
          throw new Error('Email signups are disabled. Please enable Email provider in Supabase Dashboard → Authentication → Providers → Email');
        }
        
        throw error;
      }
      
      console.log('Signup response:', data);
      
      // If user is created but email confirmation is required
      if (data?.user && data?.user?.identities?.length === 0) {
        throw new Error('Email already registered. Please use a different email or try logging in.');
      }
      
      // Check if user was created successfully
      if (data?.user) {
        // If there's a session, user is auto-confirmed
        if (data?.session) {
          setUser(data.user);
          console.log('✅ User auto-logged in after signup');
        } else {
          console.log('⚠️ User created but needs email confirmation');
          throw new Error('Account created! Please check your email to confirm your account.');
        }
      }
      
      return data;
    } catch (err) {
      console.error('Signup exception:', err);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        
        // Better error messages
        if (error.message.includes('Email logins are disabled')) {
          throw new Error('Email authentication is disabled. Please enable it in Supabase Dashboard → Authentication → Providers → Email');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Your email is not confirmed yet. Please check your email or contact support.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        
        throw error;
      }
      
      console.log('Login successful:', data);
      setUser(data.user);
      
      return data;
    } catch (err) {
      console.error('Login exception:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
