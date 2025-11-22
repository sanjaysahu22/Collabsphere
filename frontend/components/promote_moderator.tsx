import { useState, useEffect } from "react";

interface PromoteResponse {
  message: string;
}
interface PromotePayload {
  project_id: number;
  user_id: string;
}

const PromoteUser = () => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const promoteUser = async () => {
    try {
      const payload: PromotePayload = {
        project_id: 3,
        user_id: "23bcy25",
      };
      const response = await fetch(
        "https://collabsphere-nz2u.onrender.com/project/add_mod/promote",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload), 
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: PromoteResponse = await response.json();
      setResponseMessage(data.message);
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error promoting user:", error);
    }
  };
  promoteUser();
};


export default PromoteUser;