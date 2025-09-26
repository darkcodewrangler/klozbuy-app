import { db } from "@/db";
import {
  listings,
  listingMedia,
  requests,
  requestResponses,
  savedSearches,
  favorites,
  sellerFollows,
  businessMetrics,
  listingInquiries,
  userPreferences,
} from "@/db/schemas/marketplace-schema";
import { users, locations, businessProfiles } from "@/db/schemas/users-schema";
import { medias } from "@/db/schemas/media-schema";
import {
  CreateListingInput,
  UpdateListingInput,
  ListingSearchInput,
  CreateRequestInput,
  UpdateRequestInput,
  RequestSearchInput,
  CreateRequestResponseInput,
  CreateSavedSearchInput,
  CreateFavoriteInput,
  CreateSellerFollowInput,
  UpdateSellerFollowInput,
  CreateListingInquiryInput,
  UpdateListingInquiryInput,
} from "@/models/marketplace.model";
import { eq, and, or, like, gte, lte, desc, asc, sql, inArray, isNull } from "drizzle-orm";
import { LocationService } from "./location.service";
import { RecommendationService } from "./recommendation.service";

export class MarketplaceService {
  /**
   * Get a listing by ID with optional user context for personalization.
   */
  static async getListingById(id: string, userId?: string) {
    const listing = await db
      .select({
        id: listings.id,
        userId: listings.userId,
        title: listings.title,
        description: listings.description,
        category: listings.category,
        subcategory: listings.subcategory,
        type: listings.type,
        condition: listings.condition,
        price: listings.price,
        currency: listings.currency,
        negotiable: listings.negotiable,
        quantity: listings.quantity,
        brand: listings.brand,
        model: listings.model,
        specifications: listings.specifications,
        tags: listings.tags,
        status: listings.status,
        visibility: listings.visibility,
        locationId: listings.locationId,
        deliveryOptions: listings.deliveryOptions,
        shippingCost: listings.shippingCost,
        returnPolicy: listings.returnPolicy,
        warranty: listings.warranty,
        viewsCount: listings.viewsCount,
        favoritesCount: listings.favoritesCount,
        inquiriesCount: listings.inquiriesCount,
        sharesCount: listings.sharesCount,
        isPromoted: listings.isPromoted,
        promotionEndsAt: listings.promotionEndsAt,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        publishedAt: listings.publishedAt,
        expiresAt: listings.expiresAt,
        // User details
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          isVerified: users.isVerified,
          type: users.type,
        },
        // Location details
        location: {
          id: locations.id,
          name: locations.name,
          address: locations.address,
          city: locations.city,
          state: locations.state,
          country: locations.country,
          latitude: locations.latitude,
          longitude: locations.longitude,
        },
        // Business profile if applicable
        businessProfile: {
          id: businessProfiles.id,
          businessName: businessProfiles.businessName,
          businessCategory: businessProfiles.businessCategory,
          averageRating: businessProfiles.averageRating,
          reviewsCount: businessProfiles.reviewsCount,
          isVerified: businessProfiles.isVerified,
        },
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .leftJoin(locations, eq(listings.locationId, locations.id))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(eq(listings.id, id))
      .limit(1);

    if (!listing.length) return null;

    const result = listing[0];

    // Get media for the listing
    const media = await db
      .select()
      .from(listingMedia)
      .leftJoin(medias, eq(listingMedia.mediaId, medias.id))
      .where(eq(listingMedia.listingId, id))
      .orderBy(asc(listingMedia.order));

    // Increment view count if user is viewing
    if (userId && userId !== result.userId) {
      await db
        .update(listings)
        .set({ viewsCount: sql`${listings.viewsCount} + 1` })
        .where(eq(listings.id, id));
    }

    // Check if user has favorited this listing
    let isFavorited = false;
    if (userId) {
      const favorite = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.listingId, id)))
        .limit(1);
      isFavorited = favorite.length > 0;
    }

    return {
      ...result,
      media: media.map((m) => m.medias),
      isFavorited,
    };
  }

  /**
   * Search listings with advanced filtering and location-based recommendations.
   */
  static async searchListings(searchInput: ListingSearchInput, userId?: string) {
    const {
      query,
      category,
      subcategory,
      type,
      condition,
      priceMin,
      priceMax,
      location,
      radius = 10,
      sortBy = "relevance",
      page = 1,
      limit = 20,
    } = searchInput;

    const offset = (page - 1) * limit;

    // Build base query
    let whereConditions = [
      eq(listings.status, "active"),
      eq(listings.visibility, "public"),
    ];

    // Add search filters
    if (query) {
      whereConditions.push(
        or(
          like(listings.title, `%${query}%`),
          like(listings.description, `%${query}%`),
          like(listings.tags, `%${query}%`)
        )
      );
    }

    if (category) {
      whereConditions.push(eq(listings.category, category));
    }

    if (subcategory) {
      whereConditions.push(eq(listings.subcategory, subcategory));
    }

    if (type) {
      whereConditions.push(eq(listings.type, type));
    }

    if (condition) {
      whereConditions.push(eq(listings.condition, condition));
    }

    if (priceMin !== undefined) {
      whereConditions.push(gte(listings.price, priceMin));
    }

    if (priceMax !== undefined) {
      whereConditions.push(lte(listings.price, priceMax));
    }

    // Location-based filtering
    let locationIds: string[] = [];
    if (location) {
      locationIds = await LocationService.findNearbyLocationIds(location, radius);
      if (locationIds.length > 0) {
        whereConditions.push(inArray(listings.locationId, locationIds));
      }
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case "price_low":
        orderBy = [asc(listings.price)];
        break;
      case "price_high":
        orderBy = [desc(listings.price)];
        break;
      case "newest":
        orderBy = [desc(listings.createdAt)];
        break;
      case "oldest":
        orderBy = [asc(listings.createdAt)];
        break;
      case "popular":
        orderBy = [desc(listings.viewsCount), desc(listings.favoritesCount)];
        break;
      case "relevance":
      default:
        // For relevance, we'll use a combination of factors
        orderBy = [
          desc(listings.isPromoted),
          desc(listings.viewsCount),
          desc(listings.createdAt),
        ];
        break;
    }

    // Execute search query
    const searchResults = await db
      .select({
        id: listings.id,
        userId: listings.userId,
        title: listings.title,
        description: listings.description,
        category: listings.category,
        subcategory: listings.subcategory,
        type: listings.type,
        condition: listings.condition,
        price: listings.price,
        currency: listings.currency,
        negotiable: listings.negotiable,
        quantity: listings.quantity,
        brand: listings.brand,
        model: listings.model,
        tags: listings.tags,
        status: listings.status,
        locationId: listings.locationId,
        deliveryOptions: listings.deliveryOptions,
        shippingCost: listings.shippingCost,
        viewsCount: listings.viewsCount,
        favoritesCount: listings.favoritesCount,
        inquiriesCount: listings.inquiriesCount,
        isPromoted: listings.isPromoted,
        createdAt: listings.createdAt,
        publishedAt: listings.publishedAt,
        // User details
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          isVerified: users.isVerified,
          type: users.type,
        },
        // Location details
        location: {
          id: locations.id,
          name: locations.name,
          city: locations.city,
          state: locations.state,
          country: locations.country,
          latitude: locations.latitude,
          longitude: locations.longitude,
        },
        // Business profile if applicable
        businessProfile: {
          id: businessProfiles.id,
          businessName: businessProfiles.businessName,
          averageRating: businessProfiles.averageRating,
          reviewsCount: businessProfiles.reviewsCount,
          isVerified: businessProfiles.isVerified,
        },
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .leftJoin(locations, eq(listings.locationId, locations.id))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(and(...whereConditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(and(...whereConditions));

    const totalCount = totalCountResult[0]?.count || 0;

    // Get media for each listing
    const listingIds = searchResults.map((listing) => listing.id);
    const media = await db
      .select()
      .from(listingMedia)
      .leftJoin(medias, eq(listingMedia.mediaId, medias.id))
      .where(inArray(listingMedia.listingId, listingIds))
      .orderBy(asc(listingMedia.order));

    // Group media by listing ID
    const mediaByListing = media.reduce((acc, item) => {
      if (!acc[item.listing_media.listingId]) {
        acc[item.listing_media.listingId] = [];
      }
      if (item.medias) {
        acc[item.listing_media.listingId].push(item.medias);
      }
      return acc;
    }, {} as Record<string, any[]>);

    // Check favorites if user is authenticated
    let favoriteListingIds: string[] = [];
    if (userId) {
      const userFavorites = await db
        .select({ listingId: favorites.listingId })
        .from(favorites)
        .where(and(eq(favorites.userId, userId), inArray(favorites.listingId, listingIds)));
      favoriteListingIds = userFavorites.map((f) => f.listingId);
    }

    // Combine results with media and favorite status
    const results = searchResults.map((listing) => ({
      ...listing,
      media: mediaByListing[listing.id] || [],
      isFavorited: favoriteListingIds.includes(listing.id),
    }));

    // Apply personalized recommendations if user is authenticated
    let personalizedResults = results;
    if (userId) {
      personalizedResults = await RecommendationService.personalizeSearchResults(
        results,
        userId,
        searchInput
      );
    }

    return {
      listings: personalizedResults,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      filters: {
        query,
        category,
        subcategory,
        type,
        condition,
        priceRange: { min: priceMin, max: priceMax },
        location,
        radius,
        sortBy,
      },
    };
  }

  /**
   * Create a new listing.
   */
  static async createListing(listingData: CreateListingInput) {
    const newListing = await db.insert(listings).values({
      ...listingData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: listingData.status === "active" ? new Date() : null,
    });

    return await this.getListingById(newListing.insertId);
  }

  /**
   * Update an existing listing.
   */
  static async updateListing(id: string, updateData: UpdateListingInput, userId: string) {
    // Verify ownership
    const existingListing = await db
      .select({ userId: listings.userId })
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    if (!existingListing.length || existingListing[0].userId !== userId) {
      return null;
    }

    await db
      .update(listings)
      .set({
        ...updateData,
        updatedAt: new Date(),
        publishedAt: updateData.status === "active" ? new Date() : undefined,
      })
      .where(eq(listings.id, id));

    return await this.getListingById(id, userId);
  }

  /**
   * Delete a listing.
   */
  static async deleteListing(id: string, userId: string): Promise<boolean> {
    // Verify ownership
    const existingListing = await db
      .select({ userId: listings.userId })
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    if (!existingListing.length || existingListing[0].userId !== userId) {
      return false;
    }

    await db.delete(listings).where(eq(listings.id, id));
    return true;
  }

  /**
   * Get user's listings.
   */
  static async getUserListings(
    userId: string,
    options: { status?: string; page?: number; limit?: number }
  ) {
    const { status, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(listings.userId, userId)];

    if (status) {
      whereConditions.push(eq(listings.status, status));
    }

    const userListings = await db
      .select()
      .from(listings)
      .leftJoin(locations, eq(listings.locationId, locations.id))
      .where(and(...whereConditions))
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(and(...whereConditions));

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      listings: userListings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get a request by ID.
   */
  static async getRequestById(id: string) {
    const request = await db
      .select({
        id: requests.id,
        userId: requests.userId,
        title: requests.title,
        description: requests.description,
        category: requests.category,
        subcategory: requests.subcategory,
        budget: requests.budget,
        currency: requests.currency,
        urgency: requests.urgency,
        locationId: requests.locationId,
        status: requests.status,
        visibility: requests.visibility,
        tags: requests.tags,
        requirements: requests.requirements,
        preferredDelivery: requests.preferredDelivery,
        responseCount: requests.responseCount,
        viewsCount: requests.viewsCount,
        createdAt: requests.createdAt,
        updatedAt: requests.updatedAt,
        expiresAt: requests.expiresAt,
        // User details
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          isVerified: users.isVerified,
        },
        // Location details
        location: {
          id: locations.id,
          name: locations.name,
          city: locations.city,
          state: locations.state,
          country: locations.country,
          latitude: locations.latitude,
          longitude: locations.longitude,
        },
      })
      .from(requests)
      .leftJoin(users, eq(requests.userId, users.id))
      .leftJoin(locations, eq(requests.locationId, locations.id))
      .where(eq(requests.id, id))
      .limit(1);

    return request.length ? request[0] : null;
  }

  /**
   * Search requests.
   */
  static async searchRequests(searchInput: RequestSearchInput) {
    const {
      query,
      category,
      subcategory,
      urgency,
      budgetMin,
      budgetMax,
      location,
      radius = 10,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = searchInput;

    const offset = (page - 1) * limit;

    let whereConditions = [
      eq(requests.status, "active"),
      eq(requests.visibility, "public"),
    ];

    if (query) {
      whereConditions.push(
        or(
          like(requests.title, `%${query}%`),
          like(requests.description, `%${query}%`),
          like(requests.tags, `%${query}%`)
        )
      );
    }

    if (category) {
      whereConditions.push(eq(requests.category, category));
    }

    if (subcategory) {
      whereConditions.push(eq(requests.subcategory, subcategory));
    }

    if (urgency) {
      whereConditions.push(eq(requests.urgency, urgency));
    }

    if (budgetMin !== undefined) {
      whereConditions.push(gte(requests.budget, budgetMin));
    }

    if (budgetMax !== undefined) {
      whereConditions.push(lte(requests.budget, budgetMax));
    }

    // Location-based filtering
    if (location) {
      const locationIds = await LocationService.findNearbyLocationIds(location, radius);
      if (locationIds.length > 0) {
        whereConditions.push(inArray(requests.locationId, locationIds));
      }
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case "budget_high":
        orderBy = [desc(requests.budget)];
        break;
      case "budget_low":
        orderBy = [asc(requests.budget)];
        break;
      case "urgent":
        orderBy = [desc(requests.urgency), desc(requests.createdAt)];
        break;
      case "oldest":
        orderBy = [asc(requests.createdAt)];
        break;
      case "newest":
      default:
        orderBy = [desc(requests.createdAt)];
        break;
    }

    const searchResults = await db
      .select({
        id: requests.id,
        userId: requests.userId,
        title: requests.title,
        description: requests.description,
        category: requests.category,
        subcategory: requests.subcategory,
        budget: requests.budget,
        currency: requests.currency,
        urgency: requests.urgency,
        locationId: requests.locationId,
        status: requests.status,
        tags: requests.tags,
        requirements: requests.requirements,
        preferredDelivery: requests.preferredDelivery,
        responseCount: requests.responseCount,
        viewsCount: requests.viewsCount,
        createdAt: requests.createdAt,
        expiresAt: requests.expiresAt,
        // User details
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          isVerified: users.isVerified,
        },
        // Location details
        location: {
          id: locations.id,
          name: locations.name,
          city: locations.city,
          state: locations.state,
          country: locations.country,
        },
      })
      .from(requests)
      .leftJoin(users, eq(requests.userId, users.id))
      .leftJoin(locations, eq(requests.locationId, locations.id))
      .where(and(...whereConditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(and(...whereConditions));

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      requests: searchResults,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create a new request.
   */
  static async createRequest(requestData: CreateRequestInput) {
    const newRequest = await db.insert(requests).values({
      ...requestData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.getRequestById(newRequest.insertId);
  }

  /**
   * Update a request.
   */
  static async updateRequest(id: string, updateData: UpdateRequestInput, userId: string) {
    // Verify ownership
    const existingRequest = await db
      .select({ userId: requests.userId })
      .from(requests)
      .where(eq(requests.id, id))
      .limit(1);

    if (!existingRequest.length || existingRequest[0].userId !== userId) {
      return null;
    }

    await db
      .update(requests)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id));

    return await this.getRequestById(id);
  }

  /**
   * Respond to a request.
   */
  static async respondToRequest(responseData: CreateRequestResponseInput) {
    const newResponse = await db.insert(requestResponses).values({
      ...responseData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Increment response count
    await db
      .update(requests)
      .set({ responseCount: sql`${requests.responseCount} + 1` })
      .where(eq(requests.id, responseData.requestId));

    return await db
      .select()
      .from(requestResponses)
      .where(eq(requestResponses.id, newResponse.insertId))
      .limit(1);
  }

  /**
   * Add listing to favorites.
   */
  static async addToFavorites(favoriteData: CreateFavoriteInput) {
    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, favoriteData.userId),
          eq(favorites.listingId, favoriteData.listingId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const newFavorite = await db.insert(favorites).values({
      ...favoriteData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });

    // Increment favorites count
    await db
      .update(listings)
      .set({ favoritesCount: sql`${listings.favoritesCount} + 1` })
      .where(eq(listings.id, favoriteData.listingId));

    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.id, newFavorite.insertId))
      .limit(1);
  }

  /**
   * Remove listing from favorites.
   */
  static async removeFromFavorites(userId: string, listingId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));

    if (result.affectedRows > 0) {
      // Decrement favorites count
      await db
        .update(listings)
        .set({ favoritesCount: sql`${listings.favoritesCount} - 1` })
        .where(eq(listings.id, listingId));
      return true;
    }

    return false;
  }

  /**
   * Get user's favorites.
   */
  static async getUserFavorites(
    userId: string,
    options: { page?: number; limit?: number }
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const userFavorites = await db
      .select({
        id: favorites.id,
        createdAt: favorites.createdAt,
        listing: {
          id: listings.id,
          title: listings.title,
          description: listings.description,
          price: listings.price,
          currency: listings.currency,
          condition: listings.condition,
          status: listings.status,
          createdAt: listings.createdAt,
        },
      })
      .from(favorites)
      .leftJoin(listings, eq(favorites.listingId, listings.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.userId, userId));

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      favorites: userFavorites,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create a saved search.
   */
  static async createSavedSearch(searchData: CreateSavedSearchInput) {
    const newSavedSearch = await db.insert(savedSearches).values({
      ...searchData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.id, newSavedSearch.insertId))
      .limit(1);
  }

  /**
   * Get user's saved searches.
   */
  static async getUserSavedSearches(userId: string) {
    return await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));
  }

  /**
   * Delete a saved search.
   */
  static async deleteSavedSearch(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(savedSearches)
      .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));

    return result.affectedRows > 0;
  }

  /**
   * Follow a seller.
   */
  static async followSeller(followData: CreateSellerFollowInput) {
    // Check if already following
    const existing = await db
      .select()
      .from(sellerFollows)
      .where(
        and(
          eq(sellerFollows.followerId, followData.followerId),
          eq(sellerFollows.sellerId, followData.sellerId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const newFollow = await db.insert(sellerFollows).values({
      ...followData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await db
      .select()
      .from(sellerFollows)
      .where(eq(sellerFollows.id, newFollow.insertId))
      .limit(1);
  }

  /**
   * Unfollow a seller.
   */
  static async unfollowSeller(followerId: string, sellerId: string): Promise<boolean> {
    const result = await db
      .delete(sellerFollows)
      .where(
        and(eq(sellerFollows.followerId, followerId), eq(sellerFollows.sellerId, sellerId))
      );

    return result.affectedRows > 0;
  }

  /**
   * Update seller follow preferences.
   */
  static async updateSellerFollow(
    followerId: string,
    sellerId: string,
    updateData: UpdateSellerFollowInput
  ) {
    const result = await db
      .update(sellerFollows)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(
        and(eq(sellerFollows.followerId, followerId), eq(sellerFollows.sellerId, sellerId))
      );

    if (result.affectedRows === 0) {
      return null;
    }

    return await db
      .select()
      .from(sellerFollows)
      .where(
        and(eq(sellerFollows.followerId, followerId), eq(sellerFollows.sellerId, sellerId))
      )
      .limit(1);
  }

  /**
   * Create a listing inquiry.
   */
  static async createListingInquiry(inquiryData: CreateListingInquiryInput) {
    const newInquiry = await db.insert(listingInquiries).values({
      ...inquiryData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Increment inquiries count
    await db
      .update(listings)
      .set({ inquiriesCount: sql`${listings.inquiriesCount} + 1` })
      .where(eq(listings.id, inquiryData.listingId));

    return await db
      .select({
        id: listingInquiries.id,
        listingId: listingInquiries.listingId,
        userId: listingInquiries.userId,
        message: listingInquiries.message,
        isPublic: listingInquiries.isPublic,
        status: listingInquiries.status,
        createdAt: listingInquiries.createdAt,
        updatedAt: listingInquiries.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          isVerified: users.isVerified,
        },
      })
      .from(listingInquiries)
      .leftJoin(users, eq(listingInquiries.userId, users.id))
      .where(eq(listingInquiries.id, newInquiry.insertId))
      .limit(1);
  }

  /**
   * Get inquiries for a listing.
   */
  static async getListingInquiries(
    listingId: string,
    options: { isPublic?: boolean; page?: number; limit?: number }
  ) {
    const { isPublic = true, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(listingInquiries.listingId, listingId)];

    if (isPublic) {
      whereConditions.push(eq(listingInquiries.isPublic, true));
    }

    const inquiries = await db
      .select({
        id: listingInquiries.id,
        listingId: listingInquiries.listingId,
        userId: listingInquiries.userId,
        message: listingInquiries.message,
        isPublic: listingInquiries.isPublic,
        status: listingInquiries.status,
        createdAt: listingInquiries.createdAt,
        updatedAt: listingInquiries.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          isVerified: users.isVerified,
        },
      })
      .from(listingInquiries)
      .leftJoin(users, eq(listingInquiries.userId, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(listingInquiries.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listingInquiries)
      .where(and(...whereConditions));

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      inquiries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update a listing inquiry.
   */
  static async updateListingInquiry(
    id: string,
    updateData: UpdateListingInquiryInput,
    userId: string
  ) {
    // Verify ownership or listing ownership
    const inquiry = await db
      .select({
        userId: listingInquiries.userId,
        listingId: listingInquiries.listingId,
        listing: {
          userId: listings.userId,
        },
      })
      .from(listingInquiries)
      .leftJoin(listings, eq(listingInquiries.listingId, listings.id))
      .where(eq(listingInquiries.id, id))
      .limit(1);

    if (
      !inquiry.length ||
      (inquiry[0].userId !== userId && inquiry[0].listing?.userId !== userId)
    ) {
      return null;
    }

    await db
      .update(listingInquiries)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(listingInquiries.id, id));

    return await db
      .select()
      .from(listingInquiries)
      .where(eq(listingInquiries.id, id))
      .limit(1);
  }
}