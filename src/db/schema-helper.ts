import { timestamp, varchar } from "drizzle-orm/mysql-core";
import { users } from "./schemas";
import { generateUniqueId } from "../lib/id-generator";

export const ageGroupEnum = ["teen", "young_adult", "adult", "senior"] as const;
export const genderEnum = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
] as const;
export type Gender = (typeof genderEnum)[number];

export const id = varchar("id", { length: 36 })
  .primaryKey()
  .$defaultFn(() => generateUniqueId());
export const userId = varchar("user_id", { length: 36 })
  .notNull()
  .references(() => users.id, { onDelete: "cascade" });
export const createdAt = timestamp("created_at").defaultNow();
export const updatedAt = timestamp("updated_at").defaultNow().onUpdateNow();
export const postTypeEnum = ["general", "product", "service", "event"] as const;
export const postStatusEnum = [
  "draft",
  "published",
  "archived",
  "deleted",
] as const;
export const postVisibilityEnum = ["public", "followers", "nearby"] as const;
export const currency = varchar("currency", { length: 3 }).default("NGN");
export const reactionType = [
  "like",
  "love",
  "support",
  "interesting",
  "want",
] as const;
export const messageStatus = [
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
] as const;
export type MessageStatus = (typeof messageStatus)[number];
export const attachmentType = [
  "image",
  "video",
  "audio",
  "document",
  "other",
] as const;
export type AttachmentType = (typeof attachmentType)[number];
export const conversationType = ["group", "direct", "channel"] as const;
export type ConversationType = (typeof conversationType)[number];
export const conversationParticipantRole = [
  "member",
  "admin",
  "owner",
] as const;
export type ConversationParticipantRole =
  (typeof conversationParticipantRole)[number];

export const messageType = ["text", "image", "video", "audio", "file"] as const;
export type MessageType = (typeof messageType)[number];

export type ReactionType = (typeof reactionType)[number];
export const mimeType = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/webm",
  "application/pdf",
] as const;
export type MimeType = (typeof mimeType)[number];
export const mediaType = ["image", "video", "audio", "document"] as const;
export type MediaType = (typeof mediaType)[number];
export const notificationEnum = [
  "post_like",
  "post_comment",
  "post_share",
  "post_view",
  "post_comment_reply",
  "post_comment_like",
  "post_comment_share",
  "post_comment_view",
  "post_comment_reply_like",
  "post_comment_reply_share",
  "post_comment_reply_view",
  "new_follower",
  "new_message",
  "new_comment",
  "new_like",
  "new_share",
  "new_view",
] as const;
export type NotificationEnum = (typeof notificationEnum)[number];
export const notificationTargetEnum = [
  "post",
  "comment",
  "reply",
  "message",
] as const;
export type NotificationTargetEnum = (typeof notificationTargetEnum)[number];
export const notificationPreferencesDefault = {
  social: {
    likes: { in_app: true, email: false, push: true },
    comments: { in_app: true, email: true, push: true },
    follows: { in_app: true, email: false, push: false },
  },
  business: {
    reviews: { in_app: true, email: true, push: true },
    orders: { in_app: true, email: true, push: true, sms: true },
  },
  messages: {
    direct: { in_app: true, email: false, push: true },
    group: { in_app: true, email: false, push: false },
  },
  system: {
    security: { in_app: true, email: true, push: true, sms: true },
    features: { in_app: true, email: false, push: false },
  },
} as const;
export type NotificationPreferences = {
  social: {
    likes: { in_app: boolean; email: boolean; push: boolean };
    comments: { in_app: boolean; email: boolean; push: boolean };
    follows: { in_app: boolean; email: boolean; push: boolean };
    posts: { in_app: boolean; email: boolean; push: boolean };
  };
  business: {
    reviews: { in_app: boolean; email: boolean; push: boolean; sms: boolean };
    orders: { in_app: boolean; email: boolean; push: boolean; sms: boolean };
  };
  messages: {
    direct: { in_app: boolean; email: boolean; push: boolean };
    group: { in_app: boolean; email: boolean; push: boolean };
  };
  system: {
    security: { in_app: boolean; email: boolean; push: boolean; sms: boolean };
    features: { in_app: boolean; email: boolean; push: boolean };
  };
};
