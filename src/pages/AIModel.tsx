"use client"

import { useEffect, useRef, useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Loader, Camera, FlipHorizontal, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { generateGeminiResponse } from "@/services/gemini-api"

// Define types for the Teachable Machine libraries
declare global {
  interface Window {
    tmImage: any
    tf: any
  }
}

// Confidence thresholds
const CONFIDENCE_THRESHOLD = 0.95 // For displaying predictions (95%)
const DESCRIPTION_FETCH_THRESHOLD = 0.9 // For fetching description (90%)
const DESCRIPTION_DISPLAY_THRESHOLD = 0.5 // For keeping description visible (50%)
const DESCRIPTION_HIDE_DELAY = 30000 // 30 seconds in milliseconds

const AIModel = () => {
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [isModelReady, setIsModelReady] = useState(false)
  const [predictions, setPredictions] = useState<Array<{ className: string; probability: number }>>([])
  const [error, setError] = useState<string | null>(null)
  const [librariesLoaded, setLibrariesLoaded] = useState(false)
  const [isFrontCamera, setIsFrontCamera] = useState(true)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [highConfidencePrediction, setHighConfidencePrediction] = useState<{
    className: string
    probability: number
  } | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isLoadingDescription, setIsLoadingDescription] = useState(false)
  const [lastDescribedClass, setLastDescribedClass] = useState<string>("")
  const [shouldShowDescription, setShouldShowDescription] = useState(false)
  const [currentConfidence, setCurrentConfidence] = useState(0)
  const [isAndroid, setIsAndroid] = useState(false)
  const [switchingCamera, setSwitchingCamera] = useState(false)
  
  // Refs for timers and tracking
  const webcamContainerRef = useRef<HTMLDivElement>(null)
  const labelContainerRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<any>(null)
  const webcamRef = useRef<any>(null)
  const requestRef = useRef<number>()
  const hideDescriptionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchedClassRef = useRef<string>("")

  // The URL to the hosted model
  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/0MNNF3JUK/"

  // Detect device OS
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(userAgent);
    setIsAndroid(isAndroidDevice);
    if (isAndroidDevice) {
      setDebugInfo(prev => `${prev}\nDetected Android device`);
    }
  }, []);

  // Detect iOS device
  const isIOS = () => {
    return (
      ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    )
  }

  // Get available video devices
  const getVideoDevices = async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true })

      // Get all media devices
      const devices = await navigator.mediaDevices.enumerateDevices()

      // Filter for video input devices
      const videoInputs = devices.filter((device) => device.kind === "videoinput")
      setVideoDevices(videoInputs)

      const deviceInfo = videoInputs
        .map((d) => `${d.label || "Camera " + (videoInputs.indexOf(d) + 1)} (${d.deviceId.substring(0, 8)}...)`)
        .join(", ")
      setDebugInfo(`Found ${videoInputs.length} cameras: ${deviceInfo}`)

      return videoInputs
    } catch (error) {
      console.error("Error getting video devices:", error)
      setError("Unable to access camera. Please check permissions and try again.")
      setDebugInfo(`Error getting video devices: ${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }

  // Initialize the model and webcam
  const init = async () => {
    try {
      setIsModelLoading(true)
      setError(null)

      if (!window.tmImage) {
        setError("Teachable Machine library not loaded. Please refresh the page.")
        return
      }

      // Get video devices if we don't have them yet
      let devices = videoDevices
      if (devices.length === 0) {
        devices = await getVideoDevices()
      }

      const modelURL = MODEL_URL + "model.json"
      const metadataURL = MODEL_URL + "metadata.json"

      // Load the model and metadata
      modelRef.current = await window.tmImage.load(modelURL, metadataURL)
      const maxPredictions = modelRef.current.getTotalClasses()

      // Setup webcam with the appropriate camera
      // Only flip for front camera (selfie mode) and not on Android
      const flip = isFrontCamera && !isAndroid

      // Create constraints for camera selection
      let constraints: MediaTrackConstraints = {}

      // iOS specific handling
      if (isIOS()) {
        // On iOS, use facingMode constraint
        constraints = {
          facingMode: isFrontCamera ? "user" : "environment",
        }

        setDebugInfo(
          `Using iOS camera selection with facingMode: ${isFrontCamera ? "user" : "environment"}, flip: ${flip}`,
        )
      }
      // For other devices with multiple cameras
      else if (devices.length > 1) {
        // Try to select based on user preference
        // On most devices, the first camera is the rear camera and the second is the front camera
        const deviceIndex = isFrontCamera ? Math.min(1, devices.length - 1) : 0
        const device = devices[deviceIndex]

        constraints = {
          deviceId: { exact: device.deviceId },
        }

        setDebugInfo(
          `Using deviceId selection: ${device.label || "Camera " + (deviceIndex + 1)} (${device.deviceId.substring(0, 8)}...), flip: ${flip}`,
        )
      }
      // Fallback for single camera devices
      else {
        // If we only have one camera, use it
        if (devices.length === 1) {
          constraints = {
            deviceId: { exact: devices[0].deviceId },
          }
          setDebugInfo(`Using single available camera: ${devices[0].label || "Camera 1"}, flip: ${flip}`)
        } else {
          // Last resort fallback
          constraints = {
            facingMode: isFrontCamera ? "user" : "environment",
          }
          setDebugInfo(`Using fallback facingMode: ${isFrontCamera ? "user" : "environment"}, flip: ${flip}`)
        }
      }

      // Initialize webcam with selected camera constraints
      try {
        webcamRef.current = new window.tmImage.Webcam(300, 300, flip)
        await webcamRef.current.setup(constraints) // Pass constraints here
        await webcamRef.current.play()

        setDebugInfo(
          (prev) => `${prev}
Camera initialized successfully, flip: ${flip}`,
        )
      } catch (cameraError) {
        console.error("Camera setup error:", cameraError)
        setDebugInfo(
          (prev) =>
            `${prev}
Camera setup error: ${cameraError instanceof Error ? cameraError.message : String(cameraError)}`,
        )

        // Try again with simpler constraints as fallback
        try {
          setDebugInfo(
            (prev) => `${prev}
Trying fallback camera initialization...`,
          )
          webcamRef.current = new window.tmImage.Webcam(300, 300, flip)
          await webcamRef.current.setup({ facingMode: isFrontCamera ? "user" : "environment" })
          await webcamRef.current.play()
          setDebugInfo(
            (prev) => `${prev}
Fallback camera initialized successfully`,
          )
        } catch (fallbackError) {
          throw new Error(
            `Failed to initialize camera: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
          )
        }
      }

      // Start the animation loop
      requestRef.current = window.requestAnimationFrame(loop)

      // Append elements to the DOM
      if (webcamContainerRef.current) {
        webcamContainerRef.current.innerHTML = ""
        webcamContainerRef.current.appendChild(webcamRef.current.canvas)
      }

      // Setup label container
      if (labelContainerRef.current) {
        labelContainerRef.current.innerHTML = ""
        for (let i = 0; i < maxPredictions; i++) {
          labelContainerRef.current.appendChild(document.createElement("div"))
        }
      }

      setIsModelReady(true)
    } catch (error) {
      console.error("Error initializing model:", error)
      setError(error instanceof Error ? error.message : "Failed to initialize model")
      setDebugInfo(
        (prev) => `${prev}
Initialization error: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setIsModelLoading(false)
      setSwitchingCamera(false)
    }
  }

  // Direct camera switch for iOS and Android
  const directCameraSwitch = async () => {
    try {
      setIsModelLoading(true)
      setSwitchingCamera(true)
      setDebugInfo(`Attempting direct camera switch on ${isIOS() ? 'iOS' : 'Android'}...`)

      // Stop current webcam
      if (webcamRef.current) {
        webcamRef.current.stop()
      }

      // Cancel animation frame
      if (requestRef.current) {
        window.cancelAnimationFrame(requestRef.current)
      }

      // Toggle camera preference
      const newIsFrontCamera = !isFrontCamera
      setIsFrontCamera(newIsFrontCamera)

      // Create new constraints
      const constraints: MediaTrackConstraints = {
        facingMode: newIsFrontCamera ? "user" : "environment",
      }

      // Only flip for front camera and not on Android
      const flip = newIsFrontCamera && !isAndroid

      setDebugInfo(
        (prev) => `${prev}
Using facingMode: ${newIsFrontCamera ? "user" : "environment"}, flip: ${flip}`,
      )

      // Initialize webcam with new constraints
      webcamRef.current = new window.tmImage.Webcam(300, 300, flip)
      await webcamRef.current.setup(constraints)
      await webcamRef.current.play()

      // Append to DOM
      if (webcamContainerRef.current) {
        webcamContainerRef.current.innerHTML = ""
        webcamContainerRef.current.appendChild(webcamRef.current.canvas)
      }

      // Restart animation loop
      requestRef.current = window.requestAnimationFrame(loop)

      setDebugInfo(
        (prev) => `${prev}
Camera switched successfully, new isFrontCamera: ${newIsFrontCamera}, flip: ${flip}`,
      )
    } catch (error) {
      console.error("Error during direct camera switch:", error)
      setError(`Failed to switch camera: ${error instanceof Error ? error.message : String(error)}`)
      setDebugInfo(
        (prev) => `${prev}
Direct switch error: ${error instanceof Error ? error.message : String(error)}`,
      )

      // Try to recover by reverting to previous camera
      try {
        setIsFrontCamera(!isFrontCamera) // Revert the change
        await init() // Try to reinitialize with previous camera
      } catch (recoveryError) {
        console.error("Failed to recover from camera switch error:", recoveryError)
      }
    } finally {
      setIsModelLoading(false)
      setSwitchingCamera(false)
    }
  }

  // Switch camera
  const switchCamera = async () => {
    // Only allow switching if model is ready and not already switching
    if (!isModelReady || isModelLoading || switchingCamera) return
    
    setSwitchingCamera(true)

    // For iOS and Android, use direct camera switch method
    if (isIOS() || isAndroid) {
      await directCameraSwitch()
      return
    }

    try {
      setIsModelLoading(true)

      // Stop current webcam
      if (webcamRef.current) {
        webcamRef.current.stop()
      }

      // Cancel animation frame
      if (requestRef.current) {
        window.cancelAnimationFrame(requestRef.current)
      }

      // Toggle camera
      setIsFrontCamera((prev) => !prev)

      // Re-initialize with new camera
      // We'll let the useEffect handle the re-initialization
    } catch (error) {
      console.error("Error switching camera:", error)
      setError("Failed to switch camera. Please try again.")
      setIsModelLoading(false)
      setSwitchingCamera(false)
    }
  }

  // Re-initialize when camera preference changes
  useEffect(() => {
    if (isModelReady && !isIOS() && !isAndroid) {
      // Re-initialize with new camera preference
      // Skip for iOS/Android as we handle it directly in the directCameraSwitch method
      init()
    }
  }, [isFrontCamera])

  const loop = async () => {
    if (webcamRef.current) {
      webcamRef.current.update()
      await predict()
      requestRef.current = window.requestAnimationFrame(loop)
    }
  }

  // Fetch description from Gemini API
  const fetchDescription = async (className: string) => {
    if (isLoadingDescription || className === lastFetchedClassRef.current) return

    try {
      setIsLoadingDescription(true)
      lastFetchedClassRef.current = className
      setLastDescribedClass(className)

      const prompt = `Provide a brief description (2-3 sentences) of ${className}. Focus on what it is, what it's used for, and any interesting facts.`

      const response = await generateGeminiResponse({
        prompt,
        maxTokens: 150,
        temperature: 0.7,
      })

      setDescription(response)
      setShouldShowDescription(true)
      setDebugInfo((prev) => `${prev}\nFetched description for: ${className}`)
    } catch (error) {
      console.error("Error fetching description:", error)
      setDescription("Could not fetch description. Please try again.")
      setDebugInfo(
        (prev) => `${prev}\nError fetching description: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setIsLoadingDescription(false)
    }
  }

  // Handle description visibility based on confidence
  useEffect(() => {
    // Clear any existing timer
    if (hideDescriptionTimerRef.current) {
      clearTimeout(hideDescriptionTimerRef.current)
      hideDescriptionTimerRef.current = null
    }

    // If confidence drops below threshold, start timer to hide description
    if (currentConfidence < DESCRIPTION_DISPLAY_THRESHOLD && shouldShowDescription) {
      setDebugInfo(
        (prev) => `${prev}\nConfidence dropped below ${DESCRIPTION_DISPLAY_THRESHOLD * 100}%, starting 30s timer`,
      )

      hideDescriptionTimerRef.current = setTimeout(() => {
        setShouldShowDescription(false)
        setDebugInfo((prev) => `${prev}\nHiding description after 30s timeout`)
      }, DESCRIPTION_HIDE_DELAY)
    }

    return () => {
      if (hideDescriptionTimerRef.current) {
        clearTimeout(hideDescriptionTimerRef.current)
      }
    }
  }, [currentConfidence, shouldShowDescription])

  const predict = async () => {
    if (!modelRef.current || !webcamRef.current || !labelContainerRef.current) return

    try {
      // Run prediction
      const prediction = await modelRef.current.predict(webcamRef.current.canvas)

      // Update UI with predictions
      const newPredictions = [...prediction]
      setPredictions(newPredictions)

      // Find the prediction with highest confidence
      const highestConfidence = newPredictions.reduce(
        (highest, current) => (current.probability > highest.probability ? current : highest),
        { className: "", probability: 0 },
      )

      // Update current confidence
      setCurrentConfidence(highestConfidence.probability)

      // Only set high confidence prediction if it meets the threshold
      if (highestConfidence.probability >= CONFIDENCE_THRESHOLD) {
        setHighConfidencePrediction(highestConfidence)

        // If confidence is above description fetch threshold and we haven't fetched for this class yet
        if (
          highestConfidence.probability >= DESCRIPTION_FETCH_THRESHOLD &&
          highestConfidence.className !== lastFetchedClassRef.current
        ) {
          fetchDescription(highestConfidence.className)
        }

        // If confidence is above display threshold, ensure description is shown
        if (
          highestConfidence.probability >= DESCRIPTION_DISPLAY_THRESHOLD &&
          highestConfidence.className === lastDescribedClass
        ) {
          setShouldShowDescription(true)
        }
      } else {
        setHighConfidencePrediction(null)
      }

      // Also update the label container for compatibility with original code
      for (let i = 0; i < prediction.length; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2)
        if (labelContainerRef.current.childNodes[i]) {
          labelContainerRef.current.childNodes[i].innerHTML = classPrediction
        }
      }
    } catch (error) {
      console.error("Prediction error:", error)
    }
  }

  // Check if libraries are already loaded on mount
  useEffect(() => {
    if (window.tmImage && window.tf) {
      console.log("Libraries already loaded")
      setLibrariesLoaded(true)
    }
  }, [])

  // Load scripts if not already loaded
  useEffect(() => {
    // Skip if libraries are already loaded
    if (librariesLoaded) return

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.body.appendChild(script)
      })
    }

    const loadScripts = async () => {
      try {
        setError(null)
        // Load TensorFlow.js first
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js")
        // Then load Teachable Machine
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js",
        )
        console.log("Libraries loaded successfully")
        setLibrariesLoaded(true)
      } catch (error) {
        console.error("Error loading scripts:", error)
        setError("Failed to load required libraries. Please check your internet connection and try again.")
      }
    }

    loadScripts()
  }, [librariesLoaded])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        window.cancelAnimationFrame(requestRef.current)
      }
      if (webcamRef.current) {
        webcamRef.current.stop()
      }
      if (hideDescriptionTimerRef.current) {
        clearTimeout(hideDescriptionTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 container mx-auto px-4 py-12 mt-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Image Recognition</h1>
            <p className="text-muted-foreground">Use our trained model to identify objects through your camera.</p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center mb-6">
              {!isModelReady ? (
                <Button
                  onClick={init}
                  disabled={isModelLoading || !librariesLoaded}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {isModelLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Loading Model...
                    </>
                  ) : !librariesLoaded ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Loading Libraries...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Camera is active. Point your camera at an object to identify it.
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchCamera}
                    disabled={isModelLoading || switchingCamera}
                    className="flex-shrink-0"
                  >
                    {isModelLoading || switchingCamera ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FlipHorizontal className="mr-2 h-4 w-4" />
                        Switch Camera ({isFrontCamera ? "Front" : "Rear"})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Camera selection toggle (only show before initialization) */}
            {!isModelReady && (
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Label htmlFor="camera-toggle" className="text-sm">
                  Rear Camera
                </Label>
                <Switch id="camera-toggle" checked={isFrontCamera} onCheckedChange={setIsFrontCamera} />
                <Label htmlFor="camera-toggle" className="text-sm">
                  Front Camera
                </Label>
              </div>
            )}

            {/* Camera and Results Container */}
            <div className="relative mx-auto" style={{ width: "300px", height: "300px" }}>
              {/* Webcam container */}
              <div
                ref={webcamContainerRef}
                className="border-2 border-dashed border-muted-foreground/20 rounded-lg h-[300px] w-[300px] overflow-hidden"
              >
                {!isModelReady && !isModelLoading && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-muted-foreground">Camera preview will appear here</p>
                  </div>
                )}
              </div>

              {/* Overlay Results Panel */}
              {isModelReady && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 backdrop-blur-sm">
                  {highConfidencePrediction ? (
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{highConfidencePrediction.className}</span>
                        <span className="font-mono">{(highConfidencePrediction.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${highConfidencePrediction.probability * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p>No Object Detected</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description Panel */}
            {shouldShowDescription && description && (
              <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">About {lastDescribedClass}</h3>
                    {isLoadingDescription ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading description...</span>
                      </div>
                    ) : (
                      <p className="text-sm">{description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hidden label container for compatibility */}
            <div ref={labelContainerRef} className="hidden"></div>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>
                Note: This model requires access to your camera. Make sure you've granted the necessary permissions.
              </p>
              <p className="mt-2">Only objects detected with 95% or higher confidence will be displayed.</p>
              <p className="mt-1">Information about objects will appear when they're detected with high confidence.</p>

              {/* Debug info - can be removed in production */}
              {debugInfo && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-32 whitespace-pre-wrap">
                    {`Device: ${isAndroid ? 'Android' : isIOS() ? 'iOS' : 'Other'}\n${debugInfo}`}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AIModel