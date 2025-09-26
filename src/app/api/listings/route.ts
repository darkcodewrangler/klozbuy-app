import { NextRequest, NextResponse } from "next/server";
import { ListingController } from "@/controllers/marketplace.controller";
import { CreateListingSchema, ListingSearchSchema } from "@/models/marketplace.model";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const searchData = {
      query: searchParams.get("query") || undefined,
      category: searchParams.get("category") || undefined,
      type: searchParams.get("type") || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      location: searchParams.get("location") || undefined,
      radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")!) : undefined,
      condition: searchParams.get("condition") || undefined,
      deliveryType: searchParams.get("deliveryType") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    };

    // Validate search parameters
    const validatedSearch = ListingSearchSchema.parse(searchData);
    
    const result = await ListingController.searchListings(validatedSearch);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching listings:", error);
    return NextResponse.json(
      { error: "Failed to search listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateListingSchema.parse({
      ...body,
      sellerId: session.user.id,
    });

    const listing = await ListingController.createListing(validatedData);
    
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}