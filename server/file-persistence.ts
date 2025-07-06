import * as fs from 'fs/promises';
import * as path from 'path';
import { format } from 'date-fns';

export interface BackupData {
  sessions: any[];
  commits: any[];
  tasks: any[];
  goals: any[];
  activities: any[];
  gitSyncs: any[];
  breaks: any[];
  issues: any[];
  metrics: any[];
  fileChanges: any[];
  exportedAt: string;
  version: string;
}

export class FilePersistence {
  private dataDir: string;
  
  constructor(dataDirectory = './data') {
    this.dataDir = dataDirectory;
  }

  async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async saveBackup(data: BackupData): Promise<string> {
    await this.ensureDataDirectory();
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `devtrack_backup_${timestamp}.json`;
    const filepath = path.join(this.dataDir, filename);
    
    const backupData: BackupData = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '2.0.0'
    };
    
    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf-8');
    return filepath;
  }

  async loadBackup(filename: string): Promise<BackupData> {
    const filepath = path.join(this.dataDir, filename);
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  }

  async listBackups(): Promise<string[]> {
    await this.ensureDataDirectory();
    
    try {
      const files = await fs.readdir(this.dataDir);
      return files
        .filter(file => file.startsWith('devtrack_backup_') && file.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first
    } catch {
      return [];
    }
  }

  async saveCSVExport(data: any[], type: string): Promise<string> {
    await this.ensureDataDirectory();
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `devtrack_${type}_${timestamp}.csv`;
    const filepath = path.join(this.dataDir, filename);
    
    if (data.length === 0) {
      await fs.writeFile(filepath, '', 'utf-8');
      return filepath;
    }

    // Convert to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    await fs.writeFile(filepath, csv, 'utf-8');
    return filepath;
  }

  async saveDailySnapshot(data: BackupData): Promise<string> {
    await this.ensureDataDirectory();
    
    const date = format(new Date(), 'yyyy-MM-dd');
    const filename = `daily_snapshot_${date}.json`;
    const filepath = path.join(this.dataDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    return filepath;
  }

  async getLatestSnapshot(): Promise<BackupData | null> {
    const backups = await this.listBackups();
    const dailySnapshots = await this.listDailySnapshots();
    
    const allFiles = [...backups, ...dailySnapshots].sort().reverse();
    
    if (allFiles.length === 0) return null;
    
    try {
      return await this.loadBackup(allFiles[0]);
    } catch {
      return null;
    }
  }

  async listDailySnapshots(): Promise<string[]> {
    await this.ensureDataDirectory();
    
    try {
      const files = await fs.readdir(this.dataDir);
      return files
        .filter(file => file.startsWith('daily_snapshot_') && file.endsWith('.json'))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  async deleteOldBackups(daysToKeep = 30): Promise<number> {
    const backups = await this.listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    
    for (const backup of backups) {
      try {
        const filepath = path.join(this.dataDir, backup);
        const stats = await fs.stat(filepath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filepath);
          deletedCount++;
        }
      } catch {
        // Ignore errors for individual files
      }
    }
    
    return deletedCount;
  }
}

export const filePersistence = new FilePersistence();