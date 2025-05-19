import { apiRequest } from "./queryClient";

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Login user
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data = await response.json();
  return data;
}

// Register user
export async function registerUser(userData: SignupData): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  const data = await response.json();
  return data;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/current-user", {
      credentials: "include",
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to fetch current user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout", {});
}
