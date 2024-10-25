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
  OLD = 'OLD'
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
  REMOVED = 'removed'
}

export enum postType {
  RENT = 'rent',
  JOIN = 'join',
  WANTED = 'wanted',
  PASS = 'pass'
}

export enum postExpirationUnit {
  DAY = 'day',
  HOUR = 'hour',
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

export enum passItemStatus {
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
  ACCOUNT = 'account'
}

export type userSchemaType = typeof schema.users.$inferInsert;
export type userDetailSchemaType = typeof schema.userDetail.$inferInsert;
export type tokenSchemaType = typeof schema.tokens.$inferInsert;
