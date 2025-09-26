"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Package,
  Calendar,
  Briefcase,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Users,
  ShoppingBag,
  Search,
  Plus,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category: string;
  images: string[];
  status: string;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  location: {
    city: string;
    state: string;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  currentAttendees: number;
  ticketPrice?: number;
  isTicketRequired: boolean;
  category: string;
  images: string[];
  location: {
    city: string;
    state: string;
  };
}

interface Service {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  priceType: string;
  price: number;
  currency: string;
  duration: string;
  availability: any;
  serviceVenue: string;
  experienceYears: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
}

interface SellerStats {
  totalProducts: number;
  totalEvents: number;
  totalServices: number;
  totalViews: number;
  totalSales: number;
  averageRating: number;
  responseRate: number;
  responseTime: string;
}

interface SellerProfileProps {
  products: Product[];
  events: Event[];
  services: Service[];
  stats: SellerStats;
  isOwnProfile: boolean;
  className?: string;
}

export function SellerProfile({
  products,
  events,
  services,
  stats,
  isOwnProfile,
  className
}: SellerProfileProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={product.images[0] || "/placeholder-product.jpg"}
          alt={product.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Badge
          variant={product.status === "active" ? "default" : "secondary"}
          className="absolute top-2 right-2"
        >
          {product.status}
        </Badge>
        {product.condition && (
          <Badge variant="outline" className="absolute top-2 left-2 bg-white/90">
            {product.condition}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          <div className="text-right">
            <p className="font-bold text-lg text-green-600">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{product.location.city}, {product.location.state}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{product.viewsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{product.favoritesCount}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatDate(product.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={event.images[0] || "/placeholder-event.jpg"}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2 bg-white/90 rounded-lg p-2">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {new Date(event.startDate).getDate()}
            </div>
            <div className="text-xs text-gray-600">
              {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {event.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{event.currentAttendees}/{event.capacity} attendees</span>
          </div>
          {event.isTicketRequired && event.ticketPrice && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-green-600">
                {formatPrice(event.ticketPrice, "USD")}
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t">
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={service.images[0] || "/placeholder-service.jpg"}
          alt={service.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90">
          {service.serviceVenue}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {service.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {service.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{service.rating.toFixed(1)}</span>
            <span className="text-gray-600 text-sm">({service.reviewsCount})</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-green-600">
              {formatPrice(service.price, service.currency)}
              <span className="text-sm text-gray-500 font-normal">
                /{service.priceType === "hourly" ? "hr" : service.priceType}
              </span>
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{service.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>{service.experienceYears} years experience</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <Badge variant="outline" className="text-xs">
            {service.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const StatsCard = ({ icon, title, value, subtitle }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-600">{title}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<Package className="w-5 h-5" />}
          title="Products"
          value={stats.totalProducts}
        />
        <StatsCard
          icon={<Calendar className="w-5 h-5" />}
          title="Events"
          value={stats.totalEvents}
        />
        <StatsCard
          icon={<Briefcase className="w-5 h-5" />}
          title="Services"
          value={stats.totalServices}
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
        />
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalSales}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.responseTime}</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Services ({services.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="products">
          {products.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-600 mb-4">Start selling by adding your first product.</p>
                {isOwnProfile && (
                  <Button>
                    <Package className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events">
          {events.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-4">Create your first event to engage with your community.</p>
                {isOwnProfile && (
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services">
          {services.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}>
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
                <p className="text-gray-600 mb-4">Offer your skills and expertise as services.</p>
                {isOwnProfile && (
                  <Button>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}