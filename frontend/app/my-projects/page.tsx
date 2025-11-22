"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProjectCard from "@/components/project-card"
import CreateProjectButton from "@/components/create-project-button"
import Navbar from "@/components/navbar"
import { useUserContext } from "@/lib/usercontext"

interface Project {
  admin_id: number
  description: string
  project_id: number
  end_date: string
  members_required: number
  start_date: string
  status: string
  title: string
  tags: string
}

export default function MyProjects() {
  const [activeTab, setActiveTab] = useState("current")
  const [projectsData, setProjectsData] = useState<Project[]>([]) // Typed as Project[]
const {user } = useUserContext()
//const id = user?.id ? user?.id:'aditya23bcy25';
const userlocal = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
const parsedUser = userlocal ? JSON.parse(userlocal) : null;
  const userId = user?.id ? user?.id:parsedUser?.id;
  // Fetch projects from the API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("https://collabsphere-d7g1.onrender.com/list/myprojects", {
          method: "POST",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json",
          },
           // Replace with the actual user ID
           body: JSON.stringify({
          
            user_id: userId, //us Use the user ID from the context
            
          }),
        })

        if (!response.ok) {
          console.log("Error:", response.status)
       
        }

        const data = await response.json()
        console.log("API Response:", data)
        setProjectsData(data.project) // Set the project data from the API response
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }

    fetchProjects()
  }, [])

  // Filter projects based on their status
  const currentProjects = projectsData.filter((project) => project.status === "Active")
  const completedProjects = projectsData.filter((project) => project.status === "Completed")
  const appliedProjects = projectsData.filter((project) => project.status === "Applied")

  return (
    <div className="flex flex-col md:flex-row">
      <Navbar activeNav="projects" setActiveNav={() => {}} />

      <main className="min-h-screen bg-black w-full text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl font-bold text-pink-500 mb-4 md:mb-0">My Projects</h1>
            <CreateProjectButton />
          </div>

          <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="current">Current ({currentProjects.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
              <TabsTrigger value="applied">Applied ({appliedProjects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              {currentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProjects.map((project) => (
                    <ProjectCard key={project.project_id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="text-muted-foreground mb-4">You don't have any current projects</p>
                  <CreateProjectButton variant="outline" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedProjects.map((project) => (
                    <ProjectCard key={project.project_id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="text-muted-foreground">You don't have any completed projects</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applied">
              {appliedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appliedProjects.map((project) => (
                    <ProjectCard key={project.project_id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="text-muted-foreground">You haven't applied to any projects</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}