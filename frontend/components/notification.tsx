"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { useUserContext } from "@/lib/usercontext"
import Link from "next/link";

interface Notification {
  application_id: number
  applied: "user" | "admin"
  applied_at: string
  project_id: number
  remarks: string
  role: string
  status: "Pending" | "Accepted" | "Rejected"
  title: string
  user_id: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { user } = useUserContext()
  
  // Use user ID from context, or fall back to a dummy ID for development
  const userId = user?.id || 'sanjay23bcy51'

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For testing: Add a check to see if the server is running
      const testResponse = await fetch("https://collabsphere-nz2u.onrender.com/ping", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // This will catch network errors specifically for the test request
        console.log("Server is not reachable")
      })
      
      const response = await fetch("https://collabsphere-nz2u.onrender.com/notification", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      })

      if (!response.ok) {
        console.log("Response not OK:", response) 
      }

      const data = await response.json()
      console.log("Notifications:", data)
      
      if (data.notification && Array.isArray(data.notification)) {
        setNotifications(data.notification)
      } else {
        // If the data structure isn't as expected, log and initialize with empty array
        console.warn("Unexpected data structure:", data)
        setNotifications([])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      
      // Set a user-friendly error message
      if (error instanceof Error) {
        setError(error.message === "Failed to fetch" 
          ? "Cannot connect to notification server" 
          : error.message)
      } else {
        setError("Failed to load notifications")
      }
      
      // For development only: Use mock data when API is unavailable
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock notification data for development")
        setNotifications([
          {
            application_id: 13,
            applied: "user",
            applied_at: "2025-04-02T18:17:00.583870",
            project_id: 1,
            remarks: "Interested in frontend development",
            role: "member",
            status: "Pending",
            title: "Web App Development",
            user_id: "aditya23bcy25",
          },

        ])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Set up polling for notifications every minute instead of 30 seconds
    // This reduces server load while still providing reasonably fresh data
    const intervalId = setInterval(fetchNotifications, 60000)
    
    return () => clearInterval(intervalId)
  }, [userId]) // Add userId as dependency to refetch when user changes

  const handleAcceptRequest = async (applicationId: number,project_id:number,applicant_id:string, accept: boolean) => {
    try {
      setLoading(true)
      const response = await fetch("https://collabsphere-nz2u.onrender.com/update/project/app/status", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: applicant_id,
          project_id: project_id,
          status: accept ? "Accepted" : "Rejected",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Server Responsef:", data)
      if (data) {
        // Optimistically update the local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.application_id === applicationId
              ? { ...notification, status: accept ? "Accepted" : "Rejected" }
              : notification
          )
        )
        
        // Show success message
        alert(accept ? "Request accepted successfully!" : "Request rejected.")
      } else {
        throw new Error(data.message || "Failed to process the request")
      }
    } catch (error) {
      console.error("Error processing request:", error)
      alert("Failed to process the request. Please try again.")
      
      // Refresh notifications to get current state
      fetchNotifications()
    } finally {
      setLoading(false)
    }
  }

  const pendingNotifications = notifications.filter(n => n.status === "Pending")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingNotifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] min-h-[20px] flex items-center justify-center bg-pink-500 text-white">
              {pendingNotifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-zinc-950 border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h4 className="font-medium text-white">Notifications</h4>
          {pendingNotifications.length > 0 && (
            <Badge className="bg-pink-500">
              {pendingNotifications.length} new
            </Badge>
          )}
        </div>
        
        {loading ? (
          <div className="p-4 text-center text-zinc-400">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={fetchNotifications}
            >
              Retry
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-zinc-400">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-zinc-800">
              {notifications.map((notification) => (
                <div 
                  key={notification.application_id} 
                  className={`p-4 hover:bg-zinc-900 transition-colors ${
                    notification.status === "Pending" ? "bg-zinc-900/50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      Project Name:
                      <span className="text-pink-500"> {notification.title}</span>
                    </span>
                    <Badge 
                      variant={
                        notification.status === "Accepted" ? "outline" : 
                        notification.status === "Rejected" ? "destructive" : 
                        "secondary"
                      }
                      className={
                        notification.status === "Pending" ? "bg-pink-500/20 text-pink-500 border-pink-500/20" : ""
                      }
                    >
                      {notification.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-zinc-400 mb-2">
                    {notification.applied === "admin" ? (
                      <>You have been invited to join <span className="text-pink-500">{notification.user_id}</span> as {notification.role}</>
                    ) : (
                      <>
  Request to join{" "}
  <Link href={`/profile/${notification.user_id}`}>
    <span className="text-pink-500 hover:underline cursor-pointer">
      {notification.user_id}
    </span>
  </Link>{" "}
  as {notification.role}

                    </>
                    )}
                  </p>
                  
                  {notification.remarks && (
                    <p className="text-xs text-zinc-500 mb-2 italic">
                      "{notification.remarks}"
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {/*<span className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(notification.applied_at), { addSuffix: true })}
                    </span>*/}
                    
                    {notification.status === "Pending" && (
                      <div className="flex gap-2">
                        {/* Show accept/reject buttons for all pending notifications */}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-7 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleAcceptRequest(notification.application_id,notification.project_id,notification.user_id, false)}
                          disabled={loading}
                        >
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm"
                          className="h-7 px-2 py-1 text-xs bg-pink-600 hover:bg-pink-700"
                          onClick={() => handleAcceptRequest(notification.application_id,notification.project_id,notification.user_id, true)}
                          disabled={loading}
                        >
                          <Check className="h-3 w-3 mr-1" /> Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}