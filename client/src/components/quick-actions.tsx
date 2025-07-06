import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  Plus, 
  BarChart3, 
  Download, 
  Coffee, 
  RefreshCw 
} from "lucide-react";

interface QuickActionsProps {
  onLogCommit: () => void;
  onAddTask: () => void;
  onExportData: () => void;
  onGitSync: () => void;
  onTakeBreak: () => void;
}

export default function QuickActions({ onLogCommit, onAddTask, onExportData, onGitSync, onTakeBreak }: QuickActionsProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-1.5 rounded-lg mr-2">
          <RefreshCw className="h-4 w-4 text-white" />
        </div>
        Quick Actions
      </h4>
      <div className="space-y-3">
        <Button
          onClick={onLogCommit}
          variant="ghost"
          className="w-full justify-start p-4 h-auto border border-slate-200/50 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:border-emerald-200 transition-all duration-200 group"
        >
          <div className="bg-emerald-100 p-2 rounded-lg mr-3 group-hover:bg-emerald-200 transition-colors">
            <GitBranch className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-700">Log Commit</div>
            <div className="text-xs text-slate-500">Record git commit</div>
          </div>
        </Button>

        <Button
          onClick={onAddTask}
          variant="ghost"
          className="w-full justify-start p-4 h-auto border border-slate-200/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-200 group"
        >
          <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
            <Plus className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-700">Add Task</div>
            <div className="text-xs text-slate-500">Create new task</div>
          </div>
        </Button>

        <Button
          onClick={onGitSync}
          variant="ghost"
          className="w-full justify-start p-4 h-auto border border-slate-200/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:border-purple-200 transition-all duration-200 group"
        >
          <div className="bg-purple-100 p-2 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-700">Git Sync</div>
            <div className="text-xs text-slate-500">Sync repository</div>
          </div>
        </Button>

        <Button
          onClick={onTakeBreak}
          variant="ghost"
          className="w-full justify-start p-4 h-auto border border-slate-200/50 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-200 transition-all duration-200 group"
        >
          <div className="bg-amber-100 p-2 rounded-lg mr-3 group-hover:bg-amber-200 transition-colors">
            <Coffee className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-700">Take Break</div>
            <div className="text-xs text-slate-500">Start break timer</div>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start p-4 h-auto border border-slate-200/50 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 hover:border-slate-300 transition-all duration-200 group"
        >
          <div className="bg-slate-100 p-2 rounded-lg mr-3 group-hover:bg-slate-200 transition-colors">
            <BarChart3 className="h-4 w-4 text-slate-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-700">View Reports</div>
            <div className="text-xs text-slate-500">Analytics dashboard</div>
          </div>
        </Button>

        <Button
          onClick={onExportData}
          variant="ghost"
          className="w-full justify-start p-4 h-auto border border-slate-200/50 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 hover:border-slate-300 transition-all duration-200 group"
        >
          <div className="bg-slate-100 p-2 rounded-lg mr-3 group-hover:bg-slate-200 transition-colors">
            <Download className="h-4 w-4 text-slate-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-700">Export Data</div>
            <div className="text-xs text-slate-500">Download CSV</div>
          </div>
        </Button>
      </div>
    </div>
  );
}
