"use client"
import { motion } from "framer-motion" // ✅ Keep imports at the top
import NavBar from "@/components/NavBar"
import Hero from "@/components/Hero"
import Footer from "@/components/Footer"
import FeaturesSection from "@/components/sections/FeaturesSection"
import HowItWorksSection from "@/components/sections/HowItWorksSection"
import Services from "@/components/Services" // ✅ Import AI-powered Services Section
import CTASection from "@/components/sections/CTASection"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

const Index = () => {
  // Use the custom hook for scroll animations
  useScrollAnimation()

  return (
    <>
      <NavBar />
      <Hero />

      {/* 🌟 Japan Travel Image Background */}
      <div className="relative min-h-[50vh] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?japan,travel')" }}
        ></div>

        <motion.div
          className="relative flex flex-col items-center justify-center min-h-[50vh] text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-4">Explore Japan with TravelMate</h1>
          <p className="text-lg max-w-lg">Your AI-powered travel assistant to discover the best places in Japan.</p>
          <button className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105">
            Start Your Journey
          </button>
        </motion.div>
      </div>

      {/* ✅ AI-Powered Travel Services Section */}
      <Services />

      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </>
  )
}

export default Index

