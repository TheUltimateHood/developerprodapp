import { 
  sessions, 
  commits, 
  tasks, 
  goals, 
  activities,
  type Session, 
  type InsertSession,
  type Commit,
  type InsertCommit,
  type Task,
  type InsertTask,
  type Goals,
  type InsertGoals,
  type Activity,
  type InsertActivity
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
}

export class MemStorage implements IStorage {
  private sessions: Map<number, Session>;
  private commits: Map<number, Commit>;
  private tasks: Map<number, Task>;
  private goals: Map<string, Goals>;
  private activities: Map<number, Activity>;
  private currentSessionId: number;
  private currentCommitId: number;
  private currentTaskId: number;
  private currentGoalsId: number;
  private currentActivityId: number;

  constructor() {
    this.sessions = new Map();
    this.commits = new Map();
    this.tasks = new Map();
    this.goals = new Map();
    this.activities = new Map();
    this.currentSessionId = 1;
    this.currentCommitId = 1;
    this.currentTaskId = 1;
    this.currentGoalsId = 1;
    this.currentActivityId = 1;
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
}

export const storage = new MemStorage();
