"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Map, Grid, List, Plus, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { SearchFilters } from "@/components/marketplace/search-filters";
import { RequestCard } from "@/components/marketplace/request-card";
import { MarketplaceMap } from "@/components/marketplace/marketplace-map";
import { RecommendationFeed } from "@/components/marketplace/recommendation-feed";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock data - in real implementation, this would come from API
const mockListings = [
  {
    id: "1",
    title: "MacBook Pro 16-inch M2",
    description: "Excellent condition MacBook Pro with M2 chip, 16GB RAM, 512GB SSD. Perfect for developers and designers.",
    price: 2200,
    originalPrice: 2499,
    priceType: "fixed" as const,
    category: "Electronics",
    condition: "like_new" as const,
    images: ["/api/placeholder/400/300"],
    location: { id: "1", name: "Victoria Island", city: "Lagos", state: "Lagos" },
    seller: { id: "1", name: "John Doe", avatar: "/api/placeholder/40/40", rating: 4.8, verified: true },
    createdAt: "2024-01-15T10:00:00Z",
    viewCount: 156,
    favoriteCount: 23,
    deliveryType: "both" as const,
    tags: ["laptop", "apple", "m2", "professional"],
  },
  {
    id: "2",
    title: "Vintage Leather Sofa",
    description: "Beautiful vintage leather sofa in excellent condition. Perfect for living room or office.",
    price: 800,
    priceType: "negotiable" as const,
    category: "Home & Garden",
    condition: "good" as const,
    images: ["/api/placeholder/400/300"],
    location: { id: "2", name: "Ikeja", city: "Lagos", state: "Lagos" },
    seller: { id: "2", name: "Sarah Smith", avatar: "/api/placeholder/40/40", rating: 4.9, verified: true },
    createdAt: "2024-01-14T15:30:00Z",
    viewCount: 89,
    favoriteCount: 12,
    deliveryType: "pickup" as const,
    tags: ["furniture", "vintage", "leather"],
  },
];

const mockRequests = [
  {
    id: "1",
    title: "Looking for iPhone 15 Pro",
    description: "Need iPhone 15 Pro in good condition, preferably unlocked. Willing to pay fair market price.",
    category: "Electronics",
    budgetMin: 800,
    budgetMax: 1000,
    budgetType: "negotiable" as const,
    urgency: "medium" as const,
    status: "active" as const,
    location: { id: "1", name: "Victoria Island", city: "Lagos", state: "Lagos" },
    user: { id: "3", name: "Mike Johnson", avatar: "/api/placeholder/40/40", verified: false },
    responseCount: 5,
    createdAt: "2024-01-16T09:00:00Z",
    expiresAt: "2024-01-30T09:00:00Z",
    tags: ["iphone", "smartphone", "unlocked"],
  },
  {
    id: "2",
    title: "Web Developer for E-commerce Site",
    description: "Looking for experienced web developer to build custom e-commerce website with payment integration.",
    category: "Services",
    budgetMin: 50,
    budgetMax: 75,
    budgetType: "hourly" as const,
    urgency: "high" as const,
    status: "active" as const,
    location: { id: "2", name: "Ikeja", city: "Lagos", state: "Lagos" },
    user: { id: "4", name: "Lisa Chen", avatar: "/api/placeholder/40/40", verified: true },
    responseCount: 12,
    createdAt: "2024-01-15T14:20:00Z",
    expiresAt: "2024-01-25T14:20:00Z",
    tags: ["web development", "e-commerce", "react", "nodejs"],
  },
];

const mockMapLocations = [
  ...mockListings.map(listing => ({
    id: listing.id,
    lat: 40.7128 + Math.random() * 0.1,
    lng: -74.0060 + Math.random() * 0.1,
    title: listing.title,
    type: "listing" as const,
    category: listing.category,
    price: listing.price,
    priceType: listing.priceType,
    image: listing.images[0],
    status: "active",
    createdAt: listing.createdAt,
  })),
  ...mockRequests.map(request => ({
    id: request.id,
    lat: 40.7128 + Math.random() * 0.1,
    lng: -74.0060 + Math.random() * 0.1,
    title: request.title,
    type: "request" as const,
    category: request.category,
    budgetMin: request.budgetMin,
    budgetMax: request.budgetMax,
    status: request.status,
    createdAt: request.createdAt,
  })),
];

const TRENDING_CATEGORIES = [
  { name: "Electronics", count: 234, trend: "+12%" },
  { name: "Home & Garden", count: 189, trend: "+8%" },
  { name: "Clothing & Fashion", count: 156, trend: "+15%" },
  { name: "Services", count: 98, trend: "+22%" },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("listings");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    // In real implementation, this would show a modal or navigate to details
    console.log("Location clicked:", location);
  };

  const handleCreateListing = () => {
    // Navigate to create listing page
    window.location.href = "/marketplace/create";
  };

  const handleCreateRequest = () => {
    // Navigate to create request page
    window.location.href = "/marketplace/requests/create";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {mockListings.length + mockRequests.length} active items
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCreateRequest}>
                <Plus className="h-4 w-4 mr-2" />
                Post Request
              </Button>
              <Button onClick={handleCreateListing}>
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search marketplace..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Section */}
          <div className="mb-8">
            <RecommendationFeed 
              userId="current-user-id" // In real app, get from auth context
              location={{ lat: 40.7128, lng: -74.0060 }} // In real app, get from user location
            />
          </div>

          {/* Quick Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Near me (2 miles)
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending today
                </Button>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Price Range
                  </p>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Under $50
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    $50 - $200
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    $200 - $500
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Over $500
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trending Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trending Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {TRENDING_CATEGORIES.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.count} items</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.trend}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="listings">
                    Listings ({mockListings.length})
                  </TabsTrigger>
                  <TabsTrigger value="requests">
                    Requests ({mockRequests.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <SearchFilters
                    onFiltersChange={(filters) => console.log("Filters changed:", filters)}
                    initialFilters={{}}
                  />
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="listings" className="mt-0">
                {viewMode === "map" ? (
                  <Card>
                    <CardContent className="p-0">
                      <MarketplaceMap
                        locations={mockMapLocations.filter(l => l.type === "listing")}
                        onLocationClick={handleLocationClick}
                        height="600px"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <ListingGrid
                    listings={mockListings}
                    viewMode={viewMode}
                    onListingClick={(id) => window.location.href = `/marketplace/listings/${id}`}
                    onSellerClick={(id) => window.location.href = `/profile/${id}`}
                    onFavoriteToggle={(id) => console.log("Toggle favorite:", id)}
                  />
                )}
              </TabsContent>

              <TabsContent value="requests" className="mt-0">
                {viewMode === "map" ? (
                  <Card>
                    <CardContent className="p-0">
                      <MarketplaceMap
                        locations={mockMapLocations.filter(l => l.type === "request")}
                        onLocationClick={handleLocationClick}
                        height="600px"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className={cn(
                    "grid gap-4",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  )}>
                    {mockRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onRespond={(id) => window.location.href = `/marketplace/requests/${id}/respond`}
                        onViewDetails={(id) => window.location.href = `/marketplace/requests/${id}`}
                        onViewProfile={(id) => window.location.href = `/profile/${id}`}
                        compact={viewMode === "list"}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}