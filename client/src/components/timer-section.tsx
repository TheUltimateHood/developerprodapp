import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimer } from "@/hooks/use-timer";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Square, Clock, TrendingUp, Zap } from "lucide-react";
import type { Session } from "@shared/schema";

export default function TimerSection() {
  const [projectName, setProjectName] = useState("Portfolio Website");
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const { data: activeSessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions/active"],
  });

  const { data: todaySessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions", today],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", today],
  });

  const activeSession = activeSessions?.[0];
  const { 
    time, 
    isRunning, 
    start: startTimer, 
    pause: pauseTimer, 
    reset: resetTimer 
  } = useTimer(activeSession?.startTime ? new Date(activeSession.startTime) : undefined);

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sessions", {
        projectName,
        startTime: new Date(),
        isActive: true
      });
    },
    onSuccess: () => {
      startTimer();
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Session Started",
        description: `Started coding session for ${projectName}`,
      });
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession) return;
      
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - new Date(activeSession.startTime).getTime()) / 1000);
      
      return apiRequest("PATCH", `/api/sessions/${activeSession.id}`, {
        endTime,
        duration,
        isActive: false
      });
    },
    onSuccess: () => {
      resetTimer();
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Session Ended",
        description: "Coding session has been ended and saved",
      });
    }
  });

  const pauseSessionMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession) return;
      
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - new Date(activeSession.startTime).getTime()) / 1000);
      
      return apiRequest("PATCH", `/api/sessions/${activeSession.id}`, {
        endTime,
        duration,
        isActive: false
      });
    },
    onSuccess: () => {
      pauseTimer();
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    }
  });

  const handleToggleTimer = () => {
    if (activeSession) {
      if (isRunning) {
        pauseSessionMutation.mutate();
      } else {
        startSessionMutation.mutate();
      }
    } else {
      startSessionMutation.mutate();
    }
  };

  const handleStopTimer = () => {
    endSessionMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="mb-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-8 bg-gradient-to-br from-white to-slate-50">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Current Coding Session</h2>
          </div>
          
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4 tracking-wider">
              {formatTime(time)}
            </div>
            
            {!activeSession && (
              <div className="mb-4">
                <Label htmlFor="projectName" className="sr-only">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="max-w-xs mx-auto"
                />
              </div>
            )}
            
            {activeSession && (
              <div className="text-sm text-slate-500 mb-6">
                Working on: {activeSession.projectName}
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              {!activeSession ? (
                <Button
                  onClick={handleToggleTimer}
                  disabled={startSessionMutation.isPending}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 px-8 py-3 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleToggleTimer}
                    disabled={pauseSessionMutation.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 px-8 py-3 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isRunning ? 'Pause Session' : 'Resume Session'}
                  </Button>
                  <Button
                    onClick={handleStopTimer}
                    disabled={endSessionMutation.isPending}
                    variant="secondary"
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200/50 pt-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-700 font-mono">
                  {dashboardData?.sessions || 0}
                </div>
                <div className="text-sm text-blue-600 font-medium">Sessions Today</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-emerald-700 font-mono">
                  {dashboardData?.totalTime ? formatDuration(dashboardData.totalTime) : '0m'}
                </div>
                <div className="text-sm text-emerald-600 font-medium">Total Time</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-700 font-mono">
                  {dashboardData?.averageSession ? formatDuration(dashboardData.averageSession) : '0m'}
                </div>
                <div className="text-sm text-amber-600 font-medium">Avg Session</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
