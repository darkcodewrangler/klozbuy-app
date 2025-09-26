"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Eye, 
  MessageCircle, 
  Shield, 
  Truck,
  Star,
  Flag,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// Mock data - in real implementation, this would come from API
const mockListing = {
  id: "1",
  title: "MacBook Pro 16-inch M2 - Excellent Condition",
  description: `Selling my MacBook Pro 16-inch with M2 chip in excellent condition. This laptop has been my daily driver for development work but I'm upgrading to the newer model.

**Specifications:**
- Apple M2 chip with 10-core CPU and 16-core GPU
- 16GB unified memory
- 512GB SSD storage
- 16-inch Liquid Retina XDR display
- 1080p FaceTime HD camera
- Six-speaker sound system with force-cancelling woofers
- Studio-quality three-microphone array

**What's Included:**
- MacBook Pro 16-inch
- Original MagSafe 3 charging cable
- 140W USB-C Power Adapter
- Original box and documentation
- Screen protector (already applied)
- Laptop sleeve

**Condition Notes:**
- No scratches or dents on the body
- Screen is pristine with screen protector
- Battery health at 94%
- All ports and features working perfectly
- Non-smoking household

Perfect for developers, designers, video editors, or anyone who needs a powerful laptop. Reason for selling: upgrading to newer model for work requirements.`,
  price: 2200,
  originalPrice: 2499,
  priceType: "fixed" as const,
  category: "Electronics",
  condition: "like_new" as const,
  images: [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
  ],
  location: { 
    id: "1", 
    name: "Manhattan", 
    city: "New York", 
    state: "NY",
    address: "Upper West Side, Manhattan, NY"
  },
  seller: { 
    id: "1", 
    name: "John Doe", 
    avatar: "/api/placeholder/100/100", 
    rating: 4.8, 
    verified: true,
    memberSince: "2022-03-15",
    responseTime: "Usually responds within 2 hours",
    completedSales: 23,
    bio: "Tech enthusiast and software developer. I take great care of my electronics and provide detailed descriptions of all items."
  },
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-16T14:30:00Z",
  viewCount: 156,
  favoriteCount: 23,
  deliveryType: "both" as const,
  deliveryFee: 25,
  deliveryRadius: 15,
  tags: ["laptop", "apple", "m2", "professional", "development"],
  status: "active" as const,
  visibility: "public" as const,
};

const mockSimilarListings = [
  {
    id: "2",
    title: "MacBook Air M2 13-inch",
    price: 1100,
    image: "/api/placeholder/200/150",
    condition: "good",
    location: "Brooklyn, NY",
  },
  {
    id: "3",
    title: "MacBook Pro 14-inch M1 Pro",
    price: 1800,
    image: "/api/placeholder/200/150",
    condition: "like_new",
    location: "Queens, NY",
  },
  {
    id: "4",
    title: "iMac 24-inch M1",
    price: 1300,
    image: "/api/placeholder/200/150",
    condition: "excellent",
    location: "Manhattan, NY",
  },
];

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState(mockListing);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // In real implementation, fetch listing data
    // fetchListing(params.id);
  }, [params.id]);

  const handleFavoriteToggle = async () => {
    try {
      setIsFavorited(!isFavorited);
      // API call to toggle favorite
      toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      setIsFavorited(!isFavorited);
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing.title,
        text: `Check out this ${listing.category.toLowerCase()} on Marketplace`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleContactSeller = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      // API call to send message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success("Message sent to seller");
      setShowContactForm(false);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const discountPercentage = listing.originalPrice 
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to listings
            </button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavoriteToggle}
                className={cn(
                  "flex items-center gap-2",
                  isFavorited && "text-red-600 border-red-200"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
                {isFavorited ? "Favorited" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-t-lg cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                  
                  {listing.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {listing.images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {listing.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        className={cn(
                          "w-16 h-16 object-cover rounded cursor-pointer border-2 transition-all",
                          index === currentImageIndex 
                            ? "border-blue-500" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{listing.category}</Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {listing.condition.replace("_", " ")}
                      </Badge>
                      {listing.status === "active" && (
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(listing.price)}
                  </div>
                  {listing.originalPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(listing.originalPrice)}
                      </span>
                      <Badge variant="destructive">
                        {discountPercentage}% off
                      </Badge>
                    </div>
                  )}
                  {listing.priceType === "negotiable" && (
                    <Badge variant="outline">Negotiable</Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{listing.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{listing.favoriteCount} favorites</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Listed {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <div className="prose prose-sm max-w-none">
                    {listing.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {listing.tags && listing.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location & Delivery */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Location & Delivery</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{listing.location.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span>
                        {listing.deliveryType === "both" && "Pickup or delivery available"}
                        {listing.deliveryType === "pickup" && "Pickup only"}
                        {listing.deliveryType === "delivery" && "Delivery available"}
                      </span>
                    </div>

                    {listing.deliveryFee && (
                      <div className="text-sm text-gray-600">
                        Delivery fee: {formatPrice(listing.deliveryFee)}
                        {listing.deliveryRadius && ` (within ${listing.deliveryRadius} miles)`}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.seller.avatar} />
                    <AvatarFallback>
                      {listing.seller.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{listing.seller.name}</h4>
                      {listing.seller.verified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{listing.seller.rating}</span>
                      <span>({listing.seller.completedSales} sales)</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Member since {new Date(listing.seller.memberSince).getFullYear()}</p>
                  <p>{listing.seller.responseTime}</p>
                </div>

                {listing.seller.bio && (
                  <p className="text-sm text-gray-700">{listing.seller.bio}</p>
                )}

                <div className="space-y-2">
                  <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">Contact {listing.seller.name}</h3>
                          <p className="text-sm text-gray-600">
                            Send a message about "{listing.title}"
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Hi, I'm interested in your listing..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleContactSeller}
                            disabled={loading}
                            className="flex-1"
                          >
                            {loading ? "Sending..." : "Send Message"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowContactForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/profile/${listing.seller.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Stay safe:</strong> Meet in public places, inspect items before payment, 
                and use secure payment methods. Never share personal financial information.
              </AlertDescription>
            </Alert>

            {/* Similar Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Listings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSimilarListings.map((similar) => (
                  <div 
                    key={similar.id}
                    className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => router.push(`/marketplace/listings/${similar.id}`)}
                  >
                    <img
                      src={similar.image}
                      alt={similar.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{similar.title}</h4>
                      <p className="text-sm text-green-600 font-semibold">
                        {formatPrice(similar.price)}
                      </p>
                      <p className="text-xs text-gray-500">{similar.location}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <div className="relative w-full h-full">
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-contain"
            />
            
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
              onClick={() => setShowImageModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {listing.images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}