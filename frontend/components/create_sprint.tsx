
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUserContext } from "@/lib/usercontext";
import { toast } from "sonner"; // Import toast from sonner

interface ApiResponse {
  message: string;
}

interface CreateSprintProps {
  project_id: number;
  onSprintCreated?: () => void;
  onClose?: () => void;
}

// Define form schema with validation
const formSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

const CreateSprint = ({ project_id, onSprintCreated, onClose }: CreateSprintProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserContext();
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      start_date: "",
      end_date: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setResponseMessage(null);
    const userlocal = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const parsedUser = userlocal ? JSON.parse(userlocal) : null;
      const userId = user?.id ? user?.id:parsedUser?.id;
    try {
      const payload = {
        project_id,
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        user_id:userId,
      };
      
      console.log("Payload:", payload);
      
      const response = await fetch("https://collabsphere-d7g1.onrender.com/project/create_sprint", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Check specifically for the permission error
        if (response.status === 403 && data.error === "Only an admin or mod can create a sprint.") {
          // Show the error in a sonner toast
          toast.error("Permission denied: Only an admin or moderator can create a sprint");
          // Also set the local error state
          setError("Permission denied: Only an admin or moderator can create a sprint");
        } else {
          throw new Error(data.error || `HTTP error! Status: ${response.status}`);
        }
        return;
      }

      setResponseMessage(data);
      console.log("Server Response:", data);

      // Show success toast
      toast.success("Sprint created successfully!");

      // Reset form on success
      form.reset();
      
      // Call callback if provided
      if (onSprintCreated) {
        onSprintCreated();
      }
      
      // Close the form dialog if onClose is provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setError(errorMessage);
      console.error("Error creating sprint:", error);
      
      // Show generic error toast
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min values
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {responseMessage && !error && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {responseMessage.message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sprint Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sprint 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    min={today} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    min={form.watch("start_date") || today} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Sprint"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateSprint;