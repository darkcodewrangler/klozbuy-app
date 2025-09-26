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
import { UserResponseSchema } from "./users.model";
import { SelectLocationSchema } from "./location.model";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod/v4";

// ===== LISTINGS =====

// Infer types
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;

// Create listing schema
export const CreateListingSchema = createInsertSchema(listings, {
  userId: z.string().length(36, "Invalid user ID format."),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title cannot exceed 200 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(5000, "Description cannot exceed 5000 characters.")
    .optional(),
  category: z
    .string()
    .min(1, "Category is required.")
    .max(100, "Category cannot exceed 100 characters."),
  subcategory: z
    .string()
    .max(100, "Subcategory cannot exceed 100 characters.")
    .optional(),
  type: z.enum(listings.type.enumValues),
  status: z.enum(listings.status.enumValues).default("active"),
  condition: z.enum(listings.condition.enumValues).optional(),
  price: z
    .number()
    .positive("Price must be positive.")
    .max(999999999.99, "Price is too high.")
    .optional(),
  originalPrice: z
    .number()
    .positive("Original price must be positive.")
    .max(999999999.99, "Original price is too high.")
    .optional(),
  currency: z.string().length(3, "Currency must be 3 characters.").default("NGN"),
  priceType: z.enum(listings.priceType.enumValues).default("fixed"),
  isNegotiable: z.boolean().default(false),
  locationId: z
    .string()
    .length(36, "Invalid location ID format.")
    .optional()
    .nullable(),
  deliveryOptions: z
    .array(z.enum(["pickup", "delivery", "shipping"]))
    .optional(),
  deliveryRadius: z
    .number()
    .int()
    .min(1, "Delivery radius must be at least 1 km.")
    .max(1000, "Delivery radius cannot exceed 1000 km.")
    .optional(),
  deliveryFee: z
    .number()
    .min(0, "Delivery fee cannot be negative.")
    .max(999999.99, "Delivery fee is too high.")
    .optional(),
  brand: z
    .string()
    .max(100, "Brand cannot exceed 100 characters.")
    .optional(),
  model: z
    .string()
    .max(100, "Model cannot exceed 100 characters.")
    .optional(),
  sku: z
    .string()
    .max(100, "SKU cannot exceed 100 characters.")
    .optional(),
  stockQuantity: z
    .number()
    .int()
    .min(0, "Stock quantity cannot be negative.")
    .optional(),
  minOrderQuantity: z
    .number()
    .int()
    .min(1, "Minimum order quantity must be at least 1.")
    .default(1),
  weight: z
    .number()
    .positive("Weight must be positive.")
    .max(99999.999, "Weight is too high.")
    .optional(),
  dimensions: z
    .object({
      length: z.number().positive("Length must be positive."),
      width: z.number().positive("Width must be positive."),
      height: z.number().positive("Height must be positive."),
    })
    .optional(),
  serviceType: z
    .string()
    .max(100, "Service type cannot exceed 100 characters.")
    .optional(),
  duration: z
    .string()
    .max(100, "Duration cannot exceed 100 characters.")
    .optional(),
  availability: z
    .object({
      days: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])),
      hours: z.object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format."),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format."),
      }),
    })
    .optional(),
  serviceRadius: z
    .number()
    .int()
    .min(1, "Service radius must be at least 1 km.")
    .max(500, "Service radius cannot exceed 500 km.")
    .optional(),
  experienceYears: z
    .number()
    .int()
    .min(0, "Experience years cannot be negative.")
    .max(50, "Experience years cannot exceed 50.")
    .optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(20, "Cannot have more than 20 tags.")
    .optional(),
  searchKeywords: z
    .string()
    .max(1000, "Search keywords cannot exceed 1000 characters.")
    .optional(),
  expiresAt: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date().optional()
    ),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewsCount: true,
  inquiriesCount: true,
  favoritesCount: true,
  sharesCount: true,
  isPromoted: true,
  promotionEndsAt: true,
  publishedAt: true,
  soldAt: true,
});

