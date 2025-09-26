import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, varchar, timestamp, mysqlEnum, int, decimal, json, text } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const advertisementAttachments = mysqlTable("advertisement_attachments", {
	id: varchar({ length: 36 }).notNull(),
	advertisementId: varchar("advertisement_id", { length: 36 }).notNull().references(() => advertisements.id, { onDelete: "cascade" } ),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("advertisement_attachments_advertisement_id_idx").on(table.advertisementId),
	index("advertisement_attachments_media_id_idx").on(table.mediaId),
	index("advertisement_attachments_created_at_idx").on(table.createdAt),
]);

export const advertisementTargeting = mysqlTable("advertisement_targeting", {
	id: varchar({ length: 36 }).notNull(),
	advertisementId: varchar("advertisement_id", { length: 36 }).notNull(),
	gender: mysqlEnum(['male','female','other','prefer_not_to_say']),
	minAge: int("min_age"),
	maxAge: int("max_age"),
	ageGroup: mysqlEnum("age_group", ['teen','young_adult','adult','senior']),
	locationId: varchar("location_id", { length: 36 }),
},
(table) => [
	index("advertisement_targeting_advertisement_id_idx").on(table.advertisementId),
	index("advertisement_targeting_gender_idx").on(table.gender),
	index("advertisement_targeting_min_age_idx").on(table.minAge),
	index("advertisement_targeting_max_age_idx").on(table.maxAge),
	index("advertisement_targeting_age_group_idx").on(table.ageGroup),
]);

export const advertisements = mysqlTable("advertisements", {
	id: varchar({ length: 36 }).notNull(),
	title: varchar({ length: 100 }).notNull(),
	content: varchar({ length: 500 }).notNull(),
	imageUrl: varchar("image_url", { length: 500 }),
	clickUrl: varchar("click_url", { length: 500 }),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['banner','sidebar','feed','popup']).notNull(),
	placement: varchar({ length: 100 }),
	status: mysqlEnum(['active','paused','completed','cancelled']).default('active'),
	targetGender: mysqlEnum("target_gender", ['male','female','other','prefer_not_to_say']).notNull(),
	targetAgeStart: int("target_age_start"),
	targetAgeEnd: int("target_age_end"),
	targetLocationId: varchar("target_location_id", { length: 36 }).references(() => locations.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("advertisements_status_idx").on(table.status),
	index("advertisements_type_idx").on(table.type),
	index("advertisements_user_id_idx").on(table.userId),
	index("advertisements_placement_idx").on(table.placement),
	index("advertisements_target_gender_idx").on(table.targetGender),
	index("advertisements_target_age_start_idx").on(table.targetAgeStart),
	index("advertisements_target_age_end_idx").on(table.targetAgeEnd),
]);

export const audios = mysqlTable("audios", {
	id: varchar({ length: 36 }).notNull(),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	duration: int().notNull(),
	bitrate: int(),
	sampleRate: int("sample_rate"),
	channels: int(),
	format: varchar({ length: 20 }),
});

export const batchNotifications = mysqlTable("batch_notifications", {
	id: varchar({ length: 36 }).notNull(),
	batchId: varchar("batch_id", { length: 36 }).notNull().references(() => notificationBatches.id, { onDelete: "cascade" } ),
	notificationId: varchar("notification_id", { length: 36 }).notNull().references(() => notifications.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("batch_notifications_batch_id_idx").on(table.batchId),
	index("batch_notifications_notification_id_idx").on(table.notificationId),
]);

export const businessMetrics = mysqlTable("business_metrics", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	activeListings: int("active_listings").default(0),
	newListings: int("new_listings").default(0),
	soldListings: int("sold_listings").default(0),
	expiredListings: int("expired_listings").default(0),
	totalViews: int("total_views").default(0),
	totalInquiries: int("total_inquiries").default(0),
	totalFavorites: int("total_favorites").default(0),
	totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default('0'),
	averageOrderValue: decimal("average_order_value", { precision: 12, scale: 2 }).default('0'),
	averageResponseTime: int("average_response_time"),
	responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("business_metrics_unique_idx").on(table.userId, table.date),
]);

