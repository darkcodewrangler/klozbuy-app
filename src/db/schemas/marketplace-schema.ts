import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  int,
  json,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users, locations } from "./users-schema";
import { medias } from "./media-schema";
import { generateUniqueId } from "@/lib/id-generator";

// Common fields
const id = varchar("id", { length: 36 })
  .primaryKey()
  .$defaultFn(() => generateUniqueId());
const userId = varchar("user_id", { length: 36 })
  .notNull()
  .references(() => users.id, { onDelete: "cascade" });
const createdAt = timestamp("created_at").defaultNow();
const updatedAt = timestamp("updated_at").defaultNow().onUpdateNow();
const currency = varchar("currency", { length: 3 }).default("NGN");

// Marketplace Listings - Enhanced from posts
export const listings = mysqlTable(
  "listings",
  {
    id,
    userId,
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    type: mysqlEnum("type", ["product", "service"]).notNull(),
    status: mysqlEnum("status", ["active", "sold", "expired", "draft", "deleted"]).default("active"),
    condition: mysqlEnum("condition", ["new", "used", "refurbished"]),
    
    // Pricing
    price: decimal("price", { precision: 12, scale: 2, mode: "number" }),
    originalPrice: decimal("original_price", { precision: 12, scale: 2, mode: "number" }),
    currency,
    priceType: mysqlEnum("price_type", ["fixed", "negotiable", "auction", "free"]).default("fixed"),
    isNegotiable: boolean("is_negotiable").default(false),
    
    // Location & Delivery
    locationId: varchar("location_id", { length: 36 }).references(() => locations.id, { onDelete: "set null" }),
    deliveryOptions: json("delivery_options"), // ["pickup", "delivery", "shipping"]
    deliveryRadius: int("delivery_radius"), // km
    deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2, mode: "number" }),
    
    // Product specific
    brand: varchar("brand", { length: 100 }),
    model: varchar("model", { length: 100 }),
    sku: varchar("sku", { length: 100 }),
    stockQuantity: int("stock_quantity"),
    minOrderQuantity: int("min_order_quantity").default(1),
    weight: decimal("weight", { precision: 8, scale: 3, mode: "number" }),
    dimensions: json("dimensions"), // { length, width, height }
    
    // Service specific
    serviceType: varchar("service_type", { length: 100 }),
    duration: varchar("duration", { length: 100 }),
    availability: json("availability"), // Available days/hours
    serviceRadius: int("service_radius"), // km for onsite services
    experienceYears: int("experience_years"),
    
    // Engagement metrics
    viewsCount: int("views_count").default(0),
    inquiriesCount: int("inquiries_count").default(0),
    favoritesCount: int("favorites_count").default(0),
    sharesCount: int("shares_count").default(0),
    
    // Promotion
    isPromoted: boolean("is_promoted").default(false),
    promotionEndsAt: timestamp("promotion_ends_at"),
    
    // SEO & Search
    tags: json("tags"), // string[]
    searchKeywords: text("search_keywords"),
    
    // Timestamps
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    soldAt: timestamp("sold_at"),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("listings_user_id_idx").on(table.userId),
    index("listings_category_idx").on(table.category),
    index("listings_subcategory_idx").on(table.subcategory),
    index("listings_type_idx").on(table.type),
    index("listings_status_idx").on(table.status),
    index("listings_condition_idx").on(table.condition),
    index("listings_price_idx").on(table.price),
    index("listings_location_id_idx").on(table.locationId),
    index("listings_brand_idx").on(table.brand),
    index("listings_service_type_idx").on(table.serviceType),
    index("listings_is_promoted_idx").on(table.isPromoted),
    index("listings_published_at_idx").on(table.publishedAt),
    index("listings_expires_at_idx").on(table.expiresAt),
    index("listings_created_at_idx").on(table.createdAt),
    sql`FULLTEXT INDEX listings_search_idx (title, description, search_keywords) WITH PARSER MULTILINGUAL`,
  ]
);