// Update listing schema
export const UpdateListingSchema = createUpdateSchema(listings, {
  id: z.string().length(36, "Invalid listing ID format.").optional(),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title cannot exceed 200 characters.")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(5000, "Description cannot exceed 5000 characters.")
    .optional(),
  price: z
    .number()
    .positive("Price must be positive.")
    .max(999999999.99, "Price is too high.")
    .optional(),
  status: z.enum(listings.status.enumValues).optional(),
});

// Select listing schema
export const SelectListingSchema = createSelectSchema(listings);

// Listing response schema with relations
export const ListingResponseSchema = SelectListingSchema.extend({
  seller: UserResponseSchema.optional(),
  location: SelectLocationSchema.optional(),
  media: z.array(z.object({
    id: z.string(),
    mediaId: z.string(),
    isPrimary: z.boolean(),
    sortOrder: z.number(),
    altText: z.string().optional(),
    url: z.string().url(),
  })).optional(),
  inquiriesCount: z.number().default(0),
  favoritesCount: z.number().default(0),
  isFavorited: z.boolean().optional(),
});

// ===== REQUESTS =====

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;

export const CreateRequestSchema = createInsertSchema(requests, {
  userId: z.string().length(36, "Invalid user ID format."),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title cannot exceed 200 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description cannot exceed 2000 characters."),
  category: z
    .string()
    .min(1, "Category is required.")
    .max(100, "Category cannot exceed 100 characters."),
  subcategory: z
    .string()
    .max(100, "Subcategory cannot exceed 100 characters.")
    .optional(),
  budgetMin: z
    .number()
    .min(0, "Budget minimum cannot be negative.")
    .max(999999999.99, "Budget minimum is too high.")
    .optional(),
  budgetMax: z
    .number()
    .min(0, "Budget maximum cannot be negative.")
    .max(999999999.99, "Budget maximum is too high.")
    .optional(),
  currency: z.string().length(3, "Currency must be 3 characters.").default("NGN"),
  locationId: z
    .string()
    .length(36, "Invalid location ID format.")
    .optional()
    .nullable(),
  searchRadius: z
    .number()
    .int()
    .min(1, "Search radius must be at least 1 km.")
    .max(1000, "Search radius cannot exceed 1000 km.")
    .default(10),
  status: z.enum(requests.status.enumValues).default("active"),
  urgency: z.enum(requests.urgency.enumValues).default("medium"),
  neededBy: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date().optional()
    ),
  expiresAt: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date().optional()
    ),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  responsesCount: true,
  viewsCount: true,
  fulfilledAt: true,
});

export const UpdateRequestSchema = createUpdateSchema(requests, {
  id: z.string().length(36, "Invalid request ID format.").optional(),
  status: z.enum(requests.status.enumValues).optional(),
});

export const SelectRequestSchema = createSelectSchema(requests);

export const RequestResponseSchema = SelectRequestSchema.extend({
  requester: UserResponseSchema.optional(),
  location: SelectLocationSchema.optional(),
  responsesCount: z.number().default(0),
});

// ===== REQUEST RESPONSES =====

export type RequestResponse = typeof requestResponses.$inferSelect;
export type NewRequestResponse = typeof requestResponses.$inferInsert;

