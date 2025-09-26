# Klozbuy Marketplace Transformation Guide

## Overview

This document outlines comprehensive recommendations to transform Klozbuy from a social media platform into a focused marketplace while maintaining privacy and location-based features.

## 1. Reducing Social Media Aspects

### Features to Remove/Minimize

#### Complete Removal

- **General posts** - Remove the "general" post type entirely
- **Personal status updates** and casual social content
- **Public timeline/feed** - Replace with curated marketplace feed
- **Follower counts** as social metrics
- **Social reactions** (like, love, support) - Keep only practical ones (want, interested)
- **Comment threads** on posts - Replace with Q&A format for products/services
- **Shares for social purposes** - Keep only for marketplace recommendations

#### Schema Changes Required

```typescript
// Current post types in posts-schema.ts
const postTypeEnum = ["general", "product", "service", "event"] as const;

// Recommended marketplace-focused types
const listingTypeEnum = ["product", "service", "event", "request"] as const;

// Update posts table
export const posts = mysqlTable("posts", {
  // ... existing fields
  type: mysqlEnum("type", listingTypeEnum).notNull(), // Updated
  // Remove social-focused fields
  // likesCount: int("likes_count").default(0), // Remove
  // sharesCount: int("shares_count").default(0), // Remove

  // Add marketplace-focused fields
  inquiriesCount: int("inquiries_count").default(0),
  favoritesCount: int("favorites_count").default(0),
  // ... rest of fields
});
```

### Features to Transform

#### Social → Marketplace Transformations

- **Follow system** → **Favorite Sellers/Watchlist**
- **Comments** → **Product Questions & Seller Responses**
- **Shares** → **Recommendations to Friends**
- **Profile visits** → **Store/Seller Profile Views**
- **Likes** → **Favorites/Wishlist**

#### Implementation Example

```typescript
// Transform follows table to favorites
export const sellerFavorites = mysqlTable(
  "seller_favorites",
  {
    id,
    buyerId: varchar("buyer_id", { length: 36 }).notNull(),
    sellerId: varchar("seller_id", { length: 36 }).notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("unique_buyer_seller").on(table.buyerId, table.sellerId),
  ]
);

// Transform comments to Q&A
export const productQuestions = mysqlTable("product_questions", {
  id,
  listingId: varchar("listing_id", { length: 36 }).notNull(),
  buyerId: varchar("buyer_id", { length: 36 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredAt: timestamp("answered_at"),
  isPublic: boolean("is_public").default(true),
  createdAt,
  updatedAt,
});
```

## 2. Advanced Location-Based Recommendation Algorithms

### A. Multi-Factor Proximity Algorithm

```typescript
interface LocationScore {
  distance: number;
  popularityInArea: number;
  userPreferenceMatch: number;
  timeRelevance: number;
  priceRelevance: number;
}

function calculateLocationRelevance(
  userLat: number,
  userLng: number,
  listing: Listing,
  userPreferences: UserPreferences
): number {
  // 1. Distance decay function (exponential decay)
  const distance = calculateHaversineDistance(
    userLat,
    userLng,
    listing.lat,
    listing.lng
  );
  const distanceScore = Math.exp(-distance / 5); // 5km decay constant

  // 2. Local popularity boost
  const localPopularityScore =
    listing.viewsInRadius / Math.max(listing.totalViews, 1);

  // 3. Category preference matching
  const categoryScore = userPreferences.categories.includes(listing.category)
    ? 1.2
    : 1.0;

  // 4. Time-based relevance (fresher listings get boost)
  const daysSincePosted =
    (Date.now() - listing.createdAt) / (1000 * 60 * 60 * 24);
  const freshnessScore = Math.exp(-daysSincePosted / 7); // 7-day decay

  // 5. Price relevance (within user's budget gets boost)
  const priceScore = listing.price <= userPreferences.maxBudget ? 1.1 : 0.8;

  return (
    distanceScore *
    localPopularityScore *
    categoryScore *
    freshnessScore *
    priceScore
  );
}
```

### B. Collaborative Filtering for Local Preferences

