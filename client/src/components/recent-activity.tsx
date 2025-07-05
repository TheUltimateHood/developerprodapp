import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@shared/schema";

export default function RecentActivity() {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session':
        return 'fas fa-play text-primary';
      case 'commit':
        return 'fas fa-code-branch text-emerald-500';
      case 'task':
        return 'fas fa-check-circle text-amber-500';
      default:
        return 'fas fa-circle text-slate-400';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'bg-primary';
      case 'commit':
        return 'bg-emerald-500';
      case 'task':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h4>
      
      {!activities || activities.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-slate-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2 flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 font-medium">{activity.description}</p>
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
