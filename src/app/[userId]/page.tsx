import { ProfileLayout } from "@/components/profile/profile-layout";
import { SellerProfile } from "@/components/profile/seller-profile";
import { BuyerProfile } from "@/components/profile/buyer-profile";
// import { getStoredUser } from "@/lib/auth";
import { getStoredPostsByUsername, getStoredUser } from "@/lib/store/posts";
import Layout from "@/components/layouts/layout";
import { Metadata } from "next";
import {
  Package,
  Calendar,
  Briefcase,
  ShoppingBag,
  Heart,
  Clock,
  Star,
  User,
  MessageSquare,
} from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await getStoredUser(userId);

  if (!user) {
    return {
      title: "User Not Found",
      description: "The requested user profile could not be found.",
    };
  }

  const displayName =
    user.type === "business" && user.businessProfile?.businessName
      ? user.businessProfile.businessName
      : user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;

  return {
    title: `${displayName} - Profile`,
    description:
      user.bio ||
      `View ${displayName}'s profile and ${
        user.type === "business" ? "business offerings" : "activity"
      }.`,
  };
}

// Mock data - In a real app, these would come from API calls
const getMockSellerData = () => ({
  products: [
    {
      id: "1",
      title: "Vintage Leather Jacket",
      description: "Authentic vintage leather jacket in excellent condition",
      price: 150,
      currency: "USD",
      condition: "Used - Excellent",
      category: "Fashion",
      images: ["/placeholder-product.jpg"],
      status: "active",
      viewsCount: 245,
      favoritesCount: 18,
      createdAt: "2024-01-15",
      location: { city: "Lagos", state: "Lagos" },
    },
  ],
  events: [
    {
      id: "1",
      title: "Tech Meetup Lagos",
      description: "Monthly tech meetup for developers and entrepreneurs",
      startDate: "2024-02-15",
      endDate: "2024-02-15",
      venue: "Tech Hub Lagos",
      capacity: 100,
      currentAttendees: 45,
      ticketPrice: 5000,
      isTicketRequired: true,
      category: "Technology",
      images: ["/placeholder-event.jpg"],
      location: { city: "Lagos", state: "Lagos" },
    },
  ],
  services: [
    {
      id: "1",
      title: "Web Development Services",
      description: "Full-stack web development using modern technologies",
      serviceType: "development",
      priceType: "hourly",
      price: 50,
      currency: "USD",
      duration: "Flexible",
      availability: {},
      serviceVenue: "remote",
      experienceYears: 5,
      category: "Technology",
      images: ["/placeholder-service.jpg"],
      rating: 4.8,
      reviewsCount: 24,
    },
  ],
  stats: {
    totalProducts: 12,
    totalEvents: 3,
    totalServices: 8,
    totalViews: 1250,
    totalSales: 45,
    averageRating: 4.7,
    responseRate: 95,
    responseTime: "2 hours",
  },
});

