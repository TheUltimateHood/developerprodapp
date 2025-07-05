import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimer } from "@/hooks/use-timer";
import { useToast } from "@/hooks/use-toast";
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Current Coding Session</h2>
          
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold text-slate-800 mb-4">
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
                  className="bg-primary hover:bg-primary/90 px-8 py-3"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Session
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleToggleTimer}
                    disabled={pauseSessionMutation.isPending}
                    className="bg-primary hover:bg-primary/90 px-8 py-3"
                  >
                    <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                    {isRunning ? 'Pause Session' : 'Resume Session'}
                  </Button>
                  <Button
                    onClick={handleStopTimer}
                    disabled={endSessionMutation.isPending}
                    variant="secondary"
                    className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3"
                  >
                    <i className="fas fa-stop mr-2"></i>
                    End Session
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-800 font-mono">
                  {dashboardData?.sessions || 0}
                </div>
                <div className="text-sm text-slate-500">Sessions Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 font-mono">
                  {dashboardData?.totalTime ? formatDuration(dashboardData.totalTime) : '0m'}
                </div>
                <div className="text-sm text-slate-500">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600 font-mono">
                  {dashboardData?.averageSession ? formatDuration(dashboardData.averageSession) : '0m'}
                </div>
                <div className="text-sm text-slate-500">Avg Session</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
