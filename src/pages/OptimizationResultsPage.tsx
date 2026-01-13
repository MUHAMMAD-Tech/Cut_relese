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
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

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
        // Render all layouts
        setTimeout(() => {
          if (existingResult.layout_data?.sheets) {
            existingResult.layout_data.sheets.forEach((_, index) => {
              renderLayout(existingResult, index);
            });
          }
        }, 100);
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
        title: 'Optimallashtirish tugallandi',
        description: `${result.sheetsRequired} dona list kerak, chiqindi ${result.wastePercentage.toFixed(1)}%.`,
      });

      // Render all layouts
      setTimeout(() => {
        if (result.sheets) {
          result.sheets.forEach((_, index) => {
            renderLayout(savedResult, index);
          });
        }
      }, 100);
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

  const renderLayout = (result: OptResult, sheetIndex: number) => {
    const canvas = canvasRefs.current[sheetIndex];
    if (!canvas || !result.layout_data?.sheets) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sheets = result.layout_data.sheets;
    if (sheetIndex >= sheets.length) return;

    const sheet = sheets[sheetIndex];
    const material = sheet.material;

    // Scale to fit canvas
    const padding = 80;
    const scale = Math.min(
      (canvas.width - padding * 2) / material.width_mm,
      (canvas.height - padding * 2) / material.height_mm
    );

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sheet background (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      padding,
      padding,
      material.width_mm * scale,
      material.height_mm * scale
    );

    // Draw sheet border (dark gray)
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      padding,
      padding,
      material.width_mm * scale,
      material.height_mm * scale
    );

    // PROFESSIONAL STYLE: Draw placed details with vibrant colors
    sheet.placedDetails.forEach((detail, index) => {
      const x = padding + detail.x * scale;
      const y = padding + detail.y * scale;
      const w = detail.width * scale;
      const h = detail.height * scale;

      // Use assigned vibrant color from size grouping
      ctx.fillStyle = detail.color || '#FFD700';
      ctx.fillRect(x, y, w, h);

      // Add subtle hatching pattern for some pieces (like in reference)
      if (index % 3 === 0) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        const spacing = 8;
        for (let i = -h; i < w; i += spacing) {
          ctx.beginPath();
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i + h, y + h);
          ctx.stroke();
        }
      }

      // Border (dark)
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // PROFESSIONAL LABELING: Detail number and edge dimensions only
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Display dimensions in correct orientation
      const displayWidth = detail.rotated ? detail.height : detail.width;
      const displayHeight = detail.rotated ? detail.width : detail.height;
      
      // Detail identifier (like "Г 1#" in reference)
      const detailNum = detail.detailNumber || (index + 1);
      const detailLabel = `#${detailNum}`;
      
      // Draw detail number at top (smaller)
      ctx.font = 'bold 14px Arial';
      ctx.fillText(detailLabel, x + w / 2, y + 20);

      // Draw dimension values on edges only (no center label)
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#000000';
      
      // Width label at bottom
      ctx.fillText(`${displayWidth}`, x + w / 2, y + h - 10);
      
      // Height label on right side
      ctx.save();
      ctx.translate(x + w - 10, y + h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${displayHeight}`, 0, 0);
      ctx.restore();
    });

    // Draw waste areas (light gray with pattern)
    sheet.wasteAreas.forEach((waste) => {
      const x = padding + waste.x * scale;
      const y = padding + waste.y * scale;
      const w = waste.width * scale;
      const h = waste.height * scale;

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(x, y, w, h);
      
      // Waste border (dashed)
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    });

    // Draw sheet dimensions (outside)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    // Top dimension (width)
    ctx.fillText(
      `${material.width_mm}`,
      padding + (material.width_mm * scale) / 2,
      padding - 30
    );
    
    // Left dimension (height)
    ctx.save();
    ctx.translate(padding - 40, padding + (material.height_mm * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${material.height_mm}`, 0, 0);
    ctx.restore();

    // Sheet title (top left)
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.fillText(
      `List #${sheetIndex + 1} - ${material.name}`,
      padding,
      padding - 50
    );

    // LEGEND: Draw color legend for size groups (right side)
    if (sheet.sizeColorMap) {
      const legendX = padding + material.width_mm * scale + 30;
      let legendY = padding + 20;
      
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.fillText('Ranglar:', legendX, legendY);
      
      legendY += 25;
      ctx.font = '11px Arial';
      
      for (const [sizeKey, color] of Object.entries(sheet.sizeColorMap)) {
        // Draw color box
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY - 12, 25, 18);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(legendX, legendY - 12, 25, 18);
        
        // Draw size label
        ctx.fillStyle = '#000000';
        const [w, h] = sizeKey.split('x');
        ctx.fillText(`${w} × ${h}`, legendX + 35, legendY);
        
        legendY += 25;
      }
    }
  };

  const exportToPDF = () => {
    if (!optimizationResult?.layout_data?.sheets) return;

    // Export all sheets as separate images
    optimizationResult.layout_data.sheets.forEach((_, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kesish-sxemasi-list-${index + 1}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    });

    toast({
      title: 'Eksport tugallandi',
      description: `${optimizationResult.layout_data.sheets.length} dona sxema yuklab olindi.`,
    });
  };

  const exportToExcel = () => {
    if (!optimizationResult) return;

    // Create CSV content in Uzbek
    let csv = 'Detal,Kenglik (mm),Balandlik (mm),Soni\n';
    details.forEach((detail, index) => {
      csv += `Detal ${index + 1},${detail.width_mm},${detail.height_mm},${detail.quantity}\n`;
    });
    csv += `\nMaterial,${materials.find(m => m.id === selectedMaterialId)?.name}\n`;
    csv += `Listlar soni,${optimizationResult.sheets_required}\n`;
    csv += `Chiqindi foizi,${optimizationResult.waste_percentage}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kesish-royxati-${projectId}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Eksport tugallandi',
      description: 'Kesish ro\'yxati CSV fayl sifatida saqlandi.',
    });
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
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Optimallashtirish natijalari</h1>
            <p className="text-muted-foreground mt-2">
              Kesish sxemasini ko'rib chiqing va natijalarni eksport qiling
            </p>
          </div>

          {/* Material Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Material tanlash</CardTitle>
              <CardDescription>Optimallashtirish uchun material listini tanlang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Material listi</Label>
                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Material tanlang" />
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
                    Optimallashtirish...
                  </>
                ) : (
                  'Optimallashtirishni boshlash'
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
                      Kerakli listlar soni
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
                      Chiqindi foizi
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
                      Foydalanilgan foiz
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
                    <CardTitle>AI tushuntirish (O'zbekcha)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">{uzbekExplanation}</p>
                  </CardContent>
                </Card>
              )}

              {/* Cutting Layouts - All Sheets */}
              <Card>
                <CardHeader>
                  <CardTitle>Kesish sxemalari</CardTitle>
                  <CardDescription>
                    Barcha listlar uchun vizual sxemalar ({optimizationResult.layout_data?.sheets?.length || 0} dona list)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {optimizationResult.layout_data?.sheets?.map((sheet, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        List #{index + 1} - {sheet.material.name}
                      </h3>
                      <canvas
                        ref={(el) => {
                          canvasRefs.current[index] = el;
                        }}
                        width={1000}
                        height={700}
                        className="w-full border border-border rounded-lg"
                      />
                      {index < (optimizationResult.layout_data?.sheets?.length || 0) - 1 && (
                        <div className="border-b border-border mt-6" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Eksport qilish</CardTitle>
                  <CardDescription>Kesish sxemasi va ro'yxatini yuklab oling</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button onClick={exportToPDF} className="gap-2">
                    <Download className="h-4 w-4" />
                    Sxemalarni yuklab olish (PNG)
                  </Button>
                  <Button onClick={exportToExcel} variant="outline" className="gap-2">
                    <Table2 className="h-4 w-4" />
                    Ro'yxatni yuklab olish (CSV)
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
