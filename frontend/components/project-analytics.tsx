"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock
} from "lucide-react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define interfaces for the analytics data
interface Sprint {
  sprint_id: number;
  name: string;
  start_date: string;
  end_date: string;
}

interface BurndownData {
  sprint_number: number;
  planned_points: number;
  completed_points: number;
}

interface VelocityTrend {
  sprint_number: number;
  velocity: number;
}

interface TeamPerformance {
  member: string;
  done_tasks: number;
  total_tasks: number;
  completion_rate: number;
}

interface Summary {
  total_tasks: number;
  completed_tasks: number;
  total_points: number;
  completed_points: number;
  team_size: number;
}

interface AnalyticsData {
  project_start_date: string;
  project_end_date: string;
  sprints: Sprint[];
  percentage_completed: number;
  sprint_velocity: number;
  team_efficiency: number;
  pending_days: number;
  burndown_data: BurndownData[];
  velocity_trend: VelocityTrend[];
  team_performance: TeamPerformance[];
  summary: Summary;
}

interface ProjectAnalyticsProps {
  projectId: number;
}

export default function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");

  // Fetch analytics data from the backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = `https://collabsphere-nz2u.onrender.com/project/analytics?project_id=${projectId}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 404) {
          throw new Error("Project not found or not started");
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchAnalytics();
    }
  }, [projectId]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  // Handle no data state
  if (!analytics) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Project Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No analytics data available for this project.</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for charts
  const burndownData = analytics.burndown_data
    .filter(item => selectedTimeframe === "all" || 
      (selectedTimeframe === "recent" && item.sprint_number > Math.max(0, analytics.burndown_data.length - 3)))
    .map(item => ({
      sprint: `Sprint ${item.sprint_number}`,
      planned: item.planned_points,
      completed: item.completed_points,
      remaining: item.planned_points - item.completed_points
    }));

  const velocityData = analytics.velocity_trend
    .filter(item => selectedTimeframe === "all" || 
      (selectedTimeframe === "recent" && item.sprint_number > Math.max(0, analytics.velocity_trend.length - 3)))
    .map(item => ({
      sprint: `Sprint ${item.sprint_number}`,
      velocity: item.velocity
    }));

  // Calculate averages for comparison
  const previousVelocity = analytics.velocity_trend.length > 1 
    ? analytics.velocity_trend[analytics.velocity_trend.length - 2]?.velocity || 0 
    : 0;
  const currentVelocity = analytics.velocity_trend.length > 0 
    ? analytics.velocity_trend[analytics.velocity_trend.length - 1]?.velocity || 0 
    : 0;
  const velocityChange = currentVelocity - previousVelocity;

  // Format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Team performance data for charts
  const teamPerformanceData = analytics.team_performance.map(member => ({
    name: member.member,
    completionRate: member.completion_rate,
    completedTasks: member.done_tasks,
    totalTasks: member.total_tasks
  }));

  // Task completion data for pie chart
  const taskCompletionData = [
    { name: "Completed", value: analytics.summary.completed_tasks, color: "#F471B5" },
    { name: "Remaining", value: analytics.summary.total_tasks - analytics.summary.completed_tasks, color: "#374151" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-500">Project Analytics</h2>
        <div className="mt-2 sm:mt-0">
          <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTimeframe}>
            <TabsList className="grid w-full  ">
              <TabsTrigger value="all">All Time</TabsTrigger>
             
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Project Timeline */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-pink-500" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatDate(analytics.project_start_date)}</p>
            </div>
            <div className="w-full md:w-1/2 mx-4 h-2 bg-zinc-800 rounded-full my-4">
              <div 
                className="h-full bg-pink-500 rounded-full" 
                style={{ 
                  width: `${analytics.percentage_completed}%` 
                }}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{formatDate(analytics.project_end_date)}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Project Completion</p>
            <p className="text-xl font-bold text-pink-500">{analytics.percentage_completed.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-pink-500" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-pink-500">
                {analytics.summary.completed_tasks}/{analytics.summary.total_tasks}
              </span>
              <span className="text-sm font-medium text-green-500 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {analytics.percentage_completed.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={analytics.percentage_completed} 
              className="h-2 mt-2 bg-zinc-800" 
            />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="mr-2 h-4 w-4 text-pink-500" />
              Sprint Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-pink-500">
                {currentVelocity}
              </span>
              <span className={`text-sm font-medium flex items-center ${velocityChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {velocityChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {Math.abs(velocityChange)} pts {velocityChange >= 0 ? 'increase' : 'decrease'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="mr-2 h-4 w-4 text-pink-500" />
              Team Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-pink-500">
                {(analytics.team_efficiency * 100).toFixed(0)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {analytics.summary.completed_tasks}  / {analytics.summary.total_tasks}  Tasks
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-pink-500" />
              Time Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-pink-500">
                {analytics.pending_days}
              </span>
              <span className="text-sm text-muted-foreground">days left</span>
            </div>
            <div className="text-sm mt-1 text-muted-foreground">
              {analytics.pending_days > 0 
                ? `Project ends on ${formatDate(analytics.project_end_date)}`
                : "Project deadline has passed"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {/* Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Burndown Chart */}
  <Card className="bg-zinc-900 border-zinc-800">
    <CardHeader>
      <CardTitle>Sprint Burndown</CardTitle>
      <CardDescription>Planned vs completed story points across sprints</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        {burndownData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={burndownData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="sprint" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  border: "1px solid #444",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="planned"
                name="Planned Points"
                stroke="#36BFFA"
                strokeWidth={3}
                dot={{ r: 6, fill: "#36BFFA", strokeWidth: 2, stroke: "#36BFFA" }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed Points"
                stroke="#F471B5"
                strokeWidth={3}
                dot={{ r: 6, fill: "#F471B5", strokeWidth: 2, stroke: "#F471B5" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No sprint data available</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
  {/* Velocity Trend Chart */}
  <Card className="bg-zinc-900 border-zinc-800">
    <CardHeader>
      <CardTitle>Velocity Trend</CardTitle>
      <CardDescription>Story points completed per sprint</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        {velocityData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={velocityData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="sprint" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  border: "1px solid #444",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              <Bar
                dataKey="velocity"
                name="Velocity"
                fill="#F471B5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No velocity data available</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</div>
      {/* Team Performance and Task Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Individual task completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformanceData.length > 0 ? (
                teamPerformanceData.map((member) => (
                  <div key={member.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{member.name}</span>
                        <span className="text-xs ml-2 text-muted-foreground">
                          ({member.completedTasks}/{member.totalTasks} tasks)
                        </span>
                      </div>
                      <span className={`text-sm ${
                        member.completionRate >= 75 ? "text-green-500" : 
                        member.completionRate >= 50 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {member.completionRate}%
                      </span>
                    </div>
                    <Progress
                      value={member.completionRate}
                      className="h-2 bg-zinc-800"
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No team performance data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Pie Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Overall project progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "#333",
                      border: "1px solid #444",
                      borderRadius: "4px",
                    }}
                    formatter={(value) => [`${value} tasks`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4">
              <div className="flex items-center mx-2">
                <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center mx-2">
                <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                <span className="text-sm">Remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Details */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Sprint History</CardTitle>
          <CardDescription>Overview of all project sprints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sprint</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sprints.map((sprint) => {
                  const now = new Date();
                  const startDate = new Date(sprint.start_date);
                  const endDate = new Date(sprint.end_date) ;
                  
                  let status = "Upcoming";
                  if (now > endDate) status = "Completed";
                  else if (now >= startDate && now <= endDate) status = "Active";
                  
                  return (
                    <tr key={sprint.sprint_id} className="border-b border-zinc-800">
                      <td className="py-3 px-4">{sprint.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(sprint.start_date)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(sprint.end_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status === "Active" ? "bg-green-500/20 text-green-400" :
                          status === "Completed" ? "bg-blue-500/20 text-blue-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}