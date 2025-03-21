import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // ✅ Ensure Button component exists

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-24 pb-32 overflow-hidden bg-gradient-dark text-white flex items-center">
      {/* ✅ Background Effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -right-40 -top-40 w-[500px] h-[500px] bg-red-500/30 rounded-full blur-[120px]"></div>
        <div className="absolute -left-20 top-32 w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-20 left-[45%] w-[300px] h-[300px] bg-yellow-500/30 rounded-full blur-[120px]"></div>
      </div>

      {/* ✅ Hero Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* ✅ Animated Badge */}
          <div className="inline-flex items-center rounded-full px-5 py-2 mb-8 bg-white/10 backdrop-blur-md text-white text-sm shadow-lg border border-white/20">
            <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            AI-Powered Travel Assistant
          </div>

          {/* ✅ Title with Gradient */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
            Your Intelligent <br /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-yellow-500">
              Travel Companion
            </span>
          </h1>
          
          {/* ✅ Improved Subtitle */}
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Break language barriers, navigate with confidence, and solve any travel problem instantly with our AI assistant.
          </p>

          {/* ✅ CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/chatbot">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-yellow-500 text-black font-medium">
                Try the Chatbot
              </Button>
            </Link>
            <a href="#features">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg rounded-full border-2 border-white/80 text-white hover:bg-white/10 hover:border-white transition-all">
                Explore Features
              </Button>
            </a>
          </div>

          {/* ✅ Hero Image with Frame */}
          <div className="mt-20 flex justify-center">
            <div className="relative max-w-md overflow-hidden rounded-3xl shadow-2xl border-4 border-white/20 transform hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-transparent to-yellow-400/30"></div>
              <img
                src="/images/kyoto.jpg"
                alt="Kyoto traditional street"
                className="w-full h-auto object-cover"
                onError={(e) => e.currentTarget.src = "/images/placeholder.jpg"} // ✅ Fallback for missing image
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

