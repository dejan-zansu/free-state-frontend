import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BuildingInsightsResponse } from "@/types/solar"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID for a building
 * Uses building.name from Google Solar API, or falls back to coordinates
 */
export function getBuildingId(building: BuildingInsightsResponse): string {
  return building.name || `${building.center.latitude}_${building.center.longitude}`
}

/**
 * Remove duplicate buildings based on center coordinates
 * Uses 0.0001 degree tolerance (~11 meters) to account for API precision
 */
export function deduplicateBuildings(
  buildings: BuildingInsightsResponse[]
): BuildingInsightsResponse[] {
  const TOLERANCE = 0.0001 // ~11 meters
  const unique: BuildingInsightsResponse[] = []

  for (const building of buildings) {
    const isDuplicate = unique.some(existing =>
      Math.abs(existing.center.latitude - building.center.latitude) < TOLERANCE &&
      Math.abs(existing.center.longitude - building.center.longitude) < TOLERANCE
    )

    if (!isDuplicate) {
      unique.push(building)
    }
  }

  return unique
}
