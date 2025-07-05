import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface GoalTrackerProps {
  onEditGoals: () => void;
}

export default function GoalTracker({ onEditGoals }: GoalTrackerProps) {
  const today = new Date().toISOString().split('T')[0];

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", today],
  });

  const { data: goals } = useQuery({
    queryKey: ["/api/goals", today],
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const codingTimeProgress = goals && dashboardData 
    ? calculateProgress(dashboardData.totalTime, goals.codingTimeTarget)
    : 0;

  const commitsProgress = goals && dashboardData
    ? calculateProgress(dashboardData.commits, goals.commitsTarget)
    : 0;

  const tasksProgress = goals && dashboardData
    ? calculateProgress(dashboardData.tasksCompleted, goals.tasksTarget)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Daily Goals</h4>
      
      {!goals ? (
        <div className="text-center py-4">
          <p className="text-slate-500 mb-4">No goals set for today</p>
          <Button onClick={onEditGoals} variant="outline">
            Set Goals
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Coding Time</span>
              <span className="text-sm font-medium text-slate-800">
                {dashboardData ? formatTime(dashboardData.totalTime) : '0m'} / {formatTime(goals.codingTimeTarget)}
                {codingTimeProgress >= 100 && <span className="text-emerald-600 ml-1">✓</span>}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${codingTimeProgress >= 100 ? 'bg-emerald-600' : 'bg-primary'}`}
                style={{ width: `${Math.min(100, codingTimeProgress)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Commits</span>
              <span className={`text-sm font-medium ${commitsProgress >= 100 ? 'text-emerald-600' : 'text-slate-800'}`}>
                {dashboardData?.commits || 0} / {goals.commitsTarget}
                {commitsProgress >= 100 && <span className="ml-1">✓</span>}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${commitsProgress >= 100 ? 'bg-emerald-600' : 'bg-primary'}`}
                style={{ width: `${Math.min(100, commitsProgress)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Tasks</span>
              <span className={`text-sm font-medium ${tasksProgress >= 100 ? 'text-emerald-600' : 'text-slate-800'}`}>
                {dashboardData?.tasksCompleted || 0} / {goals.tasksTarget}
                {tasksProgress >= 100 && <span className="ml-1">✓</span>}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${tasksProgress >= 100 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, tasksProgress)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={onEditGoals}
        variant="ghost"
        className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700"
      >
        {goals ? 'Edit Goals' : 'Set Goals'}
      </Button>
    </div>
  );
}
