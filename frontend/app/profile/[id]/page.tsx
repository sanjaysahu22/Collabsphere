"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Add useParams
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  LogOut,
  Trophy,
  Mail,
  Github,
  Linkedin,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useUserContext } from "@/lib/usercontext";

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams(); /// Get URL parameters
  const profileUserId = params?.id as string; // Get the profile ID from URL

  const [activeNav, setActiveNav] = useState("profile");
  const [tech, setTech] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false); // Add state to track if viewing own profile
  const [activeTab, setActiveTab] = useState("profile"); // Track active tab
  // Moved inside the component
  const [userData, setuserData] = useState<User>({
    name: "",
    email: "",
    email_update: false, // Default value for email_update
    github_profile: "",
    linkedin_profile: "",
    past_experience: "",
    project_update: false, // Default value for project_update
    roll_no: 0, // Default value for roll_no
    rating: 0, // Default value for rating (e.g., 0 for no rating)
    role_type: "", // Default value for role_type (empty string for initial state)
    tech_stack: [], // Initialize tech_stack as an empty array
  });
const {user } = useUserContext()  
const userlocal = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
const parsedUser = userlocal ? JSON.parse(userlocal) : null;
  const userId = user?.id ? user?.id:parsedUser?.id;
  console.log("userIds",userId)
  // const id = user?.id ? user?.id:userlocal?.id;

