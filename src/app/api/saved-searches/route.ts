import { NextRequest, NextResponse } from "next/server";
import { SavedSearchController } from "@/controllers/marketplace.controller";
import { CreateSavedSearchSchema } from "@/models/marketplace.model";
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

    const savedSearches = await SavedSearchController.getUserSavedSearches(
      session.user.id
    );
    
    return NextResponse.json(savedSearches);
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved searches" },
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
    const validatedData = CreateSavedSearchSchema.parse({
      ...body,
      userId: session.user.id,
    });

    const savedSearch = await SavedSearchController.createSavedSearch(validatedData);
    
    return NextResponse.json(savedSearch, { status: 201 });
  } catch (error) {
    console.error("Error creating saved search:", error);
    return NextResponse.json(
      { error: "Failed to create saved search" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("id");

    if (!searchId) {
      return NextResponse.json(
        { error: "Search ID is required" },
        { status: 400 }
      );
    }

    const success = await SavedSearchController.deleteSavedSearch(
      searchId,
      session.user.id
    );
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete saved search" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: "Saved search deleted successfully" });
  } catch (error) {
    console.error("Error deleting saved search:", error);
    return NextResponse.json(
      { error: "Failed to delete saved search" },
      { status: 500 }
    );
  }
}