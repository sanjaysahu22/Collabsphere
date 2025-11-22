"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import TaskForm from "@/components/taskform"
import SprintDetails from "@/components/sprint-details"
import { useUserContext } from "@/lib/usercontext"
import ProjectTasks from "@/components/view_tasks" // Import the updated component
import CreateSprint from "./create_sprint"
import TeamMemberDropdown from "./team-members-dropdown"

interface SprintManagementProps {
  project_id: number;
  projectTitle?: string;
}

interface Sprint {
  End: string,
  Start: string,
  Status: string,
  name: string,
  sprint_id: number,
  id?: number // Add optional id for backward compatibility
}

export default function SprintManagement({ project_id, projectTitle }: SprintManagementProps) {
  const { user } = useUserContext()
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>(undefined);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)

  const fetchSprints = async () => {
    // Fetch sprints from API
    const response = await fetch(`https://collabsphere-d7g1.onrender.com/project/view_sprints?project_id=${project_id}`)
    const data = await response.json()
    setSprints(data.sprints)
    console.log(data)
    
    // If sprints exist and no sprint is selected, select the last sprint by default
    if (data.sprints && data.sprints.length > 0 && !selectedSprintId) {
      const lastSprint = data.sprints[data.sprints.length - 1]
      // Check if sprint_id or id is available (handle both cases)
      const sprintId = lastSprint.sprint_id !== undefined ? lastSprint.sprint_id : lastSprint.id
      setSelectedSprintId(sprintId)
      setSelectedSprint(lastSprint)
    }
  }

  useEffect(() => {
    fetchSprints()
  }, [project_id])

  const handleSprintSelect = (sprint: Sprint) => {
    // Use sprint_id if available, otherwise fall back to id
    const sprintId = sprint.sprint_id !== undefined ? sprint.sprint_id : sprint.id
    setSelectedSprintId(sprintId)
    setSelectedSprint(sprint)
  }

  // Find the selected sprint object
  useEffect(() => {
    if (selectedSprintId && sprints.length > 0) {
      // Look for sprint with matching sprint_id or id
      const sprint = sprints.find(s => 
        (s.sprint_id !== undefined && s.sprint_id === selectedSprintId) ||
        (s.id !== undefined && s.id === selectedSprintId)
      ) || null
      setSelectedSprint(sprint)
    }
  }, [selectedSprintId, sprints])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-pink-500">
        {projectTitle ? `Sprint Management: ${projectTitle}` : 'Sprint Management'}
      </h1>
      <div className="flex items-center gap-4">
        <Dialog open={isCreateSprintOpen} onOpenChange={setIsCreateSprintOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:text-black hover:to-blue-600">
              Create Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
            </DialogHeader>
            <CreateSprint
              project_id={project_id}
              onSprintCreated={() => {
                fetchSprints();
                setIsCreateSprintOpen(false);
              }}
              onClose={() => setIsCreateSprintOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:text-black hover:to-blue-600"
              disabled={!selectedSprintId}
            >
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <TaskForm 
              projectId={project_id} 
              onTaskAdded={() => {
                fetchSprints();
                setIsCreateTaskOpen(false);
              }} 
              sprint_id={selectedSprintId} 
            />
          </DialogContent>
        </Dialog>
        
     {/*   <TeamMemberDropdown projectId={project_id} label="Assign Moderator" purpose="moderator" onSelect={function (userId: string, userName: string): void {
          throw new Error("Function not implemented.")
        } } />*/}
      </div>
      
      {/* Updated grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sprint list column */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Project Sprints</CardTitle>
              <CardDescription>Select a sprint to view details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {sprints.length > 0 ? (
                sprints.map(sprint => {
                  // Get the sprint ID consistently
                  const sprintId = sprint.sprint_id !== undefined ? sprint.sprint_id : sprint.id;
                  return (
                    <div
                      key={sprintId}
                      onClick={() => handleSprintSelect(sprint)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedSprintId === sprintId
                          ? 'bg-pink-100 border-l-4 border-pink-500 text-black'
                          : 'hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <div className="flex items-center justify-between text-inherit">
                        <h3 className={`font-medium ${selectedSprintId === sprintId ? 'text-black' : ''}`}>
                          {sprint.name}
                        </h3>
                        <Badge 
                          variant={sprint.Status === "active" ? "default" : "outline"}
                          className={`text-xs ${selectedSprintId === sprintId ? 'text-black' : ''}`}
                        >
                          {sprint.Status}
                        </Badge>
                      </div>
                      {sprint.Start && sprint.End && (
                        <p className={`text-xs ${selectedSprintId === sprintId ? 'text-black' : 'text-muted-foreground'} mt-1 group-hover:text-black`}>
                          {new Date(sprint.Start).toLocaleDateString()} - {new Date(sprint.End).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground">No sprints available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details and tasks column */}
        <div className="md:col-span-3 space-y-6">
          {selectedSprint ? (
            <>
              <SprintDetails sprint={selectedSprint} />

              <ProjectTasks
                projectId={project_id}
                sprint_id={selectedSprintId} // Changed from sprint_id to sprintId to match component prop
              />
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Sprint Selected</h3>
              <p className="text-gray-500 mb-4">Select a sprint from the list or create a new one</p>
              <Button 
                onClick={() => setIsCreateSprintOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
              >
                Create First Sprint
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}