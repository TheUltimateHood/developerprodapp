import { useQuery } from "@tanstack/react-query";
import ProductivityChart from "./productivity-chart";

export default function MetricsOverview() {
  const today = new Date().toISOString().split('T')[0];

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", today],
  });

  const calculateProductivityScore = () => {
    if (!dashboardData || !dashboardData.goals) return 0;
    
    const codingProgress = Math.min(100, (dashboardData.totalTime / dashboardData.goals.codingTimeTarget) * 100);
    const commitsProgress = Math.min(100, (dashboardData.commits / dashboardData.goals.commitsTarget) * 100);
    const tasksProgress = Math.min(100, (dashboardData.tasksCompleted / dashboardData.goals.tasksTarget) * 100);
    
    return Math.round((codingProgress + commitsProgress + tasksProgress) / 3);
  };

  const productivityScore = calculateProductivityScore();

  return (
    <>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Today's Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Commits</p>
              <p className="text-2xl font-bold text-slate-800 font-mono">
                {dashboardData?.commits || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-code-branch text-emerald-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Lines of Code</p>
              <p className="text-2xl font-bold text-slate-800 font-mono">
                {dashboardData?.linesOfCode || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-code text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tasks Done</p>
              <p className="text-2xl font-bold text-slate-800 font-mono">
                {dashboardData?.tasksCompleted || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-amber-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Productivity</p>
              <p className="text-2xl font-bold text-emerald-600 font-mono">
                {productivityScore}%
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-emerald-600"></i>
            </div>
          </div>
        </div>
      </div>

      <ProductivityChart />
    </>
  );
}
