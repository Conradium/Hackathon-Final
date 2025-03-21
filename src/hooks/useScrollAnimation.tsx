
import { useEffect } from 'react';

export const useScrollAnimation = () => {
  useEffect(() => {
    // Function to handle scroll animations
    const handleScrollAnimation = () => {
      const elements = document.querySelectorAll('.scroll-reveal');
      
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top <= windowHeight * 0.85) {
          element.classList.add('visible');
        }
      });
    };

    // Add event listener for scroll
    window.addEventListener('scroll', handleScrollAnimation);
    
    // Trigger once on load
    handleScrollAnimation();
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScrollAnimation);
  }, []);
};