```typescript
interface UserBehaviorPattern {
  userId: string;
  locationCluster: string;
  categoryPreferences: Record<string, number>;
  priceRangePreferences: Record<string, number>;
  timePatterns: Record<string, number>;
  brandPreferences: Record<string, number>;
}

// Database schema for behavior tracking
export const userBehaviorPatterns = mysqlTable("user_behavior_patterns", {
  id,
  userId,
  locationCluster: varchar("location_cluster", { length: 50 }),
  categoryPreferences: json("category_preferences"),
  priceRangePreferences: json("price_range_preferences"),
  timePatterns: json("time_patterns"),
  brandPreferences: json("brand_preferences"),
  updatedAt,
});

// Find users with similar location and behavior patterns
function findSimilarLocalUsers(
  targetUser: UserBehaviorPattern
): UserBehaviorPattern[] {
  // Implementation using cosine similarity
  // Cluster users by location + behavior similarity
  // Recommend items popular among similar users in the same area
}
```

### C. Dynamic Radius Adjustment

```typescript
function calculateOptimalRadius(
  userLocation: Location,
  category: string,
  minResults: number = 10,
  maxRadius: number = 50
): number {
  let radius = 2; // Start with 2km
  let resultCount = 0;

  while (resultCount < minResults && radius <= maxRadius) {
    resultCount = countListingsInRadius(userLocation, category, radius);
    if (resultCount < minResults) {
      radius *= 1.5; // Expand radius by 50%
    }
  }

  return Math.min(radius, maxRadius);
}

// Database schema for radius optimization
export const categoryRadiusMetrics = mysqlTable("category_radius_metrics", {
  id,
  category: varchar("category", { length: 100 }),
  locationCluster: varchar("location_cluster", { length: 50 }),
  optimalRadius: decimal("optimal_radius", { precision: 5, scale: 2 }),
  averageListingDensity: decimal("avg_listing_density", {
    precision: 8,
    scale: 4,
  }),
  updatedAt,
});
```

### D. Seasonal and Time-Based Recommendations

```typescript
interface TimeBasedBoost {
  category: string;
  timeOfDay: number[]; // Hours 0-23
  dayOfWeek: number[]; // 0-6 (Sunday-Saturday)
  seasonalMultiplier: number;
  weatherDependency?: "rain" | "sun" | "cold" | "hot";
}

// Database schema
export const seasonalBoosts = mysqlTable("seasonal_boosts", {
  id,
  category: varchar("category", { length: 100 }),
  timeOfDay: json("time_of_day"), // Array of hours
  dayOfWeek: json("day_of_week"), // Array of days
  seasonalMultiplier: decimal("seasonal_multiplier", {
    precision: 3,
    scale: 2,
  }),
  weatherDependency: mysqlEnum("weather_dependency", [
    "rain",
    "sun",
    "cold",
    "hot",
  ]),
  isActive: boolean("is_active").default(true),
});

// Examples:
// - Boost restaurant listings during meal times (11-14, 18-21)
// - Boost event listings on weekends (5,6)
// - Boost umbrella/raincoat during rainy season
// - Boost ice cream/cold drinks during hot weather
```

## 3. New Marketplace-Focused Features

### A. Enhanced Search & Discovery

```typescript
// Saved searches for users
export const savedSearches = mysqlTable("saved_searches", {
  id,
  userId,
  searchQuery: varchar("search_query", { length: 255 }),
  filters: json("filters"), // price range, category, radius, condition
  alertsEnabled: boolean("alerts_enabled").default(false),
  alertFrequency: mysqlEnum("alert_frequency", [
    "instant",
    "daily",
    "weekly",
  ]).default("daily"),
  createdAt,
  updatedAt,
});

// Search alerts when new matching items are found
export const searchAlerts = mysqlTable("search_alerts", {
  id,
  savedSearchId: varchar("saved_search_id", { length: 36 }),
  triggeredAt: timestamp("triggered_at"),
  listingId: varchar("listing_id", { length: 36 }),
  notificationSent: boolean("notification_sent").default(false),
});

// Advanced search filters
export const searchFilters = mysqlTable("search_filters", {
  id,
  userId,
  category: varchar("category", { length: 100 }),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  condition: mysqlEnum("condition", ["new", "used", "refurbished"]),
  radius: int("radius").default(10),
  sortBy: mysqlEnum("sort_by", [
    "relevance",
    "price_low",
    "price_high",
    "newest",
    "nearest",
  ]),
  createdAt,
});
```

