import { NextRequest, NextResponse } from "next/server";
import { MarketplaceService } from "@/services/marketplace.service";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;
    const type = searchParams.get("type") as "location" | "preference" | "trending" | undefined;

    let recommendations;

    switch (type) {
      case "location":
        recommendations = await MarketplaceService.getLocationBasedRecommendations(
          session.user.id,
          limit
        );
        break;
      case "preference":
        recommendations = await MarketplaceService.getPreferenceBasedRecommendations(
          session.user.id,
          limit
        );
        break;
      case "trending":
        recommendations = await MarketplaceService.getTrendingListings(limit);
        break;
      default:
        // Get mixed recommendations
        const locationRecs = await MarketplaceService.getLocationBasedRecommendations(
          session.user.id,
          Math.floor(limit / 2)
        );
        const preferenceRecs = await MarketplaceService.getPreferenceBasedRecommendations(
          session.user.id,
          Math.floor(limit / 2)
        );
        
        // Combine and shuffle recommendations
        recommendations = [...locationRecs, ...preferenceRecs]
          .sort(() => Math.random() - 0.5)
          .slice(0, limit);
        break;
    }
    
    return NextResponse.json({
      recommendations,
      type: type || "mixed",
      count: recommendations.length,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}