import { useState, useEffect } from "react";

// Define the interface for the analytics data
interface AnalyticsData {
  burndown_data: {
    completed_points: number;
    planned_points: number;
    sprint_number: number;
  }[];
  pending_days: number;
  percentage_completed: number;
  project_end_date: string;
  project_start_date: string;
  sprints: {
    end_date: string;
    name: string;
    sprint_id: number;
    start_date: string;
  }[];
  summary: {
    completed_points: number;
    completed_tasks: number;
    team_size: number;
    total_points: number;
    total_tasks: number;
  };
  team_efficiency: number;
  team_performance: {
    completion_rate: number;
    done_tasks: number;
    member: string;
    total_tasks: number;
  }[];
  velocity_trend: {
    sprint_number: number;
    velocity: number;
  }[];
}

interface ProjectAnalyticsProps {
  projectId: number; // Pass projectId as a prop
}

const ProjectAnalytics = ({ projectId }: ProjectAnalyticsProps) => {
  // State to hold the analytics data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Effect to fetch data when the component mounts or projectId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Reset error state

        // Make the GET request to the backend
        const apiUrl = `https://collabsphere-nz2u.onrender.com/project/analytics?project_id=${projectId}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Update the state with the fetched data
        setAnalytics(data);
        console.log("Server Response:", data);
      } catch (err: unknown) {
        // Handle errors
        if (err instanceof Error) {
          setError(err.message); // Set error message
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    // Call the fetchData function
    fetchData();
  }, [projectId]); // Include projectId in the dependency array
};

export default ProjectAnalytics;