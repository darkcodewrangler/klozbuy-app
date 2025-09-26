import {
  CreateListingInput,
  UpdateListingInput,
  CreateListingSchema,
  UpdateListingSchema,
  ListingResponseSchema,
  ListingSearchSchema,
  ListingSearchInput,
  CreateRequestInput,
  UpdateRequestInput,
  CreateRequestSchema,
  UpdateRequestSchema,
  RequestResponseSchema,
  RequestSearchSchema,
  RequestSearchInput,
  CreateRequestResponseInput,
  CreateRequestResponseSchema,
  RequestResponseResponseSchema,
  CreateSavedSearchInput,
  CreateSavedSearchSchema,
  CreateFavoriteInput,
  CreateFavoriteSchema,
  CreateSellerFollowInput,
  CreateSellerFollowSchema,
  UpdateSellerFollowInput,
  UpdateSellerFollowSchema,
  CreateListingInquiryInput,
  CreateListingInquirySchema,
  UpdateListingInquiryInput,
  UpdateListingInquirySchema,
  ListingInquiryResponseSchema,
} from "@/models/marketplace.model";
import { MarketplaceService } from "@/services/marketplace.service";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod/v4";

export class ListingController {
  /**
   * Handles fetching a listing by ID.
   */
  static async getListingById(id: string, userId?: string): Promise<NextResponse> {
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Listing ID is required." },
          { status: 400 }
        );
      }

      const listing = await MarketplaceService.getListingById(id, userId);

      if (!listing) {
        return NextResponse.json({ error: "Listing not found." }, { status: 404 });
      }

      const validatedListing = ListingResponseSchema.safeParse(listing);
      if (!validatedListing.success) {
        console.error(
          "Listing data validation failed for ID:",
          id,
          validatedListing.error
        );
        return NextResponse.json(
          { error: "Internal server error: Invalid listing data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedListing.data, { status: 200 });
    } catch (error) {
      console.error("Error fetching listing by ID:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles searching and filtering listings.
   */
  static async searchListings(
    searchParams: URLSearchParams,
    userId?: string
  ): Promise<NextResponse> {
    try {
      const searchData: ListingSearchInput = {
        query: searchParams.get("query") || undefined,
        category: searchParams.get("category") || undefined,
        subcategory: searchParams.get("subcategory") || undefined,
        type: (searchParams.get("type") as "product" | "service") || undefined,
        condition: (searchParams.get("condition") as "new" | "used" | "refurbished") || undefined,
        priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
        priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
        location: searchParams.get("location") || undefined,
        radius: searchParams.get("radius") ? Number(searchParams.get("radius")) : 10,
        sortBy: (searchParams.get("sortBy") as any) || "relevance",
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      };

      const validatedSearchData = ListingSearchSchema.safeParse(searchData);
      if (!validatedSearchData.success) {
        return NextResponse.json(
          { error: "Invalid search parameters.", details: validatedSearchData.error.errors },
          { status: 400 }
        );
      }

      const result = await MarketplaceService.searchListings(validatedSearchData.data, userId);

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error("Error searching listings:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles creating a new listing.
   */
  static async createListing(requestBody: CreateListingInput): Promise<NextResponse> {
    try {
      const validatedData = CreateListingSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid listing data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const newListing = await MarketplaceService.createListing(validatedData.data);

      const validatedListing = ListingResponseSchema.safeParse(newListing);
      if (!validatedListing.success) {
        console.error("Created listing validation failed:", validatedListing.error);
        return NextResponse.json(
          { error: "Internal server error: Invalid created listing data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedListing.data, { status: 201 });
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error.", details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles updating an existing listing.
   */
  static async updateListing(
    id: string,
    requestBody: UpdateListingInput,
    userId: string
  ): Promise<NextResponse> {
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Listing ID is required." },
          { status: 400 }
        );
      }

      const validatedData = UpdateListingSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid listing data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const updatedListing = await MarketplaceService.updateListing(id, validatedData.data, userId);

      if (!updatedListing) {
        return NextResponse.json(
          { error: "Listing not found or unauthorized." },
          { status: 404 }
        );
      }

      const validatedListing = ListingResponseSchema.safeParse(updatedListing);
      if (!validatedListing.success) {
        console.error("Updated listing validation failed:", validatedListing.error);
        return NextResponse.json(
          { error: "Internal server error: Invalid updated listing data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedListing.data, { status: 200 });
    } catch (error) {
      console.error("Error updating listing:", error);
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error.", details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles deleting a listing.
   */
  static async deleteListing(id: string, userId: string): Promise<NextResponse> {
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Listing ID is required." },
          { status: 400 }
        );
      }

      const success = await MarketplaceService.deleteListing(id, userId);

      if (!success) {
        return NextResponse.json(
          { error: "Listing not found or unauthorized." },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Listing deleted successfully." }, { status: 200 });
    } catch (error) {
      console.error("Error deleting listing:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles getting user's listings.
   */
  static async getUserListings(
    userId: string,
    searchParams: URLSearchParams
  ): Promise<NextResponse> {
    try {
      const status = searchParams.get("status") || undefined;
      const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
      const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

      const result = await MarketplaceService.getUserListings(userId, { status, page, limit });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error("Error fetching user listings:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }
}

export class RequestController {
  /**
   * Handles fetching a request by ID.
   */
  static async getRequestById(id: string): Promise<NextResponse> {
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Request ID is required." },
          { status: 400 }
        );
      }

      const request = await MarketplaceService.getRequestById(id);

      if (!request) {
        return NextResponse.json({ error: "Request not found." }, { status: 404 });
      }

      const validatedRequest = RequestResponseSchema.safeParse(request);
      if (!validatedRequest.success) {
        console.error(
          "Request data validation failed for ID:",
          id,
          validatedRequest.error
        );
        return NextResponse.json(
          { error: "Internal server error: Invalid request data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedRequest.data, { status: 200 });
    } catch (error) {
      console.error("Error fetching request by ID:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles searching requests.
   */
  static async searchRequests(searchParams: URLSearchParams): Promise<NextResponse> {
    try {
      const searchData: RequestSearchInput = {
        query: searchParams.get("query") || undefined,
        category: searchParams.get("category") || undefined,
        subcategory: searchParams.get("subcategory") || undefined,
        urgency: (searchParams.get("urgency") as any) || undefined,
        budgetMin: searchParams.get("budgetMin") ? Number(searchParams.get("budgetMin")) : undefined,
        budgetMax: searchParams.get("budgetMax") ? Number(searchParams.get("budgetMax")) : undefined,
        location: searchParams.get("location") || undefined,
        radius: searchParams.get("radius") ? Number(searchParams.get("radius")) : 10,
        sortBy: (searchParams.get("sortBy") as any) || "newest",
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      };

      const validatedSearchData = RequestSearchSchema.safeParse(searchData);
      if (!validatedSearchData.success) {
        return NextResponse.json(
          { error: "Invalid search parameters.", details: validatedSearchData.error.errors },
          { status: 400 }
        );
      }

      const result = await MarketplaceService.searchRequests(validatedSearchData.data);

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error("Error searching requests:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles creating a new request.
   */
  static async createRequest(requestBody: CreateRequestInput): Promise<NextResponse> {
    try {
      const validatedData = CreateRequestSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid request data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const newRequest = await MarketplaceService.createRequest(validatedData.data);

      const validatedRequest = RequestResponseSchema.safeParse(newRequest);
      if (!validatedRequest.success) {
        console.error("Created request validation failed:", validatedRequest.error);
        return NextResponse.json(
          { error: "Internal server error: Invalid created request data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedRequest.data, { status: 201 });
    } catch (error) {
      console.error("Error creating request:", error);
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error.", details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles updating a request.
   */
  static async updateRequest(
    id: string,
    requestBody: UpdateRequestInput,
    userId: string
  ): Promise<NextResponse> {
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Request ID is required." },
          { status: 400 }
        );
      }

      const validatedData = UpdateRequestSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid request data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const updatedRequest = await MarketplaceService.updateRequest(id, validatedData.data, userId);

      if (!updatedRequest) {
        return NextResponse.json(
          { error: "Request not found or unauthorized." },
          { status: 404 }
        );
      }

      const validatedRequest = RequestResponseSchema.safeParse(updatedRequest);
      if (!validatedRequest.success) {
        console.error("Updated request validation failed:", validatedRequest.error);
        return NextResponse.json(
          { error: "Internal server error: Invalid updated request data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedRequest.data, { status: 200 });
    } catch (error) {
      console.error("Error updating request:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles responding to a request.
   */
  static async respondToRequest(requestBody: CreateRequestResponseInput): Promise<NextResponse> {
    try {
      const validatedData = CreateRequestResponseSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid response data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const response = await MarketplaceService.respondToRequest(validatedData.data);

      const validatedResponse = RequestResponseResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        console.error("Created response validation failed:", validatedResponse.error);
        return NextResponse.json(
          { error: "Internal server error: Invalid created response data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedResponse.data, { status: 201 });
    } catch (error) {
      console.error("Error responding to request:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }
}

export class FavoriteController {
  /**
   * Handles adding a listing to favorites.
   */
  static async addToFavorites(requestBody: CreateFavoriteInput): Promise<NextResponse> {
    try {
      const validatedData = CreateFavoriteSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid favorite data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const favorite = await MarketplaceService.addToFavorites(validatedData.data);

      return NextResponse.json(favorite, { status: 201 });
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles removing a listing from favorites.
   */
  static async removeFromFavorites(userId: string, listingId: string): Promise<NextResponse> {
    try {
      if (!userId || !listingId) {
        return NextResponse.json(
          { error: "User ID and Listing ID are required." },
          { status: 400 }
        );
      }

      const success = await MarketplaceService.removeFromFavorites(userId, listingId);

      if (!success) {
        return NextResponse.json(
          { error: "Favorite not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Removed from favorites successfully." }, { status: 200 });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles getting user's favorites.
   */
  static async getUserFavorites(
    userId: string,
    searchParams: URLSearchParams
  ): Promise<NextResponse> {
    try {
      const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
      const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

      const result = await MarketplaceService.getUserFavorites(userId, { page, limit });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }
}

export class SavedSearchController {
  /**
   * Handles creating a saved search.
   */
  static async createSavedSearch(requestBody: CreateSavedSearchInput): Promise<NextResponse> {
    try {
      const validatedData = CreateSavedSearchSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid saved search data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const savedSearch = await MarketplaceService.createSavedSearch(validatedData.data);

      return NextResponse.json(savedSearch, { status: 201 });
    } catch (error) {
      console.error("Error creating saved search:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles getting user's saved searches.
   */
  static async getUserSavedSearches(userId: string): Promise<NextResponse> {
    try {
      const savedSearches = await MarketplaceService.getUserSavedSearches(userId);

      return NextResponse.json(savedSearches, { status: 200 });
    } catch (error) {
      console.error("Error fetching saved searches:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles deleting a saved search.
   */
  static async deleteSavedSearch(id: string, userId: string): Promise<NextResponse> {
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Saved search ID is required." },
          { status: 400 }
        );
      }

      const success = await MarketplaceService.deleteSavedSearch(id, userId);

      if (!success) {
        return NextResponse.json(
          { error: "Saved search not found or unauthorized." },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Saved search deleted successfully." }, { status: 200 });
    } catch (error) {
      console.error("Error deleting saved search:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }
}

export class SellerFollowController {
  /**
   * Handles following a seller.
   */
  static async followSeller(requestBody: CreateSellerFollowInput): Promise<NextResponse> {
    try {
      const validatedData = CreateSellerFollowSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid follow data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const follow = await MarketplaceService.followSeller(validatedData.data);

      return NextResponse.json(follow, { status: 201 });
    } catch (error) {
      console.error("Error following seller:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles unfollowing a seller.
   */
  static async unfollowSeller(followerId: string, sellerId: string): Promise<NextResponse> {
    try {
      if (!followerId || !sellerId) {
        return NextResponse.json(
          { error: "Follower ID and Seller ID are required." },
          { status: 400 }
        );
      }

      const success = await MarketplaceService.unfollowSeller(followerId, sellerId);

      if (!success) {
        return NextResponse.json(
          { error: "Follow relationship not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Unfollowed seller successfully." }, { status: 200 });
    } catch (error) {
      console.error("Error unfollowing seller:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles updating seller follow preferences.
   */
  static async updateSellerFollow(
    followerId: string,
    sellerId: string,
    requestBody: UpdateSellerFollowInput
  ): Promise<NextResponse> {
    try {
      const validatedData = UpdateSellerFollowSchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid update data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const updatedFollow = await MarketplaceService.updateSellerFollow(
        followerId,
        sellerId,
        validatedData.data
      );

      if (!updatedFollow) {
        return NextResponse.json(
          { error: "Follow relationship not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedFollow, { status: 200 });
    } catch (error) {
      console.error("Error updating seller follow:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }
}

export class ListingInquiryController {
  /**
   * Handles creating a listing inquiry.
   */
  static async createInquiry(requestBody: CreateListingInquiryInput): Promise<NextResponse> {
    try {
      const validatedData = CreateListingInquirySchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid inquiry data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const inquiry = await MarketplaceService.createListingInquiry(validatedData.data);

      const validatedInquiry = ListingInquiryResponseSchema.safeParse(inquiry);
      if (!validatedInquiry.success) {
        console.error("Created inquiry validation failed:", validatedInquiry.error);
        return NextResponse.json(
          { error: "Internal server error: Invalid created inquiry data." },
          { status: 500 }
        );
      }

      return NextResponse.json(validatedInquiry.data, { status: 201 });
    } catch (error) {
      console.error("Error creating inquiry:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles getting inquiries for a listing.
   */
  static async getListingInquiries(
    listingId: string,
    searchParams: URLSearchParams
  ): Promise<NextResponse> {
    try {
      if (!listingId) {
        return NextResponse.json(
          { error: "Listing ID is required." },
          { status: 400 }
        );
      }

      const isPublic = searchParams.get("public") !== "false";
      const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
      const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

      const result = await MarketplaceService.getListingInquiries(listingId, {
        isPublic,
        page,
        limit,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error("Error fetching listing inquiries:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  /**
   * Handles updating an inquiry status.
   */
  static async updateInquiry(
    id: string,
    requestBody: UpdateListingInquiryInput,
    userId: string
  ): Promise<NextResponse> {
    try {
      if (!id) {
        return NextResponse.json(
          { error: "Inquiry ID is required." },
          { status: 400 }
        );
      }

      const validatedData = UpdateListingInquirySchema.safeParse(requestBody);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid inquiry data.", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const updatedInquiry = await MarketplaceService.updateListingInquiry(
        id,
        validatedData.data,
        userId
      );

      if (!updatedInquiry) {
        return NextResponse.json(
          { error: "Inquiry not found or unauthorized." },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedInquiry, { status: 200 });
    } catch (error) {
      console.error("Error updating inquiry:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }
}