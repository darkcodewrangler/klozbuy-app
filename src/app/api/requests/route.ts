import { NextRequest, NextResponse } from "next/server";
import { RequestController } from "@/controllers/marketplace.controller";
import { CreateRequestSchema, RequestSearchSchema } from "@/models/marketplace.model";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const searchData = {
      query: searchParams.get("query") || undefined,
      category: searchParams.get("category") || undefined,
      minBudget: searchParams.get("minBudget") ? parseFloat(searchParams.get("minBudget")!) : undefined,
      maxBudget: searchParams.get("maxBudget") ? parseFloat(searchParams.get("maxBudget")!) : undefined,
      location: searchParams.get("location") || undefined,
      radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")!) : undefined,
      urgency: searchParams.get("urgency") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    };

    // Validate search parameters
    const validatedSearch = RequestSearchSchema.parse(searchData);
    
    const result = await RequestController.searchRequests(validatedSearch);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching requests:", error);
    return NextResponse.json(
      { error: "Failed to search requests" },
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
    const validatedData = CreateRequestSchema.parse({
      ...body,
      requesterId: session.user.id,
    });

    const requestItem = await RequestController.createRequest(validatedData);
    
    return NextResponse.json(requestItem, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}