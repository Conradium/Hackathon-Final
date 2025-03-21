
import React from 'react';

const CTASection = () => {
  return (
    <section id="contact" className="py-20 px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="glass-card rounded-3xl p-10 md:p-16 text-center">
          <div className="inline-flex items-center rounded-full px-4 py-1 mb-4 bg-secondary text-secondary-foreground text-sm scroll-reveal">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Get Started Today
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 scroll-reveal">Ready for a Stress-Free Travel Experience?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 scroll-reveal">
            Join thousands of travelers who have enhanced their journeys with our AI-powered assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 scroll-reveal">
            <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all text-base w-full sm:w-auto">
              Start Your Journey
            </button>
            <button className="px-8 py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all text-base w-full sm:w-auto">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
