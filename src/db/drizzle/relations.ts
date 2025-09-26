import { relations } from "drizzle-orm/relations";
import { advertisements, advertisementAttachments, media, users, locations, audios, notificationBatches, batchNotifications, notifications, businessProfiles, commentReactions, postComments, conversations, conversationParticipants, documents, eventAttendees, events, posts, follows, images, messages, messageAttachments, messageMentions, messageReactions, messageReadReceipts, notificationDeliveries, notificationPreferences, postCommentMedia, postCommentMentions, postMedia, postMentions, postPromotions, postReactions, products, productMedia, reviews, services, serviceMedia, subscriptions, subscriptionPlans, videos } from "./schema";

export const advertisementAttachmentsRelations = relations(advertisementAttachments, ({one}) => ({
	advertisement: one(advertisements, {
		fields: [advertisementAttachments.advertisementId],
		references: [advertisements.id]
	}),
	media: one(media, {
		fields: [advertisementAttachments.mediaId],
		references: [media.id]
	}),
}));

export const advertisementsRelations = relations(advertisements, ({one, many}) => ({
	advertisementAttachments: many(advertisementAttachments),
	user: one(users, {
		fields: [advertisements.userId],
		references: [users.id]
	}),
	location: one(locations, {
		fields: [advertisements.targetLocationId],
		references: [locations.id]
	}),
}));

export const mediaRelations = relations(media, ({one, many}) => ({
	advertisementAttachments: many(advertisementAttachments),
	audios: many(audios),
	documents: many(documents),
	images: many(images),
	user: one(users, {
		fields: [media.userId],
		references: [users.id]
	}),
	postCommentMedias: many(postCommentMedia),
	postMedias: many(postMedia),
	productMedias: many(productMedia),
	serviceMedias: many(serviceMedia),
	videos: many(videos),
}));

export const usersRelations = relations(users, ({many}) => ({
	advertisements: many(advertisements),
	businessProfiles: many(businessProfiles),
	commentReactions: many(commentReactions),
	conversationParticipants: many(conversationParticipants),
	conversations: many(conversations),
	eventAttendees: many(eventAttendees),
	follows_followerId: many(follows, {
		relationName: "follows_followerId_users_id"
	}),
	follows_followingId: many(follows, {
		relationName: "follows_followingId_users_id"
	}),
	locations: many(locations),
	media: many(media),
	messageMentions: many(messageMentions),
	messageReactions: many(messageReactions),
	messageReadReceipts: many(messageReadReceipts),
	messages: many(messages),
	notificationBatches: many(notificationBatches),
	notificationPreferences: many(notificationPreferences),
	notifications_recipientId: many(notifications, {
		relationName: "notifications_recipientId_users_id"
	}),
	notifications_senderId: many(notifications, {
		relationName: "notifications_senderId_users_id"
	}),
	postCommentMentions: many(postCommentMentions),
	postComments: many(postComments),
	postMentions: many(postMentions),
	postPromotions: many(postPromotions),
	postReactions: many(postReactions),
	posts: many(posts),
	reviews: many(reviews),
	subscriptions: many(subscriptions),
}));

export const locationsRelations = relations(locations, ({one, many}) => ({
	advertisements: many(advertisements),
	events: many(events),
	user: one(users, {
		fields: [locations.userId],
		references: [users.id]
	}),
	postPromotions: many(postPromotions),
	posts: many(posts),
}));

export const audiosRelations = relations(audios, ({one}) => ({
	media: one(media, {
		fields: [audios.mediaId],
		references: [media.id]
	}),
}));

export const batchNotificationsRelations = relations(batchNotifications, ({one}) => ({
	notificationBatch: one(notificationBatches, {
		fields: [batchNotifications.batchId],
		references: [notificationBatches.id]
	}),
	notification: one(notifications, {
		fields: [batchNotifications.notificationId],
		references: [notifications.id]
	}),
}));

