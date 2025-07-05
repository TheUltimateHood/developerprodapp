import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LogCommitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogCommitModal({ isOpen, onClose }: LogCommitModalProps) {
  const [repository, setRepository] = useState("");
  const [message, setMessage] = useState("");
  const [linesChanged, setLinesChanged] = useState("");
  const { toast } = useToast();

  const logCommitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/commits", {
        repository,
        message,
        linesChanged: parseInt(linesChanged)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Commit Logged",
        description: "Your commit has been logged successfully",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log commit",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repository || !message || !linesChanged) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    logCommitMutation.mutate();
  };

  const handleClose = () => {
    setRepository("");
    setMessage("");
    setLinesChanged("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Commit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="repository">Repository</Label>
            <Select value={repository} onValueChange={setRepository}>
              <SelectTrigger>
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Portfolio Website">Portfolio Website</SelectItem>
                <SelectItem value="React Dashboard">React Dashboard</SelectItem>
                <SelectItem value="API Server">API Server</SelectItem>
                <SelectItem value="Mobile App">Mobile App</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="message">Commit Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add user authentication"
            />
          </div>
          
          <div>
            <Label htmlFor="linesChanged">Lines Changed</Label>
            <Input
              id="linesChanged"
              type="number"
              value={linesChanged}
              onChange={(e) => setLinesChanged(e.target.value)}
              placeholder="42"
              min="1"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={logCommitMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {logCommitMutation.isPending ? "Logging..." : "Log Commit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
