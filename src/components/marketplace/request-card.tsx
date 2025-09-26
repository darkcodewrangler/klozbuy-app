"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Clock, Eye, MessageCircle, Star, DollarSign, User, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { RequestResponse } from "@/models/marketplace.model";
import { LocationBadge } from "@/components/shared/location-badge";
import { useAuth } from "@/hooks/useAuth";

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    category: string;
    budgetMin?: number;
    budgetMax?: number;
    budgetType: "fixed" | "negotiable" | "hourly" | "contact";
    urgency: "low" | "medium" | "high" | "urgent";
    status: "active" | "in_progress" | "completed" | "cancelled";
    location?: {
      id: string;
      name: string;
      city?: string;
      state?: string;
    };
    user: {
      id: string;
      name: string;
      avatar?: string;
      verified?: boolean;
    };
    responseCount: number;
    createdAt: string;
    expiresAt?: string;
    tags?: string[];
  };
  onRespond?: (requestId: string) => void;
  onViewDetails?: (requestId: string) => void;
  onViewProfile?: (userId: string) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

const URGENCY_CONFIG = {
  low: { color: "bg-green-100 text-green-800", label: "Low Priority" },
  medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium Priority" },
  high: { color: "bg-orange-100 text-orange-800", label: "High Priority" },
  urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
};

const STATUS_CONFIG = {
  active: { color: "bg-blue-100 text-blue-800", label: "Active" },
  in_progress: { color: "bg-purple-100 text-purple-800", label: "In Progress" },
  completed: { color: "bg-green-100 text-green-800", label: "Completed" },
  cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
};

export function RequestCard({
  request,
  onRespond,
  onViewDetails,
  onViewProfile,
  compact = false,
  showActions = true,
  className,
}: RequestCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  
  const currentUserId = user?.id;
  const isFavoriteUser = false; // TODO: Implement favorite user logic

  const formatBudget = () => {
    if (request.budgetType === "contact") return "Contact for pricing";
    
    const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
    
    if (request.budgetMin && request.budgetMax) {
      if (request.budgetMin === request.budgetMax) {
        return `${formatPrice(request.budgetMin)}${request.budgetType === "hourly" ? "/hr" : ""}`;
      }
      return `${formatPrice(request.budgetMin)} - ${formatPrice(request.budgetMax)}${request.budgetType === "hourly" ? "/hr" : ""}`;
    }
    
    if (request.budgetMin) {
      return `From ${formatPrice(request.budgetMin)}${request.budgetType === "hourly" ? "/hr" : ""}`;
    }
    
    if (request.budgetMax) {
      return `Up to ${formatPrice(request.budgetMax)}${request.budgetType === "hourly" ? "/hr" : ""}`;
    }
    
    return "Budget negotiable";
  };

  const isExpiringSoon = () => {
    if (!request.expiresAt) return false;
    const expiryDate = new Date(request.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  const isExpired = () => {
    if (!request.expiresAt) return false;
    return new Date(request.expiresAt) < new Date();
  };

  const urgencyConfig = URGENCY_CONFIG[request.urgency];
  const statusConfig = STATUS_CONFIG[request.status];

  return (
    <Card 
      className={cn(
        "group hover:shadow-md transition-all duration-200 cursor-pointer",
        compact && "p-3",
        isExpired() && "opacity-60",
        className
      )}
      onClick={() => onViewDetails?.(request.id)}
    >
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {request.category}
              </Badge>
              <Badge className={cn("text-xs", urgencyConfig.color)}>
                {urgencyConfig.label}
              </Badge>
              <Badge className={cn("text-xs", statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              {isExpiringSoon() && (
                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Expires Soon
                </Badge>
              )}
            </div>
            
            <h3 className={cn(
              "font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors",
              compact ? "text-sm" : "text-base"
            )}>
              {request.title}
            </h3>
            
            {!compact && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {request.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("pt-0", compact && "pt-0")}>
        <div className="space-y-3">
          {/* Budget */}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-700">
              {formatBudget()}
            </span>
            {request.budgetType === "negotiable" && (
              <Badge variant="outline" className="text-xs">
                Negotiable
              </Badge>
            )}
          </div>

          {/* Location */}
          {request.location && (
            <LocationBadge 
              location={request.location}
              isOwner={request.user?.id === currentUserId}
              isFavoriteUser={isFavoriteUser}
              className="text-gray-600"
            />
          )}

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile?.(request.user.id);
              }}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={!imageError ? request.user.avatar : undefined} 
                  onError={() => setImageError(true)}
                />
                <AvatarFallback className="text-xs">
                  {request.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {request.user.name}
              </span>
              {request.user.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {request.tags && request.tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1">
              {request.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {request.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{request.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{request.responseCount} responses</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
              </div>
              {request.expiresAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Expires {formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {showActions && request.status === "active" && !isExpired() && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRespond?.(request.id);
                }}
                className="text-xs"
              >
                Respond
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}