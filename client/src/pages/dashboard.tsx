import { useState } from "react";
import TimerSection from "@/components/timer-section";
import MetricsOverview from "@/components/metrics-overview";
import GoalTracker from "@/components/goal-tracker";
import RecentActivity from "@/components/recent-activity";
import QuickActions from "@/components/quick-actions";
import LogCommitModal from "@/components/modals/log-commit-modal";
import AddTaskModal from "@/components/modals/add-task-modal";
import EditGoalsModal from "@/components/modals/edit-goals-modal";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-code text-primary text-xl"></i>
                <h1 className="text-xl font-bold text-slate-800">DevTrack</h1>
              </div>
              {!isMobile && (
                <nav className="hidden md:flex space-x-8">
                  <a href="#" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium">Dashboard</a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 pb-4 px-1 text-sm font-medium">Reports</a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 pb-4 px-1 text-sm font-medium">Goals</a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 pb-4 px-1 text-sm font-medium">Export</a>
                </nav>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <i className="fas fa-cog"></i>
              </button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
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
            />
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2">
          <div className="flex justify-around">
            <button className="flex flex-col items-center space-y-1 text-primary">
              <i className="fas fa-home text-lg"></i>
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-slate-400">
              <i className="fas fa-chart-bar text-lg"></i>
              <span className="text-xs">Reports</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-slate-400">
              <i className="fas fa-target text-lg"></i>
              <span className="text-xs">Goals</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-slate-400" onClick={handleExportData}>
              <i className="fas fa-download text-lg"></i>
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
    </div>
  );
}
