"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Clock, Eye, MessageCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ListingResponse } from "@/models/marketplace.model";

interface ListingCardProps {
  listing: ListingResponse;
  onFavoriteToggle?: (listingId: string, isFavorited: boolean) => void;
  className?: string;
  showSeller?: boolean;
  compact?: boolean;
}

export function ListingCard({
  listing,
  onFavoriteToggle,
  className,
  showSeller = true,
  compact = false,
}: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    onFavoriteToggle?.(listing.id, newFavoriteState);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const listingDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - listingDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const primaryImage = listing.media?.[0]?.url || "/placeholder.svg";

  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300", className)}>
      <Link href={`/marketplace/listings/${listing.id}`}>
        <div className="relative">
          {/* Image */}
          <div className={cn("relative overflow-hidden bg-gray-100", compact ? "h-40" : "h-48")}>
            <Image
              src={imageError ? "/placeholder.svg" : primaryImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
            
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white backdrop-blur-sm"
              onClick={handleFavoriteClick}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                )}
              />
            </Button>

            {/* Status Badge */}
            {listing.status !== "active" && (
              <Badge
                variant={listing.status === "sold" ? "destructive" : "secondary"}
                className="absolute top-2 left-2"
              >
                {listing.status}
              </Badge>
            )}

            {/* Condition Badge */}
            {listing.condition && (
              <Badge
                variant="outline"
                className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm"
              >
                {listing.condition}
              </Badge>
            )}

            {/* Media Count */}
            {listing.media && listing.media.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                +{listing.media.length - 1}
              </div>
            )}
          </div>

          <CardContent className={cn("p-3", compact && "p-2")}>
            {/* Title and Price */}
            <div className="space-y-1">
              <h3 className={cn(
                "font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors",
                compact ? "text-sm" : "text-base"
              )}>
                {listing.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className={cn(
                  "font-bold text-green-600",
                  compact ? "text-lg" : "text-xl"
                )}>
                  {listing.priceType === "fixed" 
                    ? formatPrice(listing.price)
                    : listing.priceType === "negotiable"
                    ? `${formatPrice(listing.price)} (OBO)`
                    : "Price on request"
                  }
                </span>
                
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(listing.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Location and Time */}
            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {listing.location?.city || "Location not specified"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(listing.createdAt)}</span>
              </div>
            </div>

            {/* Seller Info */}
            {showSeller && listing.seller && !compact && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={listing.seller.profilePictureUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {listing.seller.firstName?.[0] || listing.seller.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {listing.seller.firstName 
                      ? `${listing.seller.firstName} ${listing.seller.lastName || ""}`
                      : listing.seller.username
                    }
                  </p>
                  {listing.seller.businessProfile && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs text-gray-500">
                        {listing.seller.businessProfile.averageRating?.toFixed(1) || "New"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            {!compact && (
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{listing.viewCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{listing.inquiryCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{listing.favoriteCount || 0}</span>
                </div>
              </div>
            )}

            {/* Delivery Type */}
            {listing.deliveryType && (
              <Badge variant="outline" className="mt-2 text-xs">
                {listing.deliveryType === "pickup" ? "Pickup only" : 
                 listing.deliveryType === "delivery" ? "Delivery available" : 
                 "Pickup & Delivery"}
              </Badge>
            )}
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}