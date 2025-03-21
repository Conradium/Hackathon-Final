import type { Landmark } from "@/components/LocationDropdown"

/**
 * Utility function to fetch and parse CSV data
 */
export async function fetchAndParseCSV(url: string): Promise<Record<string, string>[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    return parseCSV(csvText)
  } catch (error) {
    console.error("Error fetching CSV:", error)
    throw error
  }
}

/**
 * Parse CSV text into an array of objects
 */
function parseCSV(csvText: string): Record<string, string>[] {
  // Split by lines and remove empty lines
  const lines = csvText.split("\n").filter((line) => line.trim() !== "")

  // Extract headers from the first line
  const headers = lines[0].split(",").map((header) => header.trim())

  // Parse each line into an object
  return lines.slice(1).map((line) => {
    // Handle commas within quoted fields
    const values: string[] = []
    let currentValue = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(currentValue)
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    // Add the last value
    values.push(currentValue)

    // Create an object with the headers as keys
    const obj: Record<string, string> = {}
    headers.forEach((header, index) => {
      // Clean up values by removing quotes
      let value = values[index] || ""
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1)
      }
      obj[header] = value
    })

    return obj
  })
}

/**
 * Validate and convert raw CSV data to Landmark objects
 */
export function convertToLandmarks(data: Record<string, string>[]): Landmark[] {
  // If data is empty or invalid, return an empty array
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn("Invalid or empty CSV data provided to convertToLandmarks")
    return []
  }

  return data
    .filter((item) => {
      // Validate that the item exists and is an object
      if (!item || typeof item !== "object") {
        return false
      }

      // Validate that the item has all required fields
      const requiredFields = [
        "Number_in_place",
        "place_name_raw",
        "place_name_jp",
        "place_name_en",
        "latitude",
        "longitude",
      ]

      return requiredFields.every((field) => field in item)
    })
    .map((item) => {
      // Convert to Landmark type
      return {
        Number_in_place: item.Number_in_place || "",
        Toilet: item.Toilet || undefined,
        Parking: item.Parking || undefined,
        place_name_raw: item.place_name_raw || "",
        place_name_jp: item.place_name_jp || "",
        place_name_en: item.place_name_en || "",
        desc_jp: item.desc_jp || "",
        desc_en: item.desc_en || "",
        latitude: item.latitude || "",
        longitude: item.longitude || "",
      }
    })
}

