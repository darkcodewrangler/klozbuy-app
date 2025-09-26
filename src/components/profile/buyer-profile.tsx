"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingBag,
  Heart,
  Clock,
  Star,
  MapPin,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  Eye,
  MessageSquare,
  Package,
  CreditCard,
  Settings,
  Bell,
  Shield,
  User,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Purchase {
  id: string;
  productTitle: string;
  sellerName: string;
  sellerAvatar: string;
  price: number;
  currency: string;
  purchaseDate: string;
  status: "completed" | "pending" | "cancelled" | "refunded";
  category: string;
  image: string;
  rating?: number;
  reviewText?: string;
}

interface Favorite {
  id: string;
  itemId: string;
  itemType: "product" | "service" | "event";
  title: string;
  price: number;
  currency: string;
  image: string;
  sellerName: string;
  addedDate: string;
  isAvailable: boolean;
}

interface Activity {
  id: string;
  type: "purchase" | "review" | "favorite" | "message" | "view";
  title: string;
  description: string;
  timestamp: string;
  relatedItem?: {
    id: string;
    title: string;
    image: string;
  };
}

interface BuyerStats {
  totalPurchases: number;
  totalSpent: number;
  totalReviews: number;
  averageRating: number;
  favoriteItems: number;
  profileViews: number;
}

interface BuyerPreferences {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  location: {
    city: string;
    state: string;
    radius: number;
  };
  notifications: {
    newListings: boolean;
    priceDrops: boolean;
    messages: boolean;
    reviews: boolean;
  };
}

interface BuyerProfileProps {
  purchases: Purchase[];
  favorites: Favorite[];
  activities: Activity[];
  stats: BuyerStats;
  preferences: BuyerPreferences;
  isOwnProfile: boolean;
}

export function BuyerProfile({
  purchases,
  favorites,
  activities,
  stats,
  preferences,
  isOwnProfile,
}: BuyerProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    trend,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: string;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {value}
              </p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{trend}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PurchaseCard = ({ purchase }: { purchase: Purchase }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={purchase.image || "/placeholder-product.jpg"}
            alt={purchase.productTitle}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {purchase.productTitle}
              </h3>
              <Badge className={getStatusColor(purchase.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(purchase.status)}
                  <span className="capitalize">{purchase.status}</span>
                </div>
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={purchase.sellerAvatar} />
                <AvatarFallback>{purchase.sellerName?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {purchase.sellerName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-600">
                {formatPrice(purchase.price, purchase.currency)}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(purchase.purchaseDate)}
              </span>
            </div>
            {purchase.rating && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < purchase.rating!
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">Your rating</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FavoriteCard = ({ favorite }: { favorite: Favorite }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={favorite.image || "/placeholder-product.jpg"}
          alt={favorite.title}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/80 hover:bg-white"
          >
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
          </Button>
        </div>
        {!favorite.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">No longer available</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {favorite.title}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-green-600">
            {formatPrice(favorite.price, favorite.currency)}
          </span>
          <Badge variant="outline" className="text-xs capitalize">
            {favorite.itemType}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{favorite.sellerName}</span>
          <span>Added {formatDate(favorite.addedDate)}</span>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }: { activity: Activity }) => (
    <div className="flex gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          {activity.type === "purchase" && (
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          )}
          {activity.type === "review" && (
            <Star className="w-4 h-4 text-yellow-600" />
          )}
          {activity.type === "favorite" && (
            <Heart className="w-4 h-4 text-red-600" />
          )}
          {activity.type === "message" && (
            <MessageSquare className="w-4 h-4 text-green-600" />
          )}
          {activity.type === "view" && (
            <Eye className="w-4 h-4 text-purple-600" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          {formatDate(activity.timestamp)}
        </p>
      </div>
      {activity.relatedItem && (
        <div className="flex-shrink-0">
          <img
            src={activity.relatedItem.image}
            alt={activity.relatedItem.title}
            className="w-12 h-12 object-cover rounded"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
          title="Total Purchases"
          value={stats.totalPurchases}
          trend="+3 this month"
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5 text-green-600" />}
          title="Total Spent"
          value={formatPrice(stats.totalSpent, "USD")}
          trend="+12%"
        />
        <StatCard
          icon={<Heart className="w-5 h-5 text-red-600" />}
          title="Favorite Items"
          value={stats.favoriteItems}
          trend="+5 this week"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          icon={<Star className="w-5 h-5 text-yellow-600" />}
          title="Reviews Given"
          value={stats.totalReviews}
          subtitle="Average rating given"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
          title="Profile Views"
          value={stats.profileViews}
          subtitle="This month"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
          title="Activity Score"
          value="92%"
          subtitle="Based on engagement"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.slice(0, 3).map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} />
                ))}
              </div>
              {purchases.length > 3 && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("purchases")}
                  >
                    View All Purchases
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Favorites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Recent Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.slice(0, 3).map((favorite) => (
                  <FavoriteCard key={favorite.id} favorite={favorite} />
                ))}
              </div>
              {favorites.length > 3 && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("favorites")}
                  >
                    View All Favorites
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Purchase History</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Favorite Items</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                  <FavoriteCard key={favorite.id} favorite={favorite} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preferences Section (only for own profile) */}
      {isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Your Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Favorite Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <p className="text-sm text-gray-600">
                  {formatPrice(preferences.priceRange.min, "USD")} -{" "}
                  {formatPrice(preferences.priceRange.max, "USD")}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3">Location Preferences</h4>
                <p className="text-sm text-gray-600">
                  {preferences.location.city}, {preferences.location.state}
                </p>
                <p className="text-xs text-gray-500">
                  Within {preferences.location.radius} miles
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3">Notifications</h4>
                <div className="space-y-1">
                  {Object.entries(preferences.notifications).map(
                    ([key, enabled]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            enabled ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
