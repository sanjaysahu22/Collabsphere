import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  description: string;
  weightage: number;
  status: "todo" | "in-progress" | "completed";
  assignee?: string;
}

interface TaskListProps {
  sprintId: string;
}

export default function TaskList({ sprintId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://collabsphere-d7g1.onrender.com/sprint/view_tasks?sprint_id=${sprintId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched tasks:", data);

      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(
          data.tasks.map((task: any) => ({
            id: task.task_id.toString(),
            title: task.title,
            description: task.description || "",
            weightage: task.weightage || 1,
            status: task.status.toLowerCase() || "todo",
            assignee: task.assignee || undefined,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [sprintId]);

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div>No tasks available for this sprint.</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{task.description}</p>
            <p>Weightage: {task.weightage}</p>
            <p>Status: {task.status}</p>
            {task.assignee && <p>Assignee: {task.assignee}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}