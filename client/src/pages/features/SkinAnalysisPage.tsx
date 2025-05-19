import { useState, useRef, useEffect } from "react";
import { Camera, Upload, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSkinAnalysisHistory } from "@/lib/openai";
import { analyzeSkinWithOpenCV, loadOpenCVScript, type SkinAnalysisResult } from "@/lib/opencv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Webcam from "react-webcam";

interface AnalysisResult {
  id: number;
  date: string;
  image: string;
  summary: string;
  details?: string;
}

export default function SkinAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<SkinAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load OpenCV.js
  useEffect(() => {
    loadOpenCVScript()
      .then(() => {
        setIsOpenCVLoaded(true);
        console.log("OpenCV.js loaded successfully");
      })
      .catch((error) => {
        console.error("Failed to load OpenCV.js:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load OpenCV.js. Some features may not work correctly.",
        });
      });
  }, [toast]);

  // Fetch analysis history
  const { data: analysisHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/skin-analysis-history'],
    staleTime: 60000, // 1 minute
  });

  // Mutation for uploading and analyzing image
  const analysisMutation = useMutation({
    mutationFn: async (imageData: string) => {
      try {
        // Send the full image data to the server
        const response = await apiRequest(
          "POST",
          "/api/analyze-skin",
          { image: imageData }
        );
        
        return response.json();
      } catch (error) {
        console.error("API request failed:", error);
        // Fallback to local OpenCV analysis if server request fails
        return analyzeSkinWithOpenCV(imageData);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis complete!",
        description: "Your skin analysis is ready to view.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skin-analysis-history'] });
      setSelectedImage(null);
      setUseWebcam(false);
      
      // Display results
      setAnalysisResults(data);
      setShowResults(true);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze skin image. Please try again.",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setUseWebcam(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleWebcamCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelectedImage(imageSrc);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);
      // Use the full selectedImage data (including data URL prefix)
      // The server will handle extracting the base64 portion
      await analysisMutation.mutateAsync(selectedImage);
    } catch (error) {
      console.error("Error during analysis:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-20 pb-24 px-4">
      <Header title="Computer Vision Skin Analysis" />
      
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <p className="text-neutral-dark mb-4">
                Upload a selfie or use your camera to get personalized insights about your skin's health using advanced computer vision technology.
              </p>
              
              <div className="flex justify-center">
                <div className="relative">
                  {useWebcam ? (
                    <div className="w-64 h-64 mx-auto mb-4 rounded-2xl overflow-hidden">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          width: 320,
                          height: 320,
                          facingMode: "user"
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : selectedImage ? (
                    <div className="w-64 h-64 mx-auto mb-4 rounded-2xl overflow-hidden">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div 
                      className="w-64 h-64 mx-auto mb-4 rounded-2xl border-2 border-dashed border-neutral-medium bg-neutral-lightest flex flex-col items-center justify-center cursor-pointer hover:border-primary transition duration-200"
                      onClick={handleUploadClick}
                    >
                      <Camera className="w-10 h-10 text-neutral-dark mb-3" />
                      <p className="text-neutral-dark">Tap to take or upload a photo</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="user"
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {selectedImage ? (
                  <Button 
                    onClick={handleAnalyzeClick}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition duration-200"
                    disabled={isUploading || analysisMutation.isPending || !isOpenCVLoaded}
                  >
                    {(isUploading || analysisMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analyze Skin
                      </>
                    )}
                  </Button>
                ) : useWebcam ? (
                  <Button 
                    onClick={handleWebcamCapture}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition duration-200"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleUploadClick}
                      className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition duration-200"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <Button 
                      onClick={() => setUseWebcam(true)}
                      className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-full transition duration-200"
                      variant="outline"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Use Camera
                    </Button>
                  </>
                )}
                
                {(useWebcam || selectedImage) && (
                  <Button 
                    onClick={() => {
                      setSelectedImage(null);
                      setUseWebcam(false);
                    }}
                    variant="outline"
                    className="px-6 py-3 border border-neutral-medium text-neutral-dark hover:bg-neutral-light font-medium rounded-full transition duration-200"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              {!isOpenCVLoaded && (
                <div className="mt-3 text-sm text-amber-600 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading OpenCV.js...
                </div>
              )}
            </div>
            
            <div className="border-t border-neutral-light pt-6">
              <h3 className="font-heading font-semibold text-lg text-primary mb-3">For best results:</h3>
              <ul className="space-y-2 text-neutral-dark">
                <li className="flex items-start">
                  <CheckCircle className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Take your photo in natural light</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Remove makeup and cleanse your face</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Capture your full face, looking straight at the camera</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-secondary mt-1 mr-2 h-5 w-5" />
                  <span>Ensure even lighting with no harsh shadows</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Analysis Results */}
        {showResults && analysisResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">Your Skin Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-lightest rounded-lg">
                  <h3 className="font-medium text-lg text-primary mb-2">Skin Condition</h3>
                  <p className="text-neutral-dark">{analysisResults.skinCondition}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-lightest rounded-lg">
                    <h3 className="font-medium text-lg text-primary mb-2">Concerns</h3>
                    <ul className="space-y-2">
                      {analysisResults.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-error mr-2">•</span>
                          <span className="text-neutral-dark">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-neutral-lightest rounded-lg">
                    <h3 className="font-medium text-lg text-primary mb-2">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisResults.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-secondary mr-2">•</span>
                          <span className="text-neutral-dark">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {analysisResults.progress && (
                  <div className="p-4 bg-neutral-lightest rounded-lg">
                    <h3 className="font-medium text-lg text-primary mb-2">Progress</h3>
                    <p className="text-neutral-dark">{analysisResults.progress}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowResults(false)} 
                  className="mr-2"
                >
                  Close
                </Button>
                <Button onClick={() => window.print()}>Save Results</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Analysis History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Your Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analysisHistory.length > 0 ? (
              <div className="overflow-x-auto hide-scrollbar">
                <div className="inline-flex space-x-4 pb-4 w-max">
                  {analysisHistory.map((analysis: AnalysisResult) => (
                    <div key={analysis.id} className="w-48 rounded-xl overflow-hidden shadow-soft bg-neutral-lightest">
                      <div className="h-32 bg-neutral-light relative">
                        <img src={analysis.image} className="w-full h-full object-cover" alt="Previous skin analysis" />
                        <div className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-primary">
                          {new Date(analysis.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-medium text-primary">{analysis.summary}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full py-8 text-center">
                <div className="text-4xl text-neutral-medium mb-3">📷</div>
                <p className="text-neutral-dark">Your past analyses will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
