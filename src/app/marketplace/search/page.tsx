"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, MapPin, Grid, List, Map, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/marketplace/listing-card";
import { RequestCard } from "@/components/marketplace/request-card";
import { MarketplaceMap } from "@/components/marketplace/marketplace-map";
import { toast } from "sonner";

// Mock data
const mockListings = [
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
];

const mockRequests = [
  {
    id: "1",
    title: "Looking for MacBook Pro for Development",
    description: "Need a MacBook Pro for software development work...",
    budget: { min: 1500, max: 2500 },
    category: "Electronics",
    location: { id: "1", name: "Manhattan", city: "New York", state: "NY" },
    user: { id: "1", name: "Alex Johnson", avatar: "/api/placeholder/100/100", rating: 4.7 },
    createdAt: "2024-01-16T09:00:00Z",
    expiresAt: "2024-02-16T09:00:00Z",
    urgency: "medium" as const,
    status: "active" as const,
    responseCount: 5,
  },
];

const categories = [
  "All Categories",
  "Electronics",
  "Vehicles",
  "Home & Garden",
  "Clothing & Accessories",
  "Sports & Recreation",
  "Books & Media",
  "Toys & Games",
  "Health & Beauty",
  "Services",
  "Other"
];

const conditions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const deliveryTypes = [
  { value: "pickup", label: "Pickup Only" },
  { value: "delivery", label: "Delivery Available" },
  { value: "both", label: "Both Options" },
];

const sortOptions = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "distance", label: "Distance" },
  { value: "popular", label: "Most Popular" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchType, setSearchType] = useState<"listings" | "requests">("listings");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  
  // Filter state
  const [category, setCategory] = useState(searchParams.get("category") || "All Categories");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDeliveryTypes, setSelectedDeliveryTypes] = useState<string[]>([]);
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [radius, setRadius] = useState([25]);
  const [sortBy, setSortBy] = useState("relevance");
  
  // Results state
  const [listings, setListings] = useState(mockListings);
  const [requests, setRequests] = useState(mockRequests);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Search function
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      // Build search parameters
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (category !== "All Categories") params.set("category", category);
      if (location) params.set("location", location);
      params.set("radius", radius[0].toString());
      params.set("sort", sortBy);
      params.set("page", currentPage.toString());
      
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
      if (priceRange[1] < 5000) params.set("maxPrice", priceRange[1].toString());
      
      if (selectedConditions.length > 0) {
        params.set("conditions", selectedConditions.join(","));
      }
      
      if (selectedDeliveryTypes.length > 0) {
        params.set("deliveryTypes", selectedDeliveryTypes.join(","));
      }

      // Update URL
      const newUrl = `/marketplace/search?${params.toString()}`;
      router.replace(newUrl, { scroll: false });

      // API call would go here
      // const response = await fetch(`/api/${searchType}?${params.toString()}`);
      // const data = await response.json();
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock filtering logic
      let filteredResults = searchType === "listings" ? mockListings : mockRequests;
      
      if (searchQuery) {
        filteredResults = filteredResults.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      if (category !== "All Categories") {
        filteredResults = filteredResults.filter(item => item.category === category);
      }
      
      if (searchType === "listings") {
        setListings(filteredResults as typeof mockListings);
      } else {
        setRequests(filteredResults as typeof mockRequests);
      }
      
      setTotalResults(filteredResults.length);
      
    } catch (error) {
      toast.error("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType, category, location, radius, sortBy, currentPage, priceRange, selectedConditions, selectedDeliveryTypes, router]);

  // Trigger search on parameter changes
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
  };

  // Clear all filters
  const clearFilters = () => {
    setCategory("All Categories");
    setPriceRange([0, 5000]);
    setSelectedConditions([]);
    setSelectedDeliveryTypes([]);
    setLocation("");
    setRadius([25]);
    setSortBy("relevance");
    setCurrentPage(1);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (category !== "All Categories") count++;
    if (priceRange[0] > 0 || priceRange[1] < 5000) count++;
    if (selectedConditions.length > 0) count++;
    if (selectedDeliveryTypes.length > 0) count++;
    if (location) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Filter panel component
  const FilterPanel = ({ isMobile = false }) => (
    <div className={cn("space-y-6", isMobile && "px-4")}>
      {/* Category */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={5000}
          step={50}
          className="w-full"
        />
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Enter city, state, or ZIP"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>
        {location && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Radius: {radius[0]} miles
            </Label>
            <Slider
              value={radius}
              onValueChange={setRadius}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </div>

      {searchType === "listings" && (
        <>
          {/* Condition */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Condition</Label>
            <div className="space-y-2">
              {conditions.map((condition) => (
                <div key={condition.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition.value}
                    checked={selectedConditions.includes(condition.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedConditions([...selectedConditions, condition.value]);
                      } else {
                        setSelectedConditions(selectedConditions.filter(c => c !== condition.value));
                      }
                    }}
                  />
                  <Label htmlFor={condition.value} className="text-sm">
                    {condition.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Delivery Options</Label>
            <div className="space-y-2">
              {deliveryTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={selectedDeliveryTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDeliveryTypes([...selectedDeliveryTypes, type.value]);
                      } else {
                        setSelectedDeliveryTypes(selectedDeliveryTypes.filter(t => t !== type.value));
                      }
                    }}
                  />
                  <Label htmlFor={type.value} className="text-sm">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for items, services, or requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          {/* Search Type Tabs */}
          <Tabs value={searchType} onValueChange={(value) => setSearchType(value as "listings" | "requests")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">{activeFilterCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterPanel />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">
                  {searchQuery ? `Results for "${searchQuery}"` : `All ${searchType}`}
                </h1>
                <span className="text-gray-600">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel isMobile />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none border-x"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="rounded-l-none"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {category !== "All Categories" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {category}
                    <button
                      onClick={() => setCategory("All Categories")}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ${priceRange[0]} - ${priceRange[1]}
                    <button
                      onClick={() => setPriceRange([0, 5000])}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {location} ({radius[0]} mi)
                    <button
                      onClick={() => setLocation("")}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching...</p>
                </div>
              </div>
            ) : (
              <>
                {viewMode === "map" ? (
                  <div className="h-96 rounded-lg overflow-hidden">
                    <MarketplaceMap
                      listings={searchType === "listings" ? listings : []}
                      requests={searchType === "requests" ? requests : []}
                      center={location ? { lat: 40.7128, lng: -74.0060 } : undefined}
                      zoom={location ? 12 : 10}
                    />
                  </div>
                ) : (
                  <div className={cn(
                    viewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  )}>
                    {searchType === "listings" ? (
                      listings.length > 0 ? (
                        listings.map((listing) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            compact={viewMode === "list"}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <p className="text-gray-600 text-lg">No listings found</p>
                          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
                        </div>
                      )
                    ) : (
                      requests.length > 0 ? (
                        requests.map((request) => (
                          <RequestCard key={request.id} request={request} />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <p className="text-gray-600 text-lg">No requests found</p>
                          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Load More */}
                {hasMore && (searchType === "listings" ? listings.length > 0 : requests.length > 0) && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}