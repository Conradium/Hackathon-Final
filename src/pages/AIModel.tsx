"use client"

import { useEffect, useRef, useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Loader, Camera, FlipHorizontal } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Define types for the Teachable Machine libraries
declare global {
  interface Window {
    tmImage: any
    tf: any
  }
}

// Confidence threshold for displaying predictions (95%)
const CONFIDENCE_THRESHOLD = 0.95

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

  const webcamContainerRef = useRef<HTMLDivElement>(null)
  const labelContainerRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<any>(null)
  const webcamRef = useRef<any>(null)
  const requestRef = useRef<number>()

  // The URL to the hosted model
  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/0MNNF3JUK/"

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
      const flip = true // Always flip for consistency in UI

      // Create constraints for camera selection
      let constraints: MediaTrackConstraints = {}

      // iOS specific handling
      if (isIOS()) {
        // On iOS, use facingMode constraint
        constraints = {
          facingMode: isFrontCamera ? "user" : "environment",
        }

        setDebugInfo(`Using iOS camera selection with facingMode: ${isFrontCamera ? "user" : "environment"}`)
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
          `Using deviceId selection: ${device.label || "Camera " + (deviceIndex + 1)} (${device.deviceId.substring(0, 8)}...)`,
        )
      }
      // Fallback for single camera devices
      else {
        // If we only have one camera, use it
        if (devices.length === 1) {
          constraints = {
            deviceId: { exact: devices[0].deviceId },
          }
          setDebugInfo(`Using single available camera: ${devices[0].label || "Camera 1"}`)
        } else {
          // Last resort fallback
          constraints = {
            facingMode: isFrontCamera ? "user" : "environment",
          }
          setDebugInfo(`Using fallback facingMode: ${isFrontCamera ? "user" : "environment"}`)
        }
      }

      // Initialize webcam with selected camera constraints
      try {
        webcamRef.current = new window.tmImage.Webcam(300, 300, flip)
        await webcamRef.current.setup(constraints) // Pass constraints here
        await webcamRef.current.play()

        setDebugInfo((prev) => `${prev}\nCamera initialized successfully`)
      } catch (cameraError) {
        console.error("Camera setup error:", cameraError)
        setDebugInfo(
          (prev) =>
            `${prev}\nCamera setup error: ${cameraError instanceof Error ? cameraError.message : String(cameraError)}`,
        )

        // Try again with simpler constraints as fallback
        try {
          setDebugInfo((prev) => `${prev}\nTrying fallback camera initialization...`)
          webcamRef.current = new window.tmImage.Webcam(300, 300, flip)
          await webcamRef.current.setup({ facingMode: isFrontCamera ? "user" : "environment" })
          await webcamRef.current.play()
          setDebugInfo((prev) => `${prev}\nFallback camera initialized successfully`)
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
      setDebugInfo((prev) => `${prev}\nInitialization error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsModelLoading(false)
    }
  }

  // Direct camera switch for iOS
  const directCameraSwitch = async () => {
    try {
      setIsModelLoading(true)
      setDebugInfo(`Attempting direct camera switch on iOS...`)

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

      setDebugInfo((prev) => `${prev}\nUsing facingMode: ${newIsFrontCamera ? "user" : "environment"}`)

      // Initialize webcam with new constraints
      webcamRef.current = new window.tmImage.Webcam(300, 300, true)
      await webcamRef.current.setup(constraints)
      await webcamRef.current.play()

      // Append to DOM
      if (webcamContainerRef.current) {
        webcamContainerRef.current.innerHTML = ""
        webcamContainerRef.current.appendChild(webcamRef.current.canvas)
      }

      // Restart animation loop
      requestRef.current = window.requestAnimationFrame(loop)

      setDebugInfo((prev) => `${prev}\nCamera switched successfully`)
    } catch (error) {
      console.error("Error during direct camera switch:", error)
      setError(`Failed to switch camera: ${error instanceof Error ? error.message : String(error)}`)
      setDebugInfo((prev) => `${prev}\nDirect switch error: ${error instanceof Error ? error.message : String(error)}`)

      // Try to recover by reverting to previous camera
      try {
        setIsFrontCamera(!isFrontCamera) // Revert the change
        await init() // Try to reinitialize with previous camera
      } catch (recoveryError) {
        console.error("Failed to recover from camera switch error:", recoveryError)
      }
    } finally {
      setIsModelLoading(false)
    }
  }

  // Switch camera
  const switchCamera = async () => {
    // Only allow switching if model is ready
    if (!isModelReady || isModelLoading) return

    // For iOS, use direct camera switch method
    if (isIOS()) {
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
    }
  }

  // Re-initialize when camera preference changes
  useEffect(() => {
    if (isModelReady && !isIOS()) {
      // Re-initialize with new camera preference
      // Skip for iOS as we handle it directly in the directCameraSwitch method
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

      // Only set high confidence prediction if it meets the threshold
      if (highestConfidence.probability >= CONFIDENCE_THRESHOLD) {
        setHighConfidencePrediction(highestConfidence)
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
                    disabled={isModelLoading}
                    className="flex-shrink-0"
                  >
                    {isModelLoading ? (
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

            {/* Hidden label container for compatibility */}
            <div ref={labelContainerRef} className="hidden"></div>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>
                Note: This model requires access to your camera. Make sure you've granted the necessary permissions.
              </p>
              <p className="mt-2">Only objects detected with 95% or higher confidence will be displayed.</p>

              {/* Debug info - can be removed in production */}
              {debugInfo && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-32 whitespace-pre-wrap">
                    {debugInfo}
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