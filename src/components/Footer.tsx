import type React from "react"
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-secondary pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo-placeholder.png"
                alt="Katsuōji Mate Logo"
                className="h-6 w-auto"
                onError={(e) => {
                  // Fallback if image doesn't exist yet
                  e.currentTarget.src = "https://via.placeholder.com/24x24?text=Logo"
                }}
              />
              <span className="text-xl font-display font-medium">Katsuōji Mate</span>
            </div>
            <p className="text-muted-foreground">
              Breaking language barriers and solving tourist problems with AI-powered assistance.
            </p>
            <div className="flex space-x-4 pt-2">
              <SocialIcon icon={Twitter} />
              <SocialIcon icon={Facebook} />
              <SocialIcon icon={Instagram} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#about">About Us</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
              <FooterLink href="#faq">FAQ</FooterLink>
              <FooterLink href="#privacy">Privacy Policy</FooterLink>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-3">
              <FooterLink href="#">AI Guide</FooterLink>
              <FooterLink href="#">Language Translation</FooterLink>
              <FooterLink href="#">Temple Navigation</FooterLink>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5" />
                <span className="text-muted-foreground">PLACEHOLDER</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-primary mr-3" />
                <span className="text-muted-foreground">PLACEHOLDER</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-primary mr-3" />
                <span className="text-muted-foreground">PLACEHOLDER@katsuojimate.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-8" />

        {/* Copyright */}
        <div className="text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Katsuōji Mate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a href={href} className="text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  </li>
)

const SocialIcon = ({ icon: Icon }: { icon: typeof Twitter }) => (
  <a
    href="#"
    className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
  >
    <Icon className="w-5 h-5" />
  </a>
)

export default Footer

