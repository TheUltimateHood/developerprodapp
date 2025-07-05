import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertCommitSchema, insertTaskSchema, insertGoalsSchema, insertActivitySchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
