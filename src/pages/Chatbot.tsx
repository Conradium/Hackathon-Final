
import { useState } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';

// Google Maps API Key - store in a more secure way in production
const GOOGLE_MAPS_API_KEY = 'AIzaSyC-zhUgXOMpO5JYq0rYyAUxhvVco50YCS0';
// Travel agent API configuration - in production, these should be stored securely
const TRAVEL_API_KEY = 'travel-agent-api-key-12345'; // Replace with your actual API key
const TRAVEL_API_ENDPOINT = 'https://api.yourtravelagent.com/v1/chat';

const ChatbotPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Travel Assistant</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with our intelligent travel agent to solve problems, get directions, and translate languages while you explore the world.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
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
