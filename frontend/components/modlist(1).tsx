import { useState, useEffect } from "react";
interface EligibleUser {
  name: string;
  roll_no: string;
}
interface ApiResponse {
  eligible_users: EligibleUser[];
}

const EligibleUsers = ({ projectId }: { projectId: number }) => {
  
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    const fetchEligibleUsers = async () => {
      try {
        const apiUrl = `https://collabsphere-nz2u.onrender.com/project/add_mod/eligible_users?project_id=${projectId}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setEligibleUsers(data.eligible_users);
        console.log("Server Response:", data);
      } catch (error) {
        console.error("Error fetching eligible users:", error);
        setErrorMessage("Failed to fetch eligible users. Please try again.");
      }
    };
    fetchEligibleUsers();
  }, [projectId]); 
};

export default EligibleUsers;