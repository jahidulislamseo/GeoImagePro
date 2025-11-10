import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Location Templates
export const locationTemplates = pgTable("location_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationTemplateSchema = createInsertSchema(locationTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertLocationTemplate = z.infer<typeof insertLocationTemplateSchema>;
export type LocationTemplate = typeof locationTemplates.$inferSelect;

// Batch Jobs
export const batchJobs = pgTable("batch_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  totalImages: real("total_images").notNull(),
  processedImages: real("processed_images").notNull().default(0),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  keywords: text("keywords"),
  description: text("description"),
  documentName: text("document_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertBatchJobSchema = createInsertSchema(batchJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertBatchJob = z.infer<typeof insertBatchJobSchema>;
export type BatchJob = typeof batchJobs.$inferSelect;

// AI Analysis Jobs
export const aiJobs = pgTable("ai_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  jobType: text("job_type").notNull(), // 'location', 'keywords', 'description'
  result: jsonb("result"), // Stores AI analysis results
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertAIJobSchema = createInsertSchema(aiJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertAIJob = z.infer<typeof insertAIJobSchema>;
export type AIJob = typeof aiJobs.$inferSelect;
