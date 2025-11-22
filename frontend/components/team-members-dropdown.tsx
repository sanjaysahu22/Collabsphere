import React, { useState, useEffect } from "react"

interface TeamMember {
  id: string; // This is roll_no from the API 
  name: string;
}

interface TeamMemberDropdownProps {
  projectId: number;
  onSelect: (userId: string, userName: string) => void;
  label?: string;
  purpose: 'moderator' | 'task'; // Flag to know where it's called
}

const TeamMemberDropdown: React.FC<TeamMemberDropdownProps> = ({ 
  projectId, 
  onSelect, 
  label,
  purpose = 'moderator' // Default to moderator assignment
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEligibleUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Always call the eligible_users API endpoint, regardless of purpose
        const apiUrl = `https://collabsphere-d7g1.onrender.com/project/add_mod/eligible_users?project_id=${projectId}`;
        
        const response = await fetch(apiUrl, {
          method: "GET",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          console.log("Error:", response.status);
        }
        
        const data = await response.json();
        console.log("Eligible users response:", data);
        
        // Transform the API response to match our TeamMember interface
        if (data.eligible_users && Array.isArray(data.eligible_users)) {
          const members: TeamMember[] = data.eligible_users.map((user: any) => ({
            id: user.roll_no,
            name: user.name
          }));
          setTeamMembers(members);
        } else {
          setTeamMembers([]);
          console.warn("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error(`Error fetching eligible users:`, error);
        setError(`Failed to fetch team members. Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEligibleUsers();
  }, [projectId, purpose]);

  const handleSelect = (member: TeamMember) => {
    setSelectedMember(member);
    onSelect(member.id, member.name); // Pass userId and userName to parent
  };

  // Function to promote a user to moderator
  const handlePromoteToMod = async (userId: string) => {
    try {
      const response = await fetch("https://collabsphere-d7g1.onrender.com/project/add_mod/promote", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          user_id: userId
        }),
      });

      if (!response.ok) { 
        console.log("Error:", response.status);
      }

      const data = await response.json();
      console.log("Promotion response:", data);
      return data.success || false;
    } catch (error) {
      console.error("Error promoting to moderator:", error);
      return false;
    }
  };

  return (
    <div className="relative space-y-4">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      
      {loading ? (
        <div className="w-full bg-gray-800 text-gray-500 border border-gray-700 rounded-md p-2">
          Loading {purpose === 'moderator' ? 'team members' : 'assignees'}...
        </div>
      ) : error ? (
        <div className="w-full bg-gray-800 text-red-400 border border-gray-700 rounded-md p-2">
          {error}
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="w-full bg-gray-800 text-gray-500 border border-gray-700 rounded-md p-2">
          No {purpose === 'moderator' ? 'eligible team members' : 'team members'} found
        </div>
      ) : (
        <div className="space-y-4">
          <select
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2"
            value={selectedMember?.id || ""}
            onChange={(e) => {
              const member = teamMembers.find((m) => m.id === e.target.value);
              if (member) handleSelect(member);
            }}
          >
            <option value="" disabled>
              {purpose === 'moderator' ? 'Select a team member' : 'Assign task to'}
            </option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          
          {/* Only show the Promote button when purpose is moderator */}
          {purpose === 'moderator' && selectedMember && (
            <button
              className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition"
              onClick={async () => {
                const success = await handlePromoteToMod(selectedMember.id);
                if (success) {
                  alert(`${selectedMember.name} has been promoted to moderator.`);
                  // Optionally refresh the list after promotion
                } else {
                  alert("Failed to promote user to moderator. Please try again.");
                }
              }}
            >
              Promote to Moderator
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamMemberDropdown;