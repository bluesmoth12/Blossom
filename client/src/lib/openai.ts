import { apiRequest } from "./queryClient";

// Image analysis - skin condition
export async function analyzeSkinImage(base64Image: string): Promise<{
  skinCondition: string;
  recommendations: string[];
  concerns: string[];
  progress?: string;
}> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/analyze-skin",
      { image: base64Image }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing skin image:", error);
    throw new Error("Failed to analyze skin image. Please try again later.");
  }
}

// Get skin analysis history
export async function getSkinAnalysisHistory(): Promise<any[]> {
  try {
    const response = await fetch("/api/skin-analysis-history", {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch skin analysis history");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching skin analysis history:", error);
    throw error;
  }
}
