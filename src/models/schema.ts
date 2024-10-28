import { timestamps } from '@/utils/schema.helper';
import { sql } from 'drizzle-orm';
import {
  AnyMySqlColumn,
  boolean,
  date,
  datetime,
  decimal,
  float,
  foreignKey,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  password: varchar({ length: 255 }).notNull(),
  provider: mysqlEnum(['local', 'facebook', 'google']).notNull().default('local'),
  status: mysqlEnum(['banned', 'actived', 'unactived']).notNull().default('unactived'),
  tokenVersion: int('token_version').notNull().default(0),
  ...timestamps
});

export const userDetail = mysqlTable('users_detail', {
  userId: int('user_id')
    .primaryKey()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  role: mysqlEnum(['renter', 'landlord']).notNull(),
  email: varchar({ length: 255 }).notNull(),
  bio: text(),
  phone: varchar({ length: 25 }).notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  gender: mysqlEnum(['male', 'female', 'others']),
  dob: date(),
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  avatarAssetId: int('avatar_asset_id').references(() => assets.id),
  ...timestamps
});

export const addresses = mysqlTable(
  'addresses',
  {
    id: int().primaryKey().autoincrement(),
    userId: int('user_id').references(() => users.id),
    provinceName: varchar('province_name', { length: 255 }).notNull(),
    districtName: varchar('district_name', { length: 255 }).notNull(),
    wardName: varchar('ward_name', { length: 255 }).notNull(),
    detail: text(),
    postalCode: varchar('postal_code', { length: 25 }),
    latitude: decimal({ precision: 11, scale: 8 }),
    longitude: decimal({ precision: 10, scale: 8 }),
    ...timestamps
  },
  (table) => {
    return {
      idxUser: index('idx_addresses_user_id').on(table.userId),
      idxWard: index('idx_addresses_ward_name').on(table.districtName),
      idxProvinceDistrictWard: index('idx_addresses_ward_name_district_name_province_id').on(
        table.wardName,
        table.districtName,
        table.provinceName
      )
    };
  }
);

export const tokens = mysqlTable(
  'tokens',
  {
    id: int().primaryKey().autoincrement(),
    value: varchar({ length: 255 }).notNull(),
    type: mysqlEnum(['refresh', 'otp', 'text', 'verify']).notNull().default('text'),
    isActived: boolean('is_actived').default(true),
    expirationTime: datetime('expiration_time').notNull(),
    userId: int('user_id').references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    target: varchar({ length: 255 }),
    ...timestamps
  },
  (table) => ({
    idxValue: unique('idx_tokens_value').on(table.value),
    idxValueType: index('idx_tokens_value_type').on(table.value, table.type)
  })
);

export const assets = mysqlTable('assets', {
  id: int().primaryKey().autoincrement(),
  type: mysqlEnum(['image', 'video']).notNull(),
  url: text().notNull(),
  name: varchar({ length: 255 }).notNull(),
  format: varchar({ length: 25 }),
  tags: json(),
  folder: varchar({ length: 255 }),
  ...timestamps
});

