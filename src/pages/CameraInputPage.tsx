import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { dbApi } from '@/db/api';
import type { DimensionDetectionResult } from '@/types/types';

export default function CameraInputPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedDimensions, setDetectedDimensions] = useState<DimensionDetectionResult | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [manualWidth, setManualWidth] = useState('');
  const [manualHeight, setManualHeight] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsUsingCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
      processImage(imageData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageBase64: string) => {
    setIsProcessing(true);
    try {
      // Extract base64 data without prefix
      const base64Data = imageBase64.split(',')[1];

      // Call dimension detection edge function
      const { data, error } = await supabase.functions.invoke('dimension-detection', {
        body: { imageBase64: base64Data },
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error?.message || 'Dimension detection failed');
      }

      setDetectedDimensions(data);

      if (data.confidence < 0.5) {
        toast({
          title: 'Low Confidence',
          description: 'AI detection has low confidence. Please verify or enter dimensions manually.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Dimensions Detected',
          description: `Width: ${data.width_mm}mm, Height: ${data.height_mm}mm`,
        });
      }

      // Set manual fields with detected values
      setManualWidth(data.width_mm.toString());
      setManualHeight(data.height_mm.toString());

    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Processing Error',
        description: 'Could not detect dimensions. Please enter manually.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDetail = async () => {
    if (!projectId) return;

    const width = Number.parseInt(manualWidth);
    const height = Number.parseInt(manualHeight);

    if (!width || !height || width <= 0 || height <= 0) {
      toast({
        title: 'Invalid Dimensions',
        description: 'Please enter valid width and height values.',
        variant: 'destructive',
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Quantity must be at least 1.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dbApi.addDetail({
        project_id: projectId,
        width_mm: width,
        height_mm: height,
        quantity,
        input_method: 'camera',
        image_url: capturedImage || undefined,
      });

      toast({
        title: 'Detail Added',
        description: 'Furniture detail saved successfully.',
      });

      // Navigate to optimization
      navigate(`/optimize/${projectId}`);
    } catch (error) {
      toast({
        title: 'Save Error',
        description: 'Failed to save detail. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Camera Input</h1>
            <p className="text-muted-foreground mt-2">
              Capture a photo of your furniture detail with a reference object (like A4 paper) for accurate dimension detection.
            </p>
          </div>

          {/* Camera/Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Capture Image</CardTitle>
              <CardDescription>
                Use your camera or upload an existing photo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!capturedImage && !isUsingCamera && (
                <div className="flex gap-4">
                  <Button onClick={startCamera} className="gap-2">
                    <Camera className="h-4 w-4" />
                    Open Camera
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {isUsingCamera && (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border border-border"
                  />
                  <div className="flex gap-4">
                    <Button onClick={capturePhoto} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-4">
                  <img
                    src={capturedImage}
                    alt="Captured furniture detail"
                    className="w-full rounded-lg border border-border"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCapturedImage(null);
                      setDetectedDimensions(null);
                      setManualWidth('');
                      setManualHeight('');
                    }}
                  >
                    Retake Photo
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing image with AI...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dimensions Section */}
          {capturedImage && !isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Dimensions</CardTitle>
                <CardDescription>
                  Verify or adjust the detected dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {detectedDimensions && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      AI Confidence: {Math.round((detectedDimensions.confidence || 0) * 100)}%
                    </p>
                    {detectedDimensions.has_reference && (
                      <p className="text-sm text-primary">
                        ✓ Reference object detected
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (mm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={manualWidth}
                      onChange={(e) => setManualWidth(e.target.value)}
                      placeholder="Enter width"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (mm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={manualHeight}
                      onChange={(e) => setManualHeight(e.target.value)}
                      placeholder="Enter height"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveDetail} className="w-full gap-2">
                  Continue to Optimization
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