### B. Request/Wanted Listings System

```typescript
export const requests = mysqlTable(
  "requests",
  {
    id,
    userId,
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
    budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("NGN"),
    urgency: mysqlEnum("urgency", ["low", "medium", "high"]).default("medium"),
    locationId: varchar("location_id", { length: 36 }),
    radius: int("radius").default(10), // km
    expiresAt: timestamp("expires_at"),
    status: mysqlEnum("status", [
      "active",
      "fulfilled",
      "expired",
      "cancelled",
    ]).default("active"),
    responseCount: int("response_count").default(0),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("requests_category_idx").on(table.category),
    index("requests_status_idx").on(table.status),
    index("requests_location_idx").on(table.locationId),
    index("requests_expires_at_idx").on(table.expiresAt),
  ]
);

// Responses to requests
export const requestResponses = mysqlTable("request_responses", {
  id,
  requestId: varchar("request_id", { length: 36 }),
  sellerId: varchar("seller_id", { length: 36 }),
  message: text("message"),
  proposedPrice: decimal("proposed_price", { precision: 10, scale: 2 }),
  availabilityDate: timestamp("availability_date"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default(
    "pending"
  ),
  createdAt,
});
```

### C. Smart Matching System

```typescript
export const listingMatches = mysqlTable(
  "listing_matches",
  {
    id,
    listingId: varchar("listing_id", { length: 36 }),
    requestId: varchar("request_id", { length: 36 }),
    matchScore: decimal("match_score", { precision: 3, scale: 2 }),
    matchFactors: json("match_factors"), // What made it match
    notificationSent: boolean("notification_sent").default(false),
    userViewed: boolean("user_viewed").default(false),
    createdAt,
  },
  (table) => [
    index("matches_listing_idx").on(table.listingId),
    index("matches_request_idx").on(table.requestId),
    index("matches_score_idx").on(table.matchScore),
  ]
);

// Matching algorithm
function calculateMatchScore(listing: Listing, request: Request): number {
  let score = 0;
  const factors = [];

  // Category match (40% weight)
  if (listing.category === request.category) {
    score += 0.4;
    factors.push("category_exact_match");
  }

  // Price match (30% weight)
  if (
    listing.price >= request.budgetMin &&
    listing.price <= request.budgetMax
  ) {
    score += 0.3;
    factors.push("price_in_budget");
  }

  // Location proximity (20% weight)
  const distance = calculateDistance(listing.location, request.location);
  if (distance <= request.radius) {
    const proximityScore = Math.max(
      0,
      (request.radius - distance) / request.radius
    );
    score += 0.2 * proximityScore;
    factors.push("location_proximity");
  }

  // Urgency bonus (10% weight)
  if (request.urgency === "high" && listing.availability === "in_stock") {
    score += 0.1;
    factors.push("urgency_match");
  }

  return { score, factors };
}
```

### D. Enhanced Business Features

```typescript
// Business operating hours
export const businessHours = mysqlTable("business_hours", {
  id,
  businessProfileId: varchar("business_profile_id", { length: 36 }),
  dayOfWeek: int("day_of_week"), // 0-6 (Sunday-Saturday)
  openTime: varchar("open_time", { length: 8 }), // HH:MM:SS
  closeTime: varchar("close_time", { length: 8 }),
  isOpen: boolean("is_open").default(true),
  timezone: varchar("timezone", { length: 50 }).default("Africa/Lagos"),
});

// Business performance metrics
export const businessMetrics = mysqlTable("business_metrics", {
  id,
  businessProfileId: varchar("business_profile_id", { length: 36 }),
  date: timestamp("date"),
  profileViews: int("profile_views").default(0),
  listingViews: int("listing_views").default(0),
  inquiries: int("inquiries").default(0),
  conversions: int("conversions").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default(0),
  responseTime: int("avg_response_time_minutes"),
});

// Business verification levels
export const businessVerifications = mysqlTable("business_verifications", {
  id,
  businessProfileId: varchar("business_profile_id", { length: 36 }),
  verificationType: mysqlEnum("type", [
    "basic",
    "phone",
    "email",
    "address",
    "documents",
    "premium",
  ]),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  verificationData: json("verification_data"),
});
```

