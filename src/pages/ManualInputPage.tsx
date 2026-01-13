import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dbApi } from '@/db/api';

interface DetailInput {
  id: string;
  width: string;
  height: string;
  quantity: string;
}

export default function ManualInputPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [details, setDetails] = useState<DetailInput[]>([
    { id: '1', width: '', height: '', quantity: '1' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addDetail = () => {
    setDetails([
      ...details,
      { id: Date.now().toString(), width: '', height: '', quantity: '1' }
    ]);
  };

  const removeDetail = (id: string) => {
    if (details.length === 1) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one detail is required.',
        variant: 'destructive',
      });
      return;
    }
    setDetails(details.filter(d => d.id !== id));
  };

  const updateDetail = (id: string, field: keyof DetailInput, value: string) => {
    setDetails(details.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const validateAndSave = async () => {
    if (!projectId) return;

    // Validate all details
    const validDetails = details.filter(d => {
      const width = Number.parseInt(d.width);
      const height = Number.parseInt(d.height);
      const quantity = Number.parseInt(d.quantity);
      return width > 0 && height > 0 && quantity > 0;
    });

    if (validDetails.length === 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter valid dimensions for at least one detail.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save all details
      for (const detail of validDetails) {
        await dbApi.addDetail({
          project_id: projectId,
          width_mm: Number.parseInt(detail.width),
          height_mm: Number.parseInt(detail.height),
          quantity: Number.parseInt(detail.quantity),
          input_method: 'manual',
        });
      }

      toast({
        title: 'Details Saved',
        description: `${validDetails.length} detail(s) saved successfully.`,
      });

      // Navigate to optimization
      navigate(`/optimize/${projectId}`);
    } catch (error) {
      toast({
        title: 'Save Error',
        description: 'Failed to save details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
            <h1 className="text-3xl font-bold text-foreground">Manual Input</h1>
            <p className="text-muted-foreground mt-2">
              Enter the dimensions of your furniture details manually for quick optimization.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Furniture Details</CardTitle>
              <CardDescription>
                Enter width, height, and quantity for each detail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {details.map((detail, index) => (
                <div key={detail.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Detail {index + 1}</h3>
                    {details.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDetail(detail.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`width-${detail.id}`}>Width (mm)</Label>
                      <Input
                        id={`width-${detail.id}`}
                        type="number"
                        min="1"
                        value={detail.width}
                        onChange={(e) => updateDetail(detail.id, 'width', e.target.value)}
                        placeholder="e.g., 300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`height-${detail.id}`}>Height (mm)</Label>
                      <Input
                        id={`height-${detail.id}`}
                        type="number"
                        min="1"
                        value={detail.height}
                        onChange={(e) => updateDetail(detail.id, 'height', e.target.value)}
                        placeholder="e.g., 1200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${detail.id}`}>Quantity</Label>
                      <Input
                        id={`quantity-${detail.id}`}
                        type="number"
                        min="1"
                        value={detail.quantity}
                        onChange={(e) => updateDetail(detail.id, 'quantity', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {index < details.length - 1 && (
                    <div className="border-b border-border" />
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addDetail}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Detail
              </Button>

              <Button
                onClick={validateAndSave}
                disabled={isSaving}
                className="w-full gap-2"
              >
                {isSaving ? 'Saving...' : 'Continue to Optimization'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Helper Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-foreground mb-2">Tips for Manual Input</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Enter dimensions in millimeters (mm)</li>
                <li>• Width is the shorter dimension, height is the longer dimension</li>
                <li>• Quantity indicates how many pieces of this detail you need</li>
                <li>• You can add multiple different details to optimize together</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
