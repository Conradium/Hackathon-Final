"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Link } from "react-router-dom"

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll event to add background to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo-placeholder.png"
              alt="Katsuōji Mate Logo"
              className="h-8 w-auto"
              onError={(e) => {
                // Fallback if image doesn't exist yet
                e.currentTarget.src = "https://via.placeholder.com/32x32?text=Logo"
              }}
            />
            <span className="text-xl font-semibold">Katsuōji Mate</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/chatbot" className="text-foreground hover:text-primary transition-colors">
              Chatbot
            </Link>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-md p-2 text-foreground hover:bg-accent focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ${isOpen ? "max-h-screen py-4" : "max-h-0"} overflow-hidden bg-background/95 backdrop-blur-md`}
      >
        <div className="container mx-auto px-4 space-y-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/chatbot"
            className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Chatbot
          </Link>
          <a
            href="#features"
            className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Features
          </a>
          <a
            href="#about"
            className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#contact"
            className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  )
}

export default NavBar

