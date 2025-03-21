const HowItWorksSection = () => {
  return (
    <section id="about" className="py-20 px-6 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full px-4 py-1 mb-4 bg-secondary text-foreground text-sm scroll-reveal">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 scroll-reveal">Artificial Intelligence Katsuoji Temple Guide</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto scroll-reveal">
            Experience Katsuoji Temple with directed guidance and AI powered digital guide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1 relative z-10">
            <div className="space-y-8">
              <div className="scroll-reveal">
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2">Ask Anything</h3>
                    <p className="text-muted-foreground">
                      Simply chat with our AI in your preferred language. Ask about direction, transportation
                      options, cultural customs, or any travel concern you have.
                    </p>
                  </div>
                </div>
              </div>
              <div className="scroll-reveal" style={{ transitionDelay: "100ms" }}>
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2">Find Unique Activities</h3>
                    <p className="text-muted-foreground">
                      Receive unique activities inside the temple, explanations and translations of existing information.
                    </p>
                  </div>
                </div>
              </div>
              <div className="scroll-reveal" style={{ transitionDelay: "200ms" }}>
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-2">Travel with Confidence</h3>
                    <p className="text-muted-foreground">
                      Explore with peace of mind knowing our AI assistant is available 24/7 to help you navigate
                      unfamiliar environments, overcome language barriers, and handle unexpected situations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center scroll-reveal relative z-0">
            {/* Improved Phone Mockup */}
            <div className="relative w-72 md:w-80 h-[580px] mx-auto">
              {/* Phone Frame */}
              <div className="absolute inset-0 bg-gray-800 rounded-[40px] shadow-2xl overflow-hidden">
                {/* Inner Frame Bezel */}
                <div className="absolute inset-[3px] bg-black rounded-[38px] overflow-hidden">
                  {/* Phone Screen */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-black/40 flex items-center justify-between px-6">
                      <div className="text-xs font-medium text-white">12:30</div>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-white rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                    
                    {/* Chat Interface */}
                    <div className="absolute top-12 left-4 right-4 bottom-16 bg-gray-800/90 rounded-xl overflow-hidden shadow-lg">
                      <div className="h-10 bg-primary/20 flex items-center px-4">
                        <div className="w-8 h-8 rounded-full bg-primary/30"></div>
                        <div className="ml-2 text-xs font-medium text-white">Katsuoji Temple Guide</div>
                      </div>
                      
                      <div className="p-4 overflow-y-auto h-[calc(100%-3.5rem)]">
                        {/* User Message */}
                        <div className="bg-gray-700 p-3 rounded-xl rounded-tr-none mb-3 ml-8 mr-2 transform translate-y-0 opacity-100 transition-all duration-500">
                          <p className="text-xs text-white">Where can I find the best spot to see Daruma dolls at Katsuoji?</p>
                        </div>
                        
                        {/* AI Response */}
                        <div className="bg-primary/30 p-3 rounded-xl rounded-tl-none mb-3 mr-8 ml-2 transform translate-y-0 opacity-100 transition-all duration-500" style={{ animationDelay: "0.5s" }}>
                          <p className="text-xs text-white">The main Daruma doll hall is located near the central temple complex. Follow the signs for "勝尾寺達磨堂" after you pass through the main gate.</p>
                        </div>
                        
                        {/* User Message */}
                        <div className="bg-gray-700 p-3 rounded-xl rounded-tr-none mb-3 ml-8 mr-2 transform translate-y-0 opacity-100 transition-all duration-500" style={{ animationDelay: "1s" }}>
                          <p className="text-xs text-white">What's the meaning behind these dolls?</p>
                        </div>
                        
                        {/* AI Response */}
                        <div className="bg-primary/30 p-3 rounded-xl rounded-tl-none mb-3 mr-8 ml-2 transform translate-y-0 opacity-100 transition-all duration-500" style={{ animationDelay: "1.5s" }}>
                          <p className="text-xs text-white">Daruma dolls represent Bodhidharma and are symbols of perseverance and good luck. At Katsuoji Temple, they're known as "winner daruma" (勝ちダルマ) and are believed to bring success and fortune.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Input Field */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-gray-700 border border-gray-600 rounded-full p-2 flex items-center shadow-lg">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex-shrink-0"></div>
                        <div className="mx-2 h-5 bg-gray-600 rounded-full flex-1">
                          <div className="text-xs text-white/50 pl-2 pt-0.5">Type a message...</div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phone Shadow */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-4 bg-black/20 rounded-full blur-md"></div>
              
              {/* Screen Reflection */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[38px]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection