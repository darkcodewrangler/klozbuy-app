"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import Layout from "@/components/layouts/layout";
import FeedSection from "@/components/home/feed-section";
import SuggestionsPanel from "@/components/home/suggestions-panel";
import AuthModal from "@/components/authentication/AuthModal";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateHaversineDistance } from "@/lib/geolocation/utils";
import NewPostSection from "../components/home/new-post-section";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { latitude, longitude, loading, error, setManualLocation } =
    useLocation();
  const [locationName, setLocationName] = useState("");
  // In a real app, this would fetch posts based on the user's location
  const handleLocation = () => {
    if (!loading && latitude && longitude) {
      console.log(`Location: ${latitude}, ${longitude}`);
      // fetchNearbyPosts(latitude, longitude);
    }
  };

  // Simple location-based greeting
  useEffect(() => {
    // Example usage:
    const userLatitude = 6.5244; // New York City
    const userLongitude = 3.3792;
    const postLatitude = 6.2522; // Los Angeles
    const postLongitude = 2.2437;

    const distanceInKilometers = calculateHaversineDistance(
      userLatitude,
      userLongitude,
      postLatitude,
      postLongitude
    );

    console.log(`Distance: ${distanceInKilometers.toFixed(2)} km`);

    const getLocationName = () => {
      // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      // For demo purposes, using hardcoded location names
      // In a real app, this would use reverse geocoding or the user's saved location
      if (latitude && longitude) {
        // Approximate coordinates for Lagos
        if (
          latitude >= 6.3 &&
          latitude <= 6.7 &&
          longitude >= 3.1 &&
          longitude <= 3.5
        ) {
          return "Lagos";
        }
        return "your area";
      }
      return "Nigeria";
    };
    setLocationName(getLocationName());
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
  }, [latitude, longitude]);
  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-6 px-3 md:px-4">
        <div className="flex-1  md:border-r border-border md:pr-4 py-6">
          {/* Location Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Discover Nearby</h1>
              <div className="flex items-center mt-1 text-muted-foreground">
                <MapPin size={16} className="mr-1" />
                {loading ? (
                  <Skeleton className="h-5 w-24" />
                ) : error ? (
                  <span className="text-sm italic">Location unavailable</span>
                ) : (
                  <p className="text-sm">{locationName}</p>
                )}
              </div>
            </div>

            <Button
              size={"sm"}
              // className="bg-klozui-green-600 hover:bg-klozui-green-600/90 text-white flex-shrink-0"
              onClick={handleLocation}
              disabled={loading}
            >
              <Navigation size={16} className="mr-2" />
              Update Location
            </Button>
          </div>
          <NewPostSection />
          {/* Main Feed */}
          <FeedSection />
        </div>

        {/* Right Panel */}
        <div className="flex py-6">
          <SuggestionsPanel className="w-[340px] flex-shrink-0" />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </Layout>
  );
};

export default Index;