## 4. Features to Exclude for Marketplace Focus

### Complete Removal List

#### Social Media Features

- **Personal timelines/feeds** - Replace with marketplace discovery
- **Story features** - Not relevant for marketplace
- **Social status indicators** (online status, last seen) - Privacy concern
- **Casual messaging** - Keep only business inquiries
- **Social groups/communities** - Focus on individual transactions
- **Personal photo albums** - Only product/service images
- **Social check-ins** - Not marketplace relevant
- **Trending hashtags** - Unless product-related

#### Files to Modify/Remove

```bash
# Remove or heavily modify these components:
src/components/home/feed-section.tsx # Transform to marketplace feed
src/app/[userId]/ # Transform to seller/buyer profiles only
src/controllers/follow.controller.ts # Transform to favorites
src/services/follow.service.ts # Transform to favorites
```

### Keep but Modify

#### Transform Social Features

- **Messaging** → **Inquiry System** (structured, business-focused)
- **Notifications** → **Transaction & Business Alerts**
- **User Profiles** → **Buyer/Seller Profiles** with transaction history
- **Reviews** → **Transaction-based Reviews** only

#### Updated Schema Examples

```typescript
// Transform messaging to inquiry system
export const inquiries = mysqlTable("inquiries", {
  id,
  listingId: varchar("listing_id", { length: 36 }),
  buyerId: varchar("buyer_id", { length: 36 }),
  sellerId: varchar("seller_id", { length: 36 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message"),
  inquiryType: mysqlEnum("type", [
    "price",
    "availability",
    "details",
    "custom",
  ]),
  status: mysqlEnum("status", ["open", "responded", "closed"]),
  responseTime: int("response_time_minutes"),
  createdAt,
  updatedAt,
});

// Transaction-based reviews only
export const transactionReviews = mysqlTable("transaction_reviews", {
  id,
  transactionId: varchar("transaction_id", { length: 36 }),
  reviewerId: varchar("reviewer_id", { length: 36 }),
  revieweeId: varchar("reviewee_id", { length: 36 }),
  rating: int("rating"), // 1-5
  reviewText: text("review_text"),
  reviewType: mysqlEnum("type", ["buyer_to_seller", "seller_to_buyer"]),
  isVerifiedPurchase: boolean("is_verified_purchase").default(true),
  createdAt,
});
```

## 5. User Engagement Features (Marketplace-Appropriate)

### A. Gamification for Marketplace Activity

```typescript
export const userAchievements = mysqlTable("user_achievements", {
  id,
  userId,
  achievementType: mysqlEnum("type", [
    "first_purchase",
    "verified_seller",
    "local_hero",
    "bargain_hunter",
    "quick_responder",
    "trusted_trader",
    "power_seller",
    "community_favorite",
    "early_adopter",
  ]),
  earnedAt: timestamp("earned_at"),
  points: int("points").default(0),
  description: varchar("description", { length: 255 }),
  badgeUrl: varchar("badge_url", { length: 500 }),
});

export const loyaltyProgram = mysqlTable("loyalty_program", {
  id,
  userId,
  totalPoints: int("total_points").default(0),
  currentTier: mysqlEnum("tier", [
    "bronze",
    "silver",
    "gold",
    "platinum",
  ]).default("bronze"),
  transactionCount: int("transaction_count").default(0),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default(0),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).default(0),
  tierBenefits: json("tier_benefits"),
  nextTierRequirement: json("next_tier_requirement"),
});

// Point earning activities
export const pointActivities = mysqlTable("point_activities", {
  id,
  userId,
  activityType: mysqlEnum("type", [
    "listing_created",
    "purchase_made",
    "review_left",
    "profile_completed",
    "verification_completed",
    "referral_made",
  ]),
  points: int("points"),
  description: varchar("description", { length: 255 }),
  createdAt,
});
```

### B. Smart Recommendations Engine

