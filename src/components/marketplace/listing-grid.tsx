"use client";

import { useState } from "react";
import { ListingCard } from "./listing-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Grid, List, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingResponse } from "@/models/marketplace.model";

interface ListingGridProps {
  listings: ListingResponse[];
  loading?: boolean;
  error?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onFavoriteToggle?: (listingId: string, isFavorited: boolean) => void;
  onRefresh?: () => void;
  className?: string;
  showSeller?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

type ViewMode = "grid" | "list";

export function ListingGrid({
  listings,
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  onFavoriteToggle,
  onRefresh,
  className,
  showSeller = true,
  emptyMessage = "No listings found",
  emptyDescription = "Try adjusting your search criteria or check back later for new listings.",
}: ListingGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const LoadingSkeleton = () => (
    <div className={cn(
      "grid gap-4",
      viewMode === "grid" 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
        : "grid-cols-1"
    )}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className={cn("w-full", viewMode === "grid" ? "h-48" : "h-32")} />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Grid className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
      <p className="text-gray-500 mb-4 max-w-md">{emptyDescription}</p>
      {onRefresh && (
        <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      )}
    </div>
  );

  const ErrorState = () => (
    <Alert variant="destructive">
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );

  if (error) {
    return <ErrorState />;
  }

  if (loading && listings.length === 0) {
    return <LoadingSkeleton />;
  }

  if (!loading && listings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </Button>
          )}
          
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className={cn(
        "grid gap-4",
        viewMode === "grid" 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1"
      )}>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onFavoriteToggle={onFavoriteToggle}
            showSeller={showSeller}
            compact={viewMode === "list"}
            className={cn(
              viewMode === "list" && "flex-row max-w-none"
            )}
          />
        ))}
      </div>

      {/* Loading More */}
      {loading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="space-y-3">
              <Skeleton className="w-full h-48" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && onLoadMore && !loading && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && listings.length > 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          You've reached the end of the results
        </div>
      )}
    </div>
  );
}