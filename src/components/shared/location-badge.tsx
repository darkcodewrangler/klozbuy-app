import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge2 } from "../ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { 
  formatLocationDisplay, 
  LocationInfo, 
  LocationCoordinates 
} from "@/utils/location-privacy";

interface LocationBadgeProps {
  distance?: number;
  landmark?: string;
  location?: LocationInfo;
  isOwner?: boolean;
  isFavoriteUser?: boolean;
  showExactAddress?: boolean;
  className?: string;
}

const LocationBadge = ({
  distance,
  landmark,
  location,
  isOwner = false,
  isFavoriteUser = false,
  showExactAddress = false,
  className,
}: LocationBadgeProps) => {
  const { isAuthenticated } = useAuth();
  const { latitude, longitude } = useLocation();

  // Get display text based on authentication and location data
  const getDisplayText = () => {
    // Legacy support for distance prop
    if (distance !== undefined) {
      return `${distance}km away`;
    }

    // Legacy support for landmark prop
    if (landmark && !location) {
      return landmark;
    }

    // Use new location privacy system
    if (location) {
      const userLocation: LocationCoordinates | undefined = 
        latitude && longitude ? { latitude, longitude } : undefined;

      return formatLocationDisplay(location, {
        isAuthenticated,
        userLocation,
        showExactAddress: showExactAddress && (isAuthenticated || isOwner),
      });
    }

    return "Nearby";
  };

  return (
    <Badge2 className={className}>
      <MapPin size={14} />
      <span className="truncate text-xs">
        {getDisplayText()}
      </span>
    </Badge2>
  );
};

export default LocationBadge;
export { LocationBadge };
