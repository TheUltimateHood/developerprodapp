import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, RefreshCw, Download, Upload, Loader2 } from "lucide-react";

interface GitSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GitSyncModal({ isOpen, onClose }: GitSyncModalProps) {
  const [repository, setRepository] = useState("");
  const [branch, setBranch] = useState("main");
  const [action, setAction] = useState<"pull" | "push" | "sync">("sync");
  const [commitMessage, setCommitMessage] = useState("");
  const { toast } = useToast();

  const gitSyncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/git/sync", {
        repository,
        branch,
        action,
        commitMessage: action === "push" ? commitMessage : undefined,
        timestamp: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Git Sync Successful",
        description: `Successfully ${action === "pull" ? "pulled from" : action === "push" ? "pushed to" : "synced with"} ${repository}`,
      });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Git Sync Failed",
        description: "Failed to sync with repository. Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setRepository("");
    setBranch("main");
    setAction("sync");
    setCommitMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repository) return;
    
    gitSyncMutation.mutate();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-2 rounded-lg">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <span>Git Sync</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="repository" className="text-sm font-medium">Repository URL</Label>
              <Input
                id="repository"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                placeholder="https://github.com/username/repo.git"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="action" className="text-sm font-medium">Action</Label>
              <Select value={action} onValueChange={(value: "pull" | "push" | "sync") => setAction(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sync">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Sync (Pull & Push)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pull">
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Pull Changes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="push">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Push Changes</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(action === "push" || action === "sync") && (
              <div>
                <Label htmlFor="commitMessage" className="text-sm font-medium">
                  Commit Message {action === "push" && "*"}
                </Label>
                <Textarea
                  id="commitMessage"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Update project files"
                  className="mt-1"
                  rows={3}
                  required={action === "push"}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={gitSyncMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={gitSyncMutation.isPending || !repository}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
            >
              {gitSyncMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {action === "pull" ? "Pull" : action === "push" ? "Push" : "Sync"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}