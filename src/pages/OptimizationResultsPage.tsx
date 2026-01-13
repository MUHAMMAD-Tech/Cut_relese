import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Loader2, FileText, Table2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dbApi } from '@/db/api';
import { optimizeCutting } from '@/services/optimizationService';
import { supabase } from '@/db/supabase';
import type { Material, CuttingDetail, OptimizationResult as OptResult } from '@/types/types';

export default function OptimizationResultsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [details, setDetails] = useState<CuttingDetail[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uzbekExplanation, setUzbekExplanation] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      const [materialsData, detailsData] = await Promise.all([
        dbApi.getMaterials(),
        dbApi.getProjectDetails(projectId),
      ]);

      setMaterials(materialsData);
      setDetails(detailsData);

      // Auto-select first material
      if (materialsData.length > 0 && !selectedMaterialId) {
        setSelectedMaterialId(materialsData[0].id);
      }

      // Check if optimization already exists
      const existingResult = await dbApi.getOptimizationResult(projectId);
      if (existingResult) {
        setOptimizationResult(existingResult);
        setUzbekExplanation(existingResult.uzbek_explanation || '');
        // Render the layout
        setTimeout(() => renderLayout(existingResult), 100);
      }
    } catch (error) {
      toast({
        title: 'Load Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const runOptimization = async () => {
    if (!projectId || !selectedMaterialId || details.length === 0) {
      toast({
        title: 'Missing Data',
        description: 'Please ensure material is selected and details are added.',
        variant: 'destructive',
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const material = materials.find(m => m.id === selectedMaterialId);
      if (!material) throw new Error('Material not found');

      // Run optimization
      const result = optimizeCutting({
        details: details.map(d => ({
          width_mm: d.width_mm,
          height_mm: d.height_mm,
          quantity: d.quantity,
        })),
        material,
        kerf_mm: 3,
      });

      // Get Uzbek explanation
      const { data: explanationData, error: explanationError } = await supabase.functions.invoke(
        'optimization-explanation',
        {
          body: {
            materialName: material.name,
            sheetsRequired: result.sheetsRequired,
            wastePercentage: result.wastePercentage,
            detailsCount: details.length,
            totalDetailsCount: details.reduce((sum, d) => sum + d.quantity, 0),
          },
        }
      );

      if (explanationError) {
        console.error('Explanation error:', explanationError);
      }

      const explanation = explanationData?.explanation || '';
      setUzbekExplanation(explanation);

      // Save to database
      const savedResult = await dbApi.saveOptimizationResult({
        project_id: projectId,
        material_id: selectedMaterialId,
        sheets_required: result.sheetsRequired,
        waste_percentage: result.wastePercentage,
        used_percentage: result.usedPercentage,
        layout_data: { sheets: result.sheets },
        uzbek_explanation: explanation,
        kerf_mm: 3,
      });

      setOptimizationResult(savedResult);

      toast({
        title: 'Optimization Complete',
        description: `${result.sheetsRequired} sheet(s) required with ${result.wastePercentage.toFixed(1)}% waste.`,
      });

      // Render layout
      setTimeout(() => renderLayout(savedResult), 100);
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: 'Optimization Error',
        description: 'Failed to optimize cutting layout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderLayout = (result: OptResult) => {
    const canvas = canvasRef.current;
    if (!canvas || !result.layout_data?.sheets) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sheets = result.layout_data.sheets;
    if (sheets.length === 0) return;

    const sheet = sheets[0]; // Render first sheet
    const material = sheet.material;

    // Scale to fit canvas
    const padding = 40;
    const scale = Math.min(
      (canvas.width - padding * 2) / material.width_mm,
      (canvas.height - padding * 2) / material.height_mm
    );

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sheet background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(
      padding,
      padding,
      material.width_mm * scale,
      material.height_mm * scale
    );

    // Draw sheet border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      padding,
      padding,
      material.width_mm * scale,
      material.height_mm * scale
    );

    // Draw placed details
    sheet.placedDetails.forEach((detail, index) => {
      const x = padding + detail.x * scale;
      const y = padding + detail.y * scale;
      const w = detail.width * scale;
      const h = detail.height * scale;

      // Fill detail
      ctx.fillStyle = index % 2 === 0 ? '#4ade80' : '#60a5fa';
      ctx.fillRect(x, y, w, h);

      // Border
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = `${detail.width}×${detail.height}`;
      ctx.fillText(label, x + w / 2, y + h / 2);
    });

    // Draw waste areas
    sheet.wasteAreas.forEach((waste) => {
      const x = padding + waste.x * scale;
      const y = padding + waste.y * scale;
      const w = waste.width * scale;
      const h = waste.height * scale;

      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(x, y, w, h);
    });

    // Draw dimensions
    ctx.fillStyle = '#666666';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${material.width_mm} mm`,
      padding + (material.width_mm * scale) / 2,
      padding - 10
    );
    ctx.save();
    ctx.translate(padding - 20, padding + (material.height_mm * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${material.height_mm} mm`, 0, 0);
    ctx.restore();
  };

  const exportToPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a link to download the canvas as image
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cutting-layout-${projectId}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });

    toast({
      title: 'Export Complete',
      description: 'Layout exported as PNG image.',
    });
  };

  const exportToExcel = () => {
    if (!optimizationResult) return;

    // Create CSV content
    let csv = 'Detail,Width (mm),Height (mm),Quantity\n';
    details.forEach((detail, index) => {
      csv += `Detail ${index + 1},${detail.width_mm},${detail.height_mm},${detail.quantity}\n`;
    });
    csv += `\nMaterial,${materials.find(m => m.id === selectedMaterialId)?.name}\n`;
    csv += `Sheets Required,${optimizationResult.sheets_required}\n`;
    csv += `Waste Percentage,${optimizationResult.waste_percentage}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cut-list-${projectId}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Cut list exported as CSV file.',
    });
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
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Optimization Results</h1>
            <p className="text-muted-foreground mt-2">
              Review your cutting layout and export the results
            </p>
          </div>

          {/* Material Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Material Selection</CardTitle>
              <CardDescription>Choose the material sheet for optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Material Sheet</Label>
                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} ({material.width_mm}×{material.height_mm} mm)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={runOptimization}
                disabled={isOptimizing || !selectedMaterialId}
                className="w-full"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  'Run Optimization'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {optimizationResult && (
            <>
              {/* Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Sheets Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                      {optimizationResult.sheets_required}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Waste Percentage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive">
                      {optimizationResult.waste_percentage.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Used Percentage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {optimizationResult.used_percentage.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Explanation */}
              {uzbekExplanation && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Explanation (Uzbek)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">{uzbekExplanation}</p>
                  </CardContent>
                </Card>
              )}

              {/* Cutting Layout */}
              <Card>
                <CardHeader>
                  <CardTitle>Cutting Layout</CardTitle>
                  <CardDescription>Visual representation of the first sheet</CardDescription>
                </CardHeader>
                <CardContent>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full border border-border rounded-lg"
                  />
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Download your cutting layout and cut list</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button onClick={exportToPDF} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Layout (PNG)
                  </Button>
                  <Button onClick={exportToExcel} variant="outline" className="gap-2">
                    <Table2 className="h-4 w-4" />
                    Export Cut List (CSV)
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
