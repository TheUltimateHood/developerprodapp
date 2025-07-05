import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const addTaskMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/tasks", {
        title,
        description,
        completed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Task Added",
        description: "Your task has been added successfully",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }
    addTaskMutation.mutate();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCompleted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Implement user authentication"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the task..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={completed}
              onCheckedChange={(checked) => setCompleted(checked as boolean)}
            />
            <Label htmlFor="completed" className="text-sm">
              Mark as completed
            </Label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addTaskMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {addTaskMutation.isPending ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
