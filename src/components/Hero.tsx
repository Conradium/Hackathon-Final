import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-hero-gradient text-white">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 top-32 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-[45%] w-64 h-64 bg-pink-400/30 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/chatbot">
              <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all bg-white text-primary">
                Try the Chatbot
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-full border-white text-white hover:bg-white hover:text-primary transition-all">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Hero Image */}
          <div className="mt-16 flex justify-center">
            <div className="relative max-w-xs md:max-w-sm overflow-hidden rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20"></div>
              <img
                src="/images/kyoto.jpg"
                alt="Kyoto traditional street"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
