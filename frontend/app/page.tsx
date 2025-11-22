"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Footer from "@/components/Footerpage"
import FeaturesSection from "@/components/features"
import GoogleLogin from "@/components/GoogleLogin"


export default function Home() {
  interface Project {
    project_id: number;
    score: number;
    title: string;
  }
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter() // Use useRouter hook
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await fetch("https://collabsphere-nz2u.onrender.com/best_projects", {
          method: "GET",
          credentials: "include", // Include cookies if needed
        });
    
        if (!response.ok) {
          console.log("Error fetching data:", response.statusText);
          return;
        }    
        const data = await response.json();
        setProjects(data.project); // Assuming API returns an array of projects

        console.log("Server Response:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 678
    canvas.height = 678

    // Orbital objects
    const orbits = [
      { radius: 120, angle: 0, color: "#E86C8D", speed: 0.001 },
      { radius: 180, angle: 2, color: "#4C6FFF", speed: 0.0015 },
      { radius: 240, angle: 4, color: "#FF5733", speed: 0.002 },
    ]

    // Animation function
    function animate() {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw orbital paths
      orbits.forEach((orbit) => {
        ctx.beginPath()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.arc(canvas.width / 2, canvas.height / 2, orbit.radius, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Draw orbital objects
      orbits.forEach((orbit) => {
        orbit.angle += orbit.speed

        const x = canvas.width / 2 + Math.cos(orbit.angle) * orbit.radius
        const y = canvas.height / 2 + Math.sin(orbit.angle) * orbit.radius

        ctx.beginPath()
        ctx.fillStyle = orbit.color
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw center logo
      ctx.beginPath()
      ctx.fillStyle = "#6B46C1"
      ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2)
      ctx.fill()

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    
    <main className="min-h-screen bg-black text-white">
    
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <canvas ref={canvasRef} className="w-full max-w-[678px] mx-auto" />
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-bold">Why Collabsphere?</h1>
            <p className="text-xl text-gray-400">
              CollabSphere enables students to connect, collaborate, and build impactful projects together.
            </p>
            <GoogleLogin />
          </div>
        </div>

        <div className="mt-24">
  <FeaturesSection  data={{ project: projects }} />
        </div>
      </div>
    </main>
  )
}