// Listing Media
export const listingMedia = mysqlTable(
  "listing_media",
  {
    id,
    listingId: varchar("listing_id", { length: 36 })
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    mediaId: varchar("media_id", { length: 36 })
      .notNull()
      .references(() => medias.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").default(false),
    sortOrder: int("sort_order").default(0),
    altText: varchar("alt_text", { length: 500 }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("listing_media_listing_id_idx").on(table.listingId),
    index("listing_media_media_id_idx").on(table.mediaId),
    index("listing_media_is_primary_idx").on(table.isPrimary),
    index("listing_media_sort_order_idx").on(table.sortOrder),
  ]
);

// Wanted/Request Listings
export const requests = mysqlTable(
  "requests",
  {
    id,
    userId,
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    
    // Budget
    budgetMin: decimal("budget_min", { precision: 12, scale: 2, mode: "number" }),
    budgetMax: decimal("budget_max", { precision: 12, scale: 2, mode: "number" }),
    currency,
    
    // Location
    locationId: varchar("location_id", { length: 36 }).references(() => locations.id, { onDelete: "set null" }),
    searchRadius: int("search_radius").default(10), // km
    
    // Status
    status: mysqlEnum("status", ["active", "fulfilled", "expired", "cancelled"]).default("active"),
    urgency: mysqlEnum("urgency", ["low", "medium", "high", "urgent"]).default("medium"),
    
    // Engagement
    responsesCount: int("responses_count").default(0),
    viewsCount: int("views_count").default(0),
    
    // Timestamps
    neededBy: timestamp("needed_by"),
    expiresAt: timestamp("expires_at"),
    fulfilledAt: timestamp("fulfilled_at"),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("requests_user_id_idx").on(table.userId),
    index("requests_category_idx").on(table.category),
    index("requests_status_idx").on(table.status),
    index("requests_urgency_idx").on(table.urgency),
    index("requests_location_id_idx").on(table.locationId),
    index("requests_needed_by_idx").on(table.neededBy),
    index("requests_expires_at_idx").on(table.expiresAt),
    index("requests_created_at_idx").on(table.createdAt),
    sql`FULLTEXT INDEX requests_search_idx (title, description) WITH PARSER MULTILINGUAL`,
  ]
);

// Request Responses
export const requestResponses = mysqlTable(
  "request_responses",
  {
    id,
    requestId: varchar("request_id", { length: 36 })
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    responderId: varchar("responder_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    proposedPrice: decimal("proposed_price", { precision: 12, scale: 2, mode: "number" }),
    currency,
    availability: varchar("availability", { length: 200 }),
    status: mysqlEnum("status", ["pending", "accepted", "rejected", "withdrawn"]).default("pending"),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("request_responses_request_id_idx").on(table.requestId),
    index("request_responses_responder_id_idx").on(table.responderId),
    index("request_responses_status_idx").on(table.status),
    uniqueIndex("request_responses_unique_idx").on(table.requestId, table.responderId),
  ]
);

// Saved Searches & Alerts
export const savedSearches = mysqlTable(
  "saved_searches",
  {
    id,
    userId,
    name: varchar("name", { length: 100 }).notNull(),
    searchQuery: text("search_query").notNull(),
    filters: json("filters"), // category, price range, location, etc.
    alertsEnabled: boolean("alerts_enabled").default(true),
    alertFrequency: mysqlEnum("alert_frequency", ["instant", "daily", "weekly"]).default("daily"),
    lastAlertSent: timestamp("last_alert_sent"),
    isActive: boolean("is_active").default(true),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("saved_searches_user_id_idx").on(table.userId),
    index("saved_searches_alerts_enabled_idx").on(table.alertsEnabled),
    index("saved_searches_is_active_idx").on(table.isActive),
  ]
);

// User Favorites/Watchlist
export const favorites = mysqlTable(
  "favorites",
  {
    id,
    userId,
    listingId: varchar("listing_id", { length: 36 })
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    index("favorites_user_id_idx").on(table.userId),
    index("favorites_listing_id_idx").on(table.listingId),
    uniqueIndex("favorites_unique_idx").on(table.userId, table.listingId),
  ]
);

// Seller Following (transformed from social follows)
export const sellerFollows = mysqlTable(
  "seller_follows",
  {
    id,
    followerId: varchar("follower_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: varchar("seller_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    notificationsEnabled: boolean("notifications_enabled").default(true),
    createdAt,
  },
  (table) => [
    index("seller_follows_follower_id_idx").on(table.followerId),
    index("seller_follows_seller_id_idx").on(table.sellerId),
    uniqueIndex("seller_follows_unique_idx").on(table.followerId, table.sellerId),
  ]
);

// Business Metrics & Analytics
export const businessMetrics = mysqlTable(
  "business_metrics",
  {
    id,
    userId,
    date: timestamp("date").notNull(),
    
    // Listing metrics
    activeListings: int("active_listings").default(0),
    newListings: int("new_listings").default(0),
    soldListings: int("sold_listings").default(0),
    expiredListings: int("expired_listings").default(0),
    
    // Engagement metrics
    totalViews: int("total_views").default(0),
    totalInquiries: int("total_inquiries").default(0),
    totalFavorites: int("total_favorites").default(0),
    
    // Revenue metrics
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2, mode: "number" }).default(0),
    averageOrderValue: decimal("average_order_value", { precision: 12, scale: 2, mode: "number" }).default(0),
    
    // Response metrics
    averageResponseTime: int("average_response_time"), // minutes
    responseRate: decimal("response_rate", { precision: 5, scale: 2, mode: "number" }).default(0), // percentage
    
    createdAt,
    updatedAt,
  },
  (table) => [
    index("business_metrics_user_id_idx").on(table.userId),
    index("business_metrics_date_idx").on(table.date),
    uniqueIndex("business_metrics_unique_idx").on(table.userId, table.date),
  ]
);

// Listing Inquiries (transformed from comments)
export const listingInquiries = mysqlTable(
  "listing_inquiries",
  {
    id,
    listingId: varchar("listing_id", { length: 36 })
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    inquirerId: varchar("inquirer_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    isPublic: boolean("is_public").default(true), // public questions vs private messages
    parentId: varchar("parent_id", { length: 36 }).references(() => listingInquiries.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["pending", "answered", "resolved"]).default("pending"),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("listing_inquiries_listing_id_idx").on(table.listingId),
    index("listing_inquiries_inquirer_id_idx").on(table.inquirerId),
    index("listing_inquiries_parent_id_idx").on(table.parentId),
    index("listing_inquiries_status_idx").on(table.status),
    index("listing_inquiries_is_public_idx").on(table.isPublic),
  ]
);

// User Preferences for Recommendations
export const userPreferences = mysqlTable(
  "user_preferences",
  {
    id,
    userId,
    preferredCategories: json("preferred_categories"), // string[]
    priceRanges: json("price_ranges"), // { min, max } per category
    preferredBrands: json("preferred_brands"), // string[]
    searchRadius: int("search_radius").default(10), // km
    deliveryPreferences: json("delivery_preferences"), // ["pickup", "delivery", "shipping"]
    notificationSettings: json("notification_settings"),
    privacySettings: json("privacy_settings"),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("user_preferences_user_id_idx").on(table.userId),
    uniqueIndex("user_preferences_unique_idx").on(table.userId),
  ]
);

// Relations
export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [listings.locationId],
    references: [locations.id],
  }),
  media: many(listingMedia),
  inquiries: many(listingInquiries),
  favorites: many(favorites),
}));

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(listings, {
    fields: [listingMedia.listingId],
    references: [listings.id],
  }),
  media: one(medias, {
    fields: [listingMedia.mediaId],
    references: [medias.id],
  }),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  requester: one(users, {
    fields: [requests.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [requests.locationId],
    references: [locations.id],
  }),
  responses: many(requestResponses),
}));

export const requestResponsesRelations = relations(requestResponses, ({ one }) => ({
  request: one(requests, {
    fields: [requestResponses.requestId],
    references: [requests.id],
  }),
  responder: one(users, {
    fields: [requestResponses.responderId],
    references: [users.id],
  }),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, {
    fields: [savedSearches.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [favorites.listingId],
    references: [listings.id],
  }),
}));

export const sellerFollowsRelations = relations(sellerFollows, ({ one }) => ({
  follower: one(users, {
    fields: [sellerFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  seller: one(users, {
    fields: [sellerFollows.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
}));

export const businessMetricsRelations = relations(businessMetrics, ({ one }) => ({
  user: one(users, {
    fields: [businessMetrics.userId],
    references: [users.id],
  }),
}));

export const listingInquiriesRelations = relations(listingInquiries, ({ one, many }) => ({
  listing: one(listings, {
    fields: [listingInquiries.listingId],
    references: [listings.id],
  }),
  inquirer: one(users, {
    fields: [listingInquiries.inquirerId],
    references: [users.id],
  }),
  parent: one(listingInquiries, {
    fields: [listingInquiries.parentId],
    references: [listingInquiries.id],
  }),
  replies: many(listingInquiries),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));