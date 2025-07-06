import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Coffee, Play, Pause, Square, Clock } from "lucide-react";

interface BreakTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BreakTimerModal({ isOpen, onClose }: BreakTimerModalProps) {
  const [breakType, setBreakType] = useState<"short" | "long" | "custom">("short");
  const [customMinutes, setCustomMinutes] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const { toast } = useToast();

  const breakDurations = {
    short: 5,
    long: 15,
    custom: customMinutes
  };

  const startBreakMutation = useMutation({
    mutationFn: async () => {
      const duration = breakDurations[breakType];
      return apiRequest("POST", "/api/breaks", {
        type: breakType,
        duration,
        startTime: new Date(),
        isActive: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Break Started",
        description: `Started ${breakType} break (${breakDurations[breakType]} minutes)`,
      });
    }
  });

  const endBreakMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/breaks/end", {
        endTime: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Break Ended",
        description: "Break completed! Ready to get back to work?",
      });
      handleClose();
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            toast({
              title: "Break Time's Up!",
              description: "Your break is over. Time to get back to work!",
            });
            endBreakMutation.mutate();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, endBreakMutation, toast]);

  const startBreak = () => {
    const duration = breakDurations[breakType];
    setTotalTime(duration * 60);
    setTimeLeft(duration * 60);
    setIsRunning(true);
    startBreakMutation.mutate();
  };

  const pauseBreak = () => {
    setIsRunning(false);
  };

  const resumeBreak = () => {
    setIsRunning(true);
  };

  const stopBreak = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setTotalTime(0);
    endBreakMutation.mutate();
  };

  const handleClose = () => {
    if (isRunning) {
      const confirmExit = window.confirm("Are you sure you want to end your break?");
      if (!confirmExit) return;
      stopBreak();
    }
    onClose();
    setTimeLeft(0);
    setTotalTime(0);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (totalTime === 0) return 0;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span>Break Timer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isRunning && timeLeft === 0 ? (
            <>
              <div>
                <Label htmlFor="breakType" className="text-sm font-medium">Break Type</Label>
                <Select value={breakType} onValueChange={(value: "short" | "long" | "custom") => setBreakType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Break (5 minutes)</SelectItem>
                    <SelectItem value="long">Long Break (15 minutes)</SelectItem>
                    <SelectItem value="custom">Custom ({customMinutes} minutes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {breakType === "custom" && (
                <div>
                  <Label htmlFor="customMinutes" className="text-sm font-medium">Duration (minutes)</Label>
                  <Select value={customMinutes.toString()} onValueChange={(value) => setCustomMinutes(parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30, 45, 60].map((minutes) => (
                        <SelectItem key={minutes} value={minutes.toString()}>
                          {minutes} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={startBreak}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                disabled={startBreakMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Break ({breakDurations[breakType]} min)
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      className="text-amber-500"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 56}`,
                        strokeDashoffset: `${2 * Math.PI * 56 * (1 - getProgressPercentage() / 100)}`,
                        transition: 'stroke-dashoffset 1s linear'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-mono font-bold text-slate-800">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-xs text-slate-500">remaining</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-3">
                  {isRunning ? (
                    <Button
                      onClick={pauseBreak}
                      variant="outline"
                      className="border-amber-200 hover:bg-amber-50"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeBreak}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button
                    onClick={stopBreak}
                    variant="outline"
                    className="border-red-200 hover:bg-red-50 text-red-600"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Break
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}