
import React from 'react';

const HowItWorksSection = () => {
  return (
    <section id="about" className="py-20 px-6 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full px-4 py-1 mb-4 bg-white text-foreground text-sm scroll-reveal">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 scroll-reveal">Seamless Travel Assistance</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto scroll-reveal">
            Our platform makes travel effortless with intuitive features that work together to enhance your journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <div className="space-y-8">
              <div className="scroll-reveal">
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2">Ask Anything</h3>
                    <p className="text-muted-foreground">
                      Simply tell our AI what you need help with - from finding attractions to solving travel problems.
                    </p>
                  </div>
                </div>
              </div>
              <div className="scroll-reveal" style={{ transitionDelay: '100ms' }}>
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2">Get Instant Solutions</h3>
                    <p className="text-muted-foreground">
                      Receive intelligent responses, translations, and navigation assistance immediately.
                    </p>
                  </div>
                </div>
              </div>
              <div className="scroll-reveal" style={{ transitionDelay: '200ms' }}>
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2">Enhance Your Journey</h3>
                    <p className="text-muted-foreground">
                      Enjoy a smoother travel experience with personalized recommendations and local insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center scroll-reveal">
            <div className="relative w-72 h-96 md:w-80 md:h-[450px] bg-white dark:bg-accent rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
              <div className="absolute top-0 left-0 right-0 h-16 bg-white dark:bg-dark flex items-center justify-center">
                <div className="w-32 h-5 rounded-full bg-primary/10"></div>
              </div>
              <div className="absolute top-20 left-5 right-5">
                <div className="bg-accent p-4 rounded-lg mb-3 transform translate-x-5 animate-pulse-slow">
                  <p className="text-sm">Where can I find the best street food in Bangkok?</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg mb-3 transform -translate-x-5 animate-pulse-slow" style={{ animationDelay: '1s' }}>
                  <p className="text-sm">For the best street food in Bangkok, check out Chinatown, especially along Yaowarat Road. Ratchawat Market and Wang Lang Market are also excellent choices.</p>
                </div>
                <div className="bg-accent p-4 rounded-lg mb-3 transform translate-x-5 animate-pulse-slow" style={{ animationDelay: '2s' }}>
                  <p className="text-sm">Can you help me navigate there?</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg mb-3 transform -translate-x-5 animate-pulse-slow" style={{ animationDelay: '3s' }}>
                  <p className="text-sm">Absolutely! I've mapped the route to Yaowarat Road. It's about 15 minutes by taxi from your current location.</p>
                </div>
              </div>
              <div className="absolute bottom-6 left-5 right-5">
                <div className="bg-white dark:bg-accent border border-input rounded-full p-3 flex items-center">
                  <div className="w-full h-5 bg-muted/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
