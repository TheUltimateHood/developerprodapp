import { 
  sessions, 
  commits, 
  tasks, 
  goals, 
  activities,
  gitSyncs,
  breaks,
  issues,
  metrics,
  fileChanges,
  type Session, 
  type InsertSession,
  type Commit,
  type InsertCommit,
  type Task,
  type InsertTask,
  type Goals,
  type InsertGoals,
  type Activity,
  type InsertActivity,
  type GitSync,
  type InsertGitSync,
  type Break,
  type InsertBreak,
  type Issue,
  type InsertIssue,
  type Metrics,
  type InsertMetrics,
  type FileChange,
  type InsertFileChange
} from "@shared/schema";

export interface IStorage {
  // Sessions
  getActiveSessions(): Promise<Session[]>;
  getSessionsForDate(date: string): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<Session>): Promise<Session>;
  
  // Commits
  getCommitsForDate(date: string): Promise<Commit[]>;
  getCommitsForDateRange(startDate: string, endDate: string): Promise<Commit[]>;
  createCommit(commit: InsertCommit): Promise<Commit>;
  
  // Tasks
  getTasksForDate(date: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task>;
  
  // Goals
  getGoalsForDate(date: string): Promise<Goals | undefined>;
  createOrUpdateGoals(goals: InsertGoals): Promise<Goals>;
  
  // Activities
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Git Syncs
  getGitSyncsForDate(date: string): Promise<GitSync[]>;
  createGitSync(gitSync: InsertGitSync): Promise<GitSync>;
  
  // Breaks
  getActiveBreaks(): Promise<Break[]>;
  getBreaksForDate(date: string): Promise<Break[]>;
  createBreak(breakData: InsertBreak): Promise<Break>;
  endActiveBreak(endTime: Date): Promise<Break | null>;
  
  // Issues
  getIssues(): Promise<Issue[]>;
  getIssuesForDate(date: string): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, issue: Partial<Issue>): Promise<Issue>;
  
  // Metrics
  getMetricsForDate(date: string): Promise<Metrics | undefined>;
  createOrUpdateMetrics(metrics: InsertMetrics): Promise<Metrics>;
  getWeeklyMetrics(startDate: string, endDate: string): Promise<Metrics[]>;
  
  // File Changes
  getFileChangesForDate(date: string): Promise<FileChange[]>;
  getFileChangesForSession(sessionId: number): Promise<FileChange[]>;
  createFileChange(fileChange: InsertFileChange): Promise<FileChange>;
  
  // Data export/import
  exportAllData(): Promise<any>;
  importData(data: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessions: Map<number, Session>;
  private commits: Map<number, Commit>;
  private tasks: Map<number, Task>;
  private goals: Map<string, Goals>;
  private activities: Map<number, Activity>;
  private gitSyncs: Map<number, GitSync>;
  private breaks: Map<number, Break>;
  private issues: Map<number, Issue>;
  private metrics: Map<string, Metrics>;
  private fileChanges: Map<number, FileChange>;
  private currentSessionId: number;
  private currentCommitId: number;
  private currentTaskId: number;
  private currentGoalsId: number;
  private currentActivityId: number;
  private currentGitSyncId: number;
  private currentBreakId: number;
  private currentIssueId: number;
  private currentMetricsId: number;
  private currentFileChangeId: number;

  constructor() {
    this.sessions = new Map();
    this.commits = new Map();
    this.tasks = new Map();
    this.goals = new Map();
    this.activities = new Map();
    this.gitSyncs = new Map();
    this.breaks = new Map();
    this.issues = new Map();
    this.metrics = new Map();
    this.fileChanges = new Map();
    this.currentSessionId = 1;
    this.currentCommitId = 1;
    this.currentTaskId = 1;
    this.currentGoalsId = 1;
    this.currentActivityId = 1;
    this.currentGitSyncId = 1;
    this.currentBreakId = 1;
    this.currentIssueId = 1;
    this.currentMetricsId = 1;
    this.currentFileChangeId = 1;
  }

  async getActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  async getSessionsForDate(date: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => {
      const sessionDate = session.startTime.toISOString().split('T')[0];
      return sessionDate === date;
    });
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = { 
      ...insertSession, 
      id,
      startTime: insertSession.startTime || new Date(),
      endTime: insertSession.endTime || null,
      duration: insertSession.duration || null,
      isActive: insertSession.isActive ?? false
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: number, sessionUpdate: Partial<Session>): Promise<Session> {
    const existingSession = this.sessions.get(id);
    if (!existingSession) {
      throw new Error(`Session with id ${id} not found`);
    }
    const updatedSession = { ...existingSession, ...sessionUpdate };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getCommitsForDate(date: string): Promise<Commit[]> {
    return Array.from(this.commits.values()).filter(commit => {
      const commitDate = commit.timestamp.toISOString().split('T')[0];
      return commitDate === date;
    });
  }

  async getCommitsForDateRange(startDate: string, endDate: string): Promise<Commit[]> {
    return Array.from(this.commits.values()).filter(commit => {
      const commitDate = commit.timestamp.toISOString().split('T')[0];
      return commitDate >= startDate && commitDate <= endDate;
    });
  }

  async createCommit(insertCommit: InsertCommit): Promise<Commit> {
    const id = this.currentCommitId++;
    const commit: Commit = { 
      ...insertCommit, 
      id,
      timestamp: new Date()
    };
    this.commits.set(id, commit);
    return commit;
  }

  async getTasksForDate(date: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => {
      const taskDate = task.timestamp.toISOString().split('T')[0];
      return taskDate === date;
    });
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      id,
      title: insertTask.title,
      description: insertTask.description || null,
      completed: insertTask.completed || false,
      timestamp: new Date(),
      completedAt: insertTask.completed ? new Date() : null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    const updatedTask = { 
      ...existingTask, 
      ...taskUpdate,
      completedAt: taskUpdate.completed && !existingTask.completed ? new Date() : existingTask.completedAt
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async getGoalsForDate(date: string): Promise<Goals | undefined> {
    return this.goals.get(date);
  }

  async createOrUpdateGoals(insertGoals: InsertGoals): Promise<Goals> {
    const existingGoals = this.goals.get(insertGoals.date);
    if (existingGoals) {
      const updatedGoals = { ...existingGoals, ...insertGoals };
      this.goals.set(insertGoals.date, updatedGoals);
      return updatedGoals;
    } else {
      const id = this.currentGoalsId++;
      const goals: Goals = { ...insertGoals, id };
      this.goals.set(insertGoals.date, goals);
      return goals;
    }
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      timestamp: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Git Sync methods
  async getGitSyncsForDate(date: string): Promise<GitSync[]> {
    const targetDate = new Date(date);
    const startOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    return Array.from(this.gitSyncs.values()).filter(gitSync => {
      const syncDate = new Date(gitSync.createdAt);
      return syncDate >= startOfTargetDate && syncDate < endOfTargetDate;
    });
  }

  async createGitSync(insertGitSync: InsertGitSync): Promise<GitSync> {
    const id = this.currentGitSyncId++;
    const gitSync: GitSync = {
      ...insertGitSync,
      id,
      status: "success",
      createdAt: new Date()
    };
    this.gitSyncs.set(id, gitSync);
    return gitSync;
  }

  // Break methods
  async getActiveBreaks(): Promise<Break[]> {
    return Array.from(this.breaks.values()).filter(breakRecord => breakRecord.isActive);
  }

  async getBreaksForDate(date: string): Promise<Break[]> {
    const targetDate = new Date(date);
    const startOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    return Array.from(this.breaks.values()).filter(breakRecord => {
      const breakDate = new Date(breakRecord.startTime);
      return breakDate >= startOfTargetDate && breakDate < endOfTargetDate;
    });
  }

  async createBreak(insertBreak: InsertBreak): Promise<Break> {
    const id = this.currentBreakId++;
    const breakRecord: Break = {
      ...insertBreak,
      id,
      createdAt: new Date()
    };
    this.breaks.set(id, breakRecord);
    return breakRecord;
  }

  async endActiveBreak(endTime: Date): Promise<Break | null> {
    const activeBreaks = await this.getActiveBreaks();
    if (activeBreaks.length === 0) return null;

    const activeBreak = activeBreaks[0];
    const updatedBreak: Break = {
      ...activeBreak,
      endTime,
      isActive: false
    };
    this.breaks.set(activeBreak.id, updatedBreak);
    return updatedBreak;
  }

  // Issue methods
  async getIssues(): Promise<Issue[]> {
    return Array.from(this.issues.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getIssuesForDate(date: string): Promise<Issue[]> {
    const targetDate = new Date(date);
    const startOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    return Array.from(this.issues.values()).filter(issue => {
      const issueDate = new Date(issue.createdAt);
      return issueDate >= startOfTargetDate && issueDate < endOfTargetDate;
    });
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = this.currentIssueId++;
    const issue: Issue = {
      ...insertIssue,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.issues.set(id, issue);
    return issue;
  }

  async updateIssue(id: number, updateData: Partial<Issue>): Promise<Issue> {
    const existingIssue = this.issues.get(id);
    if (!existingIssue) {
      throw new Error(`Issue with id ${id} not found`);
    }

    const updatedIssue: Issue = {
      ...existingIssue,
      ...updateData,
      updatedAt: new Date(),
      resolvedAt: updateData.status === "resolved" ? new Date() : existingIssue.resolvedAt
    };
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  // Metrics methods
  async getMetricsForDate(date: string): Promise<Metrics | undefined> {
    return this.metrics.get(date);
  }

  async createOrUpdateMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const existing = this.metrics.get(insertMetrics.date);
    
    if (existing) {
      const updated: Metrics = {
        ...existing,
        ...insertMetrics,
        id: existing.id
      };
      this.metrics.set(insertMetrics.date, updated);
      return updated;
    } else {
      const id = this.currentMetricsId++;
      const newMetrics: Metrics = {
        ...insertMetrics,
        id,
        createdAt: new Date()
      };
      this.metrics.set(insertMetrics.date, newMetrics);
      return newMetrics;
    }
  }

  async getWeeklyMetrics(startDate: string, endDate: string): Promise<Metrics[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.metrics.values()).filter(metric => {
      const metricDate = new Date(metric.date);
      return metricDate >= start && metricDate <= end;
    });
  }

  // File Changes methods
  async getFileChangesForDate(date: string): Promise<FileChange[]> {
    const targetDate = new Date(date);
    const startOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    return Array.from(this.fileChanges.values()).filter(change => {
      const changeDate = new Date(change.timestamp);
      return changeDate >= startOfTargetDate && changeDate < endOfTargetDate;
    });
  }

  async getFileChangesForSession(sessionId: number): Promise<FileChange[]> {
    return Array.from(this.fileChanges.values()).filter(change => 
      change.sessionId === sessionId
    );
  }

  async createFileChange(insertFileChange: InsertFileChange): Promise<FileChange> {
    const id = this.currentFileChangeId++;
    const fileChange: FileChange = {
      ...insertFileChange,
      id,
      timestamp: new Date()
    };
    this.fileChanges.set(id, fileChange);
    return fileChange;
  }

  // Data export/import methods
  async exportAllData(): Promise<any> {
    return {
      sessions: Array.from(this.sessions.values()),
      commits: Array.from(this.commits.values()),
      tasks: Array.from(this.tasks.values()),
      goals: Array.from(this.goals.values()),
      activities: Array.from(this.activities.values()),
      gitSyncs: Array.from(this.gitSyncs.values()),
      breaks: Array.from(this.breaks.values()),
      issues: Array.from(this.issues.values()),
      metrics: Array.from(this.metrics.values()),
      fileChanges: Array.from(this.fileChanges.values()),
      exportedAt: new Date().toISOString(),
      version: "2.0.0"
    };
  }

  async importData(data: any): Promise<void> {
    // Clear existing data
    this.sessions.clear();
    this.commits.clear();
    this.tasks.clear();
    this.goals.clear();
    this.activities.clear();
    this.gitSyncs.clear();
    this.breaks.clear();
    this.issues.clear();
    this.metrics.clear();
    this.fileChanges.clear();

    // Import sessions
    if (data.sessions) {
      data.sessions.forEach((session: Session) => {
        this.sessions.set(session.id, session);
        this.currentSessionId = Math.max(this.currentSessionId, session.id + 1);
      });
    }

    // Import commits
    if (data.commits) {
      data.commits.forEach((commit: Commit) => {
        this.commits.set(commit.id, commit);
        this.currentCommitId = Math.max(this.currentCommitId, commit.id + 1);
      });
    }

    // Import tasks
    if (data.tasks) {
      data.tasks.forEach((task: Task) => {
        this.tasks.set(task.id, task);
        this.currentTaskId = Math.max(this.currentTaskId, task.id + 1);
      });
    }

    // Import goals
    if (data.goals) {
      data.goals.forEach((goal: Goals) => {
        this.goals.set(goal.date, goal);
        this.currentGoalsId = Math.max(this.currentGoalsId, goal.id + 1);
      });
    }

    // Import activities
    if (data.activities) {
      data.activities.forEach((activity: Activity) => {
        this.activities.set(activity.id, activity);
        this.currentActivityId = Math.max(this.currentActivityId, activity.id + 1);
      });
    }

    // Import git syncs
    if (data.gitSyncs) {
      data.gitSyncs.forEach((gitSync: GitSync) => {
        this.gitSyncs.set(gitSync.id, gitSync);
        this.currentGitSyncId = Math.max(this.currentGitSyncId, gitSync.id + 1);
      });
    }

    // Import breaks
    if (data.breaks) {
      data.breaks.forEach((breakRecord: Break) => {
        this.breaks.set(breakRecord.id, breakRecord);
        this.currentBreakId = Math.max(this.currentBreakId, breakRecord.id + 1);
      });
    }

    // Import issues
    if (data.issues) {
      data.issues.forEach((issue: Issue) => {
        this.issues.set(issue.id, issue);
        this.currentIssueId = Math.max(this.currentIssueId, issue.id + 1);
      });
    }

    // Import metrics
    if (data.metrics) {
      data.metrics.forEach((metric: Metrics) => {
        this.metrics.set(metric.date, metric);
        this.currentMetricsId = Math.max(this.currentMetricsId, metric.id + 1);
      });
    }

    // Import file changes
    if (data.fileChanges) {
      data.fileChanges.forEach((fileChange: FileChange) => {
        this.fileChanges.set(fileChange.id, fileChange);
        this.currentFileChangeId = Math.max(this.currentFileChangeId, fileChange.id + 1);
      });
    }
  }
}

export const storage = new MemStorage();
