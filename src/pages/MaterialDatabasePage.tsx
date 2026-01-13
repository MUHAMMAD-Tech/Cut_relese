import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { dbApi } from '@/db/api';
import type { Material } from '@/types/types';

export default function MaterialDatabasePage() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await dbApi.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setIsLoading(false);
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
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Material Database</h1>
            <p className="text-muted-foreground mt-2">
              Available material sheets for cutting optimization
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Materials</CardTitle>
              <CardDescription>
                Pre-configured material sheets with standard dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading materials...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Width (mm)</TableHead>
                      <TableHead>Height (mm)</TableHead>
                      <TableHead>Thickness (mm)</TableHead>
                      <TableHead>Area (m²)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.material_type}</TableCell>
                        <TableCell>{material.width_mm}</TableCell>
                        <TableCell>{material.height_mm}</TableCell>
                        <TableCell>{material.thickness_mm}</TableCell>
                        <TableCell>
                          {((material.width_mm * material.height_mm) / 1000000).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Material Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">LSP (Laminated Sheet Panel)</h4>
                <p className="text-sm text-muted-foreground">
                  High-quality laminated panels suitable for furniture manufacturing. Available in two standard sizes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">AKL (Acrylic Laminate)</h4>
                <p className="text-sm text-muted-foreground">
                  Durable acrylic laminate sheets ideal for modern furniture designs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">DVP (Hardboard)</h4>
                <p className="text-sm text-muted-foreground">
                  Thin hardboard panels perfect for backing and drawer bottoms.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
