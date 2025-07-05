import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export default function ProductivityChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get data for the last 7 days
  const getDatesArray = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = getDatesArray();

  // Fetch dashboard data for each of the last 7 days
  const queries = dates.map(date => 
    useQuery({
      queryKey: ["/api/dashboard", date],
    })
  );

  const isLoading = queries.some(query => query.isLoading);
  const chartData = queries.map((query, index) => ({
    date: dates[index],
    data: query.data,
    dayName: new Date(dates[index]).toLocaleDateString('en', { weekday: 'short' })
  }));

  useEffect(() => {
    if (isLoading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Calculate max value for scaling
    const maxValue = Math.max(...chartData.map(d => {
      if (!d.data || !d.data.goals) return 0;
      const codingProgress = Math.min(100, (d.data.totalTime / d.data.goals.codingTimeTarget) * 100);
      const commitsProgress = Math.min(100, (d.data.commits / d.data.goals.commitsTarget) * 100);
      const tasksProgress = Math.min(100, (d.data.tasksCompleted / d.data.goals.tasksTarget) * 100);
      return Math.round((codingProgress + commitsProgress + tasksProgress) / 3);
    }), 100);

    // Draw bars
    const barWidth = chartWidth / chartData.length * 0.8;
    const barSpacing = chartWidth / chartData.length * 0.2;

    chartData.forEach((item, index) => {
      let productivity = 0;
      if (item.data && item.data.goals) {
        const codingProgress = Math.min(100, (item.data.totalTime / item.data.goals.codingTimeTarget) * 100);
        const commitsProgress = Math.min(100, (item.data.commits / item.data.goals.commitsTarget) * 100);
        const tasksProgress = Math.min(100, (item.data.tasksCompleted / item.data.goals.tasksTarget) * 100);
        productivity = Math.round((codingProgress + commitsProgress + tasksProgress) / 3);
      }

      const barHeight = (productivity / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing);
      const y = padding + chartHeight - barHeight;

      // Determine bar color based on date (today is darker)
      const isToday = item.date === new Date().toISOString().split('T')[0];
      const color = isToday ? '#2563eb' : productivity > 0 ? '#60a5fa' : '#e2e8f0';

      // Draw bar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw day label
      ctx.fillStyle = isToday ? '#1f2937' : '#6b7280';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(item.dayName, x + barWidth / 2, canvas.height - 10);
    });
  }, [chartData, isLoading]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">7-Day Productivity Trend</h4>
      <div className="h-64 flex items-center justify-center">
        {isLoading ? (
          <div className="text-slate-500">Loading chart data...</div>
        ) : (
          <canvas
            ref={canvasRef}
            width={600}
            height={256}
            className="w-full h-full"
            style={{ maxWidth: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
