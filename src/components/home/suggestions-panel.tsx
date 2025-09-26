import React from "react";
import { Store, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/shared/user-avatar";
import LocationBadge from "@/components/shared/location-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import UserName from "../shared/user-name";
import { LinkBox } from "../ui/link-box";
import { LinkOverlay } from "../ui/link-overlay";

// Sample data - would come from API in real app
const sampleBusinesses = [
  {
    id: "201",
    name: "Mama's Kitchen",
    type: "restaurant",
    distance: 1.2,
    isVerified: true,
    avatar: "",
  },
  {
    id: "202",
    name: "Smart Electronics",
    type: "electronics",
    distance: 2.5,
    isVerified: false,
    avatar: "",
  },
  {
    id: "203",
    name: "Fashion Palace",
    type: "clothing",
    distance: 3.7,
    isVerified: true,
    avatar: "",
  },
  {
    id: "204",
    name: "Green Grocers",
    type: "grocery",
    distance: 1.8,
    isVerified: false,
    avatar: "",
  },
];

// Sample ad data
const sampleAd = {
  id: 1,
  advertiserName: "MTN Nigeria",
  title: "New Data Plans",
  description:
    "Get more value with our new data bundles! Enjoy high-speed internet at affordable prices.",
  imageUrl:
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9iaWxlJTIwaW50ZXJuZXR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  link: "https://example.com",
};

interface SuggestionsPanelProps {
  className?: string;
}

const SuggestionsPanel = ({ className }: SuggestionsPanelProps) => {
  return (
    <div className={cn("hidden xl:flex flex-col gap-4 w-full", className)}>
      {/* Nearby Businesses */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-2 px-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Nearby Businesses</span>
            <Link
              href="/search"
              className="text-sm font-normal text-klozui-green-600 flex items-center hover:underline"
            >
              See all <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-1">
            {sampleBusinesses.map((business) => (
              <LinkBox
                key={business.id}
                className="flex items-center gap-3 px-4 py-2 rounded-lg "
              >
                <LinkOverlay href={`/business/${business.id}`} />
                <UserAvatar
                  name={business.name}
                  size="sm"
                  userType="business"
                  src={business.avatar}
                />
                <div className="flex-1 min-w-0">
                  <UserName
                    id={business.id}
                    name={business.name}
                    isVerified={business.isVerified}
                  />
                  <div className="text-xs text-muted-foreground group-hover:z-10 relative inline-block capitalize">
                    {business.type}
                  </div>
                </div>
                <LocationBadge
                  distance={business.distance}
                  size="sm"
                  variant="outline"
                />
              </LinkBox>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="sticky top-16 lg:flex flex-col gap-4 ">
        {/* Create Business Card */}
        <Card className="bg-gradient-to-br from-klozui-green-600/90 to-klozui-green-600 text-white animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="bg-white/20 p-3 rounded-full">
                <Store size={24} />
              </div>
              <h3 className="font-semibold text-lg">Grow Your Business</h3>
              <p className="text-sm text-white/85">
                Create a business profile to reach more customers in your area
              </p>
              <Link href="/onboarding?type=business">
                <Button className="mt-1 bg-white text-klozui-green-600 hover:bg-white/90 hover:text-klozui-green-600">
                  Create Business
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sponsored Ad */}
        <Card className="overflow-hidden border animate-fade-in">
          <div className="relative">
            <img
              src={sampleAd.imageUrl}
              alt={sampleAd.title}
              className="w-full h-32 object-cover"
            />
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full">
              Sponsored
            </div>
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium text-base">{sampleAd.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {sampleAd.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full border-klozui-green-600 text-klozui-green-600 hover:bg-klozui-green-600/5"
            >
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuggestionsPanel;
