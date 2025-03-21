"use client"
import NavBar from "@/components/NavBar"
import Hero from "@/components/Hero"
import Footer from "@/components/Footer"
import HowItWorksSection from "@/components/sections/HowItWorksSection"
import Services from "@/components/Services"
import CTASection from "@/components/sections/CTASection"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

const Index = () => {
  // Use the custom hook for scroll animations
  useScrollAnimation()

  return (
    <>
      <NavBar />
      <Hero />

      {/* AI-Powered Travel Services Section */}
      <Services />

      <HowItWorksSection />
      <CTASection />
      <Footer />
    </>
  )
}

export default Index