export const notificationBatchesRelations = relations(notificationBatches, ({one, many}) => ({
	batchNotifications: many(batchNotifications),
	user: one(users, {
		fields: [notificationBatches.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one, many}) => ({
	batchNotifications: many(batchNotifications),
	notificationDeliveries: many(notificationDeliveries),
	user_recipientId: one(users, {
		fields: [notifications.recipientId],
		references: [users.id],
		relationName: "notifications_recipientId_users_id"
	}),
	user_senderId: one(users, {
		fields: [notifications.senderId],
		references: [users.id],
		relationName: "notifications_senderId_users_id"
	}),
}));

export const businessProfilesRelations = relations(businessProfiles, ({one, many}) => ({
	user: one(users, {
		fields: [businessProfiles.userId],
		references: [users.id]
	}),
	reviews: many(reviews),
}));

export const commentReactionsRelations = relations(commentReactions, ({one}) => ({
	user: one(users, {
		fields: [commentReactions.userId],
		references: [users.id]
	}),
	postComment: one(postComments, {
		fields: [commentReactions.commentId],
		references: [postComments.id]
	}),
}));

export const postCommentsRelations = relations(postComments, ({one, many}) => ({
	commentReactions: many(commentReactions),
	postCommentMedias: many(postCommentMedia),
	postCommentMentions: many(postCommentMentions),
	user: one(users, {
		fields: [postComments.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [postComments.postId],
		references: [posts.id]
	}),
	postComment: one(postComments, {
		fields: [postComments.parentId],
		references: [postComments.id],
		relationName: "postComments_parentId_postComments_id"
	}),
	postComments: many(postComments, {
		relationName: "postComments_parentId_postComments_id"
	}),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [conversationParticipants.userId],
		references: [users.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	conversationParticipants: many(conversationParticipants),
	user: one(users, {
		fields: [conversations.createdBy],
		references: [users.id]
	}),
	messages: many(messages),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	media: one(media, {
		fields: [documents.mediaId],
		references: [media.id]
	}),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({one}) => ({
	user: one(users, {
		fields: [eventAttendees.userId],
		references: [users.id]
	}),
	event: one(events, {
		fields: [eventAttendees.eventId],
		references: [events.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventAttendees: many(eventAttendees),
	post: one(posts, {
		fields: [events.postId],
		references: [posts.id]
	}),
	location: one(locations, {
		fields: [events.venueLocationId],
		references: [locations.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	events: many(events),
	postComments: many(postComments),
	postMedias: many(postMedia),
	postMentions: many(postMentions),
	postPromotions: many(postPromotions),
	postReactions: many(postReactions),
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	}),
	location: one(locations, {
		fields: [posts.locationId],
		references: [locations.id]
	}),
	products: many(products),
	reviews: many(reviews),
	services: many(services),
}));

export const followsRelations = relations(follows, ({one}) => ({
	user_followerId: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "follows_followerId_users_id"
	}),
	user_followingId: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "follows_followingId_users_id"
	}),
}));

export const imagesRelations = relations(images, ({one}) => ({
	media: one(media, {
		fields: [images.mediaId],
		references: [media.id]
	}),
}));

export const messageAttachmentsRelations = relations(messageAttachments, ({one}) => ({
	message: one(messages, {
		fields: [messageAttachments.messageId],
		references: [messages.id]
	}),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	messageAttachments: many(messageAttachments),
	messageMentions: many(messageMentions),
	messageReactions: many(messageReactions),
	messageReadReceipts: many(messageReadReceipts),
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	}),
	message: one(messages, {
		fields: [messages.replyToId],
		references: [messages.id],
		relationName: "messages_replyToId_messages_id"
	}),
	messages: many(messages, {
		relationName: "messages_replyToId_messages_id"
	}),
}));

export const messageMentionsRelations = relations(messageMentions, ({one}) => ({
	message: one(messages, {
		fields: [messageMentions.messageId],
		references: [messages.id]
	}),
	user: one(users, {
		fields: [messageMentions.mentionedUserId],
		references: [users.id]
	}),
}));

export const messageReactionsRelations = relations(messageReactions, ({one}) => ({
	message: one(messages, {
		fields: [messageReactions.messageId],
		references: [messages.id]
	}),
	user: one(users, {
		fields: [messageReactions.userId],
		references: [users.id]
	}),
}));

export const messageReadReceiptsRelations = relations(messageReadReceipts, ({one}) => ({
	message: one(messages, {
		fields: [messageReadReceipts.messageId],
		references: [messages.id]
	}),
	user: one(users, {
		fields: [messageReadReceipts.userId],
		references: [users.id]
	}),
}));

export const notificationDeliveriesRelations = relations(notificationDeliveries, ({one}) => ({
	notification: one(notifications, {
		fields: [notificationDeliveries.notificationId],
		references: [notifications.id]
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
	user: one(users, {
		fields: [notificationPreferences.userId],
		references: [users.id]
	}),
}));

export const postCommentMediaRelations = relations(postCommentMedia, ({one}) => ({
	postComment: one(postComments, {
		fields: [postCommentMedia.commentId],
		references: [postComments.id]
	}),
	media: one(media, {
		fields: [postCommentMedia.mediaId],
		references: [media.id]
	}),
}));

export const postCommentMentionsRelations = relations(postCommentMentions, ({one}) => ({
	postComment: one(postComments, {
		fields: [postCommentMentions.commentId],
		references: [postComments.id]
	}),
	user: one(users, {
		fields: [postCommentMentions.mentionedUserId],
		references: [users.id]
	}),
}));

export const postMediaRelations = relations(postMedia, ({one}) => ({
	post: one(posts, {
		fields: [postMedia.postId],
		references: [posts.id]
	}),
	media: one(media, {
		fields: [postMedia.mediaId],
		references: [media.id]
	}),
}));

export const postMentionsRelations = relations(postMentions, ({one}) => ({
	post: one(posts, {
		fields: [postMentions.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postMentions.mentionedUserId],
		references: [users.id]
	}),
}));

export const postPromotionsRelations = relations(postPromotions, ({one}) => ({
	post: one(posts, {
		fields: [postPromotions.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postPromotions.userId],
		references: [users.id]
	}),
	location: one(locations, {
		fields: [postPromotions.targetLocationId],
		references: [locations.id]
	}),
}));

export const postReactionsRelations = relations(postReactions, ({one}) => ({
	user: one(users, {
		fields: [postReactions.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [postReactions.postId],
		references: [posts.id]
	}),
}));

export const productMediaRelations = relations(productMedia, ({one}) => ({
	product: one(products, {
		fields: [productMedia.postId],
		references: [products.id]
	}),
	media: one(media, {
		fields: [productMedia.mediaId],
		references: [media.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productMedias: many(productMedia),
	post: one(posts, {
		fields: [products.postId],
		references: [posts.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
	businessProfile: one(businessProfiles, {
		fields: [reviews.businessId],
		references: [businessProfiles.id]
	}),
	post: one(posts, {
		fields: [reviews.postId],
		references: [posts.id]
	}),
}));

export const serviceMediaRelations = relations(serviceMedia, ({one}) => ({
	service: one(services, {
		fields: [serviceMedia.postId],
		references: [services.id]
	}),
	media: one(media, {
		fields: [serviceMedia.mediaId],
		references: [media.id]
	}),
}));

export const servicesRelations = relations(services, ({one, many}) => ({
	serviceMedias: many(serviceMedia),
	post: one(posts, {
		fields: [services.postId],
		references: [posts.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
	subscriptionPlan: one(subscriptionPlans, {
		fields: [subscriptions.planId],
		references: [subscriptionPlans.id]
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	subscriptions: many(subscriptions),
}));

export const videosRelations = relations(videos, ({one}) => ({
	media: one(media, {
		fields: [videos.mediaId],
		references: [media.id]
	}),
}));