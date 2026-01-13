import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Edit3, History, Scissors } from 'lucide-react';
import { dbApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createNewProject = async (inputMethod: 'camera' | 'manual') => {
    setIsCreating(true);
    try {
      const project = await dbApi.createProject(`Project ${new Date().toLocaleString()}`);
      
      if (inputMethod === 'camera') {
        navigate(`/camera/${project.id}`);
      } else {
        navigate(`/manual/${project.id}`);
      }
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Loyihani yaratib bo\'lmadi. Iltimos, qayta urinib ko\'ring.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SketchCut AI</h1>
              <p className="text-sm text-muted-foreground">AI Smart Cut Optimizer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              AI Smart Cut Optimizer'ga xush kelibsiz
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI yordamida o'lchamlarni aniqlash va aqlli material foydalanish hisoblash bilan mebel kesish sxemalarini optimallashtiring.
            </p>
          </div>

          {/* Input Method Selection */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !isCreating && createNewProject('camera')}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Camera className="h-6 w-6" />
                </div>
                <CardTitle>Kamera orqali kiritish</CardTitle>
                <CardDescription>
                  Mebel detallarining rasmini oling va AI avtomatik ravishda o'lchamlarni aniqlaydi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  disabled={isCreating}
                  onClick={(e) => {
                    e.stopPropagation();
                    createNewProject('camera');
                  }}
                >
                  Kamera bilan boshlash
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !isCreating && createNewProject('manual')}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50 text-secondary-foreground mb-4">
                  <Edit3 className="h-6 w-6" />
                </div>
                <CardTitle>Qo'lda kiritish</CardTitle>
                <CardDescription>
                  Tez va aniq kesish optimallashtiruvi uchun o'lchamlarni qo'lda kiriting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  disabled={isCreating}
                  onClick={(e) => {
                    e.stopPropagation();
                    createNewProject('manual');
                  }}
                >
                  Qo'lda kiritishni boshlash
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle>Asosiy imkoniyatlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">AI o'lcham aniqlash</h4>
                    <p className="text-sm text-muted-foreground">
                      Kalibrlash qo'llab-quvvatlash bilan avtomatik chekka va burchak aniqlash
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Aqlli optimallashtirish</h4>
                    <p className="text-sm text-muted-foreground">
                      Aqlli kesish sxemasi algoritmlari bilan chiqindini kamaytiring
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Vizual sxemalar</h4>
                    <p className="text-sm text-muted-foreground">
                      O'lchamlar va belgilar bilan aniq grafik kesish rejalari
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Ko'p eksport formatlari</h4>
                    <p className="text-sm text-muted-foreground">
                      PNG, CSV formatlarida eksport qiling
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material Database Link */}
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/materials')}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Materiallar bazasini ko'rish
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