```typescript
export const userInteractions = mysqlTable(
  "user_interactions",
  {
    id,
    userId,
    listingId: varchar("listing_id", { length: 36 }),
    interactionType: mysqlEnum("type", [
      "view",
      "inquiry",
      "save",
      "share",
      "purchase",
      "search",
    ]),
    duration: int("duration_seconds"), // Time spent viewing
    deviceType: varchar("device_type", { length: 50 }),
    referrerType: varchar("referrer_type", { length: 50 }), // search, recommendation, direct
    createdAt,
  },
  (table) => [
    index("interactions_user_idx").on(table.userId),
    index("interactions_listing_idx").on(table.listingId),
    index("interactions_type_idx").on(table.interactionType),
  ]
);

// Recommendation algorithm based on interactions
function generateRecommendations(userId: string): Listing[] {
  // 1. Collaborative filtering based on similar users
  // 2. Content-based filtering based on user's interaction history
  // 3. Location-based recommendations
  // 4. Trending items in user's area
  // 5. Price-based recommendations within user's budget range
}
```

### C. Local Market Insights

```typescript
export const marketInsights = mysqlTable(
  "market_insights",
  {
    id,
    locationId: varchar("location_id", { length: 36 }),
    category: varchar("category", { length: 100 }),
    averagePrice: decimal("average_price", { precision: 10, scale: 2 }),
    medianPrice: decimal("median_price", { precision: 10, scale: 2 }),
    listingCount: int("listing_count"),
    soldCount: int("sold_count"),
    demandScore: decimal("demand_score", { precision: 3, scale: 2 }), // 0-1
    supplyScore: decimal("supply_score", { precision: 3, scale: 2 }), // 0-1
    trendDirection: mysqlEnum("trend", ["up", "down", "stable"]),
    weekOfYear: int("week_of_year"),
    year: int("year"),
    createdAt,
  },
  (table) => [
    index("insights_location_category_idx").on(
      table.locationId,
      table.category
    ),
    index("insights_week_year_idx").on(table.weekOfYear, table.year),
  ]
);

// Price prediction based on market data
export const pricePredictions = mysqlTable("price_predictions", {
  id,
  category: varchar("category", { length: 100 }),
  locationCluster: varchar("location_cluster", { length: 50 }),
  predictedPrice: decimal("predicted_price", { precision: 10, scale: 2 }),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  factors: json("factors"), // What influenced the prediction
  validUntil: timestamp("valid_until"),
  createdAt,
});
```

## 6. Privacy-Preserving Location Features

### A. Location Abstraction Levels

```typescript
interface LocationPrivacy {
  exact: { lat: number; lng: number }; // Only for completed transactions
  approximate: { lat: number; lng: number }; // ±500m for active listings
  district: string; // "Victoria Island, Lagos"
  city: string; // "Lagos"
  state: string; // "Lagos State"
}

// Database schema for location privacy
export const locationPrivacySettings = mysqlTable("location_privacy_settings", {
  id,
  userId,
  defaultLevel: mysqlEnum("level", [
    "exact",
    "approximate",
    "district",
    "city",
    "state",
  ]).default("approximate"),
  showToFollowers: mysqlEnum("followers_level", [
    "exact",
    "approximate",
    "district",
    "city",
    "state",
  ]).default("district"),
  showToPublic: mysqlEnum("public_level", [
    "approximate",
    "district",
    "city",
    "state",
  ]).default("district"),
  allowLocationHistory: boolean("allow_location_history").default(false),
  createdAt,
  updatedAt,
});

function getLocationByPrivacyLevel(
  location: Location,
  privacyLevel: keyof LocationPrivacy,
  userRelation: "owner" | "inquirer" | "browser"
): LocationPrivacy[keyof LocationPrivacy] {
  switch (privacyLevel) {
    case "exact":
      return userRelation === "owner"
        ? location
        : addLocationNoise(location, 100); // 100m noise
    case "approximate":
      return addLocationNoise(location, 500); // 500m noise
    case "district":
      return getDistrictName(location);
    case "city":
      return getCityName(location);
    case "state":
      return getStateName(location);
    default:
      return getDistrictName(location);
  }
}

// Add random noise to coordinates for privacy
function addLocationNoise(location: Location, radiusMeters: number): Location {
  const earthRadius = 6371000; // Earth's radius in meters
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random() * radiusMeters;

  const deltaLat =
    ((randomRadius * Math.cos(randomAngle)) / earthRadius) * (180 / Math.PI);
  const deltaLng =
    ((randomRadius * Math.sin(randomAngle)) /
      (earthRadius * Math.cos((location.lat * Math.PI) / 180))) *
    (180 / Math.PI);

  return {
    lat: location.lat + deltaLat,
    lng: location.lng + deltaLng,
  };
}
```

