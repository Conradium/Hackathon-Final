
import React from 'react';
import FeatureCard from '@/components/FeatureCard';
import { Bot, Languages, Map, MessageSquare, Navigation, Star } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full px-4 py-1 mb-4 bg-secondary text-secondary-foreground text-sm scroll-reveal">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            What We Offer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 scroll-reveal">Revolutionizing Travel Experience</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto scroll-reveal">
            Our AI-powered platform simplifies travel with intelligent features designed to enhance your journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Bot} 
            title="AI Travel Agent" 
            description="Our intelligent assistant provides personalized recommendations and solves travel problems in real-time."
            delay={0}
          />
          <FeatureCard 
            icon={Languages} 
            title="Language Translation" 
            description="Break language barriers with instant translation in over 100 languages, helping you communicate effortlessly."
            delay={100}
          />
          <FeatureCard 
            icon={Map} 
            title="Interactive Maps" 
            description="Explore new destinations with detailed, interactive maps featuring points of interest and local attractions."
            delay={200}
          />
          <FeatureCard 
            icon={Navigation} 
            title="Smart Navigation" 
            description="Get accurate directions and efficient routes to any destination, even when you're offline."
            delay={300}
          />
          <FeatureCard 
            icon={MessageSquare} 
            title="Local Insights" 
            description="Access insider tips and cultural information from locals to enhance your travel experience."
            delay={400}
          />
          <FeatureCard 
            icon={Star} 
            title="Personalized Experience" 
            description="Receive tailored recommendations based on your preferences and previous travel history."
            delay={500}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
