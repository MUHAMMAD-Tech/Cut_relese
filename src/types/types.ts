export interface Material {
  id: string;
  name: string;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  material_type: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  created_at?: string;
}

export interface CuttingProject {
  id: string;
  project_name: string;
  created_at: string;
  updated_at: string;
}

export interface CuttingDetail {
  id: string;
  project_id: string;
  width_mm: number;
  height_mm: number;
  quantity: number;
  input_method: 'camera' | 'manual';
  image_url?: string;
  created_at: string;
}

export interface PlacedDetail {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  detailIndex: number;
  quantity: number;
  detailNumber?: number;
  color?: string;
}

export interface SheetLayout {
  sheetIndex: number;
  material: Material;
  placedDetails: PlacedDetail[];
  wasteAreas: { x: number; y: number; width: number; height: number }[];
  sizeColorMap?: Record<string, string>;
}

export interface OptimizationResult {
  id: string;
  project_id: string;
  material_id: string;
  sheets_required: number;
  waste_percentage: number;
  used_percentage: number;
  layout_data: {
    sheets: SheetLayout[];
  };
  uzbek_explanation?: string;
  kerf_mm: number;
  created_at: string;
}

export interface DimensionDetectionResult {
  width_mm: number;
  height_mm: number;
  confidence: number;
  has_reference: boolean;
  error?: string;
}

export interface OptimizationInput {
  details: Array<{
    width_mm: number;
    height_mm: number;
    quantity: number;
  }>;
  material: Material;
  kerf_mm: number;
}
