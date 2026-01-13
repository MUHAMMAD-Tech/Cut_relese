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
        title: 'Kamera xatosi',
        description: 'Kameraga kirish imkoni yo\'q. Iltimos, ruxsatlarni tekshiring.',
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
        console.error('Edge function xatosi:', errorMsg || error?.message);
        throw new Error(errorMsg || error?.message || 'O\'lchamlarni aniqlashda xatolik');
      }

      console.log('AI javobi:', data);
      setDetectedDimensions(data);

      // Show detected text if available
      if (data.detected_text) {
        toast({
          title: 'Matn aniqlandi',
          description: `Topilgan matn: ${data.detected_text}`,
        });
      }

      if (data.confidence < 0.5) {
        toast({
          title: 'Past ishonch darajasi',
          description: data.notes || 'AI aniqlash past ishonch darajasiga ega. Iltimos, tekshiring yoki o\'lchamlarni qo\'lda kiriting.',
          variant: 'default',
        });
      } else if (data.width_mm > 0 && data.height_mm > 0) {
        toast({
          title: 'O\'lchamlar aniqlandi',
          description: `Kenglik: ${data.width_mm}mm, Balandlik: ${data.height_mm}mm`,
        });
      } else {
        toast({
          title: 'O\'lchamlar topilmadi',
          description: data.notes || 'Iltimos, o\'lchamlarni qo\'lda kiriting.',
          variant: 'default',
        });
      }

      // Set manual fields with detected values
      if (data.width_mm > 0) setManualWidth(data.width_mm.toString());
      if (data.height_mm > 0) setManualHeight(data.height_mm.toString());

    } catch (error) {
      console.error('Rasmni qayta ishlashda xatolik:', error);
      toast({
        title: 'Qayta ishlash xatosi',
        description: 'O\'lchamlarni aniqlab bo\'lmadi. Iltimos, qo\'lda kiriting.',
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
        title: 'Noto\'g\'ri o\'lchamlar',
        description: 'Iltimos, to\'g\'ri kenglik va balandlik qiymatlarini kiriting.',
        variant: 'destructive',
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: 'Noto\'g\'ri miqdor',
        description: 'Miqdor kamida 1 bo\'lishi kerak.',
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
        title: 'Detal qo\'shildi',
        description: 'Mebel detali muvaffaqiyatli saqlandi.',
      });

      // Navigate to optimization
      navigate(`/optimize/${projectId}`);
    } catch (error) {
      toast({
        title: 'Saqlash xatosi',
        description: 'Detalni saqlab bo\'lmadi. Iltimos, qayta urinib ko\'ring.',
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
            Bosh sahifaga qaytish
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kamera orqali kiritish</h1>
            <p className="text-muted-foreground mt-2">
              Aniq o'lchamlarni aniqlash uchun mebel detalingizning rasmini ma'lumot ob'ekti (masalan, A4 qog'oz) bilan oling.
            </p>
          </div>

          {/* Camera/Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Rasm olish</CardTitle>
              <CardDescription>
                Kamerangizdan foydalaning yoki mavjud rasmni yuklang
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!capturedImage && !isUsingCamera && (
                <div className="flex gap-4">
                  <Button onClick={startCamera} className="gap-2">
                    <Camera className="h-4 w-4" />
                    Kamerani ochish
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Rasm yuklash
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
                      Rasm olish
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-4">
                  <img
                    src={capturedImage}
                    alt="Olingan mebel detali"
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
                    Qayta rasm olish
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI bilan rasmni qayta ishlash...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dimensions Section */}
          {capturedImage && !isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle>Aniqlangan o'lchamlar</CardTitle>
                <CardDescription>
                  Aniqlangan o'lchamlarni tekshiring yoki sozlang
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {detectedDimensions && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      AI ishonch darajasi: {Math.round((detectedDimensions.confidence || 0) * 100)}%
                    </p>
                    {detectedDimensions.has_reference && (
                      <p className="text-sm text-primary">
                        ✓ Ma'lumot ob'ekti aniqlandi
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="width">Kenglik (mm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={manualWidth}
                      onChange={(e) => setManualWidth(e.target.value)}
                      placeholder="Kenglikni kiriting"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Balandlik (mm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={manualHeight}
                      onChange={(e) => setManualHeight(e.target.value)}
                      placeholder="Balandlikni kiriting"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Miqdor</Label>
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
                  Optimallashtirishga o'tish
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
