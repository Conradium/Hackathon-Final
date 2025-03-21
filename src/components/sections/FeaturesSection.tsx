import { useState, useEffect } from "react";
import { Languages, Navigation, MapPin, Phone, Globe, Clock } from "lucide-react";
import FeatureCard from "@/components/FeatureCard"; // ✅ Now correctly imported

const Features = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const featureSection = document.getElementById("features");
      if (featureSection) {
        const rect = featureSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && !animate) {
          setAnimate(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // ✅ Check on initial load

    return () => window.removeEventListener("scroll", handleScroll);
  }, [animate]); // ✅ Prevents multiple re-renders

  // ✅ Fixed `features` Array (Now Includes `delay`)
  const features = [
    { icon: Languages, title: "Real-time Translation", description: "Instant AI translations in 100+ languages.", delay: 0 },
    { icon: Navigation, title: "Smart Navigation", description: "Find your way with AI-guided directions.", delay: 100 },
    { icon: MapPin, title: "Local Recommendations", description: "Discover hidden gems & authentic experiences.", delay: 200 },
    { icon: Phone, title: "Emergency Assistance", description: "One-tap access to local emergency services.", delay: 300 },
    { icon: Globe, title: "Cultural Guide", description: "Learn customs, etiquette & cultural insights.", delay: 400 },
    { icon: Clock, title: "24/7 Travel Support", description: "Round-the-clock assistance for travel needs.", delay: 500 }
  ];

  return (
    <section id="features" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Powered by Advanced AI</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our AI travel assistant provides real-time support for all your needs.
          </p>
        </div>

        {/* ✅ FIXED GRID STRUCTURE (No Duplicates & Aligned Properly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} // ✅ Ensures unique elements
              className={`opacity-0 transform transition-all duration-700 ${
                animate ? "opacity-100 translate-y-0" : "translate-y-6"
              }`}
              style={{ transitionDelay: `${feature.delay}ms` }} // ✅ Staggered animation
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={feature.delay} // ✅ Now properly passed
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;