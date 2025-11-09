import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AgroSync AI assistant. I can help you with your drone operations, weather data, and crop analysis. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserContext = async () => {
    if (!user) return null;

    try {
      // Fetch user's drone sessions
      const { data: sessions } = await supabase
        .from('drone_sessions')
        .select('*, session_markers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch user's image analyses
      const { data: analyses } = await supabase
        .from('image_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch user's weather history
      const { data: weather } = await supabase
        .from('weather_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        userName: profile?.full_name || user.email?.split('@')[0] || 'User',
        userEmail: user.email,
        totalSessions: sessions?.length || 0,
        recentSessions: sessions?.map(s => ({
          name: s.session_name,
          date: s.session_date,
          areas: s.total_areas,
          status: s.status
        })) || [],
        totalAnalyses: analyses?.length || 0,
        recentAnalyses: analyses?.map(a => ({
          disease: a.disease_detected,
          confidence: a.confidence_score,
          date: a.created_at
        })) || [],
        recentWeather: weather?.map(w => ({
          location: w.location,
          temperature: w.temperature,
          condition: w.weather_condition,
          date: w.created_at
        })) || []
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get user context
      const userContext = await getUserContext();

      // Prepare context for Gemini
      const contextPrompt = userContext ? `
User Context:
- Name: ${userContext.userName}
- Email: ${userContext.userEmail}
- Total Drone Operations: ${userContext.totalSessions}
- Recent Operations: ${userContext.recentSessions.map(s => `${s.name} (${s.areas} areas, ${s.status})`).join(', ') || 'None'}
- Total Crop Analyses: ${userContext.totalAnalyses}
- Recent Diseases Detected: ${userContext.recentAnalyses.map(a => `${a.disease} (${a.confidence}% confidence)`).join(', ') || 'None'}
- Recent Weather Checks: ${userContext.recentWeather.map(w => `${w.location}: ${w.temperature}°C, ${w.condition}`).join(', ') || 'None'}

You are AgroSync AI, an intelligent assistant for drone-based crop monitoring. Help the user with their questions about their drone operations, crop health, weather data, and agriculture insights. Use the context above to provide personalized responses.
` : 'You are AgroSync AI, an intelligent assistant for drone-based crop monitoring.';

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${contextPrompt}\n\nUser Question: ${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      
      console.log('Gemini API Response:', data); // Debug log
      
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      let errorMessage = 'I apologize, but I encountered an error processing your request.';
      
      if (error.message.includes('API_KEY')) {
        errorMessage = 'API key error. Please check the Gemini API key configuration.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-green-500/50 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-8 z-50 w-96 h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AgroSync AI</h3>
                <p className="text-white/80 text-xs">Your Smart Agriculture Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-green-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Bot size={18} className="text-gray-700" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none shadow-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-green-500" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
