import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onLogCommit: () => void;
  onAddTask: () => void;
  onExportData: () => void;
}

export default function QuickActions({ onLogCommit, onAddTask, onExportData }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h4>
      <div className="space-y-3">
        <Button
          onClick={onLogCommit}
          variant="ghost"
          className="w-full justify-start p-3 h-auto border border-slate-200 hover:bg-slate-50"
        >
          <i className="fas fa-code-branch text-emerald-600 mr-3"></i>
          <span className="text-sm font-medium text-slate-700">Log Commit</span>
        </Button>

        <Button
          onClick={onAddTask}
          variant="ghost"
          className="w-full justify-start p-3 h-auto border border-slate-200 hover:bg-slate-50"
        >
          <i className="fas fa-plus-circle text-primary mr-3"></i>
          <span className="text-sm font-medium text-slate-700">Add Task</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start p-3 h-auto border border-slate-200 hover:bg-slate-50"
        >
          <i className="fas fa-chart-bar text-amber-600 mr-3"></i>
          <span className="text-sm font-medium text-slate-700">View Reports</span>
        </Button>

        <Button
          onClick={onExportData}
          variant="ghost"
          className="w-full justify-start p-3 h-auto border border-slate-200 hover:bg-slate-50"
        >
          <i className="fas fa-download text-slate-600 mr-3"></i>
          <span className="text-sm font-medium text-slate-700">Export Data</span>
        </Button>
      </div>
    </div>
  );
}
