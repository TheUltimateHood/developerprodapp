import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bug, 
  Plus, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Star,
  Users,
  GitBranch
} from "lucide-react";

interface IssueTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Issue {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category: string;
  assignee?: string;
  repository?: string;
  branch?: string;
  linesAffected?: number;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export default function IssueTrackerModal({ isOpen, onClose }: IssueTrackerModalProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  
  // New issue form state
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    category: "bug",
    assignee: "",
    repository: "",
    branch: "",
    linesAffected: "",
    estimatedHours: "",
    tags: ""
  });

  const { toast } = useToast();

  const { data: issues = [], isLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
    enabled: isOpen,
  });

  const createIssueMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/issues", {
        ...newIssue,
        linesAffected: newIssue.linesAffected ? parseInt(newIssue.linesAffected) : undefined,
        estimatedHours: newIssue.estimatedHours ? parseInt(newIssue.estimatedHours) : undefined,
        tags: newIssue.tags || "[]"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Issue Created",
        description: `New ${newIssue.category} "${newIssue.title}" has been created`,
      });
      resetForm();
      setActiveTab("list");
    },
    onError: () => {
      toast({
        title: "Failed to Create Issue",
        description: "Please check your input and try again",
        variant: "destructive",
      });
    }
  });

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Issue> }) => {
      return apiRequest("PATCH", `/api/issues/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Issue Updated",
        description: "Issue has been updated successfully",
      });
    }
  });

  const resetForm = () => {
    setNewIssue({
      title: "",
      description: "",
      status: "open",
      priority: "medium",
      category: "bug",
      assignee: "",
      repository: "",
      branch: "",
      linesAffected: "",
      estimatedHours: "",
      tags: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.title.trim()) return;
    createIssueMutation.mutate();
  };

  const handleStatusChange = (issueId: number, newStatus: string) => {
    updateIssueMutation.mutate({
      id: issueId,
      updates: { 
        status: newStatus,
        resolvedAt: newStatus === "resolved" ? new Date().toISOString() : undefined
      }
    });
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    const matchesPriority = filterPriority === "all" || issue.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "in-progress": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed": return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bug": return <Bug className="h-3 w-3" />;
      case "feature": return <Star className="h-3 w-3" />;
      case "enhancement": return <Plus className="h-3 w-3" />;
      default: return <Bug className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
              <Bug className="h-5 w-5 text-white" />
            </div>
            <span>Issue Tracker</span>
            <Badge variant="secondary" className="ml-2">
              {filteredIssues.length} issues
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Issues List</TabsTrigger>
            <TabsTrigger value="create">Create Issue</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 h-96 overflow-y-auto">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 flex-1 min-w-64">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none bg-white"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Issues List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Bug className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No issues found</p>
                <p className="text-sm">Create your first issue to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(issue.status)}
                          <h4 className="font-medium text-slate-800">{issue.title}</h4>
                          <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(issue.category)}
                            <span className="ml-1">{issue.category}</span>
                          </Badge>
                        </div>
                        {issue.description && (
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{issue.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          {issue.repository && (
                            <span className="flex items-center space-x-1">
                              <GitBranch className="h-3 w-3" />
                              <span>{issue.repository}</span>
                            </span>
                          )}
                          {issue.assignee && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{issue.assignee}</span>
                            </span>
                          )}
                          {issue.linesAffected && (
                            <span>{issue.linesAffected} lines</span>
                          )}
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Select
                          value={issue.status}
                          onValueChange={(value) => handleStatusChange(issue.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newIssue.category} onValueChange={(value) => setNewIssue(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="enhancement">Enhancement</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newIssue.description}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={(value) => setNewIssue(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newIssue.status} onValueChange={(value) => setNewIssue(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    value={newIssue.assignee}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, assignee: e.target.value }))}
                    placeholder="Developer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="repository">Repository</Label>
                  <Input
                    id="repository"
                    value={newIssue.repository}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, repository: e.target.value }))}
                    placeholder="Repository name"
                  />
                </div>
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={newIssue.branch}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, branch: e.target.value }))}
                    placeholder="main"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linesAffected">Lines Affected</Label>
                  <Input
                    id="linesAffected"
                    type="number"
                    value={newIssue.linesAffected}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, linesAffected: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={newIssue.estimatedHours}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newIssue.tags}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="frontend, api, critical"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={createIssueMutation.isPending}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={createIssueMutation.isPending || !newIssue.title.trim()}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {createIssueMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Issue
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}