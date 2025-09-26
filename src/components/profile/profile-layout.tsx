"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Shield,
  ExternalLink,
  Phone,
  Mail,
  Globe
} from "lucide-react";

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  website?: string;
  type: "individual" | "business";
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
  businessProfile?: {
    businessName?: string;
    businessType?: string;
    businessDescription?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessWebsite?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

interface ProfileTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface ProfileLayoutProps {
  user: User;
  isOwnProfile: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: ProfileTab[];
  children: React.ReactNode;
}

export function ProfileLayout({
  user,
  isOwnProfile,
  activeTab,
  onTabChange,
  tabs,
  children
}: ProfileLayoutProps) {
  const displayName = user.type === "business" && user.businessProfile?.businessName
    ? user.businessProfile.businessName
    : user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    });
  };

  const formatLocation = () => {
    if (!user.location) return null;
    const { city, state, country } = user.location;
    const parts = [city, state, country].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        {user.coverImageUrl ? (
          <img
            src={user.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Header */}
      <div className="relative -mt-16 sm:-mt-20 lg:-mt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user.profilePictureUrl} alt={displayName} />
                    <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                        {displayName}
                      </h1>
                      <p className="text-gray-600 text-sm sm:text-base">@{user.username}</p>
                      
                      {/* Business Type Badge */}
                      {user.type === "business" && user.businessProfile?.businessType && (
                        <Badge variant="secondary" className="mt-2">
                          {user.businessProfile.businessType}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isOwnProfile ? (
                        <Button variant="outline" size="sm">
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            Follow
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="mt-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {formatLocation() && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatLocation()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Business Contact Info */}
                  {user.type === "business" && user.businessProfile && (
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {user.businessProfile.businessPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{user.businessProfile.businessPhone}</span>
                        </div>
                      )}
                      {user.businessProfile.businessEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.businessProfile.businessEmail}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    {user.followersCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{user.followersCount.toLocaleString()}</span>
                        <span className="text-gray-600">followers</span>
                      </div>
                    )}
                    {user.followingCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{user.followingCount.toLocaleString()}</span>
                        <span className="text-gray-600">following</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent border-0 w-full justify-start overflow-x-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 hover:text-gray-900 transition-colors rounded-none bg-transparent"
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.count !== undefined && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          {children}
        </Tabs>
      </div>
    </div>
  );
}