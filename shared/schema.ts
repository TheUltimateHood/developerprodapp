import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  isActive: boolean("is_active").default(false),
});

export const commits = pgTable("commits", {
  id: serial("id").primaryKey(),
  repository: text("repository").notNull(),
  message: text("message").notNull(),
  linesChanged: integer("lines_changed").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  codingTimeTarget: integer("coding_time_target").notNull(), // in minutes
  commitsTarget: integer("commits_target").notNull(),
  tasksTarget: integer("tasks_target").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'session', 'commit', 'task'
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  projectName: true,
  startTime: true,
  endTime: true,
  duration: true,
  isActive: true,
});

export const insertCommitSchema = createInsertSchema(commits).pick({
  repository: true,
  message: true,
  linesChanged: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  completed: true,
});

export const insertGoalsSchema = createInsertSchema(goals).pick({
  codingTimeTarget: true,
  commitsTarget: true,
  tasksTarget: true,
  date: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  description: true,
});

// Git sync table
export const gitSyncs = pgTable("git_syncs", {
  id: serial("id").primaryKey(),
  repository: text("repository").notNull(),
  branch: text("branch").notNull(),
  action: text("action").notNull(), // pull, push, sync
  commitMessage: text("commit_message"),
  status: text("status").notNull().default("pending"), // pending, success, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGitSyncSchema = createInsertSchema(gitSyncs).pick({
  repository: true,
  branch: true,
  action: true,
  commitMessage: true,
});

// Break tracking table
export const breaks = pgTable("breaks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // short, long, custom
  duration: integer("duration").notNull(), // in minutes
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBreakSchema = createInsertSchema(breaks).pick({
  type: true,
  duration: true,
  startTime: true,
  endTime: true,
  isActive: true,
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Commit = typeof commits.$inferSelect;
export type InsertCommit = z.infer<typeof insertCommitSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Goals = typeof goals.$inferSelect;
export type InsertGoals = z.infer<typeof insertGoalsSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type GitSync = typeof gitSyncs.$inferSelect;
export type InsertGitSync = z.infer<typeof insertGitSyncSchema>;
export type Break = typeof breaks.$inferSelect;
export type InsertBreak = z.infer<typeof insertBreakSchema>;
