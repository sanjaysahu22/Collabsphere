'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import TeamMemberDropdown from "@/components/team-members-dropdown";
import { useUserContext } from "@/lib/usercontext";

interface TaskFormProps {
  sprint_id?: number;
  projectId: number;
  onTaskAdded: () => void; // Callback to refresh the task list
}

export default function TaskForm({ sprint_id, projectId, onTaskAdded }: TaskFormProps) {
  
  const [description, setDescription] = useState("");
  const [weightage, setWeightage] = useState(5);
  const [assignee, setAssignee] = useState("");
  const [assigneeName, setAssigneeName] = useState(""); // Store name for display
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user} = useUserContext();
  
  console.log("User ID:", user?.id); // Log the user ID
  const handleAssigneeSelected = (userId: string, userName: string) => {
    setAssignee(userId);
    setAssigneeName(userName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    setIsSubmitting(true);
    console.log("Submitting task:", {
      sprint_id,description ,weightage ,assignee, projectId
    });
    try {
      const response = await fetch("https://collabsphere-d7g1.onrender.com/project/edit_tasks/add_task", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sprint_number: sprint_id,
         description: description,
          points: weightage,
          assigned_to: assignee || null,
          project_id: projectId,
          user_id: user?.id, 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Task created:", data);

      // Clear the form
      
      setDescription("");
      setWeightage(5);
      setAssignee("");
      setAssigneeName("");

      // Notify parent to refresh the task list
      onTaskAdded();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div className="space-y-2">
        <label className="text-sm">Description</label>
        <Textarea
          placeholder="Describe what needs to be done in this task"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
       
        <TeamMemberDropdown 
          projectId={projectId}
          onSelect={handleAssigneeSelected}
          label="Assign task to team member"
          purpose="task"
        />
        {assigneeName && (
          <p className="text-sm text-green-500 mt-1">
            Task will be assigned to: {assigneeName}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm">Task Weightage (Story Points)</label>
        <Slider
          defaultValue={[5]}
          max={13}
          min={1}
          step={1}
          value={[weightage]}
          onValueChange={(value) => setWeightage(value[0])}
        />
        <div className="text-sm">Weightage: {weightage}</div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding Task..." : "Add Task"}
      </Button>
    </form>
  );
}