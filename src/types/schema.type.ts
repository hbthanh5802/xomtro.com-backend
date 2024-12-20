import * as schema from '@/models/schema';

export enum userRole {
  RENTER = 'renter',
  LANDLORD = 'landlord'
}

export enum userStatus {
  BANNED = 'banned',
  ACTIVED = 'actived',
  UNACTIVED = 'unactived'
}

export enum userProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

export enum userGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHERS = 'others'
}

export enum tokenType {
  REFRESH = 'refresh',
  OTP = 'otp',
  VERIFY = 'verify',
  TEXT = 'text'
}

export enum areaUnit {
  CM2 = 'cm2',
  m2 = 'm2'
}

export enum propertyStatus {
  NEW = 'new',
  GOOD = 'good',
  OLD = 'old'
}

export enum timeUnit {
  DAY = 'day',
  HOUR = 'hour',
  MINUTE = 'minute',
  YEAR = 'year',
  SECOND = 'second',
  MONTH = 'month'
}

export enum postStatus {
  ACTIVED = 'actived',
  UNACTIVED = 'unactived',
  HIDDEN = 'hidden'
}

export enum postType {
  RENTAL = 'rental',
  JOIN = 'join',
  WANTED = 'wanted',
  PASS = 'pass'
}

export enum postExpirationUnit {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export enum assetType {
  VIDEO = 'video',
  IMAGE = 'image'
}

export enum priceUnit {
  VND = 'vnd',
  USD = 'usd'
}

export enum rentalMinLeaseUnit {
  DAY = 'day',
  HOUR = 'hour',
  YEAR = 'year',
  MONTH = 'month'
}

export enum passItemStatusType {
  NEW = 'new',
  USED = 'used'
}

export enum postReactionType {
  LIKE = 'like',
  HEART = 'heart',
  FUNNY = 'funny',
  ANGRY = 'angry',
  SAD = 'sad'
}

export enum chatType {
  GROUP = 'group',
  INDIVIDUAL = 'individual'
}

export enum messageType {
  TEXT = 'text',
  FILE = 'file'
}

export enum notificationType {
  CHAT = 'chat',
  POST = 'post',
  ACCOUNT = 'account',
  GENERAL = 'general'
}

export enum userContactType {
  FACEBOOK = 'facebook',
  EMAIL = 'email',
  PHONE = 'phone',
  ZALO = 'zalo',
  OTHER = 'other'
}

// INSERT
export type userSchemaType = typeof schema.users.$inferInsert;
export type userDetailSchemaType = typeof schema.userDetail.$inferInsert;
export type tokenSchemaType = typeof schema.tokens.$inferInsert;
export type assetSchemaType = typeof schema.assets.$inferInsert;
export type addressSchemaType = typeof schema.addresses.$inferInsert;
export type postSchemaType = typeof schema.posts.$inferInsert;
export type rentalPostSchemaType = typeof schema.rentalPosts.$inferInsert;
export type wantedPostSchemaType = typeof schema.wantedPosts.$inferInsert;
export type joinPostSchemaType = typeof schema.joinPosts.$inferInsert;
export type passPostSchemaType = typeof schema.passPosts.$inferInsert;
export type postAssetsSchemaType = typeof schema.postAssets.$inferInsert;
export type passPostItemSchemaType = typeof schema.passPostItems.$inferInsert;

export type UserPostsInterestedInsertSchemaType = typeof schema.userPostsInterested.$inferInsert;
export type UserFollowersInsertSchemaType = typeof schema.userFollowers.$inferInsert;
export type UserContactsInsertSchemaType = typeof schema.userContacts.$inferInsert;
export type ChatInsertSchemaType = typeof schema.chats.$inferInsert;
export type ChatMemberInsertSchemaType = typeof schema.chatMembers.$inferInsert;
export type MessageInsertSchemaType = typeof schema.messages.$inferInsert;
export type PostCommentInsertSchemaType = typeof schema.postComments.$inferInsert;
export type NotificationInsertSchemaType = typeof schema.notifications.$inferInsert;

// SELECT
export type UserPostInterestedSelectSchemaType = typeof schema.userPostsInterested.$inferSelect;
export type UserFollowersSelectSchemaType = typeof schema.userFollowers.$inferSelect;
export type AssetSelectSchemaType = typeof schema.assets.$inferSelect;
export type UserContactsSelectSchemaType = typeof schema.userContacts.$inferSelect;
export type PostSelectSchemaType = typeof schema.posts.$inferSelect;
export type ChatSelectSchemaType = typeof schema.chats.$inferSelect;
export type ChatMemberSelectSchemaType = typeof schema.chatMembers.$inferSelect;
export type MessageSelectSchemaType = typeof schema.messages.$inferSelect;
export type PostCommentSelectSchemaType = typeof schema.postComments.$inferSelect;
export type NotificationSelectSchemaType = typeof schema.notifications.$inferSelect;