export const businessProfiles = mysqlTable("business_profiles", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	businessName: varchar("business_name", { length: 100 }).notNull(),
	businessCategory: varchar("business_category", { length: 50 }).notNull(),
	registrationNumber: varchar("registration_number", { length: 100 }),
	taxId: varchar("tax_id", { length: 100 }),
	isVerified: tinyint("is_verified").default(0),
	reviewsCount: int("reviews_count"),
	contactPhone: varchar("contact_phone", { length: 20 }),
	address: varchar({ length: 255 }),
	averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default('0'),
	verificationStatus: mysqlEnum("verification_status", ['pending','approved','rejected','suspended']).default('pending'),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	registeredDate: int("registered_date"),
	employeeCount: mysqlEnum("employee_count", ['1-10','11-50','51-200','201-500','500+']),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
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
]);

export const commentReactions = mysqlTable("comment_reactions", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	commentId: varchar("comment_id", { length: 36 }).notNull().references(() => postComments.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['like','love','support','interesting','want']).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("comment_reactions_user_id_idx").on(table.userId),
	index("comment_reactions_comment_id_idx").on(table.commentId),
]);

export const conversationParticipants = mysqlTable("conversation_participants", {
	id: varchar({ length: 36 }).notNull(),
	conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	role: mysqlEnum(['member','admin','owner']).default('member'),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	leftAt: timestamp("left_at", { mode: 'string' }),
},
(table) => [
	index("conversation_participants_conversation_id_idx").on(table.conversationId),
	index("conversation_participants_user_id_idx").on(table.userId),
	index("conversation_participants_active_idx").on(table.conversationId, table.leftAt),
	index("conversation_participants_joined_at_idx").on(table.joinedAt),
]);

export const conversations = mysqlTable("conversations", {
	id: varchar({ length: 36 }).notNull(),
	type: mysqlEnum(['group','direct','channel']).default('direct'),
	name: varchar({ length: 100 }),
	description: varchar({ length: 255 }),
	isPrivate: tinyint("is_private").default(1),
	createdBy: varchar("created_by", { length: 36 }).references(() => users.id, { onDelete: "set null" } ),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("conversations_type_idx").on(table.type),
	index("conversations_name_idx").on(table.name),
	index("conversations_description_idx").on(table.description),
	index("conversations_created_by_idx").on(table.createdBy),
	index("conversations_last_message_idx").on(table.lastMessageAt),
]);

export const documents = mysqlTable("documents", {
	id: varchar({ length: 36 }).notNull(),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	pageCount: int("page_count"),
	thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
	isSearchable: tinyint("is_searchable").default(0),
});

