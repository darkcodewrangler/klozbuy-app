import React from "react";
import { MapPin, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { 
  formatLocationDisplay, 
  LocationInfo, 
  LocationCoordinates,
  shouldShowExactLocation 
} from "@/utils/location-privacy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LocationDisplayProps {
  location: LocationInfo;
  isOwner?: boolean;
  isFavoriteUser?: boolean;
  showExactAddress?: boolean;
  showPrivacyIndicator?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
  onPrivacyToggle?: () => void;
}

export function LocationDisplay({
  location,
  isOwner = false,
  isFavoriteUser = false,
  showExactAddress = false,
  showPrivacyIndicator = false,
  variant = "default",
  className,
  onPrivacyToggle,
}: LocationDisplayProps) {
  const { isAuthenticated, user } = useAuth();
  const { latitude, longitude } = useLocation();

  const userLocation: LocationCoordinates | undefined = 
    latitude && longitude ? { latitude, longitude } : undefined;

  const displayText = formatLocationDisplay(location, {
    isAuthenticated,
    userLocation,
    showExactAddress: showExactAddress && (isAuthenticated || isOwner),
  });

  const showingExactLocation = shouldShowExactLocation({
    isAuthenticated,
    isOwner,
    isFavoriteUser,
    showExactAddress,
  });

  const renderCompact = () => (
    <div className={cn("flex items-center gap-1 text-sm text-gray-600", className)}>
      <MapPin className="h-3 w-3" />
      <span className="truncate">{displayText}</span>
      {showPrivacyIndicator && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                {showingExactLocation ? (
                  <Eye className="h-3 w-3 text-green-600" />
                ) : (
                  <EyeOff className="h-3 w-3 text-orange-600" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {showingExactLocation 
                  ? "Exact location visible" 
                  : "Approximate location for privacy"
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  const renderDefault = () => (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <MapPin className="h-4 w-4 text-gray-500" />
      <span className="text-gray-700">{displayText}</span>
      {showPrivacyIndicator && (
        <Badge variant={showingExactLocation ? "default" : "secondary"} className="text-xs">
          {showingExactLocation ? "Exact" : "Approximate"}
        </Badge>
      )}
    </div>
  );

  const renderDetailed = () => (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">Location</span>
        </div>
        {showPrivacyIndicator && onPrivacyToggle && isOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrivacyToggle}
            className="h-6 px-2 text-xs"
          >
            {showingExactLocation ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Make Private
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show Exact
              </>
            )}
          </Button>
        )}
      </div>
      <div className="text-sm text-gray-700 pl-6">
        {displayText}
      </div>
      {showPrivacyIndicator && (
        <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
          {showingExactLocation ? (
            <>
              <Eye className="h-3 w-3 text-green-600" />
              <span>Exact location visible to authenticated users</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 text-orange-600" />
              <span>Approximate location shown for privacy</span>
            </>
          )}
        </div>
      )}
    </div>
  );

  switch (variant) {
    case "compact":
      return renderCompact();
    case "detailed":
      return renderDetailed();
    default:
      return renderDefault();
  }
}

export default LocationDisplay;