export const CreateRequestResponseSchema = createInsertSchema(requestResponses, {
  requestId: z.string().length(36, "Invalid request ID format."),
  responderId: z.string().length(36, "Invalid responder ID format."),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(1000, "Message cannot exceed 1000 characters."),
  proposedPrice: z
    .number()
    .positive("Proposed price must be positive.")
    .max(999999999.99, "Proposed price is too high.")
    .optional(),
  currency: z.string().length(3, "Currency must be 3 characters.").default("NGN"),
  availability: z
    .string()
    .max(200, "Availability cannot exceed 200 characters.")
    .optional(),
  status: z.enum(requestResponses.status.enumValues).default("pending"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateRequestResponseSchema = createUpdateSchema(requestResponses, {
  id: z.string().length(36, "Invalid response ID format.").optional(),
  status: z.enum(requestResponses.status.enumValues).optional(),
});

export const SelectRequestResponseSchema = createSelectSchema(requestResponses);

export const RequestResponseResponseSchema = SelectRequestResponseSchema.extend({
  responder: UserResponseSchema.optional(),
});

// ===== SAVED SEARCHES =====

export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;

export const CreateSavedSearchSchema = createInsertSchema(savedSearches, {
  userId: z.string().length(36, "Invalid user ID format."),
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name cannot exceed 100 characters."),
  searchQuery: z
    .string()
    .min(1, "Search query is required.")
    .max(500, "Search query cannot exceed 500 characters."),
  filters: z
    .object({
      category: z.string().optional(),
      subcategory: z.string().optional(),
      priceMin: z.number().min(0).optional(),
      priceMax: z.number().min(0).optional(),
      condition: z.enum(["new", "used", "refurbished"]).optional(),
      location: z.string().optional(),
      radius: z.number().int().min(1).max(1000).optional(),
    })
    .optional(),
  alertsEnabled: z.boolean().default(true),
  alertFrequency: z.enum(savedSearches.alertFrequency.enumValues).default("daily"),
  isActive: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastAlertSent: true,
});

export const UpdateSavedSearchSchema = createUpdateSchema(savedSearches, {
  id: z.string().length(36, "Invalid saved search ID format.").optional(),
});

export const SelectSavedSearchSchema = createSelectSchema(savedSearches);

// ===== FAVORITES =====

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export const CreateFavoriteSchema = createInsertSchema(favorites, {
  userId: z.string().length(36, "Invalid user ID format."),
  listingId: z.string().length(36, "Invalid listing ID format."),
}).omit({
  id: true,
  createdAt: true,
});

export const SelectFavoriteSchema = createSelectSchema(favorites);

// ===== SELLER FOLLOWS =====

export type SellerFollow = typeof sellerFollows.$inferSelect;
export type NewSellerFollow = typeof sellerFollows.$inferInsert;

export const CreateSellerFollowSchema = createInsertSchema(sellerFollows, {
  followerId: z.string().length(36, "Invalid follower ID format."),
  sellerId: z.string().length(36, "Invalid seller ID format."),
  notificationsEnabled: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
});

export const UpdateSellerFollowSchema = createUpdateSchema(sellerFollows, {
  notificationsEnabled: z.boolean().optional(),
});

export const SelectSellerFollowSchema = createSelectSchema(sellerFollows);

// ===== BUSINESS METRICS =====

export type BusinessMetric = typeof businessMetrics.$inferSelect;
export type NewBusinessMetric = typeof businessMetrics.$inferInsert;

export const CreateBusinessMetricSchema = createInsertSchema(businessMetrics, {
  userId: z.string().length(36, "Invalid user ID format."),
  date: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date()
    ),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const SelectBusinessMetricSchema = createSelectSchema(businessMetrics);

// ===== LISTING INQUIRIES =====

export type ListingInquiry = typeof listingInquiries.$inferSelect;
export type NewListingInquiry = typeof listingInquiries.$inferInsert;

export const CreateListingInquirySchema = createInsertSchema(listingInquiries, {
  listingId: z.string().length(36, "Invalid listing ID format."),
  inquirerId: z.string().length(36, "Invalid inquirer ID format."),
  message: z
    .string()
    .min(1, "Message is required.")
    .max(1000, "Message cannot exceed 1000 characters."),
  isPublic: z.boolean().default(true),
  parentId: z
    .string()
    .length(36, "Invalid parent ID format.")
    .optional()
    .nullable(),
  status: z.enum(listingInquiries.status.enumValues).default("pending"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateListingInquirySchema = createUpdateSchema(listingInquiries, {
  id: z.string().length(36, "Invalid inquiry ID format.").optional(),
  status: z.enum(listingInquiries.status.enumValues).optional(),
});

export const SelectListingInquirySchema = createSelectSchema(listingInquiries);

export const ListingInquiryResponseSchema = SelectListingInquirySchema.extend({
  inquirer: UserResponseSchema.optional(),
  replies: z.array(z.lazy(() => ListingInquiryResponseSchema)).optional(),
});

// ===== USER PREFERENCES =====

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

export const CreateUserPreferenceSchema = createInsertSchema(userPreferences, {
  userId: z.string().length(36, "Invalid user ID format."),
  preferredCategories: z
    .array(z.string().min(1).max(100))
    .max(20, "Cannot have more than 20 preferred categories.")
    .optional(),
  priceRanges: z
    .record(
      z.string(),
      z.object({
        min: z.number().min(0),
        max: z.number().min(0),
      })
    )
    .optional(),
  preferredBrands: z
    .array(z.string().min(1).max(100))
    .max(50, "Cannot have more than 50 preferred brands.")
    .optional(),
  searchRadius: z
    .number()
    .int()
    .min(1, "Search radius must be at least 1 km.")
    .max(1000, "Search radius cannot exceed 1000 km.")
    .default(10),
  deliveryPreferences: z
    .array(z.enum(["pickup", "delivery", "shipping"]))
    .optional(),
  notificationSettings: z
    .object({
      newListings: z.boolean().default(true),
      priceDrops: z.boolean().default(true),
      savedSearchAlerts: z.boolean().default(true),
      inquiryResponses: z.boolean().default(true),
    })
    .optional(),
  privacySettings: z
    .object({
      showExactLocation: z.boolean().default(false),
      showOnlineStatus: z.boolean().default(true),
      allowDirectMessages: z.boolean().default(true),
    })
    .optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserPreferenceSchema = createUpdateSchema(userPreferences, {
  userId: z.string().length(36, "Invalid user ID format.").optional(),
});

export const SelectUserPreferenceSchema = createSelectSchema(userPreferences);

// ===== TYPE EXPORTS =====

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;
export type ListingResponse = z.infer<typeof ListingResponseSchema>;

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
export type UpdateRequestInput = z.infer<typeof UpdateRequestSchema>;
export type RequestResponse = z.infer<typeof RequestResponseSchema>;

export type CreateRequestResponseInput = z.infer<typeof CreateRequestResponseSchema>;
export type UpdateRequestResponseInput = z.infer<typeof UpdateRequestResponseSchema>;
export type RequestResponseResponse = z.infer<typeof RequestResponseResponseSchema>;

export type CreateSavedSearchInput = z.infer<typeof CreateSavedSearchSchema>;
export type UpdateSavedSearchInput = z.infer<typeof UpdateSavedSearchSchema>;
export type SavedSearchResponse = z.infer<typeof SelectSavedSearchSchema>;

export type CreateFavoriteInput = z.infer<typeof CreateFavoriteSchema>;
export type FavoriteResponse = z.infer<typeof SelectFavoriteSchema>;

export type CreateSellerFollowInput = z.infer<typeof CreateSellerFollowSchema>;
export type UpdateSellerFollowInput = z.infer<typeof UpdateSellerFollowSchema>;
export type SellerFollowResponse = z.infer<typeof SelectSellerFollowSchema>;

export type CreateBusinessMetricInput = z.infer<typeof CreateBusinessMetricSchema>;
export type BusinessMetricResponse = z.infer<typeof SelectBusinessMetricSchema>;

export type CreateListingInquiryInput = z.infer<typeof CreateListingInquirySchema>;
export type UpdateListingInquiryInput = z.infer<typeof UpdateListingInquirySchema>;
export type ListingInquiryResponse = z.infer<typeof ListingInquiryResponseSchema>;

export type CreateUserPreferenceInput = z.infer<typeof CreateUserPreferenceSchema>;
export type UpdateUserPreferenceInput = z.infer<typeof UpdateUserPreferenceSchema>;
export type UserPreferenceResponse = z.infer<typeof SelectUserPreferenceSchema>;

// ===== SEARCH & FILTER SCHEMAS =====

export const ListingSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  type: z.enum(["product", "service"]).optional(),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  location: z.string().optional(),
  radius: z.number().int().min(1).max(1000).default(10),
  sortBy: z.enum(["newest", "oldest", "price_low", "price_high", "distance", "relevance"]).default("relevance"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const RequestSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  urgency: z.enum(["low", "medium", "high", "urgent"]).optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  location: z.string().optional(),
  radius: z.number().int().min(1).max(1000).default(10),
  sortBy: z.enum(["newest", "oldest", "budget_high", "budget_low", "urgency", "distance"]).default("newest"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type ListingSearchInput = z.infer<typeof ListingSearchSchema>;
export type RequestSearchInput = z.infer<typeof RequestSearchSchema>;