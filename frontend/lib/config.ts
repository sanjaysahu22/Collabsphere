// Configuration utility for API URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://collabsphere-d7g1.onrender.com';

export const API_ENDPOINTS = {
  VERIFY_GOOGLE: `${API_BASE_URL}/verify/google`,
  VERIFY_USER_ID: `${API_BASE_URL}/verify/user_id`,
  AUTO_LOGIN: `${API_BASE_URL}/auto_login`,
  ADD_TASK: `${API_BASE_URL}/project/edit_tasks/add_task`,
  VIEW_TASKS: `${API_BASE_URL}/project/view_tasks`,
  UPDATE_TASK: `${API_BASE_URL}/project/edit_tasks/update_task`,
  // Add more endpoints as needed
};

export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};