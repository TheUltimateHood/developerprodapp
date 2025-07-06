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
  linesWritten: integer("lines_written").default(0),
  linesDeleted: integer("lines_deleted").default(0),
  filesModified: integer("files_modified").default(0),
  productivity: integer("productivity").default(0), // 0-100 score
  notes: text("notes"),
  tags: text("tags"), // JSON array as string
});

export const commits = pgTable("commits", {
  id: serial("id").primaryKey(),
  repository: text("repository").notNull(),
  message: text("message").notNull(),
  linesChanged: integer("lines_changed").notNull(),
  linesAdded: integer("lines_added").default(0),
  linesDeleted: integer("lines_deleted").default(0),
  filesChanged: integer("files_changed").default(1),
  commitHash: text("commit_hash"),
  branch: text("branch").default("main"),
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
  linesWritten: true,
  linesDeleted: true,
  filesModified: true,
  productivity: true,
  notes: true,
  tags: true,
});

export const insertCommitSchema = createInsertSchema(commits).pick({
  repository: true,
  message: true,
  linesChanged: true,
  linesAdded: true,
  linesDeleted: true,
  filesChanged: true,
  commitHash: true,
  branch: true,
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

// Issues/Bug tracking table
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"), // open, in-progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  category: text("category").notNull().default("bug"), // bug, feature, enhancement, task
  assignee: text("assignee"),
  repository: text("repository"),
  branch: text("branch"),
  linesAffected: integer("lines_affected"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  tags: text("tags"), // JSON array as string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertIssueSchema = createInsertSchema(issues).pick({
  title: true,
  description: true,
  status: true,
  priority: true,
  category: true,
  assignee: true,
  repository: true,
  branch: true,
  linesAffected: true,
  estimatedHours: true,
  actualHours: true,
  tags: true,
});

// Enhanced metrics table
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  totalLinesWritten: integer("total_lines_written").default(0),
  totalLinesDeleted: integer("total_lines_deleted").default(0),
  totalLinesModified: integer("total_lines_modified").default(0),
  filesModified: integer("files_modified").default(0),
  bugsFixed: integer("bugs_fixed").default(0),
  featuresAdded: integer("features_added").default(0),
  codeQualityScore: integer("code_quality_score").default(0), // 0-100
  testsCoverage: integer("tests_coverage").default(0), // 0-100
  performanceScore: integer("performance_score").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMetricsSchema = createInsertSchema(metrics).pick({
  date: true,
  totalLinesWritten: true,
  totalLinesDeleted: true,
  totalLinesModified: true,
  filesModified: true,
  bugsFixed: true,
  featuresAdded: true,
  codeQualityScore: true,
  testsCoverage: true,
  performanceScore: true,
});

// File changes tracking table
export const fileChanges = pgTable("file_changes", {
  id: serial("id").primaryKey(),
  filePath: text("file_path").notNull(),
  repository: text("repository").notNull(),
  changeType: text("change_type").notNull(), // added, modified, deleted
  linesAdded: integer("lines_added").default(0),
  linesDeleted: integer("lines_deleted").default(0),
  linesModified: integer("lines_modified").default(0),
  commitId: text("commit_id"),
  sessionId: integer("session_id").references(() => sessions.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertFileChangeSchema = createInsertSchema(fileChanges).pick({
  filePath: true,
  repository: true,
  changeType: true,
  linesAdded: true,
  linesDeleted: true,
  linesModified: true,
  commitId: true,
  sessionId: true,
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
export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Metrics = typeof metrics.$inferSelect;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type FileChange = typeof fileChanges.$inferSelect;
export type InsertFileChange = z.infer<typeof insertFileChangeSchema>;