export const eventAttendees = mysqlTable("event_attendees", {
	id: varchar({ length: 36 }).notNull(),
	eventId: varchar("event_id", { length: 36 }).references(() => events.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("event_attendees_event_id_idx").on(table.eventId),
	index("event_attendees_user_id_idx").on(table.userId),
]);

export const events = mysqlTable("events", {
	id: varchar({ length: 36 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	title: varchar({ length: 100 }).notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	startTime: varchar("start_time", { length: 10 }),
	endTime: varchar("end_time", { length: 10 }),
	timezone: varchar({ length: 50 }).default('Africa/Lagos'),
	coverImageUrl: varchar("cover_image_url", { length: 500 }),
	venue: varchar({ length: 200 }),
	venueLocationId: varchar("venue_location_id", { length: 36 }).references(() => locations.id, { onDelete: "set null" } ),
	eventVenueType: mysqlEnum("event_venue_type", ['online','offline']).default('offline'),
	meetingUrl: varchar("meeting_url", { length: 500 }),
	capacity: int(),
	currentAttendees: int("current_attendees"),
	ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }),
	isTicketRequired: tinyint("is_ticket_required").default(0),
	registrationDeadline: timestamp("registration_deadline", { mode: 'string' }),
	contactInfo: json("contact_info"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("events_post_id_idx").on(table.postId),
	index("events_start_date_idx").on(table.startDate),
	index("events_title_idx").on(table.title),
	index("events_venue_idx").on(table.venue),
	index("events_venue_location_id_idx").on(table.venueLocationId),
	index("events_event_venue_type_idx").on(table.eventVenueType),
	index("events_capacity_idx").on(table.capacity),
	index("events_current_attendees_idx").on(table.currentAttendees),
	index("events_ticket_price_idx").on(table.ticketPrice),
	index("events_registration_deadline_idx").on(table.registrationDeadline),
	index("events_end_date_idx").on(table.endDate),
]);

export const favorites = mysqlTable("favorites", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	listingId: varchar("listing_id", { length: 36 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("favorites_unique_idx").on(table.userId, table.listingId),
]);

export const follows = mysqlTable("follows", {
	id: varchar({ length: 36 }).notNull(),
	followerId: varchar("follower_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	followingId: varchar("following_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("follows_follower_id_idx").on(table.followerId),
	index("follows_following_id_idx").on(table.followingId),
]);

export const images = mysqlTable("images", {
	id: varchar({ length: 36 }).notNull(),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	width: int().notNull(),
	height: int().notNull(),
	altText: varchar("alt_text", { length: 255 }),
	thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
	colorProfile: varchar("color_profile", { length: 50 }),
	isAnimated: tinyint("is_animated").default(0),
});

export const listingInquiries = mysqlTable("listing_inquiries", {
	id: varchar({ length: 36 }).notNull(),
	listingId: varchar("listing_id", { length: 36 }).notNull(),
	inquirerId: varchar("inquirer_id", { length: 36 }).notNull(),
	message: text().notNull(),
	isPublic: tinyint("is_public").default(1),
	parentId: varchar("parent_id", { length: 36 }),
	status: mysqlEnum(['pending','answered','resolved']).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const listingMedia = mysqlTable("listing_media", {
	id: varchar({ length: 36 }).notNull(),
	listingId: varchar("listing_id", { length: 36 }).notNull(),
	mediaId: varchar("media_id", { length: 36 }).notNull(),
	isPrimary: tinyint("is_primary").default(0),
	sortOrder: int("sort_order").default(0),
	altText: varchar("alt_text", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const listings = mysqlTable("listings", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }).notNull(),
	subcategory: varchar({ length: 100 }),
	type: mysqlEnum(['product','service']).notNull(),
	status: mysqlEnum(['active','sold','expired','draft','deleted']).default('active'),
	condition: mysqlEnum(['new','used','refurbished']),
	price: decimal({ precision: 12, scale: 2 }),
	originalPrice: decimal("original_price", { precision: 12, scale: 2 }),
	currency: varchar({ length: 3 }).default('NGN'),
	priceType: mysqlEnum("price_type", ['fixed','negotiable','auction','free']).default('fixed'),
	isNegotiable: tinyint("is_negotiable").default(0),
	locationId: varchar("location_id", { length: 36 }),
	deliveryOptions: json("delivery_options"),
	deliveryRadius: int("delivery_radius"),
	deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
	brand: varchar({ length: 100 }),
	model: varchar({ length: 100 }),
	sku: varchar({ length: 100 }),
	stockQuantity: int("stock_quantity"),
	minOrderQuantity: int("min_order_quantity").default(1),
	weight: decimal({ precision: 8, scale: 3 }),
	dimensions: json(),
	serviceType: varchar("service_type", { length: 100 }),
	duration: varchar({ length: 100 }),
	availability: json(),
	serviceRadius: int("service_radius"),
	experienceYears: int("experience_years"),
	viewsCount: int("views_count").default(0),
	inquiriesCount: int("inquiries_count").default(0),
	favoritesCount: int("favorites_count").default(0),
	sharesCount: int("shares_count").default(0),
	isPromoted: tinyint("is_promoted").default(0),
	promotionEndsAt: timestamp("promotion_ends_at", { mode: 'string' }),
	tags: json(),
	searchKeywords: text("search_keywords"),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	soldAt: timestamp("sold_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const locations = mysqlTable("locations", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['primary','business','delivery']).default('primary'),
	name: varchar({ length: 100 }),
	address: varchar({ length: 255 }),
	city: varchar({ length: 100 }),
	landmark: varchar({ length: 150 }),
	state: varchar({ length: 100 }),
	country: varchar({ length: 100 }).default('Nigeria'),
	postalCode: varchar("postal_code", { length: 20 }),
	latitude: decimal({ precision: 10, scale: 8 }),
	longitude: decimal({ precision: 11, scale: 8 }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
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
]);

export const media = mysqlTable("media", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['image','video','audio','document']).notNull(),
	url: varchar({ length: 500 }).notNull(),
	fileName: varchar("file_name", { length: 255 }),
	fileSize: int("file_size"),
	cdnPublicId: varchar("cdn_public_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const messageAttachments = mysqlTable("message_attachments", {
	id: varchar({ length: 36 }).notNull(),
	messageId: varchar("message_id", { length: 36 }).notNull().references(() => messages.id, { onDelete: "cascade" } ),
	cdnUrl: varchar("cdn_url", { length: 500 }).notNull(),
	cdnPublicId: varchar("cdn_public_id", { length: 255 }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	fileSize: int("file_size"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("message_attachments_message_id_idx").on(table.messageId),
]);

export const messageMentions = mysqlTable("message_mentions", {
	id: varchar({ length: 36 }).notNull(),
	messageId: varchar("message_id", { length: 36 }).notNull().references(() => messages.id, { onDelete: "cascade" } ),
	mentionedUserId: varchar("mentioned_user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("message_mentions_message_id_idx").on(table.messageId),
	index("message_mentions_mentioned_user_id_idx").on(table.mentionedUserId),
]);

export const messageReactions = mysqlTable("message_reactions", {
	id: varchar({ length: 36 }).notNull(),
	messageId: varchar("message_id", { length: 36 }).notNull().references(() => messages.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 50 }).notNull(),
	emoji: varchar({ length: 10 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("message_reactions_message_id_idx").on(table.messageId),
	index("message_reactions_user_id_idx").on(table.userId),
]);

export const messageReadReceipts = mysqlTable("message_read_receipts", {
	id: varchar({ length: 36 }).notNull(),
	messageId: varchar("message_id", { length: 36 }).notNull().references(() => messages.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	readAt: timestamp("read_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("message_read_receipts_message_id_idx").on(table.messageId),
	index("message_read_receipts_user_id_idx").on(table.userId),
]);

export const messages = mysqlTable("messages", {
	id: varchar({ length: 36 }).notNull(),
	conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	content: text(),
	messageType: mysqlEnum("message_type", ['text','image','video','audio','file']).default('text'),
	replyToId: varchar("reply_to_id", { length: 36 }),
	isEdited: tinyint("is_edited").default(0),
	isDeleted: tinyint("is_deleted").default(0),
	reactionCount: int("reaction_count"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
	index("messages_sender_id_idx").on(table.senderId),
	index("messages_reply_to_id_idx").on(table.replyToId),
	index("messages_active_idx").on(table.conversationId, table.isDeleted, table.createdAt),
	foreignKey({
			columns: [table.replyToId],
			foreignColumns: [table.id],
			name: "messages_reply_to_id_messages_id_fk"
		}).onDelete("set null"),
]);

export const notificationBatches = mysqlTable("notification_batches", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	batchType: mysqlEnum("batch_type", ['daily_digest','weekly_digest','monthly_digest','activity_summary']).notNull(),
	status: mysqlEnum(['pending','processing','sent','failed']).default('pending'),
	title: varchar({ length: 255 }),
	content: text(),
	notificationCount: int("notification_count"),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }).notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("notification_batches_user_id_idx").on(table.userId),
	index("notification_batches_type_idx").on(table.batchType),
	index("notification_batches_status_idx").on(table.status),
	index("notification_batches_scheduled_idx").on(table.scheduledFor),
]);

export const notificationDeliveries = mysqlTable("notification_deliveries", {
	id: varchar({ length: 36 }).notNull(),
	notificationId: varchar("notification_id", { length: 36 }).notNull().references(() => notifications.id, { onDelete: "cascade" } ),
	channel: mysqlEnum(['in_app','email','push','sms']).notNull(),
	status: mysqlEnum(['pending','sent','delivered','failed','bounced','clicked','opened']).default('pending'),
	externalId: varchar("external_id", { length: 255 }),
	provider: varchar({ length: 50 }),
	attemptCount: int("attempt_count").default(1),
	lastAttemptAt: timestamp("last_attempt_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	failureReason: text("failure_reason"),
	openedAt: timestamp("opened_at", { mode: 'string' }),
	clickedAt: timestamp("clicked_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("notification_deliveries_notification_id_idx").on(table.notificationId),
	index("notification_deliveries_channel_idx").on(table.channel),
	index("notification_deliveries_status_idx").on(table.status),
	index("notification_deliveries_external_id_idx").on(table.externalId),
	index("notification_deliveries_delivered_at_idx").on(table.deliveredAt),
	index("notification_deliveries_retry_idx").on(table.status, table.lastAttemptAt),
]);

export const notificationPreferences = mysqlTable("notification_preferences", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	enableInApp: tinyint("enable_in_app").default(1),
	enableEmail: tinyint("enable_email").default(1),
	enablePush: tinyint("enable_push").default(1),
	enableSms: tinyint("enable_sms").default(0),
	quietHours: json("quiet_hours"),
	preferences: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("notification_preferences_user_id_idx").on(table.userId),
]);

export const notificationTemplates = mysqlTable("notification_templates", {
	id: varchar({ length: 36 }).notNull(),
	type: mysqlEnum(['like','comment','reply','mention','follow','unfollow','post_shared','post_featured','post_approved','post_rejected','review_received','review_reply','business_verified','business_suspended','message_received','message_reaction','event_reminder','event_invitation','event_cancelled','event_updated','subscription_expiring','subscription_renewed','subscription_cancelled','payment_successful','payment_failed','promotion_approved','promotion_rejected','promotion_budget_low','promotion_completed','account_warning','feature_announcement','maintenance_notice','security_alert','welcome']).notNull(),
	inAppTitle: varchar("in_app_title", { length: 255 }),
	inAppContent: text("in_app_content"),
	emailSubject: varchar("email_subject", { length: 255 }),
	emailContent: text("email_content"),
	pushTitle: varchar("push_title", { length: 255 }),
	pushContent: text("push_content"),
	smsContent: text("sms_content"),
	variables: json(),
	isActive: tinyint("is_active").default(1),
	defaultPriority: mysqlEnum("default_priority", ['low','normal','high','urgent']).default('normal'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("notification_templates_type_idx").on(table.type),
	index("notification_templates_active_idx").on(table.isActive),
]);

export const notifications = mysqlTable("notifications", {
	id: varchar({ length: 36 }).notNull(),
	recipientId: varchar("recipient_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" } ),
	senderId: varchar("sender_id", { length: 36 }).references(() => users.id, { onDelete: "set null" } ),
	type: mysqlEnum(['like','comment','reply','mention','follow','unfollow','post_shared','post_featured','post_approved','post_rejected','review_received','review_reply','business_verified','business_suspended','message_received','message_reaction','event_reminder','event_invitation','event_cancelled','event_updated','subscription_expiring','subscription_renewed','subscription_cancelled','payment_successful','payment_failed','promotion_approved','promotion_rejected','promotion_budget_low','promotion_completed','account_warning','feature_announcement','maintenance_notice','security_alert','welcome']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	entityType: mysqlEnum("entity_type", ['post','comment','user','review','message','conversation','event','subscription','promotion','advertisement']),
	entityId: varchar("entity_id", { length: 36 }),
	metadata: json(),
	isRead: tinyint("is_read").default(0),
	readAt: timestamp("read_at", { mode: 'string' }),
	channels: json(),
	priority: mysqlEnum(['low','normal','high','urgent']).default('normal'),
	groupKey: varchar("group_key", { length: 100 }),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("notifications_recipient_id_idx").on(table.recipientId),
	index("notifications_sender_id_idx").on(table.senderId),
	index("notifications_type_idx").on(table.type),
	index("notifications_entity_idx").on(table.entityType, table.entityId),
	index("notifications_read_status_idx").on(table.isRead),
	index("notifications_priority_idx").on(table.priority),
	index("notifications_group_key_idx").on(table.groupKey),
	index("notifications_scheduled_idx").on(table.scheduledFor),
	index("notifications_expires_idx").on(table.expiresAt),
	index("notifications_created_at_idx").on(table.createdAt),
	index("notifications_recipient_unread_idx").on(table.recipientId, table.isRead, table.createdAt),
	index("notifications_recipient_type_idx").on(table.recipientId, table.type),
]);

export const postCommentMedia = mysqlTable("post_comment_media", {
	id: varchar({ length: 36 }).notNull(),
	commentId: varchar("comment_id", { length: 36 }).notNull().references(() => postComments.id, { onDelete: "cascade" } ),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
},
(table) => [
	index("post_comment_media_comment_id_idx").on(table.commentId),
	index("post_comment_media_media_id_idx").on(table.mediaId),
]);

export const postCommentMentions = mysqlTable("post_comment_mentions", {
	id: varchar({ length: 36 }).notNull(),
	commentId: varchar("comment_id", { length: 36 }).notNull().references(() => postComments.id, { onDelete: "cascade" } ),
	mentionedUserId: varchar("mentioned_user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	positionStart: int("position_start"),
	positionEnd: int("position_end"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("comment_mentions_comment_id_idx").on(table.commentId),
	index("comment_mentions_user_id_idx").on(table.mentionedUserId),
]);

export const postComments = mysqlTable("post_comments", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	content: text().notNull(),
	parentId: varchar("parent_id", { length: 36 }),
	status: mysqlEnum(['pending','approved','deleted','hidden']).default('approved'),
	isEdited: tinyint("is_edited").default(0),
	editedAt: timestamp("edited_at", { mode: 'string' }),
	reactionCount: int("reaction_count"),
	replyCount: int("reply_count"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("comments_user_id_idx").on(table.userId),
	index("comments_post_id_idx").on(table.postId),
	index("comments_status_idx").on(table.status),
	index("comments_parent_id_idx").on(table.parentId),
	index("comments_edited_at_idx").on(table.editedAt),
	index("comments_reaction_count_idx").on(table.reactionCount),
	index("comments_reply_count_idx").on(table.replyCount),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "post_comments_parent_id_post_comments_id_fk"
		}).onDelete("cascade"),
]);

export const postMedia = mysqlTable("post_media", {
	id: varchar({ length: 36 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	isPrimary: tinyint("is_primary").default(0),
	sortOrder: int("sort_order"),
	altText: varchar("alt_text", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("post_media_post_id_idx").on(table.postId),
	index("post_media_media_id_idx").on(table.mediaId),
	index("post_media_alt_text_idx").on(table.altText),
	index("post_media_is_primary_idx").on(table.isPrimary),
	index("post_media_sort_order_idx").on(table.sortOrder),
]);

export const postMentions = mysqlTable("post_mentions", {
	id: varchar({ length: 36 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	mentionedUserId: varchar("mentioned_user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const postPromotions = mysqlTable("post_promotions", {
	id: varchar({ length: 36 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	budget: decimal({ precision: 10, scale: 2 }).default('0'),
	spent: decimal({ precision: 10, scale: 2 }).default('0'),
	currency: varchar({ length: 3 }).default('NGN'),
	targetRadius: int("target_radius"),
	targetLocationId: varchar("target_location_id", { length: 36 }).references(() => locations.id, { onDelete: "set null" } ),
	targetAudience: json("target_audience"),
	impressions: int(),
	clicks: int(),
	conversions: int(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }),
	type: mysqlEnum(['boost','featured','location_targeted','demographic_targeted','interest_targeted']).notNull(),
	status: mysqlEnum(['active','paused','completed','cancelled','pending_approval']).default('pending_approval'),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	approvedBy: varchar("approved_by", { length: 36 }),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("post_promotions_post_id_idx").on(table.postId),
	index("post_promotions_user_id_idx").on(table.userId),
	index("post_promotions_status_idx").on(table.status),
	index("post_promotions_type_idx").on(table.type),
	index("post_promotions_start_date_idx").on(table.startDate),
	index("post_promotions_end_date_idx").on(table.endDate),
]);

export const postReactions = mysqlTable("post_reactions", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['like','love','support','interesting','want']).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("post_reactions_user_id_idx").on(table.userId),
	index("post_reactions_post_id_idx").on(table.postId),
]);

export const posts = mysqlTable("posts", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['general','product','service','event']).notNull(),
	content: text(),
	status: mysqlEnum(['draft','published','archived','deleted']).default('published'),
	visibility: mysqlEnum(['public','followers','nearby']).default('public').notNull(),
	locationId: varchar("location_id", { length: 36 }).references(() => locations.id, { onDelete: "set null" } ),
	isPromoted: tinyint("is_promoted").default(0),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	likesCount: int("likes_count"),
	commentsCount: int("comments_count"),
	sharesCount: int("shares_count"),
	viewsCount: int("views_count"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("posts_user_id_idx").on(table.userId),
	index("posts_type_idx").on(table.type),
	index("posts_status_idx").on(table.status),
	index("posts_location_id_idx").on(table.locationId),
	index("posts_published_at_idx").on(table.publishedAt),
	index("posts_visibility_idx").on(table.visibility),
	index("posts_is_promoted_idx").on(table.isPromoted),
	index("posts_created_at_idx").on(table.createdAt),
	index("posts_updated_at_idx").on(table.updatedAt),
	index("posts_likes_count_idx").on(table.likesCount),
	index("posts_comments_count_idx").on(table.commentsCount),
	index("posts_shares_count_idx").on(table.sharesCount),
	index("posts_views_count_idx").on(table.viewsCount),
]);

export const productMedia = mysqlTable("product_media", {
	id: varchar({ length: 36 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" } ),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	isPrimary: tinyint("is_primary").default(0),
	sortOrder: int("sort_order"),
	altText: varchar("alt_text", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("post_media_product_id_idx").on(table.postId),
	index("post_media_media_id_idx").on(table.mediaId),
	index("post_media_alt_text_idx").on(table.altText),
	index("post_media_is_primary_idx").on(table.isPrimary),
	index("post_media_sort_order_idx").on(table.sortOrder),
]);

export const products = mysqlTable("products", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	description: varchar({ length: 500 }),
	mediaId: varchar("media_id", { length: 36 }),
	category: varchar({ length: 100 }),
	sku: varchar({ length: 100 }),
	price: decimal({ precision: 10, scale: 2 }),
	compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
	currency: varchar({ length: 3 }).default('NGN'),
	condition: mysqlEnum(['new','used','refurbished']).default('new'),
	availability: mysqlEnum(['in_stock','out_of_stock','pre_order','discontinued']).default('in_stock'),
	stockQuantity: int("stock_quantity"),
	minOrderQuantity: int("min_order_quantity").default(1),
	maxOrderQuantity: int("max_order_quantity"),
	weight: decimal({ precision: 8, scale: 3 }),
	dimensions: json(),
	brand: varchar({ length: 100 }),
	model: varchar({ length: 100 }),
	warranty: varchar({ length: 200 }),
	isNegotiable: tinyint("is_negotiable").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("products_post_id_idx").on(table.postId),
	index("products_sku_idx").on(table.sku),
	index("products_price_idx").on(table.price),
	index("products_compare_price_idx").on(table.compareAtPrice),
	index("products_availability_idx").on(table.availability),
]);

export const requestResponses = mysqlTable("request_responses", {
	id: varchar({ length: 36 }).notNull(),
	requestId: varchar("request_id", { length: 36 }).notNull(),
	responderId: varchar("responder_id", { length: 36 }).notNull(),
	message: text().notNull(),
	proposedPrice: decimal("proposed_price", { precision: 12, scale: 2 }),
	currency: varchar({ length: 3 }).default('NGN'),
	availability: varchar({ length: 200 }),
	status: mysqlEnum(['pending','accepted','rejected','withdrawn']).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("request_responses_unique_idx").on(table.requestId, table.responderId),
]);

export const requests = mysqlTable("requests", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	subcategory: varchar({ length: 100 }),
	budgetMin: decimal("budget_min", { precision: 12, scale: 2 }),
	budgetMax: decimal("budget_max", { precision: 12, scale: 2 }),
	currency: varchar({ length: 3 }).default('NGN'),
	locationId: varchar("location_id", { length: 36 }),
	searchRadius: int("search_radius").default(10),
	status: mysqlEnum(['active','fulfilled','expired','cancelled']).default('active'),
	urgency: mysqlEnum(['low','medium','high','urgent']).default('medium'),
	responsesCount: int("responses_count").default(0),
	viewsCount: int("views_count").default(0),
	neededBy: timestamp("needed_by", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	fulfilledAt: timestamp("fulfilled_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const reviews = mysqlTable("reviews", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	businessId: varchar("business_id", { length: 36 }).notNull().references(() => businessProfiles.id, { onDelete: "cascade" } ),
	postId: varchar("post_id", { length: 36 }).references(() => posts.id, { onDelete: "cascade" } ),
	rating: int().notNull(),
	title: varchar({ length: 200 }),
	content: text(),
	isVerifiedPurchase: tinyint("is_verified_purchase").default(0),
	isRecommended: tinyint("is_recommended"),
	helpfulCount: int("helpful_count"),
	status: mysqlEnum(['pending','approved','rejected']).default('approved'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("reviews_user_id_idx").on(table.userId),
	index("reviews_business_id_idx").on(table.businessId),
	index("reviews_post_id_idx").on(table.postId),
	index("reviews_rating_idx").on(table.rating),
	index("reviews_status_idx").on(table.status),
]);

export const savedSearches = mysqlTable("saved_searches", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	searchQuery: text("search_query").notNull(),
	filters: json(),
	alertsEnabled: tinyint("alerts_enabled").default(1),
	alertFrequency: mysqlEnum("alert_frequency", ['instant','daily','weekly']).default('daily'),
	lastAlertSent: timestamp("last_alert_sent", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const sellerFollows = mysqlTable("seller_follows", {
	id: varchar({ length: 36 }).notNull(),
	followerId: varchar("follower_id", { length: 36 }).notNull(),
	sellerId: varchar("seller_id", { length: 36 }).notNull(),
	notificationsEnabled: tinyint("notifications_enabled").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("seller_follows_unique_idx").on(table.followerId, table.sellerId),
]);

export const serviceMedia = mysqlTable("service_media", {
	id: varchar({ length: 36 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => services.id, { onDelete: "cascade" } ),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	isPrimary: tinyint("is_primary").default(0),
	sortOrder: int("sort_order"),
	altText: varchar("alt_text", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("post_media_service_id_idx").on(table.postId),
	index("post_media_media_id_idx").on(table.mediaId),
	index("post_media_alt_text_idx").on(table.altText),
	index("post_media_is_primary_idx").on(table.isPrimary),
	index("post_media_sort_order_idx").on(table.sortOrder),
]);

export const services = mysqlTable("services", {
	id: varchar({ length: 36 }).notNull(),
	postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id, { onDelete: "cascade" } ),
	serviceType: varchar("service_type", { length: 100 }).notNull(),
	priceType: mysqlEnum("price_type", ['fixed','hourly','per_project','negotiable']).notNull(),
	price: decimal({ precision: 10, scale: 2 }),
	currency: varchar({ length: 3 }).default('NGN'),
	duration: varchar({ length: 100 }),
	availability: json(),
	serviceVenue: mysqlEnum("service_venue", ['onsite','remote','hybrid']).default('onsite'),
	serviceRadius: int("service_radius"),
	experienceYears: int("experience_years"),
	certifications: json(),
	portfolio: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("services_post_id_idx").on(table.postId),
	index("services_type_idx").on(table.serviceType),
	index("services_price_type_idx").on(table.priceType),
]);

export const subscriptionPlans = mysqlTable("subscription_plans", {
	id: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).default('NGN'),
	billingInterval: mysqlEnum("billing_interval", ['monthly','quarterly','yearly']).notNull(),
	features: json(),
	limits: json(),
	isActive: tinyint("is_active").default(1),
	sortOrder: int("sort_order"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("subscription_plans_slug_idx").on(table.slug),
	index("subscription_plans_active_idx").on(table.isActive),
]);

export const subscriptions = mysqlTable("subscriptions", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	planId: varchar("plan_id", { length: 36 }).notNull().references(() => subscriptionPlans.id, { onDelete: "cascade" } ),
	status: mysqlEnum(['active','inactive','cancelled','expired','past_due']).notNull(),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }).notNull(),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }).notNull(),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("subscriptions_user_id_idx").on(table.userId),
	index("subscriptions_plan_id_idx").on(table.planId),
	index("subscriptions_status_idx").on(table.status),
	index("subscriptions_period_end_idx").on(table.currentPeriodEnd),
]);

export const userPreferences = mysqlTable("user_preferences", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	preferredCategories: json("preferred_categories"),
	priceRanges: json("price_ranges"),
	preferredBrands: json("preferred_brands"),
	searchRadius: int("search_radius").default(10),
	deliveryPreferences: json("delivery_preferences"),
	notificationSettings: json("notification_settings"),
	privacySettings: json("privacy_settings"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("user_preferences_unique_idx").on(table.userId),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 36 }).notNull(),
	lastSeenAt: timestamp("last_seen_at", { mode: 'string' }),
	type: mysqlEnum(['individual','business']).notNull(),
	username: varchar({ length: 50 }),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: tinyint("email_verified").default(0),
	phoneNumber: varchar("phone_number", { length: 255 }),
	phoneNumberVerified: tinyint("phone_number_verified"),
	isOnline: tinyint("is_online").default(0),
	firstName: varchar("first_name", { length: 50 }),
	lastName: varchar("last_name", { length: 50 }),
	bio: varchar({ length: 255 }),
	profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
	coverImageUrl: varchar("cover_image_url", { length: 500 }),
	website: varchar({ length: 255 }),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
	gender: mysqlEnum(['male','female','other','prefer_not_to_say']),
	role: varchar({ length: 50 }),
	banned: tinyint(),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
	displayUsername: varchar("display_username", { length: 50 }),
	isVerified: tinyint("is_verified").default(0),
	followersCount: int("followers_count"),
	followingCount: int("following_count"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
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
]);

export const videos = mysqlTable("videos", {
	id: varchar({ length: 36 }).notNull(),
	mediaId: varchar("media_id", { length: 36 }).notNull().references(() => media.id, { onDelete: "cascade" } ),
	duration: int().notNull(),
	width: int(),
	height: int(),
	thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
	bitrate: int(),
	codec: varchar({ length: 50 }),
	frameRate: decimal("frame_rate", { precision: 5, scale: 2 }),
});
