"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Sprint {
  name: string;
  sprint_id: number;
  start_date?: string;
  end_date?: string;
}

interface ApiResponse {
  sprints: Sprint[];
}

interface ProjectSprintsProps {
  project_id: number | string;
  onLatestSprintSelect?: (sprint: Sprint) => void;
  label?: string;
}

const ProjectSprints = ({ project_id, onLatestSprintSelect, label }: ProjectSprintsProps) => {
  const [sprintsData, setSprintsData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://collabsphere-nz2u.onrender.com/project/view_sprints?project_id=${project_id}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
      console.log("Error:", response.status);
        }
        
        const data = await response.json();
        console.log("Server Response:", data);
        setSprintsData(data);
        
        // If there are sprints, select the latest one (last in the array)
        if (data.sprints && data.sprints.length > 0 && onLatestSprintSelect) {
          const latestSprint = data.sprints[data.sprints.length - 1];
          onLatestSprintSelect(latestSprint);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load sprints");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [project_id, onLatestSprintSelect]);

  return (
    <div className="space-y-4">
      {label && <h3 className="text-lg font-medium">{label}</h3>}
      
      {loading ? (
        <div className="w-full bg-zinc-800 text-gray-500 border border-zinc-700 rounded-md p-4 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading sprints...</span>
        </div>
      ) : error ? (
        <div className="w-full bg-zinc-800 text-red-400 border border-zinc-700 rounded-md p-4">
          {error}
        </div>
      ) : !sprintsData || !sprintsData.sprints || sprintsData.sprints.length === 0 ? (
        <div className="w-full bg-zinc-800 text-gray-500 border border-zinc-700 rounded-md p-4">
          No sprints found for this project
        </div>
      ) : (
        <div className="space-y-3">
          {sprintsData.sprints.map((sprint, index) => (
            <Card 
              key={sprint.sprint_id} 
              className={`bg-zinc-800 border-zinc-700 ${
                index === sprintsData.sprints.length - 1 ? 'border-pink-500' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{sprint.name}</h4>
                    {sprint.start_date && sprint.end_date && (
                      <p className="text-sm text-gray-400 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(sprint.start_date), "MMM d")} - {format(new Date(sprint.end_date), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  {index === sprintsData.sprints.length - 1 && (
                    <Badge className="bg-pink-500">Current</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSprints;