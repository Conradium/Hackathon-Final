import { useState } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';

// 🔒 Secure API keys in `.env`
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const TRAVEL_API_KEY = import.meta.env.VITE_TRAVEL_AGENT_API_KEY;
const TRAVEL_API_ENDPOINT = import.meta.env.VITE_TRAVEL_AGENT_ENDPOINT;

const ChatbotPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* 🔥 Improved Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
              AI Travel Assistant
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Chat with our intelligent travel agent to get recommendations, directions, and translations in real-time.
            </p>
          </div>
          
          {/* 🛠️ Fixed Chat Interface Alignment */}
          <div className="flex justify-center">
            <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
              <ChatInterface 
                mapsApiKey={GOOGLE_MAPS_API_KEY} 
                travelApiKey={TRAVEL_API_KEY}
                travelApiEndpoint={TRAVEL_API_ENDPOINT}
              />
            </div>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatbotPage;
