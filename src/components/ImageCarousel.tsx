"use client"

import { useState, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// Define image sources with fallbacks
const CAROUSEL_IMAGES = [
    {
        src: "/images/daruma.jpeg",
        fallbackSrc: "/placeholder.svg?height=600&width=800&text=Temple+View+1",
        alt: "Kachi Daruma",
        title: "Kachi Daruma",
        description: "A Daruma is a round, traditional Japanese doll that acts as a good luck charm, symbolizing perseverance and used for making wishes.",
      },
      {
        src: "/images/hondo.jpg",
        fallbackSrc: "/placeholder.svg?height=600&width=800&text=Temple+View+1",
        alt: "Katsuoji Temple Hondo",
        title: "Katsuoji Temple Hondo",
        description: "This is the main shrine in the temple.",
      },
      {
        src: "/images/sanmon.jpg",
        fallbacksSrc: "/placeholder.svg?height=600&width=800&text=Temple+View+1",
        alt: "Sanmon Gate",
        title: "Sanmon Gate",
        description: "The gate towards the temple grounds.",
      },
]

interface ImageCarouselProps {
  className?: string
}

export default function ImageCarousel({ className }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "ltr", // Changed from "rtl" to "ltr"
    dragFree: false,  // Changed from true to false for better control
    align: "center",  // Added alignment
    containScroll: "trimSnaps" // Ensures proper scroll behavior
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<(typeof CAROUSEL_IMAGES)[0] | null>(null)
  const [imageSources, setImageSources] = useState<string[]>(CAROUSEL_IMAGES.map((img) => img.src))
  const [currentIndex, setCurrentIndex] = useState(0) // Track the current slide

  // Set up autoplay
  useEffect(() => {
    if (!emblaApi) return

    // Update current index when slide changes
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap())
    }
    
    emblaApi.on("select", onSelect)
    
    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000) // Rotate every 4 seconds

    return () => {
      emblaApi.off("select", onSelect)
      clearInterval(autoplayInterval)
    }
  }, [emblaApi])

  const handleImageClick = (image: (typeof CAROUSEL_IMAGES)[0], index: number) => {
    setSelectedImage({
      ...image,
      src: imageSources[index], // Use the current source (which might be the fallback)
    })
    setOpenDialog(true)
  }

  const handleImageError = (index: number) => {
    // When an image fails to load, use its fallback
    setImageSources((prev) => {
      const newSources = [...prev]
      newSources[index] = CAROUSEL_IMAGES[index].fallbackSrc
      return newSources
    })
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex">
            {CAROUSEL_IMAGES.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative mx-4">
                <div
                  className="relative aspect-[16/9] overflow-hidden rounded-xl cursor-pointer transform transition-transform hover:scale-[1.02]"
                  onClick={() => handleImageClick(image, index)}
                >
                  <img
                    src={imageSources[index] || "/placeholder.svg"}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="text-lg font-semibold">{image.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Dots */}
        <div className="flex justify-center mt-4">
          {CAROUSEL_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`w-3 h-3 mx-1 rounded-full transition-colors ${
                currentIndex === index ? "bg-blue-600" : "bg-gray-300"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full"
              onClick={() => setOpenDialog(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage.src || "/placeholder.svg"}
                  alt={selectedImage.alt}
                  className="w-full max-h-[80vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = selectedImage.fallbackSrc
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-white">
                  <h2 className="text-xl font-bold mb-1">{selectedImage.title}</h2>
                  <p>{selectedImage.description}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}