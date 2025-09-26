import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  index,
  mysqlEnum,
  int,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { users } from "./users-schema";
import { generateUniqueId } from "@/lib/id-generator";

const id = varchar("id", { length: 36 })
  .primaryKey()
  .$defaultFn(() => generateUniqueId());

const userId = varchar("user_id", { length: 36 })
  .notNull()
  .references(() => users.id, { onDelete: "cascade" });

const createdAt = timestamp("created_at").defaultNow();
const updatedAt = timestamp("updated_at").defaultNow().onUpdateNow();

export const userPrivacySettings = mysqlTable(
  "user_privacy_settings",
  {
    id,
    userId,
    // Location sharing preferences
    shareExactLocation: boolean("share_exact_location").default(false),
    locationVisibility: mysqlEnum("location_visibility", [
      "public",
      "followers",
      "private"
    ]).default("followers"),
    proximityDisplayRadius: int("proximity_display_radius").default(5), // in kilometers
    showInLocationSearch: boolean("show_in_location_search").default(true),
    enableLocationRecommendations: boolean("enable_location_recommendations").default(true),
    
    // Profile visibility preferences
    profileVisibility: mysqlEnum("profile_visibility", [
      "public",
      "followers",
      "private"
    ]).default("public"),
    showOnlineStatus: boolean("show_online_status").default(true),
    showLastSeen: boolean("show_last_seen").default(true),
    
    // Contact preferences
    allowDirectMessages: mysqlEnum("allow_direct_messages", [
      "everyone",
      "followers",
      "none"
    ]).default("everyone"),
    showPhoneNumber: boolean("show_phone_number").default(false),
    showEmail: boolean("show_email").default(false),
    
    // Activity preferences
    showActivity: boolean("show_activity").default(true),
    indexProfile: boolean("index_profile").default(true), // Allow search engines to index
    
    createdAt,
    updatedAt,
  },
  (table) => [
    index("privacy_settings_user_id_idx").on(table.userId),
    index("privacy_settings_location_visibility_idx").on(table.locationVisibility),
    index("privacy_settings_profile_visibility_idx").on(table.profileVisibility),
    index("privacy_settings_share_exact_location_idx").on(table.shareExactLocation),
    index("privacy_settings_show_in_search_idx").on(table.showInLocationSearch),
    index("privacy_settings_created_at_idx").on(table.createdAt),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "privacy_settings_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const userPrivacySettingsRelations = relations(userPrivacySettings, ({ one }) => ({
  user: one(users, {
    fields: [userPrivacySettings.userId],
    references: [users.id],
  }),
}));