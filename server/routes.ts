import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { filePersistence } from "./file-persistence";
import { insertSessionSchema, insertCommitSchema, insertTaskSchema, insertGoalsSchema, insertActivitySchema, insertGitSyncSchema, insertBreakSchema, insertIssueSchema, insertMetricsSchema, insertFileChangeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sessions
  app.get("/api/sessions/active", async (req, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active sessions" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const sessions = await storage.getSessionsForDate(date);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      
      // Create activity
      await storage.createActivity({
        type: "session",
        description: `Started coding session: ${session.projectName}`
      });
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updateSession(id, req.body);
      
      if (req.body.endTime) {
        await storage.createActivity({
          type: "session",
          description: `Ended coding session: ${session.projectName}`
        });
      }
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update session" });
    }
  });

  // Commits
  app.get("/api/commits", async (req, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      if (startDate && endDate && typeof startDate === 'string' && typeof endDate === 'string') {
        const commits = await storage.getCommitsForDateRange(startDate, endDate);
        return res.json(commits);
      }
      
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      
      const commits = await storage.getCommitsForDate(date);
      res.json(commits);
    } catch (error) {
      res.status(500).json({ error: "Failed to get commits" });
    }
  });

  app.post("/api/commits", async (req, res) => {
    try {
      const commitData = insertCommitSchema.parse(req.body);
      const commit = await storage.createCommit(commitData);
      
      // Create activity
      await storage.createActivity({
        type: "commit",
        description: `Committed: ${commit.message}`
      });
      
      res.json(commit);
    } catch (error) {
      res.status(400).json({ error: "Invalid commit data" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const tasks = await storage.getTasksForDate(date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      // Create activity
      await storage.createActivity({
        type: "task",
        description: `${task.completed ? 'Completed' : 'Added'} task: ${task.title}`
      });
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.body);
      
      if (req.body.completed) {
        await storage.createActivity({
          type: "task",
          description: `Completed task: ${task.title}`
        });
      }
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const goals = await storage.getGoalsForDate(date);
      res.json(goals || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalsData = insertGoalsSchema.parse(req.body);
      const goals = await storage.createOrUpdateGoals(goalsData);
      res.json(goals);
    } catch (error) {
      res.status(400).json({ error: "Invalid goals data" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const { limit = "10" } = req.query;
      const activities = await storage.getRecentActivities(parseInt(limit as string));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get activities" });
    }
  });

  // Analytics/Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }

      const [sessions, commits, tasks, goals] = await Promise.all([
        storage.getSessionsForDate(date),
        storage.getCommitsForDate(date),
        storage.getTasksForDate(date),
        storage.getGoalsForDate(date)
      ]);

      const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const completedTasks = tasks.filter(task => task.completed).length;
      const totalLinesOfCode = commits.reduce((sum, commit) => sum + commit.linesChanged, 0);

      const dashboardData = {
        sessions: sessions.length,
        totalTime: Math.floor(totalTime / 60), // convert to minutes
        averageSession: sessions.length > 0 ? Math.floor(totalTime / sessions.length / 60) : 0,
        commits: commits.length,
        linesOfCode: totalLinesOfCode,
        tasksCompleted: completedTasks,
        totalTasks: tasks.length,
        goals: goals || null
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  // Data export
  app.get("/api/export", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        return res.status(400).json({ error: "Start date and end date parameters are required" });
      }

      const commits = await storage.getCommitsForDateRange(startDate, endDate);
      
      // Get sessions and tasks for the date range
      const sessions: any[] = [];
      const tasks: any[] = [];
      
      const currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailySessions = await storage.getSessionsForDate(dateStr);
        const dailyTasks = await storage.getTasksForDate(dateStr);
        sessions.push(...dailySessions);
        tasks.push(...dailyTasks);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const exportData = {
        dateRange: { startDate, endDate },
        sessions,
        commits,
        tasks,
        summary: {
          totalSessions: sessions.length,
          totalCommits: commits.length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(task => task.completed).length,
          totalCodingTime: sessions.reduce((sum, session) => sum + (session.duration || 0), 0),
          totalLinesOfCode: commits.reduce((sum, commit) => sum + commit.linesChanged, 0)
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="devtrack-export-${startDate}-to-${endDate}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Git Sync routes
  app.post("/api/git/sync", async (req, res) => {
    try {
      const gitSyncData = insertGitSyncSchema.parse(req.body);
      const gitSync = await storage.createGitSync(gitSyncData);
      
      // Create activity
      await storage.createActivity({
        type: "git",
        description: `Git ${gitSync.action}: ${gitSync.repository}${gitSync.commitMessage ? ` - ${gitSync.commitMessage}` : ''}`
      });
      
      res.json(gitSync);
    } catch (error) {
      res.status(400).json({ error: "Invalid git sync data" });
    }
  });

  app.get("/api/git/syncs", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const gitSyncs = await storage.getGitSyncsForDate(date);
      res.json(gitSyncs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get git syncs" });
    }
  });

  // Break tracking routes
  app.post("/api/breaks", async (req, res) => {
    try {
      const breakData = insertBreakSchema.parse(req.body);
      const breakRecord = await storage.createBreak(breakData);
      
      // Create activity
      await storage.createActivity({
        type: "break",
        description: `Started ${breakRecord.type} break (${breakRecord.duration} minutes)`
      });
      
      res.json(breakRecord);
    } catch (error) {
      res.status(400).json({ error: "Invalid break data" });
    }
  });

  app.post("/api/breaks/end", async (req, res) => {
    try {
      const { endTime } = req.body;
      const breakRecord = await storage.endActiveBreak(new Date(endTime));
      
      if (breakRecord) {
        // Create activity
        await storage.createActivity({
          type: "break",
          description: `Ended ${breakRecord.type} break`
        });
      }
      
      res.json(breakRecord);
    } catch (error) {
      res.status(500).json({ error: "Failed to end break" });
    }
  });

  app.get("/api/breaks/active", async (req, res) => {
    try {
      const activeBreaks = await storage.getActiveBreaks();
      res.json(activeBreaks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active breaks" });
    }
  });

  app.get("/api/breaks", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const breaks = await storage.getBreaksForDate(date);
      res.json(breaks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get breaks" });
    }
  });

  // Issues routes
  app.get("/api/issues", async (req, res) => {
    try {
      const issues = await storage.getIssues();
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: "Failed to get issues" });
    }
  });

  app.post("/api/issues", async (req, res) => {
    try {
      const issueData = insertIssueSchema.parse(req.body);
      const issue = await storage.createIssue(issueData);
      
      // Create activity
      await storage.createActivity({
        type: "issue",
        description: `Created ${issue.category}: ${issue.title}`
      });
      
      res.json(issue);
    } catch (error) {
      res.status(400).json({ error: "Invalid issue data" });
    }
  });

  app.patch("/api/issues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.updateIssue(id, req.body);
      
      // Create activity for status changes
      if (req.body.status) {
        await storage.createActivity({
          type: "issue",
          description: `Updated issue status to ${req.body.status}: ${issue.title}`
        });
      }
      
      res.json(issue);
    } catch (error) {
      res.status(400).json({ error: "Failed to update issue" });
    }
  });

  // Enhanced metrics routes
  app.get("/api/metrics/enhanced/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      // Get daily metrics
      const dailyMetrics = await storage.getMetricsForDate(date) || {
        date,
        totalLinesWritten: 0,
        totalLinesDeleted: 0,
        totalLinesModified: 0,
        filesModified: 0,
        bugsFixed: 0,
        featuresAdded: 0,
        codeQualityScore: 85,
        testsCoverage: 70,
        performanceScore: 80
      };

      // Calculate weekly metrics
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - 7);
      const weeklyMetrics = await storage.getWeeklyMetrics(
        weekStart.toISOString().split('T')[0],
        date
      );

      const weeklyAggregate = weeklyMetrics.reduce((acc, metric) => ({
        linesWritten: acc.linesWritten + metric.totalLinesWritten,
        linesDeleted: acc.linesDeleted + metric.totalLinesDeleted,
        filesModified: acc.filesModified + metric.filesModified,
        bugsFixed: acc.bugsFixed + metric.bugsFixed,
        featuresAdded: acc.featuresAdded + metric.featuresAdded,
        avgQualityScore: Math.round((acc.avgQualityScore + metric.codeQualityScore) / 2),
        avgTestsCoverage: Math.round((acc.avgTestsCoverage + metric.testsCoverage) / 2),
        avgPerformanceScore: Math.round((acc.avgPerformanceScore + metric.performanceScore) / 2)
      }), {
        linesWritten: 0,
        linesDeleted: 0,
        filesModified: 0,
        bugsFixed: 0,
        featuresAdded: 0,
        avgQualityScore: 85,
        avgTestsCoverage: 70,
        avgPerformanceScore: 80
      });

      // Get issue statistics
      const allIssues = await storage.getIssues();
      const issueStats = {
        total: allIssues.length,
        open: allIssues.filter(i => i.status === "open").length,
        inProgress: allIssues.filter(i => i.status === "in-progress").length,
        resolved: allIssues.filter(i => i.status === "resolved").length,
        critical: allIssues.filter(i => i.priority === "critical").length,
        high: allIssues.filter(i => i.priority === "high").length
      };

      // Get productivity metrics
      const todaySessions = await storage.getSessionsForDate(date);
      const totalHours = todaySessions.reduce((acc, session) => 
        acc + (session.duration || 0), 0) / 3600;
      
      const productivityStats = {
        totalSessions: todaySessions.length,
        totalHours,
        avgSessionLength: todaySessions.length > 0 
          ? Math.round((totalHours * 60) / todaySessions.length) 
          : 0,
        linesPerHour: totalHours > 0 
          ? Math.round(dailyMetrics.totalLinesWritten / totalHours) 
          : 0,
        bugsPerDay: dailyMetrics.bugsFixed,
        featuresPerWeek: weeklyAggregate.featuresAdded / 7
      };

      res.json({
        daily: dailyMetrics,
        weekly: weeklyAggregate,
        issues: issueStats,
        productivity: productivityStats
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get enhanced metrics" });
    }
  });

  app.post("/api/metrics", async (req, res) => {
    try {
      const metricsData = insertMetricsSchema.parse(req.body);
      const metrics = await storage.createOrUpdateMetrics(metricsData);
      res.json(metrics);
    } catch (error) {
      res.status(400).json({ error: "Invalid metrics data" });
    }
  });

  // File changes routes
  app.get("/api/file-changes", async (req, res) => {
    try {
      const { date, sessionId } = req.query;
      
      if (sessionId) {
        const fileChanges = await storage.getFileChangesForSession(parseInt(sessionId as string));
        res.json(fileChanges);
      } else if (date && typeof date === 'string') {
        const fileChanges = await storage.getFileChangesForDate(date);
        res.json(fileChanges);
      } else {
        return res.status(400).json({ error: "Date or sessionId parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get file changes" });
    }
  });

  app.post("/api/file-changes", async (req, res) => {
    try {
      const fileChangeData = insertFileChangeSchema.parse(req.body);
      const fileChange = await storage.createFileChange(fileChangeData);
      
      // Create activity
      await storage.createActivity({
        type: "file",
        description: `${fileChange.changeType} ${fileChange.filePath} (+${fileChange.linesAdded}/-${fileChange.linesDeleted})`
      });
      
      res.json(fileChange);
    } catch (error) {
      res.status(400).json({ error: "Invalid file change data" });
    }
  });

  // File persistence routes
  app.post("/api/backup", async (req, res) => {
    try {
      const data = await storage.exportAllData();
      const filepath = await filePersistence.saveBackup(data);
      
      // Create activity
      await storage.createActivity({
        type: "backup",
        description: `Created backup: ${filepath.split('/').pop()}`
      });
      
      res.json({ 
        success: true, 
        filepath,
        message: "Backup created successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  app.get("/api/backups", async (req, res) => {
    try {
      const backups = await filePersistence.listBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: "Failed to list backups" });
    }
  });

  app.post("/api/restore/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const data = await filePersistence.loadBackup(filename);
      await storage.importData(data);
      
      // Create activity
      await storage.createActivity({
        type: "restore",
        description: `Restored data from: ${filename}`
      });
      
      res.json({ 
        success: true, 
        message: "Data restored successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to restore backup" });
    }
  });

  app.post("/api/export/csv", async (req, res) => {
    try {
      const { type, startDate, endDate } = req.body;
      let data: any[] = [];
      
      switch (type) {
        case "sessions":
          data = await storage.getSessionsForDate(startDate);
          break;
        case "commits":
          data = await storage.getCommitsForDateRange(startDate, endDate);
          break;
        case "tasks":
          data = await storage.getTasksForDate(startDate);
          break;
        case "issues":
          data = await storage.getIssuesForDate(startDate);
          break;
        case "activities":
          data = await storage.getRecentActivities(1000);
          break;
        default:
          return res.status(400).json({ error: "Invalid export type" });
      }
      
      const filepath = await filePersistence.saveCSVExport(data, type);
      
      // Create activity
      await storage.createActivity({
        type: "export",
        description: `Exported ${type} to CSV: ${filepath.split('/').pop()}`
      });
      
      res.json({ 
        success: true, 
        filepath,
        message: `${type} exported successfully`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  app.post("/api/daily-snapshot", async (req, res) => {
    try {
      const data = await storage.exportAllData();
      const filepath = await filePersistence.saveDailySnapshot(data);
      
      res.json({ 
        success: true, 
        filepath,
        message: "Daily snapshot saved"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save daily snapshot" });
    }
  });

  // Auto-backup cleanup
  app.post("/api/cleanup-backups", async (req, res) => {
    try {
      const { daysToKeep = 30 } = req.body;
      const deletedCount = await filePersistence.deleteOldBackups(daysToKeep);
      
      res.json({ 
        success: true, 
        deletedCount,
        message: `Cleaned up ${deletedCount} old backups`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to cleanup backups" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
