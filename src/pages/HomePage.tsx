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
        title: 'Error',
        description: 'Failed to create project. Please try again.',
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
              Welcome to AI Smart Cut Optimizer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimize your furniture cutting layouts with AI-powered dimension detection and intelligent material usage calculation.
            </p>
          </div>

          {/* Input Method Selection */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !isCreating && createNewProject('camera')}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Camera className="h-6 w-6" />
                </div>
                <CardTitle>Camera Input</CardTitle>
                <CardDescription>
                  Capture furniture detail photos and let AI detect dimensions automatically
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
                  Start with Camera
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !isCreating && createNewProject('manual')}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50 text-secondary-foreground mb-4">
                  <Edit3 className="h-6 w-6" />
                </div>
                <CardTitle>Manual Input</CardTitle>
                <CardDescription>
                  Enter dimensions manually for quick and precise cutting optimization
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
                  Start Manual Entry
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">AI Dimension Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatic edge and corner detection with calibration support
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Smart Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Minimize waste with intelligent cutting layout algorithms
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Visual Layouts</h4>
                    <p className="text-sm text-muted-foreground">
                      Clear graphical cutting plans with dimensions and labels
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Multiple Export Formats</h4>
                    <p className="text-sm text-muted-foreground">
                      Export to PDF, Excel, and DXF for CNC machines
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
              View Material Database
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
