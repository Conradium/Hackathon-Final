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
          {/* AI Assistant Badge */}
          <div className="inline-flex items-center rounded-full px-4 py-1 mb-6 bg-secondary text-secondary-foreground text-sm shadow-md">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            AI-Powered Temple Guide
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Your Intelligent <br /> Temple Companion
          </h1>
          <p className="text-xl md:text-2xl text-text-muted-foreground mb-10 max-w-3xl mx-auto">
            Break language barriers, navigate with confidence, and experience Katsuōji Temple with our AI assistant.
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

