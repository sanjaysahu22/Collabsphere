
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Briefcase, Code, Flag, Github, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useUserContext } from "@/lib/usercontext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider" // Import Slider for rating

// Update interface to match the actual API response
interface ProjectDetails {
  description: string
  end_date: string
  github_link: string
  project_size: number
  project_type: string
  start_date: string
  team_members: string[]
  tech_stack: string
  title: string
  status?: "planning" | "running" | "completed"
  rating?: number // Add rating field
}

interface ProjectDetailsProps {
  project_id: number;
  onTitleChange?: (title: string) => void;
}

const fetchProjectDetails = async(project_id: number) => {
  try {
    const response = await fetch(`https://collabsphere-d7g1.onrender.com/project/view_details?project_id=${project_id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("Error:", response.status);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Function to update project status
const updateProjectStatus = async (project_id: number, newStatus: string, userId: string) => {
  try {
    const response = await fetch(`https://collabsphere-d7g1.onrender.com/project/update_status`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id,
        user_id: userId,
        status: newStatus
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
}

// New function to submit project rating
const submitProjectRating = async (project_id: number, userId: string, rating: number) => {
  try {
    const response = await fetch(`https://collabsphere-d7g1.onrender.com/project/give_rating`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id,
        user_id: userId,
        rating: rating, // Rating out of 10
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting project rating:", error);
    throw error;
  }
}

export default function ProjectDetails({ project_id, onTitleChange }: ProjectDetailsProps) {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>();
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [ratingValue, setRatingValue] = useState<number>(5); // Default rating 5/10
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { user } = useUserContext();
  
  // Get user ID from context or local storage
  const userlocal = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const parsedUser = userlocal ? JSON.parse(userlocal) : null;
  const userId = user?.id ? user.id : parsedUser?.id;
 
  useEffect(() => {
    const getProjectDetails = async () => {
      setLoading(true);
      const details = await fetchProjectDetails(project_id);
      if (details) {
        // Assume running status if not provided
        setProjectDetails({
          ...details,
          status: details.status || "running",
          rating: details.rating || 0,
        });
        
        if (onTitleChange && details.title) {
          onTitleChange(details.title);
        }
      }
      setLoading(false);
    };
    
    getProjectDetails();
  }, [project_id]);
  
  // Handle status change
  const handleStatusChange = async (newStatus: "planning" | "running" | "completed") => {
    if (!userId) {
      toast.error("You need to be logged in to change project status");
      return;
    }
    
    try {
      setStatusUpdating(true);
      await updateProjectStatus(project_id, newStatus, userId);
      
      // Update local state
      setProjectDetails(prev => prev ? {...prev, status: newStatus} : prev);
      
      toast.success(`Project status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update project status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (!userId) {
      toast.error("You need to be logged in to rate a project");
      return;
    }
    
    try {
      setIsSubmittingRating(true);
      await submitProjectRating(project_id, userId, ratingValue);
      
      // Update local state
      setProjectDetails(prev => prev ? {...prev, rating: ratingValue} : prev);
      
      toast.success(`Project rated ${ratingValue} out of 10`);
      setIsRatingDialogOpen(false);
    } catch (error) {
      toast.error("Failed to submit project rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/my-projects" className="text-muted-foreground hover:text-white mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-pink-500">Loading Project...</h1>
          </div>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
            <p className="text-muted-foreground">
              Fetching project details, please wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Project not found or error
  if (!projectDetails) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/my-projects" className="text-muted-foreground hover:text-white mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-pink-500">Project Not Found</h1>
          </div>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Convert tech_stack string to array for rendering
  const techStackArray = projectDetails.tech_stack 
    ? projectDetails.tech_stack.split(',').map(tech => tech.trim())
    : [];
  
  const getStatusStyle = (stepNumber: number) => {
    const currentStatus = projectDetails.status || "running";
    
    if (
      (stepNumber === 1 && currentStatus === "planning") ||
      (stepNumber === 2 && currentStatus === "running") ||
      (stepNumber === 3 && currentStatus === "completed")
    ) {
      return "bg-pink-500";
    }
    
    return "bg-zinc-700";
  };
  
  // Generate stars for rating display
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const filledStars = Math.round(rating / 2); // Convert 10-scale to 5-star scale
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i}
          className={`h-4 w-4 ${i < filledStars ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} 
        />
      );
    }
    
    return stars;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Overview</CardTitle>
              
              {/* Rating Display and Dialog Trigger */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 mb-1">
                  {renderRatingStars(projectDetails.rating || 0)}
                  <span className="text-sm text-muted-foreground ml-1">
                    {projectDetails.rating ? (projectDetails.rating / 10 * 5).toFixed(1) : "0"}/5
                  </span>
                </div>
                
                <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Rate Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate this project</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`h-8 w-8 ${i < (ratingValue / 2) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
                            />
                          ))}
                        </div>
                        <div className="w-full px-1">
                          <Slider 
                            defaultValue={[ratingValue]} 
                            max={10} 
                            step={1}
                            onValueChange={(value) => setRatingValue(value[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-muted-foreground">1</span>
                            <span className="text-sm font-medium">{ratingValue}/10</span>
                            <span className="text-sm text-muted-foreground">10</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 w-full mt-4">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            onClick={handleRatingSubmit}
                            disabled={isSubmittingRating}
                            className="bg-pink-500 hover:bg-pink-600"
                          >
                            {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{projectDetails.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Project Type</p>
                    <p className="font-medium">{projectDetails.project_type}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="font-medium">{projectDetails.project_size}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(projectDetails.start_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(projectDetails.end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {projectDetails.github_link && (
                  <div className="flex items-start">
                    <Github className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Github</p>
                      <a 
                        href={projectDetails.github_link}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {projectDetails.github_link.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techStackArray.length > 0 ? (
                  techStackArray.map((tech, index) => (
                    <Badge key={index} className="bg-pink-500/10 text-pink-500 border-pink-500/20">
                      <Code className="h-3 w-3 mr-1" /> {tech}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No technologies specified for this project.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Project Status Card - New addition */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Project Status</CardTitle>
                <DropdownMenu>
                
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange("planning")}>
                      Planning
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("running")}>
                      Running
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status Progress Indicator */}
              <div className="flex items-center justify-between">
                {/* Progress Bar Line */}
              
                {/* Status Circles */}
                <div className="relative flex justify-between w-full z-10">
                  {/* Planning Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full ${getStatusStyle(1)}`}></div>
                    <span className="text-xs mt-1">Planning</span>
                  </div>
                  
                  {/* Running Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full ${getStatusStyle(2)}`}></div>
                    <span className="text-xs mt-1">Running</span>
                  </div>
                  
                  {/* Completed Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full ${getStatusStyle(3)}`}></div>
                    <span className="text-xs mt-1">Completed</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm font-medium">
                  <span className="capitalize">{projectDetails.status || "Running"}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectDetails.team_members && projectDetails.team_members.length > 0 ? (
                  projectDetails.team_members.map((member, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                        <AvatarFallback>
                          {member.split(' ').map(word => word[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No team members have been added to this project.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}