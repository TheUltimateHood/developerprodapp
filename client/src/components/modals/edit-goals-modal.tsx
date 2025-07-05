import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Goals } from "@shared/schema";

interface EditGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditGoalsModal({ isOpen, onClose }: EditGoalsModalProps) {
  const [codingTimeTarget, setCodingTimeTarget] = useState("480"); // 8 hours in minutes
  const [commitsTarget, setCommitsTarget] = useState("10");
  const [tasksTarget, setTasksTarget] = useState("12");
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const { data: existingGoals } = useQuery<Goals | null>({
    queryKey: ["/api/goals", today],
    enabled: isOpen,
  });

  useEffect(() => {
    if (existingGoals) {
      setCodingTimeTarget(existingGoals.codingTimeTarget.toString());
      setCommitsTarget(existingGoals.commitsTarget.toString());
      setTasksTarget(existingGoals.tasksTarget.toString());
    }
  }, [existingGoals]);

  const saveGoalsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/goals", {
        date: today,
        codingTimeTarget: parseInt(codingTimeTarget),
        commitsTarget: parseInt(commitsTarget),
        tasksTarget: parseInt(tasksTarget)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Goals Updated",
        description: "Your daily goals have been updated",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goals",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const codingTime = parseInt(codingTimeTarget);
    const commits = parseInt(commitsTarget);
    const tasks = parseInt(tasksTarget);
    
    if (codingTime <= 0 || commits <= 0 || tasks <= 0) {
      toast({
        title: "Invalid Values",
        description: "All goals must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    saveGoalsMutation.mutate();
  };

  const convertMinutesToHours = (minutes: number) => {
    return (minutes / 60).toFixed(1);
  };

  const convertHoursToMinutes = (hours: string) => {
    return Math.round(parseFloat(hours || "0") * 60);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Daily Goals</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="codingTime">Daily Coding Time (hours)</Label>
            <Input
              id="codingTime"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={convertMinutesToHours(parseInt(codingTimeTarget))}
              onChange={(e) => setCodingTimeTarget(convertHoursToMinutes(e.target.value).toString())}
              placeholder="8"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current: {convertMinutesToHours(parseInt(codingTimeTarget))} hours
            </p>
          </div>
          
          <div>
            <Label htmlFor="commits">Daily Commits Target</Label>
            <Input
              id="commits"
              type="number"
              min="1"
              value={commitsTarget}
              onChange={(e) => setCommitsTarget(e.target.value)}
              placeholder="10"
            />
          </div>
          
          <div>
            <Label htmlFor="tasks">Daily Tasks Target</Label>
            <Input
              id="tasks"
              type="number"
              min="1"
              value={tasksTarget}
              onChange={(e) => setTasksTarget(e.target.value)}
              placeholder="12"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saveGoalsMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {saveGoalsMutation.isPending ? "Saving..." : "Save Goals"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
