import { NextRequest, NextResponse } from "next/server";
import { ListingController } from "@/controllers/marketplace.controller";
import { UpdateListingSchema } from "@/models/marketplace.model";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const listing = await ListingController.getListingById(params.id);
    
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user owns the listing
    const existingListing = await ListingController.getListingById(params.id);
    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this listing" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateListingSchema.parse(body);

    const updatedListing = await ListingController.updateListing(
      params.id,
      validatedData
    );
    
    if (!updatedListing) {
      return NextResponse.json(
        { error: "Failed to update listing" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user owns the listing
    const existingListing = await ListingController.getListingById(params.id);
    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this listing" },
        { status: 403 }
      );
    }

    const success = await ListingController.deleteListing(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete listing" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}