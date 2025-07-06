import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Code, 
  FileText, 
  Bug, 
  Star, 
  GitCommit, 
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";

interface MetricsData {
  daily: {
    date: string;
    totalLinesWritten: number;
    totalLinesDeleted: number;
    totalLinesModified: number;
    filesModified: number;
    bugsFixed: number;
    featuresAdded: number;
    codeQualityScore: number;
    testsCoverage: number;
    performanceScore: number;
  };
  weekly: {
    linesWritten: number;
    linesDeleted: number;
    filesModified: number;
    bugsFixed: number;
    featuresAdded: number;
    avgQualityScore: number;
    avgTestsCoverage: number;
    avgPerformanceScore: number;
  };
  issues: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
    high: number;
  };
  productivity: {
    totalSessions: number;
    totalHours: number;
    avgSessionLength: number;
    linesPerHour: number;
    bugsPerDay: number;
    featuresPerWeek: number;
  };
}

export default function EnhancedMetrics() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: metricsData, isLoading } = useQuery<MetricsData>({
    queryKey: ["/api/metrics/enhanced", today],
  });

  if (isLoading || !metricsData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Lines Written Today</p>
                <p className="text-2xl font-bold text-blue-900">
                  {metricsData.daily.totalLinesWritten.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metricsData.productivity.linesPerHour.toFixed(1)} per hour
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Files Modified</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {metricsData.daily.filesModified}
                </p>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <FileText className="h-3 w-3 mr-1" />
                  {metricsData.weekly.filesModified} this week
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Bugs Fixed</p>
                <p className="text-2xl font-bold text-orange-900">
                  {metricsData.daily.bugsFixed}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Bug className="h-3 w-3 mr-1" />
                  {metricsData.productivity.bugsPerDay.toFixed(1)} per day avg
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Bug className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Features Added</p>
                <p className="text-2xl font-bold text-purple-900">
                  {metricsData.daily.featuresAdded}
                </p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Star className="h-3 w-3 mr-1" />
                  {metricsData.productivity.featuresPerWeek.toFixed(1)} per week
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quality">Code Quality</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="issues">Issue Tracking</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className={`${getScoreBg(metricsData.daily.codeQualityScore)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Code Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getScoreColor(metricsData.daily.codeQualityScore)}`}>
                    {metricsData.daily.codeQualityScore}/100
                  </div>
                  <Progress value={metricsData.daily.codeQualityScore} className="h-2" />
                  <p className="text-xs text-slate-600">
                    Weekly average: {metricsData.weekly.avgQualityScore}/100
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`${getScoreBg(metricsData.daily.testsCoverage)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Test Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getScoreColor(metricsData.daily.testsCoverage)}`}>
                    {metricsData.daily.testsCoverage}%
                  </div>
                  <Progress value={metricsData.daily.testsCoverage} className="h-2" />
                  <p className="text-xs text-slate-600">
                    Weekly average: {metricsData.weekly.avgTestsCoverage}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`${getScoreBg(metricsData.daily.performanceScore)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getScoreColor(metricsData.daily.performanceScore)}`}>
                    {metricsData.daily.performanceScore}/100
                  </div>
                  <Progress value={metricsData.daily.performanceScore} className="h-2" />
                  <p className="text-xs text-slate-600">
                    Weekly average: {metricsData.weekly.avgPerformanceScore}/100
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Changes Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Code Changes Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Lines Added</span>
                    <span className="font-medium text-green-600">
                      +{metricsData.daily.totalLinesWritten.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={75} 
                    className="h-2" 
                    style={{ 
                      '--progress-background': 'rgb(34 197 94)' 
                    } as React.CSSProperties} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Lines Deleted</span>
                    <span className="font-medium text-red-600">
                      -{metricsData.daily.totalLinesDeleted.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={25} 
                    className="h-2" 
                    style={{ 
                      '--progress-background': 'rgb(239 68 68)' 
                    } as React.CSSProperties} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Lines Modified</span>
                    <span className="font-medium text-blue-600">
                      ~{metricsData.daily.totalLinesModified.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={50} 
                    className="h-2" 
                    style={{ 
                      '--progress-background': 'rgb(59 130 246)' 
                    } as React.CSSProperties} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Productivity Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Sessions</span>
                  <span className="font-semibold">{metricsData.productivity.totalSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Hours</span>
                  <span className="font-semibold">{metricsData.productivity.totalHours.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Average Session</span>
                  <span className="font-semibold">{metricsData.productivity.avgSessionLength.toFixed(0)}min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Lines per Hour</span>
                  <span className="font-semibold">{metricsData.productivity.linesPerHour.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Lines Written</span>
                  <Badge variant="secondary">
                    {metricsData.weekly.linesWritten.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Files Modified</span>
                  <Badge variant="secondary">
                    {metricsData.weekly.filesModified}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Bugs Fixed</span>
                  <Badge variant="secondary">
                    {metricsData.weekly.bugsFixed}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Features Added</span>
                  <Badge variant="secondary">
                    {metricsData.weekly.featuresAdded}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bug className="h-5 w-5 mr-2" />
                  Issue Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Issues</span>
                    <span className="font-semibold">{metricsData.issues.total}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Open</span>
                      <span>{metricsData.issues.open}</span>
                    </div>
                    <Progress 
                      value={(metricsData.issues.open / metricsData.issues.total) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">In Progress</span>
                      <span>{metricsData.issues.inProgress}</span>
                    </div>
                    <Progress 
                      value={(metricsData.issues.inProgress / metricsData.issues.total) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Resolved</span>
                      <span>{metricsData.issues.resolved}</span>
                    </div>
                    <Progress 
                      value={(metricsData.issues.resolved / metricsData.issues.total) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Priority Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Critical</span>
                    </div>
                    <Badge variant="destructive">{metricsData.issues.critical}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">High</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">{metricsData.issues.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                    <Badge variant="secondary">
                      {metricsData.issues.total - metricsData.issues.critical - metricsData.issues.high}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Performance charts coming soon</p>
                <p className="text-sm">Advanced analytics and trending data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}