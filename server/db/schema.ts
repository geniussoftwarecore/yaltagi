import { pgTable, serial, varchar, text, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Rooms table
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  accessCode: varchar('access_code', { length: 20 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  hostId: integer('host_id').references(() => users.id).notNull(),
  maxParticipants: integer('max_participants').default(10),
  isPrivate: boolean('is_private').default(false),
  requiresWaitingRoom: boolean('requires_waiting_room').default(false),
  isRecording: boolean('is_recording').default(false),
  settings: json('settings').$type<{
    allowScreenShare?: boolean;
    allowChat?: boolean;
    muteOnJoin?: boolean;
    cameraOnJoin?: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Room participants table
export const roomParticipants = pgTable('room_participants', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id),
  displayName: varchar('display_name', { length: 100 }),
  isMuted: boolean('is_muted').default(false),
  isCameraOn: boolean('is_camera_on').default(true),
  isScreenSharing: boolean('is_screen_sharing').default(false),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
});

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id),
  senderName: varchar('sender_name', { length: 100 }).notNull(),
  message: text('message').notNull(),
  messageType: varchar('message_type', { length: 20 }).default('text'), // 'text', 'system', 'file'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertRoomSchema = createInsertSchema(rooms);
export const selectRoomSchema = createSelectSchema(rooms);

export const insertRoomParticipantSchema = createInsertSchema(roomParticipants);
export const selectRoomParticipantSchema = createSelectSchema(roomParticipants);

export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const selectChatMessageSchema = createSelectSchema(chatMessages);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type RoomParticipant = typeof roomParticipants.$inferSelect;
export type NewRoomParticipant = typeof roomParticipants.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;