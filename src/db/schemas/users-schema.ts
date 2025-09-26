import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  index,
  mysqlEnum,
  text,
  decimal,
  int,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { advertisements } from "./advertisements-schema";
import {
  commentReactions,
  postComments,
  postReactions,
  posts,
} from "./posts-schema";
import { medias } from "./media-schema";
import {
  messages,
  conversationParticipants,
  conversations,
  messageReactions,
  messageReadReceipts,
  messageMentions,
} from "./messages-schema";
import { userPrivacySettings } from "./privacy-schema";
import { generateUniqueId } from "@/lib/id-generator";

const genderEnum = ["male", "female", "other", "prefer_not_to_say"] as const;
const id = varchar("id", { length: 36 })
  .primaryKey()
  .$defaultFn(
    () => generateUniqueId() // this should be bigint string e.g 17489305838459032
  );
const userId = varchar("user_id", { length: 36 })
  .notNull()
  .references(() => users.id, { onDelete: "cascade" });
const createdAt = timestamp("created_at").defaultNow();
const updatedAt = timestamp("updated_at").defaultNow().onUpdateNow();

export const users = mysqlTable(
  "users",
  {
    id,
    lastSeenAt: timestamp("last_seen_at"),
    type: mysqlEnum("type", ["individual", "business"]).notNull(),
    username: varchar("username", { length: 50 }).unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false),
    phoneNumber: varchar("phone_number", { length: 255 }).unique(),
    phoneNumberVerified: boolean("phone_number_verified"),
    isOnline: boolean("is_online").default(false),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    bio: varchar("bio", { length: 255 }),
    profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
    coverImageUrl: varchar("cover_image_url", { length: 500 }),
    website: varchar("website", { length: 255 }),
    dateOfBirth: timestamp("date_of_birth"),
    gender: mysqlEnum("gender", genderEnum),
    role: varchar("role", { length: 50, enum: ["admin", "user"] }),
    banned: boolean("banned"),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    displayUsername: varchar("display_username", { length: 50 }),
    isVerified: boolean("is_verified").default(false),
    followersCount: int("followers_count").default(0),
    followingCount: int("following_count").default(0),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("users_username_idx").on(table.username),
    index("users_email_idx").on(table.email),
    index("users_type_idx").on(table.type),
    index("users_online_idx").on(table.isOnline),
    index("users_email_verified_idx").on(table.emailVerified),
    index("users_phone_verified_idx").on(table.phoneNumberVerified),
    index("users_is_verified_idx").on(table.isVerified),
    index("users_role_idx").on(table.role),
    index("users_banned_idx").on(table.banned),
    index("users_phone_number_idx").on(table.phoneNumber),
    index("users_created_at_idx").on(table.createdAt),
    index("users_last_seen_idx").on(table.lastSeenAt),
    index("users_gender_idx").on(table.gender),
    index("users_date_of_birth_idx").on(table.dateOfBirth),
    index("users_first_name_idx").on(table.firstName),
    index("users_last_name_idx").on(table.lastName),
    index("users_followers_count_idx").on(table.followersCount),
    index("users_following_count_idx").on(table.followingCount),
    index("users_display_username_idx").on(table.displayUsername),

    index("users_bio_idx").on(table.bio),
    sql`FULLTEXT INDEX (bio) WITH PARSER MULTILINGUAL`,
  ]
);

