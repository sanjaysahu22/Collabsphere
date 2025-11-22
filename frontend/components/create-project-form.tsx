"use client";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/lib/usercontext";

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export default function CreateProjectForm({
  onSuccess,
}: CreateProjectFormProps) {
  const router = useRouter();
  const [techStack, setTechStack] = useState<string[]>([]);
  const [tech, setTech] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const {user } = useUserContext()
  const id = user?.id ? user?.id:'sanjay23bcy51';
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    membersRequired: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => {
    if (tech && !techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
      setTech("");
    }
  };

  const handleRemoveTech = (item: string) => {
    setTechStack(techStack.filter((t) => t !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the data to match the API's expected format
    const projectData = {
      admin_id: id, // Replace with actual admin ID if needed
      title: formData.name,
      description: formData.description,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      members_required: formData.membersRequired,
      status: "Planning", // Default status
      tags: techStack.join(","), // Using tech stack as tags
    };
    console.log(techStack.join(","))
    try {
      // Make the API call using your existing API endpoint
      const response = await fetch("https://collabsphere-d7g1.onrender.com/add/project", {
        method: "POST",
        credentials: "include", // Include cookies if needed
        headers: {
          "Content-Type": "application/json", // Specify JSON data
        },
        body: JSON.stringify(projectData), // Send the prepared data
      });

      // Check for errors in the response
      if (!response.ok) {
        console.error( "Error:", response.statusText);
        throw new Error("Failed to create project");
      }

      // Parse the response data
      const data = await response.json();
      console.log("Server Response:", data);

      // Simulate success and redirect
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to the projects page
      router.push("/my-projects");
    } catch (error) {
      console.error("Error submitting project data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-blue-400 mb-4 pb-2 border-b border-zinc-800">
          Project Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Project Name</label>
            <Input
              name="name"
              placeholder="Enter project name"
              className="bg-zinc-800 border-zinc-700"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Project Description</label>
            <Textarea
              name="description"
              placeholder="Describe your project"
              className="bg-zinc-800 border-zinc-700 min-h-[100px]"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tech Stack</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add technology"
                className="bg-zinc-800 border-zinc-700"
                value={tech}
                onChange={(e) => setTech(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTech}
                className="border-zinc-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {techStack.map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-zinc-800 text-white"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(item)}
                      className="ml-1 text-zinc-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Members Required</label>
            <Input
              type="number" // Ensures only numbers can be entered
              placeholder="Enter number of members"
              className="bg-zinc-800 border-zinc-700"
              value={formData.membersRequired}
              onChange={(e) => {
                const value = e.target.value;
                // Ensure the input is a valid integer (optional: add additional validation if needed)
                if (/^\d*$/.test(value)) {
                  // Regex to allow only digits
                  setFormData((prev) => ({ ...prev, membersRequired: value }));
                }
              }}
              required
            />
          </div>
        </div>
      </div>
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
        >
          CREATE PROJECT
        </Button>
      </div>
    </form>
  );
}