"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Layers, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: "listing" | "request";
  category: string;
  price?: number;
  priceType?: string;
  budgetMin?: number;
  budgetMax?: number;
  image?: string;
  status: string;
  createdAt: string;
}

interface MarketplaceMapProps {
  locations: MapLocation[];
  onLocationClick?: (location: MapLocation) => void;
  onLocationSelect?: (location: MapLocation) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  height?: string;
  className?: string;
}

// Mock map component since we don't have a real map library
function MockMapComponent({ 
  locations, 
  center, 
  zoom, 
  onLocationClick,
  selectedRadius,
  mapType,
}: {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationClick?: (location: MapLocation) => void;
  selectedRadius: number;
  mapType: string;
}) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Center Point */}
      {center && (
        <div 
          className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-2 -translate-y-2"
          style={{
            left: '50%',
            top: '50%',
          }}
        />
      )}

      {/* Radius Circle */}
      {center && selectedRadius > 0 && (
        <div 
          className="absolute border-2 border-blue-400 border-dashed rounded-full opacity-30"
          style={{
            left: '50%',
            top: '50%',
            width: `${selectedRadius * 20}px`,
            height: `${selectedRadius * 20}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Location Markers */}
      {locations.map((location, index) => (
        <div
          key={location.id}
          className={cn(
            "absolute w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-4 -translate-y-4 transition-all hover:scale-110",
            location.type === "listing" ? "bg-green-500" : "bg-orange-500"
          )}
          style={{
            left: `${20 + (index % 10) * 8}%`,
            top: `${20 + Math.floor(index / 10) * 15}%`,
          }}
          onClick={() => onLocationClick?.(location)}
          title={location.title}
        >
          <div className="w-full h-full flex items-center justify-center">
            {location.type === "listing" ? (
              <MapPin className="w-4 h-4 text-white" />
            ) : (
              <Search className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      ))}

      {/* Map Type Indicator */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium">
        {mapType === "satellite" ? "Satellite" : "Street"}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-green-500 rounded-full border border-white"></div>
          <span>Listings ({locations.filter(l => l.type === "listing").length})</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-orange-500 rounded-full border border-white"></div>
          <span>Requests ({locations.filter(l => l.type === "request").length})</span>
        </div>
      </div>
    </div>
  );
}

export function MarketplaceMap({
  locations,
  onLocationClick,
  onLocationSelect,
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  showFilters = true,
  showSearch = true,
  height = "500px",
  className,
}: MarketplaceMapProps) {
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "listing" | "request">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRadius, setSelectedRadius] = useState([10]);
  const [mapType, setMapType] = useState<"street" | "satellite">("street");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Could not get user location:", error);
        }
      );
    }
  }, []);

  // Filter locations based on search and filters
  useEffect(() => {
    let filtered = locations;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(location =>
        location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(location => location.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(location => location.category === selectedCategory);
    }

    // Radius filter (simplified - in real implementation would use actual distance calculation)
    // For demo purposes, we'll just limit the number of results based on radius
    const maxResults = Math.floor(selectedRadius[0] * 2);
    filtered = filtered.slice(0, maxResults);

    setFilteredLocations(filtered);
  }, [locations, searchQuery, selectedType, selectedCategory, selectedRadius]);

  const categories = Array.from(new Set(locations.map(l => l.category)));

  const handleLocationClick = (location: MapLocation) => {
    onLocationClick?.(location);
    onLocationSelect?.(location);
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      // In a real implementation, this would center the map on user's location
      console.log("Centering on user location:", userLocation);
    }
  };

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {showFilters && (
              <Button
                variant="outline"
                size="icon"
                className="bg-white/90 backdrop-blur-sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm"
              onClick={() => setMapType(mapType === "street" ? "satellite" : "street")}
            >
              <Layers className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm"
              onClick={centerOnUserLocation}
              disabled={!userLocation}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <Card className="absolute top-20 left-4 z-10 w-80 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFiltersPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="listing">Listings Only</SelectItem>
                  <SelectItem value="request">Requests Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Radius Filter */}
            <div className="space-y-2">
              <Label>Search Radius: {selectedRadius[0]} miles</Label>
              <Slider
                value={selectedRadius}
                onValueChange={setSelectedRadius}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {filteredLocations.length} of {locations.length} locations
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Component */}
      <MockMapComponent
        locations={filteredLocations}
        center={userLocation || center}
        zoom={zoom}
        onLocationClick={handleLocationClick}
        selectedRadius={selectedRadius[0]}
        mapType={mapType}
      />

      {/* Results Summary */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
        <div className="text-sm space-y-1">
          <div className="font-medium">
            {filteredLocations.length} locations found
          </div>
          <div className="flex gap-4 text-xs text-gray-600">
            <span>{filteredLocations.filter(l => l.type === "listing").length} listings</span>
            <span>{filteredLocations.filter(l => l.type === "request").length} requests</span>
          </div>
        </div>
      </div>
    </div>
  );
}