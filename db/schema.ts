import {integer,sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const merchantStores=sqliteTable('merchant_stores',{
 id:text('id').primaryKey(),userId:text('user_id').notNull().unique(),email:text('email').notNull(),ownerName:text('owner_name').notNull(),businessName:text('business_name').notNull(),slug:text('slug').notNull().unique(),logoKey:text('logo_key').notNull(),createdAt:integer('created_at').notNull(),
});
export const emailChallenges=sqliteTable('email_challenges',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),email:text('email').notNull(),purpose:text('purpose').notNull(),codeHash:text('code_hash').notNull(),createdAt:integer('created_at').notNull(),expiresAt:integer('expires_at').notNull(),attempts:integer('attempts').notNull().default(0),status:text('status').notNull().default('pending'),proofHash:text('proof_hash'),verifiedAt:integer('verified_at'),proofExpiresAt:integer('proof_expires_at'),consumedAt:integer('consumed_at'),
},table=>[index('email_challenges_user_created_idx').on(table.userId,table.createdAt)]);
