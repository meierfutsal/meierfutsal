import {sqliteTable,text,integer,index,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:text('id').primaryKey(),kind:text('kind').notNull(),data:text('data').notNull(),revision:integer('revision').notNull().default(1),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()},t=>[index('idx_records_kind').on(t.kind)]);
export const admins=sqliteTable('admins',{email:text('email').primaryKey(),createdAt:text('created_at').notNull()});
export const requests=sqliteTable('request_limits',{key:text('key').primaryKey(),count:integer('count').notNull().default(0)});
