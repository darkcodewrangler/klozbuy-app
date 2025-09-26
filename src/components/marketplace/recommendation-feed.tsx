"use client";

import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, MapPin, Heart, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ListingCard } from "./listing-card";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  priceType: "fixed" | "negotiable" | "auction";
  category: string;
  condition: "new" | "like_new" | "excellent" | "good" | "fair";
  images: string[];
  location: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  createdAt: string;
  viewCount: number;
  favoriteCount: number;
  deliveryType: "pickup" | "delivery" | "both";
  tags: string[];
  status: "active" | "sold" | "expired";
  visibility: "public" | "private";
}

interface RecommendationFeedProps {
  userId?: string;
  location?: { lat: number; lng: number };
  className?: string;
}

// Mock recommendation data
const mockRecommendations = {
  personalized: [
    {
      id: "1",
      title: "MacBook Pro 16-inch M2",
      price: 2200,
      originalPrice: 2499,
      priceType: "fixed" as const,
      category: "Electronics",
      condition: "like_new" as const,
      images: ["/api/placeholder/400/300"],
      location: { id: "1", name: "Manhattan", city: "New York", state: "NY" },
      seller: { id: "1", name: "John Doe", avatar: "/api/placeholder/100/100", rating: 4.8, verified: true },
      createdAt: "2024-01-15T10:00:00Z",
      viewCount: 156,
      favoriteCount: 23,
      deliveryType: "both" as const,
      tags: ["laptop", "apple", "m2"],
      status: "active" as const,
      visibility: "public" as const,
    },
    {
      id: "2",
      title: "iPhone 15 Pro Max 256GB",
      price: 1100,
      priceType: "negotiable" as const,
      category: "Electronics",
      condition: "excellent" as const,
      images: ["/api/placeholder/400/300"],
      location: { id: "2", name: "Brooklyn", city: "New York", state: "NY" },
      seller: { id: "2", name: "Jane Smith", avatar: "/api/placeholder/100/100", rating: 4.9, verified: true },
      createdAt: "2024-01-14T15:30:00Z",
      viewCount: 89,
      favoriteCount: 15,
      deliveryType: "pickup" as const,
      tags: ["phone", "apple", "iphone"],
      status: "active" as const,
      visibility: "public" as const,
    },
  ],
  trending: [
    {
      id: "3",
      title: "Gaming Setup - RTX 4080 PC",
      price: 2800,
      priceType: "fixed" as const,
      category: "Electronics",
      condition: "excellent" as const,
      images: ["/api/placeholder/400/300"],
      location: { id: "3", name: "Queens", city: "New York", state: "NY" },
      seller: { id: "3", name: "Mike Johnson", avatar: "/api/placeholder/100/100", rating: 4.7, verified: true },
      createdAt: "2024-01-13T12:00:00Z",
      viewCount: 234,
      favoriteCount: 45,
      deliveryType: "pickup" as const,
      tags: ["gaming", "pc", "rtx"],
      status: "active" as const,
      visibility: "public" as const,
    },
  ],
  nearby: [
    {
      id: "4",
      title: "Vintage Leather Sofa",
      price: 450,
      priceType: "negotiable" as const,
      category: "Home & Garden",
      condition: "good" as const,
      images: ["/api/placeholder/400/300"],
      location: { id: "1", name: "Manhattan", city: "New York", state: "NY" },
      seller: { id: "4", name: "Sarah Wilson", avatar: "/api/placeholder/100/100", rating: 4.6, verified: false },
      createdAt: "2024-01-12T16:45:00Z",
      viewCount: 67,
      favoriteCount: 8,
      deliveryType: "pickup" as const,
      tags: ["furniture", "vintage", "leather"],
      status: "active" as const,
      visibility: "public" as const,
    },
  ],
  recent: [
    {
      id: "5",
      title: "Professional Camera Kit",
      price: 1200,
      priceType: "fixed" as const,
      category: "Electronics",
      condition: "like_new" as const,
      images: ["/api/placeholder/400/300"],
      location: { id: "2", name: "Brooklyn", city: "New York", state: "NY" },
      seller: { id: "5", name: "David Brown", avatar: "/api/placeholder/100/100", rating: 4.9, verified: true },
      createdAt: "2024-01-16T08:30:00Z",
      viewCount: 45,
      favoriteCount: 12,
      deliveryType: "both" as const,
      tags: ["camera", "photography", "professional"],
      status: "active" as const,
      visibility: "public" as const,
    },
  ],
};

export function RecommendationFeed({ userId, location, className }: RecommendationFeedProps) {
  const [activeTab, setActiveTab] = useState("personalized");
  const [recommendations, setRecommendations] = useState<Record<string, Listing[]>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load recommendations
  const loadRecommendations = async (type: string = activeTab, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // In real implementation, this would be an API call
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (location) {
        params.set("lat", location.lat.toString());
        params.set("lng", location.lng.toString());
      }
      params.set("type", type);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use mock data based on type
      const data = mockRecommendations[type as keyof typeof mockRecommendations] || [];
      
      setRecommendations(prev => ({
        ...prev,
        [type]: data,
      }));

      if (refresh) {
        toast.success("Recommendations refreshed");
      }
    } catch (error) {
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load initial recommendations
  useEffect(() => {
    loadRecommendations();
  }, [activeTab, userId, location]);

  // Refresh recommendations
  const handleRefresh = () => {
    loadRecommendations(activeTab, true);
  };

  // Get tab icon
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "personalized":
        return <Sparkles className="h-4 w-4" />;
      case "trending":
        return <TrendingUp className="h-4 w-4" />;
      case "nearby":
        return <MapPin className="h-4 w-4" />;
      case "recent":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get tab description
  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "personalized":
        return "Based on your interests and activity";
      case "trending":
        return "Popular items in your area";
      case "nearby":
        return "Items close to your location";
      case "recent":
        return "Recently listed items";
      default:
        return "";
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {getTabIcon(type)}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type} recommendations yet
      </h3>
      <p className="text-gray-600 mb-4">
        {type === "personalized" && "Browse and interact with listings to get personalized recommendations"}
        {type === "trending" && "Check back later for trending items in your area"}
        {type === "nearby" && "Enable location services to see nearby recommendations"}
        {type === "recent" && "New listings will appear here"}
      </p>
      <Button variant="outline" onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          <p className="text-gray-600 mt-1">Discover items you might like</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">For You</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trending</span>
          </TabsTrigger>
          <TabsTrigger value="nearby" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Nearby</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Recent</span>
          </TabsTrigger>
        </TabsList>

        {["personalized", "trending", "nearby", "recent"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getTabIcon(tab)}
                <span>{getTabDescription(tab)}</span>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : recommendations[tab]?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations[tab].map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <EmptyState type={tab} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Recommendation Insights */}
      {userId && recommendations[activeTab]?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Why these recommendations?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Based on your favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>Near your location</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Popular in your area</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}