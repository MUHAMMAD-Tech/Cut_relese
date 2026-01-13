import type { Material, OptimizationInput, SheetLayout, PlacedDetail } from '@/types/types';

interface Rectangle {
  width: number;
  height: number;
  quantity: number;
  id: string;
}

interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  detailIndex: number;
  quantity: number;
  id: string;
}

/**
 * Guillotine cutting optimization algorithm
 * Places rectangles on sheets to minimize waste
 */
export class CuttingOptimizer {
  private kerf: number;

  constructor(kerf: number = 3) {
    this.kerf = kerf;
  }

  /**
   * Main optimization function
   */
  optimize(input: OptimizationInput): {
    sheets: SheetLayout[];
    sheetsRequired: number;
    wastePercentage: number;
    usedPercentage: number;
  } {
    const { details, material, kerf_mm } = input;
    this.kerf = kerf_mm;

    // Expand details by quantity
    const rectangles: Rectangle[] = [];
    details.forEach((detail, index) => {
      for (let i = 0; i < detail.quantity; i++) {
        rectangles.push({
          width: detail.width_mm,
          height: detail.height_mm,
          quantity: 1,
          id: `${index}-${i}`,
        });
      }
    });

    // Sort rectangles by area (largest first) for better packing
    rectangles.sort((a, b) => b.width * b.height - a.width * a.height);

    const sheets: SheetLayout[] = [];
    let currentSheet: Placement[] = [];
    let sheetIndex = 0;

    for (const rect of rectangles) {
      const placed = this.placeRectangle(
        rect,
        material.width_mm,
        material.height_mm,
        currentSheet,
        rectangles.indexOf(rect)
      );

      if (placed) {
        currentSheet.push(placed);
      } else {
        // Start new sheet
        if (currentSheet.length > 0) {
          sheets.push(this.createSheetLayout(currentSheet, material, sheetIndex));
          sheetIndex++;
        }
        currentSheet = [];
        const newPlaced = this.placeRectangle(
          rect,
          material.width_mm,
          material.height_mm,
          currentSheet,
          rectangles.indexOf(rect)
        );
        if (newPlaced) {
          currentSheet.push(newPlaced);
        }
      }
    }

    // Add last sheet
    if (currentSheet.length > 0) {
      sheets.push(this.createSheetLayout(currentSheet, material, sheetIndex));
    }

    const sheetsRequired = sheets.length;
    const totalSheetArea = sheetsRequired * material.width_mm * material.height_mm;
    const usedArea = rectangles.reduce((sum, r) => sum + r.width * r.height, 0);
    const wastePercentage = ((totalSheetArea - usedArea) / totalSheetArea) * 100;
    const usedPercentage = (usedArea / totalSheetArea) * 100;

    return {
      sheets,
      sheetsRequired,
      wastePercentage: Math.round(wastePercentage * 100) / 100,
      usedPercentage: Math.round(usedPercentage * 100) / 100,
    };
  }

  /**
   * Try to place a rectangle on the current sheet
   */
  private placeRectangle(
    rect: Rectangle,
    sheetWidth: number,
    sheetHeight: number,
    placements: Placement[],
    detailIndex: number
  ): Placement | null {
    // Try both orientations
    const orientations = [
      { width: rect.width, height: rect.height, rotated: false },
      { width: rect.height, height: rect.width, rotated: true },
    ];

    for (const orientation of orientations) {
      const placement = this.findPosition(
        orientation.width,
        orientation.height,
        sheetWidth,
        sheetHeight,
        placements
      );

      if (placement) {
        return {
          ...placement,
          rotated: orientation.rotated,
          detailIndex,
          quantity: rect.quantity,
          id: rect.id,
        };
      }
    }

    return null;
  }

  /**
   * Find a position for a rectangle using guillotine algorithm
   */
  private findPosition(
    width: number,
    height: number,
    sheetWidth: number,
    sheetHeight: number,
    placements: Placement[]
  ): { x: number; y: number; width: number; height: number } | null {
    // Add kerf to dimensions
    const w = width + this.kerf;
    const h = height + this.kerf;

    // Try to place at origin if empty
    if (placements.length === 0) {
      if (w <= sheetWidth && h <= sheetHeight) {
        return { x: 0, y: 0, width, height };
      }
      return null;
    }

    // Generate candidate positions
    const candidates: { x: number; y: number }[] = [];

    // Try positions next to existing placements
    for (const p of placements) {
      candidates.push({ x: p.x + p.width + this.kerf, y: p.y });
      candidates.push({ x: p.x, y: p.y + p.height + this.kerf });
    }

    // Sort candidates by position (bottom-left first)
    candidates.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    // Try each candidate position
    for (const candidate of candidates) {
      if (
        candidate.x + w <= sheetWidth &&
        candidate.y + h <= sheetHeight &&
        !this.overlaps(candidate.x, candidate.y, w, h, placements)
      ) {
        return { x: candidate.x, y: candidate.y, width, height };
      }
    }

    return null;
  }

  /**
   * Check if a rectangle overlaps with existing placements
   */
  private overlaps(
    x: number,
    y: number,
    width: number,
    height: number,
    placements: Placement[]
  ): boolean {
    for (const p of placements) {
      const pw = p.width + this.kerf;
      const ph = p.height + this.kerf;

      if (
        x < p.x + pw &&
        x + width > p.x &&
        y < p.y + ph &&
        y + height > p.y
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Create sheet layout with waste areas
   */
  private createSheetLayout(
    placements: Placement[],
    material: Material,
    sheetIndex: number
  ): SheetLayout {
    const placedDetails: PlacedDetail[] = placements.map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      rotated: p.rotated,
      detailIndex: p.detailIndex,
      quantity: p.quantity,
    }));

    // Calculate waste areas (simplified - just mark unused space)
    const wasteAreas: { x: number; y: number; width: number; height: number }[] = [];
    
    // Find the bounding box of all placements
    let maxX = 0;
    let maxY = 0;
    for (const p of placements) {
      maxX = Math.max(maxX, p.x + p.width);
      maxY = Math.max(maxY, p.y + p.height);
    }

    // Add waste area if there's unused space
    if (maxX < material.width_mm || maxY < material.height_mm) {
      wasteAreas.push({
        x: maxX,
        y: 0,
        width: material.width_mm - maxX,
        height: material.height_mm,
      });
    }

    return {
      sheetIndex,
      material,
      placedDetails,
      wasteAreas,
    };
  }
}

export const optimizeCutting = (input: OptimizationInput) => {
  const optimizer = new CuttingOptimizer(input.kerf_mm);
  return optimizer.optimize(input);
};
