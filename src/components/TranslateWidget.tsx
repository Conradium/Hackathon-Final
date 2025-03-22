"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define available languages
const languages = [
  { code: "en", name: "English" },
  { code: "ja", name: "Japanese" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "ko", name: "Korean" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
]

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}

const TranslateWidget = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en")

  // Add CSS to head to hide Google Translate elements
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      .goog-te-banner-frame {
        display: none !important;
      }
      .goog-te-menu-value:hover {
        text-decoration: none !important;
      }
      body {
        top: 0 !important;
      }
      .goog-tooltip {
        display: none !important;
      }
      .goog-tooltip:hover {
        display: none !important;
      }
      .goog-text-highlight {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Load Google Translate script
  useEffect(() => {
    // Skip if script is already loaded
    if (document.getElementById("google-translate-script") || isScriptLoaded) {
      return
    }

    // Create script element
    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true

    // Define initialization function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: languages.map((lang) => lang.code).join(","),
            autoDisplay: false,
          },
          "google_translate_element",
        )
        setIsScriptLoaded(true)
      }
    }

    // Add script to document
    document.body.appendChild(script)

    // Cleanup
    return () => {
      if (document.getElementById("google-translate-script")) {
        document.getElementById("google-translate-script")?.remove()
        delete window.googleTranslateElementInit
      }
    }
  }, [isScriptLoaded])

  // Function to change language using Google Translate's select element
  const changeLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode)

    // Try to find and use Google's own language selector
    const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement
    if (selectElement) {
      selectElement.value = languageCode
      selectElement.dispatchEvent(new Event("change"))
      return
    }

    // Fallback: Try to find the iframe and click the language option
    const iframe = document.querySelector(".goog-te-menu-frame") as HTMLIFrameElement
    if (!iframe) return

    // Access the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    // Find and click the language option
    const languageOption = iframeDoc.querySelector(`a[href*="setLang=${languageCode}"]`) as HTMLAnchorElement
    if (languageOption) {
      languageOption.click()
    }
  }

  return (
    <div className="relative">
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Custom Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline-block">
              {languages.find((lang) => lang.code === currentLanguage)?.name || "Translate"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={currentLanguage === language.code ? "bg-muted" : ""}
            >
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default TranslateWidget