const id = 'sanjay23bcy51';
  const handleAddTech = () => {
    if (tech.trim() !== "") {
      setTechStack((prev) => [...prev, tech.trim()]);
      setuserData((prev) => ({
        ...prev, // Spread the previous state
        tech_stack: [...prev.tech_stack, tech], // Add the new value to the tech_stack array
      }));
      setTech("");

    }
  };

   useEffect(() => {
    if (userId && profileUserId) {
      const isOwner = userId === profileUserId;
      setIsOwnProfile(isOwner);
      console.log("Is own profile:", isOwner, "userId:", userId, "profileUserId:", profileUserId);
      
      // Reset to profile tab if settings was selected but it's not the user's profile
      if (!isOwner && activeTab === "settings") {
        setActiveTab("profile");
      }
    }
  }, [userId, profileUserId, activeTab]);
  
  const handleRemoveTech = (itemToRemove: string) => {
    setTechStack((prev) => prev.filter((item) => item !== itemToRemove));
  };
  const [roll_no, setroll_no] = useState(3);
  interface User {
    name:string;
    email: string; // Email address of the user
    email_update: boolean; // Whether email updates are enabled
    github_profile: string; // GitHub profile URL
    linkedin_profile: string; // LinkedIn profile URL
    past_experience: string; // Description of past experience
    project_update: boolean; // Whether project updates are enabled
    rating: number; // User rating (e.g., 4.8)
    role_type: string; // Role type (e.g., "professor")
    roll_no: number; // Roll number or unique identifier
    tech_stack: string[]; // Array of technical skills
  }
  const [profile, setProfile] = useState<User[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://collabsphere-d7g1.onrender.com/profile/view", {
          method: "POST",
          credentials: "include", // Include cookies if needed
          headers: {
            "Content-Type": "application/json", // Specify that we're sending JSON data
          },
          body: JSON.stringify({roll_no: userId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response: line 176", data);
        setProfile(data.user);
        setuserData(data.user[0]);
        console.log("Server Response:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  const [project_setting, setProjectSetting] = useState<Project[]>([]);
  useEffect(() => {
    let user_id = id;
    console.log(user_id);
    const fetchCurrentProjects = async () => {
      try {
        const response = await fetch(
          "https://collabsphere-d7g1.onrender.com/list/current/projects",
          {
            method: "POST",
            credentials: "include", // Include cookies if needed
            headers: {
              "Content-Type": "application/json", // Specify that we're sending JSON data
            },
            body: JSON.stringify({ user_id:userId }),
          }
        );

        if (!response.ok) {
        console.log("Error:", response.status);
        }

        const data = await response.json();
        console.log("Server Response:", data);

        // Update the project_setting state with the fetched projects
        setProjectSetting(data.project);
      } catch (error) {
        console.error("Error fetching current projects:", error);
      }
    };
    fetchCurrentProjects();
  }, []);

  interface Project {
    admin_id: number; // ID of the project administrator
    role: string; // Description of the project
    end_date: string; // End date of the project (in ISO format)
    members_required: number; // Number of members required for the project
    project_id: number; // Unique identifier for the project
    start_date: string; // Start date of the project (in ISO format)
    status: string; // Status of the project (e.g., "Active", "Completed")
    tags: string; // Tags associated with the project (comma-separated)
    title: string; // Title of the project
  }
  const [past_projects, setPastprojects] = useState<Past[]>([]);
  useEffect(() => {
    let user_id = id;
    const fetchPastProjects = async () => {
      try {
        const response = await fetch(
          "https://collabsphere-d7g1.onrender.com/list/past/projects",
          {
            method: "POST",
            credentials: "include", // Include cookies if needed
            headers: {
              "Content-Type": "application/json", // Specify that we're sending JSON data
            },
            body: JSON.stringify({ user_id :userId}),
          }
        );

        if (!response.ok) {
         console.log("Error:", response.status);
        }

        const data = await response.json();
        console.log("Server Response:", data);

        // Update the project_setting state with the fetched projects
        setPastprojects(data.project);
      } catch (error) {
        console.error("Error fetching current projects:", error);
      }
    };
    fetchPastProjects();
  }, []);
  interface Past {
    admin_id: number; // ID of the project administrator
    role: string; // Description of the project
    end_date: string; // End date of the project (in ISO format)
    members_required: number; // Number of members required for the project
    project_id: number; // Unique identifier for the project
    start_date: string; // Start date of the project (in ISO format)
    status: string; // Status of the project (e.g., "Active", "Completed")
    tags: string; // Tags associated with the project (comma-separated)
    title: string; // Title of the project
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare the data to match the API's expected format
    const profileData = {
      past_experience: userData.past_experience,
      tech_stack : [...userData.tech_stack],

      github_profile: userData.github_profile,
      linkedin_profile: userData.linkedin_profile,
      email_update: userData.email_update,
      project_update: userData.project_update,
      roll_no: id,
    };
    try {
      console.log(profileData);
      // Make the API call using your existing API endpoint
      const response = await fetch("https://collabsphere-d7g1.onrender.com/update/profile", {
        method: "POST",
        credentials: "include", // Include cookies if needed
        headers: {
          "Content-Type": "application/json", // Specify JSON data
        },
        body: JSON.stringify(profileData), // Send the prepared data
      });
      // Check for errors in the response
      if (!response.ok) {
       console.log("Error:", response.status);
      }
      // Parse the response data
      const data = await response.json();
      console.log("Server Response:", data);
      // Redirect to the profile page
      alert("Changes Saved")
    } catch (error) {
      console.error("Error submitting profile data:", error);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-black text-white">
          <Navbar  activeNav={activeNav} setActiveNav={setActiveNav}   />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
          <Link href="/create_project">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 mb-6">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-pink-500"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-pink-500"
            >
              Projects
            </TabsTrigger>
           {isOwnProfile && (
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-pink-500"
              >
                Settings
              </TabsTrigger>
            )}
          </TabsList>
   

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Map over the profile.User array */}
            {profile.map((userData, index) => (
              <Card key={index} className="bg-gray-800 border-none">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center">
                      {/* <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-pink-500">
                        <Image
                          src="/placeholder.svg" // Replace with actual avatar URL if available
                          alt="User Avatar"
                          fill
                          className="object-cover"
                        />
                      </div> */}
                      <h2 className="text-xl font-bold">
                        {userData.role_type}
                      </h2>{" "}
                      {/* Role type as name */}
                      <p className="text-gray-400">
                        {userData.past_experience}
                      </p>{" "}
                      {/* Past experience */}
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-pink-500" />
                          <span>{userData.email}</span>
                        </div>

                        {/*  Profile */}
                        <div className="flex items-center gap-2">
                          <Github className="h-5 w-5 text-pink-500" />
                          <a
                            href={userData.github_profile}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            GitHub Profile
                          </a>
                        </div>

                        {/* LinkedIn Profile */}
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-5 w-5 text-pink-500" />
                          <a
                            href={userData.linkedin_profile}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {userData.linkedin_profile}
                          </a>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-pink-500" />
                          <span>Rating: {userData.rating}</span>
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Bio</h3>
                        <p className="text-gray-300">
                          {userData.past_experience || "No bio available."}
                        </p>
                      </div>

                      {/* Skills Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {userData.tech_stack.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-gray-800 border-none">
              <CardHeader>
                <CardTitle className="text-pink-500">
                  Current Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Map over project_setting to render each project */}
                  {project_setting.map((project) => (
                    <div
                      key={project.project_id}
                      className="p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-400">
                            Role: {project.role}
                          </p>
                          <p className="text-sm mt-1">
                            Team: {project.members_required} members
                          </p>
                          {/* <p className="text-sm mt-1">Tags: {project.tags}</p> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-none">
              <CardHeader>
                <CardTitle className="text-pink-500">Past Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {past_projects.map((project) => (
                    <div
                      key={project.project_id}
                      className="p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-400">
                            Role: {project.role}
                          </p>
                          <p className="text-sm mt-1">
                            Team: {project.members_required} members
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-green-500 rounded-full text-sm">
                          Completed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </TabsContent>
          {isOwnProfile && (<TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-none">
              <CardHeader>
                <CardTitle className="text-pink-500">
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userData.name || ''} // Use empty string as fallback
                    readOnly
                    onChange={(e) =>
                      setuserData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userData.email || ''} // Use empty string as fallback
                    readOnly
                    onChange={(e) =>
                      setuserData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="bg-gray-700 border-gray-600 cursor-not-allowed"
                  />
                </div>
                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={userData.linkedin_profile || ''} // Use empty string as fallback
                    onChange={(e) =>
                      setuserData((prev) => ({
                        ...prev,
                        linkedin_profile: e.target.value, // Fixed property name
                      }))
                    }
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                {/* GitHub */}
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={userData.github_profile || ''} // Use empty string as fallback
                    onChange={(e) =>
                      setuserData((prev) => ({
                        ...prev,
                        github_profile: e.target.value,
                      }))
                    }
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                {/* Past Experience */}
                <div className="space-y-2">
                  <Label htmlFor="pastexperience">Past Experience</Label>
                  <Input
                    id="pastexperience"
                    value={userData.past_experience || ''} // Use empty string as fallback
                    onChange={(e) =>
                      setuserData((prev) => ({
                        ...prev,
                        past_experience: e.target.value,
                      }))
                    }
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                {/* Tech Stack (New Section) */}
                <div>
                  <label className="block text-sm mb-1">Tech Stack</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technology"
                      className="bg-zinc-800 border-zinc-700"
                      onChange={(e) =>
                      {setTech(e.target.value)}
                      }
                      
                    
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
                  {userData.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.tech_stack.map((item, index) => (
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
                {/* Save Changes Button */}
                <Button
                  className="bg-pink-500 hover:bg-pink-600 w-full"
                  onClick={(e) => {
                    handleSubmit(e);
                  }}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            {/* Logout Section */}
            <Card className="bg-gray-800 border-none">
              <CardContent className="space-y-6">
                <div className="pt-4 border-t border-gray-700">
                <Button 
  onClick={() => {
    localStorage.removeItem('user');
   localStorage.removeItem('token');
    
    // Redirect to homepage
    router.push('/');
  }} 
  variant="destructive" 
  className="w-full"
>
  <LogOut className="mr-2 h-4 w-4" /> Logout
</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>)}
          
          {/* Settings Tab */}
          {/* <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-none">
              <CardHeader>
                <CardTitle className="text-pink-500">
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={userData.name}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    defaultValue={userData.email}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    defaultValue={userData.linkedin}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GithHub</Label>
                  <Input
                    id="github"
                    defaultValue={userData.github}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pastexperience">Past Experience</Label>
                  <Input
                    id="pastexperience"
                    defaultValue={userData.bio}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="techstack">Tech Stack</Label>
                  <Input
                    id="techstack"
                    defaultValue={userData.skills}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <Button className="bg-pink-500 hover:bg-pink-600 w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-none">
              
              <CardContent className="space-y-6">
                <div className="pt-4 border-t border-gray-700">
                  <Button variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}