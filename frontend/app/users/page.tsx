"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TeamMemberCard from "@/components/team-member-card";
import { Search } from "lucide-react";
import Navbar from "@/components/navbar";

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://collabsphere-d7g1.onrender.com/list/users", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const rawData = await response.json();
        console.log("Raw API Response:", rawData); // Log raw API response for debugging

        // Extract the 'projects' array from the raw data
        const userData = Array.isArray(rawData?.projects)
          ? rawData.projects
          : [];

        console.log("Normalized User Data:", userData); // Log normalized data

        // Process the tech_stack field to ensure it's always an array
        const processedData = userData.map((user: Partial<UserProfile>) => ({
          email: user.email || "",
          email_update: user.email_update || false,
          github_profile: user.github_profile || "",
          linkedin_profile: user.linkedin_profile || "",
          name: user.name || "Unknown",
          past_experience: user.past_experience || "",
          project_count: user.project_count || 0,
          project_update: user.project_update || false,
          rating: user.rating || 0,
          role_type: user.role_type || "",
          roll_no: user.roll_no || 0,
          tech_stack: Array.isArray(user.tech_stack)
            ? user.tech_stack // Keep as is if already an array
            : typeof user.tech_stack === "string"
            ? [user.tech_stack] // Convert string to array with one element
            : [], // Fallback for undefined/null
        }));

        console.log("Processed Data:", processedData); // Log processed data
        setUserProfile(processedData); // Update state with processed data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  // Get all unique skills from userProfile
  const allSkills = Array.from(
    new Set(userProfile.flatMap((member) => member.tech_stack))
  ).sort();

  // Filter team members based on search query and selected skills
  const filteredMembers = userProfile
  .filter((member) => {
    // Ensure all required fields exist
    return (
      member &&
      typeof member.name === "string" &&
      typeof member.role_type === "string" &&
      Array.isArray(member.tech_stack)
    );
  })
  .filter((member) => {
    const matchesSearch =
      searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => member.tech_stack.includes(skill));

    return matchesSearch && matchesSkills;
  });
  // Toggle a skill in the selectedSkills array
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prevSkills) =>
      prevSkills.includes(skill)
        ? prevSkills.filter((s) => s !== skill)
        : [...prevSkills, skill]
    );
  };

  // Define the UserProfile interface
  interface UserProfile {
    email: string;
    email_update: boolean;
    github_profile: string;
    linkedin_profile: string;
    name: string;
    past_experience: string;
    project_count: number;
    project_update: boolean;
    rating: number;
    role_type: string;
    roll_no: number;
    tech_stack: string[];
  }

  return (
    <div className="flex flex-col md:flex-row">
      <Navbar activeNav="users" setActiveNav={() => {}} />
      <main className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-pink-500 mb-8">
            Team Members
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-1 space-y-6">
              {/* Search Section */}
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                <h2 className="text-lg font-semibold mb-4">Search</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or role"
                    className="pl-9 bg-zinc-800 border-zinc-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Skills Filter Section */}
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                <h2 className="text-lg font-semibold mb-4">Filter by Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        selectedSkills.includes(skill) ? "default" : "outline"
                      }
                      className={
                        selectedSkills.includes(skill)
                          ? "bg-pink-500 hover:bg-pink-600 cursor-pointer"
                          : "bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                      }
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Filtered Members */}
            <div className="lg:col-span-3">
              {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredMembers.map((member) => (
                    <TeamMemberCard key={member.roll_no} member={member} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="text-muted-foreground">
                    No team members match your search criteria
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSkills([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}