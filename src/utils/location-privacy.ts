// Remove server-only import to make this utility client-compatible
// import { LocationService } from "@/services/location.service";
import { calculateHaversineDistance } from "@/lib/geolocation/utils";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationDisplayOptions {
  isAuthenticated: boolean;
  userLocation?: LocationCoordinates;
  showExactAddress?: boolean;
  privacyLevel?: "exact" | "approximate" | "city" | "state";
}

/**
 * Formats location information based on user authentication status and privacy preferences
 */
export function formatLocationDisplay(
  location: LocationInfo,
  options: LocationDisplayOptions
): string {
  const { isAuthenticated, userLocation, showExactAddress = false, privacyLevel = "approximate" } = options;

  // If user is authenticated and exact address is requested
  if (isAuthenticated && showExactAddress && location.address) {
    return location.address;
  }

  // If user is authenticated, show city and state
  if (isAuthenticated) {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.length > 0 ? parts.join(", ") : location.name || "Location not specified";
  }

  // For non-authenticated users, show proximity-based information
  if (userLocation && location.latitude && location.longitude) {
    const distance = calculateHaversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    );

    return formatProximityDisplay(distance);
  }

  // Fallback to general area information
  return getGeneralAreaDisplay(location, privacyLevel);
}

/**
 * Formats distance into user-friendly proximity display
 */
export function formatProximityDisplay(distanceKm: number): string {
  if (distanceKm < 0.1) {
    return "Very close to you";
  } else if (distanceKm < 1) {
    return "Less than 1km away";
  } else if (distanceKm < 5) {
    return `${Math.round(distanceKm)}km away`;
  } else if (distanceKm < 10) {
    return `${Math.round(distanceKm)}km away`;
  } else if (distanceKm < 25) {
    return `${Math.round(distanceKm)}km away`;
  } else if (distanceKm < 50) {
    return `${Math.round(distanceKm / 5) * 5}km+ away`;
  } else {
    return "50km+ away";
  }
}

/**
 * Gets general area display based on privacy level
 */
export function getGeneralAreaDisplay(location: LocationInfo, privacyLevel: "exact" | "approximate" | "city" | "state"): string {
  switch (privacyLevel) {
    case "exact":
      return location.address || location.name || "Location not specified";
    case "approximate":
      return location.city || location.state || "General area";
    case "city":
      return location.city || location.state || "City area";
    case "state":
      return location.state || location.country || "State area";
    default:
      return "Nearby";
  }
}

/**
 * Determines if exact location should be shown based on user relationship and privacy settings
 */
export function shouldShowExactLocation(
  isAuthenticated: boolean,
  isOwner: boolean = false,
  isFavoriteUser: boolean = false,
  userPrivacyLevel: "public" | "friends" | "private" = "public"
): boolean {
  // Always show exact location to the owner
  if (isOwner) return true;

  // For non-authenticated users, never show exact location
  if (!isAuthenticated) return false;

  // For authenticated users, check privacy level
  switch (userPrivacyLevel) {
    case "public":
      return true;
    case "friends":
      return isFavoriteUser;
    case "private":
      return false;
    default:
      return false;
  }
}

/**
 * Adds noise to coordinates for privacy protection
 */
export function addLocationNoise(
  coordinates: LocationCoordinates,
  radiusMeters: number = 500
): LocationCoordinates {
  const earthRadius = 6371000; // Earth's radius in meters
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random() * radiusMeters;

  const deltaLat = ((randomRadius * Math.cos(randomAngle)) / earthRadius) * (180 / Math.PI);
  const deltaLng = ((randomRadius * Math.sin(randomAngle)) / 
    (earthRadius * Math.cos((coordinates.latitude * Math.PI) / 180))) * (180 / Math.PI);

  return {
    latitude: coordinates.latitude + deltaLat,
    longitude: coordinates.longitude + deltaLng,
  };
}

/**
 * Gets location display for marketplace listings
 */
export function getMarketplaceLocationDisplay(
  listing: {
    location?: LocationInfo;
    seller?: { id: string };
  },
  options: LocationDisplayOptions & {
    currentUserId?: string;
    isFavoriteSeller?: boolean;
  }
): string {
  if (!listing.location) return "Location not specified";

  const isOwner = options.currentUserId === listing.seller?.id;
  const shouldShowExact = shouldShowExactLocation(
    options.isAuthenticated,
    isOwner,
    options.isFavoriteSeller
  );

  return formatLocationDisplay(listing.location, {
    ...options,
    showExactAddress: shouldShowExact,
  });
}