const getMockBuyerData = () => ({
  purchases: [
    {
      id: "1",
      title: "Wireless Headphones",
      seller: {
        id: "seller1",
        username: "techstore",
        firstName: "Tech",
        lastName: "Store",
        profilePictureUrl: "/placeholder-avatar.jpg",
        isVerified: true,
      },
      price: 89.99,
      currency: "USD",
      status: "delivered" as const,
      purchaseDate: "2024-01-10",
      deliveryDate: "2024-01-15",
      image: "/placeholder-product.jpg",
      category: "Electronics",
      rating: 5,
      review: "Great quality headphones!",
    },
  ],
  favorites: [
    {
      id: "1",
      listing: {
        id: "listing1",
        title: "Vintage Camera",
        price: 299,
        currency: "USD",
        image: "/placeholder-product.jpg",
        seller: {
          username: "photographer",
          isVerified: true,
        },
        status: "active",
        location: {
          city: "Lagos",
          state: "Lagos",
        },
      },
      createdAt: "2024-01-20",
    },
  ],
  activities: [
    {
      id: "1",
      type: "purchase" as const,
      title: "Purchased Wireless Headphones",
      description: "Successfully purchased wireless headphones from Tech Store",
      timestamp: "2024-01-10",
    },
  ],
  stats: {
    totalPurchases: 15,
    totalSpent: 1250.5,
    totalFavorites: 8,
    totalReviews: 12,
    averageRating: 4.5,
    memberSince: "2023-06-15",
  },
  preferences: {
    categories: ["Electronics", "Fashion", "Books"],
    priceRange: { min: 10, max: 500 },
    location: { radius: 25, city: "Lagos", state: "Lagos" },
    notifications: {
      newListings: true,
      priceDrops: true,
      messages: true,
      recommendations: false,
    },
  },
});

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { userId } = await params;
  const user = await getStoredUser(userId);
  const posts = await getStoredPostsByUsername(user?.username || "");

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              User Not Found
            </h1>
            <p className="text-gray-600">
              The requested user profile could not be found.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Determine if this is the current user's profile (mock implementation)
  const isOwnProfile = true; // In real app, compare with current user ID

  // Get profile data based on user type
  const sellerData = user.type === "business" ? getMockSellerData() : null;
  const buyerData = getMockBuyerData();

  // Define tabs based on user type
  const getProfileTabs = () => {
    if (user.type === "business") {
      return [
        {
          id: "overview",
          label: "Overview",
          icon: <User className="w-4 h-4" />,
        },
        {
          id: "products",
          label: "Products",
          icon: <Package className="w-4 h-4" />,
          count: sellerData?.stats.totalProducts,
        },
        {
          id: "events",
          label: "Events",
          icon: <Calendar className="w-4 h-4" />,
          count: sellerData?.stats.totalEvents,
        },
        {
          id: "services",
          label: "Services",
          icon: <Briefcase className="w-4 h-4" />,
          count: sellerData?.stats.totalServices,
        },
        { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
        {
          id: "about",
          label: "About",
          icon: <MessageSquare className="w-4 h-4" />,
        },
      ];
    } else {
      return [
        {
          id: "overview",
          label: "Overview",
          icon: <User className="w-4 h-4" />,
        },
        {
          id: "purchases",
          label: "Purchases",
          icon: <ShoppingBag className="w-4 h-4" />,
          count: buyerData.stats.totalPurchases,
        },
        {
          id: "favorites",
          label: "Favorites",
          icon: <Heart className="w-4 h-4" />,
          count: buyerData.stats.totalFavorites,
        },
        {
          id: "activity",
          label: "Activity",
          icon: <Clock className="w-4 h-4" />,
        },
        {
          id: "about",
          label: "About",
          icon: <MessageSquare className="w-4 h-4" />,
        },
      ];
    }
  };

  return (
    <Layout>
      <ProfileLayout
        user={user}
        isOwnProfile={isOwnProfile}
        activeTab="overview"
        // onTabChange={() => {}}
        tabs={getProfileTabs()}
      >
        <TabsContent value="overview">
          {user.type === "business" && sellerData ? (
            <SellerProfile
              products={sellerData.products}
              events={sellerData.events}
              services={sellerData.services}
              stats={sellerData.stats}
              isOwnProfile={isOwnProfile}
            />
          ) : (
            <BuyerProfile
              purchases={buyerData.purchases}
              favorites={buyerData.favorites}
              activities={buyerData.activities}
              stats={buyerData.stats}
              preferences={buyerData.preferences}
              isOwnProfile={isOwnProfile}
            />
          )}
        </TabsContent>

        {user.type === "business" && sellerData && (
          <>
            <TabsContent value="products">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sellerData.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border p-4"
                  >
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-green-600 font-bold">${product.price}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="events">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerData.events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-sm border p-4"
                  >
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="services">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerData.services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg shadow-sm border p-4"
                  >
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="text-green-600 font-bold">
                      ${service.price}/hr
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </>
        )}

        <TabsContent value="about">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-600">{user.bio || "No bio available."}</p>
          </div>
        </TabsContent>
      </ProfileLayout>
    </Layout>
  );
}