// Business profiles - Extended info for businesses
export const businessProfiles = mysqlTable(
  "business_profiles",
  {
    id,
    userId: userId,
    businessName: varchar("business_name", { length: 100 }).notNull(),
    businessCategory: varchar("business_category", { length: 50 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxId: varchar("tax_id", { length: 100 }),
    isVerified: boolean("is_verified").default(false),
    reviewsCount: int("reviews_count").default(0),
    contactPhone: varchar("contact_phone", { length: 20 }),
    address: varchar("address", { length: 255 }),
    averageRating: decimal("average_rating", {
      precision: 3,
      scale: 2,
      mode: "number",
    }).default(0.0),
    verificationStatus: mysqlEnum("verification_status", [
      "pending",
      "approved",
      "rejected",
      "suspended",
    ]).default("pending"),
    verifiedAt: timestamp("verified_at"),
    registeredDate: int("registered_date"),
    employeeCount: mysqlEnum("employee_count", [
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "500+",
    ]),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("business_profiles_user_id_idx").on(table.userId),
    index("business_profiles_verified_idx").on(table.isVerified),
    index("business_profiles_status_idx").on(table.verificationStatus),
    index("business_profiles_created_at_idx").on(table.createdAt),
    index("business_profiles_business_name_idx").on(table.businessName),
    index("business_profiles_registred_date_idx").on(table.registeredDate),
    index("business_profiles_employee_count_idx").on(table.employeeCount),
    index("business_profiles_business_category_idx").on(table.businessCategory),
    index("business_profiles_average_rating_idx").on(table.averageRating),
    index("business_profiles_reviews_count_idx").on(table.reviewsCount),
    index("business_profiles_address_idx").on(table.address),
    index("business_profiles_contact_phone_idx").on(table.contactPhone),
    sql`FULLTEXT INDEX (business_name) WITH PARSER MULTILINGUAL`,
  ]
);

// Locations table - Normalized location data
export const locations = mysqlTable(
  "locations",
  {
    id,
    userId: userId,
    type: mysqlEnum("type", ["primary", "business", "delivery"]).default(
      "primary"
    ),
    name: varchar("name", { length: 100 }), // e.g., "Main Store", "Home"
    address: varchar("address", { length: 255 }),
    city: varchar("city", { length: 100 }),
    landmark: varchar("landmark", { length: 150 }),
    state: varchar("state", { length: 100 }),
    country: varchar("country", { length: 100 }).default("Nigeria"),
    postalCode: varchar("postal_code", { length: 20 }),
    latitude: decimal("latitude", { precision: 10, scale: 8, mode: "number" }),
    longitude: decimal("longitude", {
      precision: 11,
      scale: 8,
      mode: "number",
    }),
    isActive: boolean("is_active").default(true),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("locations_user_id_idx").on(table.userId),
    index("locations_lat_lng_idx").on(table.latitude, table.longitude),
    index("locations_city_idx").on(table.city),
    index("locations_active_idx").on(table.isActive),
    index("locations_created_at_idx").on(table.createdAt),
    index("locations_country_idx").on(table.country),
    index("locations_postal_code_idx").on(table.postalCode),
    index("locations_state_idx").on(table.state),
    index("locations_name_idx").on(table.name),
    index("locations_address_idx").on(table.address),
  ]
);
export const follows = mysqlTable(
  "follows",
  {
    id,
    followerId: varchar("follower_id", { length: 36 }).notNull(),
    followingId: varchar("following_id", { length: 36 }).notNull(),
    createdAt,
  },
  (table) => [
    index("follows_follower_id_idx").on(table.followerId),
    index("follows_following_id_idx").on(table.followingId),
    uniqueIndex("follows_unique_follow_idx").on(
      table.followerId,
      table.followingId
    ),
    foreignKey({
      columns: [table.followerId],
      foreignColumns: [users.id],
      name: "follows_follower_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.followingId],
      foreignColumns: [users.id],
      name: "follows_following_id_fk",
    }).onDelete("cascade"),
  ]
);
export const usersRelations = relations(users, ({ one, many }) => ({
  businessProfile: one(businessProfiles, {
    fields: [users.id],
    references: [businessProfiles.userId],
  }),
  privacySettings: one(userPrivacySettings, {
    fields: [users.id],
    references: [userPrivacySettings.userId],
  }),
  posts: many(posts),
  comments: many(postComments),
  postReactions: many(postReactions),
  commentReactions: many(commentReactions),
  advertisements: many(advertisements),
  media: many(medias),
  sentMessages: many(messages),
  conversationParticipants: many(conversationParticipants),
  createdConversations: many(conversations),
  messageReactions: many(messageReactions),
  messageReadReceipts: many(messageReadReceipts),
  messageMentions: many(messageMentions),
  // Following relationships
  following: many(follows, { relationName: "following" }),
  followers: many(follows, { relationName: "follower" }),
}));
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const businessProfilesRelations = relations(
  businessProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [businessProfiles.userId],
      references: [users.id],
    }),
  })
);