### B. Proximity-Based Matching Without Exact Locations

```typescript
// Geohashing for privacy-preserving location matching
export const locationGeohashes = mysqlTable(
  "location_geohashes",
  {
    id,
    locationId: varchar("location_id", { length: 36 }),
    geohash4: varchar("geohash_4", { length: 4 }), // ~20km precision
    geohash5: varchar("geohash_5", { length: 5 }), // ~5km precision
    geohash6: varchar("geohash_6", { length: 6 }), // ~1km precision
    geohash7: varchar("geohash_7", { length: 7 }), // ~150m precision
    createdAt,
  },
  (table) => [
    index("geohash_4_idx").on(table.geohash4),
    index("geohash_5_idx").on(table.geohash5),
    index("geohash_6_idx").on(table.geohash6),
    index("geohash_7_idx").on(table.geohash7),
  ]
);

function findNearbyListings(
  userLocation: Location,
  radius: number,
  category?: string
): Listing[] {
  // Use appropriate geohash precision based on radius
  const precision = radius <= 1 ? 7 : radius <= 5 ? 6 : radius <= 20 ? 5 : 4;
  const userGeohash = encodeGeohash(
    userLocation.lat,
    userLocation.lng,
    precision
  );

  // Find listings with matching geohash prefixes
  // This avoids exposing exact coordinates to the client
  return findListingsByGeohash(userGeohash, category);
}

// Location clustering for anonymity
export const locationClusters = mysqlTable("location_clusters", {
  id,
  clusterName: varchar("cluster_name", { length: 100 }),
  centerLat: decimal("center_lat", { precision: 10, scale: 8 }),
  centerLng: decimal("center_lng", { precision: 11, scale: 8 }),
  radius: int("radius_meters"),
  memberCount: int("member_count").default(0),
  isActive: boolean("is_active").default(true),
});
```

## 7. Implementation Priority

### Phase 1: Core Marketplace Features (Weeks 1-4)

1. Remove general posts and social features
2. Implement request/wanted listings
3. Transform follow system to favorites
4. Update post types and schemas

### Phase 2: Enhanced Discovery (Weeks 5-8)

1. Implement advanced search and filters
2. Add saved searches and alerts
3. Build recommendation engine
4. Implement location privacy controls

### Phase 3: Business Features (Weeks 9-12)

1. Enhanced business profiles and metrics
2. Smart matching system
3. Inquiry system (replace casual messaging)
4. Transaction-based reviews

### Phase 4: Engagement & Analytics (Weeks 13-16)

1. Gamification and loyalty program
2. Market insights and analytics
3. Performance optimization
4. Advanced location algorithms

## 8. Database Migration Strategy

### Step 1: Add New Tables

```sql
-- Add all new marketplace-focused tables
-- Keep existing tables for backward compatibility initially
```

### Step 2: Data Migration

```sql
-- Migrate existing data to new structure
-- Transform follows to favorites
-- Convert comments to Q&A format
-- Update post types
```

### Step 3: Remove Old Tables

```sql
-- After successful migration and testing
-- Remove social media focused tables
-- Clean up unused columns
```

## 9. API Changes Required

### New Endpoints

```typescript
// Marketplace-focused API endpoints
POST /api/requests - Create wanted listing
GET /api/recommendations - Get personalized recommendations
POST /api/inquiries - Send inquiry about listing
GET /api/market-insights - Get local market data
POST /api/favorites/sellers - Add seller to favorites
GET /api/search/saved - Get saved searches
```

### Modified Endpoints

```typescript
// Transform existing endpoints
GET /api/posts -> GET /api/listings
POST /api/follow -> POST /api/favorites
GET /api/feed -> GET /api/marketplace-feed
```

This transformation will create a focused, privacy-conscious marketplace that leverages location intelligence while maintaining user engagement through marketplace-specific features rather than social media mechanics.
