"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MapPin, DollarSign, Package, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  query?: string;
  category?: string;
  type?: "product" | "service";
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  radius?: number;
  condition?: "new" | "like_new" | "good" | "fair" | "poor";
  deliveryType?: "pickup" | "delivery" | "both";
  sortBy?: "createdAt" | "price" | "distance" | "popularity";
  sortOrder?: "asc" | "desc";
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  className?: string;
}

const CATEGORIES = [
  "Electronics",
  "Clothing & Fashion",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Automotive",
  "Health & Beauty",
  "Toys & Games",
  "Art & Crafts",
  "Business & Industrial",
  "Services",
  "Other",
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const DELIVERY_TYPES = [
  { value: "pickup", label: "Pickup Only" },
  { value: "delivery", label: "Delivery Available" },
  { value: "both", label: "Both" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest First" },
  { value: "price", label: "Price" },
  { value: "distance", label: "Distance" },
  { value: "popularity", label: "Most Popular" },
];

export function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  className,
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 10000,
  ]);
  const [radiusValue, setRadiusValue] = useState([filters.radius || 25]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({ query: filters.query });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      minPrice: values[0] > 0 ? values[0] : undefined,
      maxPrice: values[1] < 10000 ? values[1] : undefined,
    });
  };

  const handleRadiusChange = (values: number[]) => {
    setRadiusValue(values);
    updateFilter("radius", values[0]);
  };

  const getActiveFiltersCount = () => {
    const filterKeys = Object.keys(filters).filter(key => 
      key !== "query" && key !== "sortBy" && key !== "sortOrder" && filters[key as keyof SearchFilters]
    );
    return filterKeys.length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Category
        </Label>
        <Select value={filters.category || ""} onValueChange={(value) => updateFilter("category", value || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Type</Label>
        <div className="flex gap-2">
          <Button
            variant={filters.type === "product" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("type", filters.type === "product" ? undefined : "product")}
          >
            Products
          </Button>
          <Button
            variant={filters.type === "service" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("type", filters.type === "service" ? undefined : "service")}
          >
            Services
          </Button>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Price Range
        </Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={10000}
            min={0}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>₦{priceRange[0].toLocaleString()}</span>
                <span>₦{priceRange[1] >= 10000 ? "10,000+" : priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </Label>
        <Input
          placeholder="Enter city or zip code"
          value={filters.location || ""}
          onChange={(e) => updateFilter("location", e.target.value || undefined)}
        />
      </div>

      {/* Radius */}
      {filters.location && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Search Radius</Label>
          <div className="px-2">
            <Slider
              value={radiusValue}
              onValueChange={handleRadiusChange}
              max={100}
              min={1}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1 mile</span>
              <span>{radiusValue[0]} miles</span>
              <span>100+ miles</span>
            </div>
          </div>
        </div>
      )}

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Condition</Label>
        <div className="space-y-2">
          {CONDITIONS.map((condition) => (
            <div key={condition.value} className="flex items-center space-x-2">
              <Checkbox
                id={condition.value}
                checked={filters.condition === condition.value}
                onCheckedChange={(checked) =>
                  updateFilter("condition", checked ? condition.value : undefined)
                }
              />
              <Label htmlFor={condition.value} className="text-sm">
                {condition.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Delivery
        </Label>
        <div className="space-y-2">
          {DELIVERY_TYPES.map((delivery) => (
            <div key={delivery.value} className="flex items-center space-x-2">
              <Checkbox
                id={delivery.value}
                checked={filters.deliveryType === delivery.value}
                onCheckedChange={(checked) =>
                  updateFilter("deliveryType", checked ? delivery.value : undefined)
                }
              />
              <Label htmlFor={delivery.value} className="text-sm">
                {delivery.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select value={filters.sortBy || "createdAt"} onValueChange={(value) => updateFilter("sortBy", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={filters.sortOrder === "asc" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("sortOrder", "asc")}
          >
            Ascending
          </Button>
          <Button
            variant={filters.sortOrder === "desc" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("sortOrder", "desc")}
          >
            Descending
          </Button>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearAllFilters} className="w-full">
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search for products, services..."
            value={filters.query || ""}
            onChange={(e) => updateFilter("query", e.target.value || undefined)}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>
        <Button onClick={onSearch}>Search</Button>
      </div>

      {/* Mobile Filters */}
      <div className="flex items-center justify-between lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <FilterContent />
          </SheetContent>
        </Sheet>

        {/* Quick Sort */}
        <Select value={filters.sortBy || "createdAt"} onValueChange={(value) => updateFilter("sortBy", value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("category")}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("type")}
              />
            </Badge>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ₦{(filters.minPrice || 0).toLocaleString()} - ₦{filters.maxPrice ? filters.maxPrice.toLocaleString() : "10,000+"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  clearFilter("minPrice");
                  clearFilter("maxPrice");
                  setPriceRange([0, 10000]);
                }}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.location} ({filters.radius || 25} miles)
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  clearFilter("location");
                  clearFilter("radius");
                }}
              />
            </Badge>
          )}
          {filters.condition && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {CONDITIONS.find(c => c.value === filters.condition)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("condition")}
              />
            </Badge>
          )}
          {filters.deliveryType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {DELIVERY_TYPES.find(d => d.value === filters.deliveryType)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("deliveryType")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}