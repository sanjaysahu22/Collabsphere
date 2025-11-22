import { useState } from "react";
interface TaskData {
  project_id: number;
  sprint_number: number;
  description: string;
  assigned_to: string;
  points: number;
  user_id: string;
}

const AddTaskForm = () => {
  
  const [formData, setFormData] = useState<TaskData>({
    project_id: 3, 
    sprint_number: 1, 
    description: "", 
    assigned_to: "", 
    points: 0, 
    user_id: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to handle form input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Make a POST request to the backend API
      const response = await fetch(
        "https://collabsphere-d7g1.onrender.com/project/edit_tasks/add_task",
        {
          method: "POST",
          credentials: "include", // Include cookies or authentication tokens
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Send the form data as JSON
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // Reset the form and clear any previous errors
      setFormData({
        project_id: 3,
        sprint_number: 1,
        description: "",
        assigned_to: "",
        points: 0,
        user_id: "",
      });
      setErrorMessage(null);
      alert("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      setErrorMessage("Failed to add task. Please check your inputs.");
    }
  };
};

export default AddTaskForm;