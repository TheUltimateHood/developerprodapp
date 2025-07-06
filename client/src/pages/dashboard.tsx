import { useState } from "react";
import TimerSection from "@/components/timer-section";
import MetricsOverview from "@/components/metrics-overview";
import GoalTracker from "@/components/goal-tracker";
import RecentActivity from "@/components/recent-activity";
import QuickActions from "@/components/quick-actions";
import LogCommitModal from "@/components/modals/log-commit-modal";
import AddTaskModal from "@/components/modals/add-task-modal";
import EditGoalsModal from "@/components/modals/edit-goals-modal";
import GitSyncModal from "@/components/modals/git-sync-modal";
import BreakTimerModal from "@/components/modals/break-timer-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Code2, 
  Settings, 
  Home, 
  BarChart3, 
  Target, 
  Download,
  GitBranch,
  Clock,
  Calendar
} from "lucide-react";

export default function Dashboard() {
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleExportData = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    window.open(`/api/export?startDate=${startDateStr}&endDate=${endDateStr}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">DevTrack</h1>
                  <p className="text-xs text-slate-500">Developer Productivity</p>
                </div>
              </div>
              {!isMobile && (
                <nav className="hidden md:flex space-x-8 ml-8">
                  <a href="#" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Reports</span>
                  </a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Goals</span>
                  </a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                    <GitBranch className="h-4 w-4" />
                    <span>Git</span>
                  </a>
                </nav>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1 text-xs font-medium text-slate-600">
                <Clock className="h-3 w-3" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TimerSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MetricsOverview />
          </div>

          <div className="space-y-6">
            <GoalTracker onEditGoals={() => setIsGoalsModalOpen(true)} />
            <RecentActivity />
            <QuickActions
              onLogCommit={() => setIsCommitModalOpen(true)}
              onAddTask={() => setIsTaskModalOpen(true)}
              onExportData={handleExportData}
              onGitSync={() => setIsGitModalOpen(true)}
              onTakeBreak={() => setIsBreakModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/50 px-4 py-2 shadow-lg">
          <div className="flex justify-around">
            <button className="flex flex-col items-center space-y-1 text-primary">
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-slate-400">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Reports</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-slate-400">
              <Target className="h-5 w-5" />
              <span className="text-xs">Goals</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-slate-400">
              <GitBranch className="h-5 w-5" />
              <span className="text-xs">Git</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-slate-400" onClick={handleExportData}>
              <Download className="h-5 w-5" />
              <span className="text-xs">Export</span>
            </button>
          </div>
        </nav>
      )}

      <LogCommitModal
        isOpen={isCommitModalOpen}
        onClose={() => setIsCommitModalOpen(false)}
      />
      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
      <EditGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
      />
      <GitSyncModal
        isOpen={isGitModalOpen}
        onClose={() => setIsGitModalOpen(false)}
      />
      <BreakTimerModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
      />
    </div>
  );
}