export const properties = mysqlTable('properties', {
  id: int().primaryKey().autoincrement(),
  ownerId: int('owner_id').references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  addressId: int('address_id').references(() => addresses.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  totalArea: float(),
  totalAreaUnit: mysqlEnum(['cm2', 'm2', 'km2']).default('m2'),
  priceRangeStart: int('price_range_start').default(0),
  priceRangeEnd: int('price_range_end'),
  isActived: boolean('is_actived').default(true),
  ...timestamps
});

export const posts = mysqlTable('posts', {
  id: int().primaryKey().autoincrement(),
  ownerId: int('owner_id').references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  expiration_after: int('expiration_after'),
  expirationAfterUnit: mysqlEnum('expiration_after_unit', ['day', 'hour', 'minute']).default('day'),
  status: mysqlEnum(['actived', 'unactived', 'removed']).default('actived'),
  type: mysqlEnum(['rental', 'pass', 'join', 'wanted']).notNull(),
  note: text(),
  tagsList: json(),
  addressProvince: varchar('address_province', { length: 255 }).notNull(),
  addressDistrict: varchar('address_district', { length: 255 }).notNull(),
  addressDetail: varchar('address_detail', { length: 255 }),
  addressWard: varchar('address_ward', { length: 255 }).notNull(),
  addressLongitude: decimal('address_longitude', { precision: 11, scale: 8 }),
  addressLatitude: decimal('address_latitude', { precision: 10, scale: 8 }),
  ...timestamps
});

export const rentalPosts = mysqlTable('rental_posts', {
  id: int('post_id')
    .primaryKey()
    .notNull()
    .references(() => posts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  priceStart: int('price_start').notNull(),
  priceEnd: int('price_end'),
  priceUnit: mysqlEnum('price_unit', ['vnd', 'usd']).notNull(),
  minLeaseTerm: int('min_lease_term').notNull(),
  minLeaseTermUnit: mysqlEnum('min_lease_term_unit', ['enum', 'day', 'month', 'year']).notNull()
});

export const wantedPosts = mysqlTable('wanted_posts', {
  id: int('post_id')
    .primaryKey()
    .notNull()
    .references(() => posts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  priceStart: int('price_start').notNull(),
  priceEnd: int('price_end'),
  priceUnit: mysqlEnum('price_unit', ['vnd', 'usd']).notNull(),
  moveInDate: date('move_in_date').notNull()
});

export const joinPosts = mysqlTable('join_posts', {
  id: int('post_id')
    .primaryKey()
    .notNull()
    .references(() => posts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  priceStart: int('price_start').notNull(),
  priceEnd: int('price_end'),
  priceUnit: mysqlEnum('price_unit', ['vnd', 'usd']).notNull(),
  moveInDate: date('move_in_date').notNull()
});

export const passPosts = mysqlTable('pass_posts', {
  id: int('post_id')
    .primaryKey()
    .notNull()
    .references(() => posts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  priceStart: int('price_start').notNull(),
  priceEnd: int('price_end'),
  priceUnit: mysqlEnum('price_unit', ['vnd', 'usd']).notNull()
});

export const passPostItems = mysqlTable('pass_post_items', {
  id: int().primaryKey().autoincrement(),
  passPostId: int('pass_post_id')
    .notNull()
    .references(() => passPosts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  passPrice: int('pass_price').notNull(),
  status: mysqlEnum(['new', 'used'])
});

export const userPostReactions = mysqlTable(
  'user_post_reactions',
  {
    userId: int('user_id').references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    postId: int('post_id').references(() => posts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
    reactionType: mysqlEnum('reaction_type', ['like', 'heart', 'funny', 'angry', 'sad']),
    ...timestamps
  },
  (table) => ({
    pkUserPostReaction: primaryKey({ name: 'pk_user_id_post_id', columns: [table.userId, table.postId] }),
    idxUserIdPostId: unique('idx_user_id_post_id').on(table.userId, table.postId)
  })
);

export const postTags = mysqlTable('post_tags', {
  id: int().primaryKey().autoincrement(),
  label: varchar({ length: 25 }).notNull(),
  usedCount: int('used_count').notNull().default(1),
  ...timestamps
});

export const postComments = mysqlTable('post_comments', {
  id: int().primaryKey().autoincrement(),
  content: text().notNull(),
  postId: int('post_id')
    .notNull()
    .references(() => posts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  ...timestamps
});

export const postCommentClosures = mysqlTable(
  'post_comment_closures',
  {
    ancestorId: int('ancestor_id')
      .notNull()
      .references(() => postComments.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    descendantId: int('descendant_id')
      .notNull()
      .references(() => postComments.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    depth: int().notNull()
  },
  (table) => ({
    pkPostCommentClosures: primaryKey({
      name: 'pk_post_comment_closures',
      columns: [table.ancestorId, table.descendantId]
    }),
    idxDescendantIdAncestorId: index('idx_post_comment_closures_ancestor_id_descendant_id').on(
      table.descendantId,
      table.ancestorId
    ),
    idxDescendantId: index('idx_post_comment_closures_descendant_id').on(table.descendantId),
    idxAncestorId: index('idx_post_comment_closures_ancestor_id').on(table.ancestorId)
  })
);

export const chats = mysqlTable('chats', {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }),
  type: mysqlEnum(['group', 'individual']).notNull(),
  ...timestamps
});

export const chatMembers = mysqlTable(
  'chat_members',
  {
    id: int().primaryKey().autoincrement(),
    chatId: int('chat_id').references(() => chats.id),
    userId: int('user_id').references(() => users.id),
    joinedAt: timestamp('joined_at')
      .notNull()
      .default(sql`(now())`),
    lastReadAt: timestamp('last_read_at').onUpdateNow()
  },
  (table) => ({
    idxUserIdChatId: unique('idx_chat_members_chatId_userId').on(table.userId, table.chatId),
    idxJoinedAtLastReadAt: index('idx_chat_members_last_read_at_joined_at').on(table.lastReadAt, table.joinedAt)
  })
);

export const messages = mysqlTable('messages', {
  id: int().primaryKey().autoincrement(),
  senderId: int('sender_id')
    .notNull()
    .references(() => users.id),
  content: text().notNull(),
  assetId: int('asset_id').references(() => assets.id),
  messageType: mysqlEnum('message_type', ['text', 'file']).notNull(),
  sentAt: datetime('sent_at')
    .notNull()
    .default(sql`now()`),
  allowRecallTime: datetime('allow_recall_time').notNull(),
  isRecalled: boolean('is_recalled').notNull().default(false),
  recalledAt: timestamp('recalled_at')
});

export const notifications = mysqlTable('notifications', {
  id: int().primaryKey().autoincrement(),
  type: mysqlEnum(['chat', 'post', 'account']).notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  isRead: boolean('is_read').default(false),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  postId: int('post_id').references(() => posts.id),
  ...timestamp
});
