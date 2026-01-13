import type { Material, OptimizationInput, SheetLayout, PlacedDetail } from '@/types/types';

interface Rectangle {
  width: number;
  height: number;
  quantity: number;
  id: string;
  originalIndex: number;
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
  detailNumber: number;
}

interface FreeSpace {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Professional CAD/CAM Nesting Optimization Engine
 * ZERO unnecessary waste - SketchCut Pro style
 */
export class CuttingOptimizer {
  private kerf: number;
  private detailCounter: number = 1;

  constructor(kerf: number = 3) {
    this.kerf = kerf;
  }

  /**
   * Main optimization function with anti-waste logic
   */
  optimize(input: OptimizationInput): {
    sheets: SheetLayout[];
    sheetsRequired: number;
    wastePercentage: number;
    usedPercentage: number;
  } {
    const { details, material, kerf_mm } = input;
    this.kerf = kerf_mm;
    this.detailCounter = 1;

    // Expand details by quantity and keep original index
    const rectangles: Rectangle[] = [];
    details.forEach((detail, index) => {
      for (let i = 0; i < detail.quantity; i++) {
        rectangles.push({
          width: detail.width_mm,
          height: detail.height_mm,
          quantity: 1,
          id: `D${this.detailCounter++}`,
          originalIndex: index,
        });
      }
    });

    // Sort by area (largest first) for optimal packing
    rectangles.sort((a, b) => b.width * b.height - a.width * a.height);

    const sheets: SheetLayout[] = [];
    let remainingRects = [...rectangles];
    let sheetIndex = 0;

    // CRITICAL: Pack all details with ZERO unnecessary waste
    while (remainingRects.length > 0) {
      const { placements, packed } = this.packSheet(
        remainingRects,
        material.width_mm,
        material.height_mm
      );

      if (placements.length > 0) {
        sheets.push(this.createSheetLayout(placements, material, sheetIndex));
        sheetIndex++;
        
        // Remove packed rectangles
        remainingRects = remainingRects.filter(r => !packed.includes(r.id));
      } else {
        // Force place at least one rectangle if nothing fits
        if (remainingRects.length > 0) {
          const rect = remainingRects[0];
          const placement = this.forcePlaceRectangle(rect, material.width_mm, material.height_mm);
          if (placement) {
            sheets.push(this.createSheetLayout([placement], material, sheetIndex));
            sheetIndex++;
            remainingRects.shift();
          } else {
            break; // Cannot fit even one rectangle
          }
        }
      }
    }

    const sheetsRequired = sheets.length;
    const totalSheetArea = sheetsRequired * material.width_mm * material.height_mm;
    const usedArea = rectangles.reduce((sum, r) => sum + r.width * r.height, 0);
    const wastePercentage = totalSheetArea > 0 ? ((totalSheetArea - usedArea) / totalSheetArea) * 100 : 0;
    const usedPercentage = totalSheetArea > 0 ? (usedArea / totalSheetArea) * 100 : 0;

    return {
      sheets,
      sheetsRequired,
      wastePercentage: Math.round(wastePercentage * 100) / 100,
      usedPercentage: Math.round(usedPercentage * 100) / 100,
    };
  }

  /**
   * Pack as many rectangles as possible into a single sheet
   * ANTI-WASTE LOGIC: Fill all available space
   */
  private packSheet(
    rectangles: Rectangle[],
    sheetWidth: number,
    sheetHeight: number
  ): { placements: Placement[]; packed: string[] } {
    const placements: Placement[] = [];
    const packed: string[] = [];
    const freeSpaces: FreeSpace[] = [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }];

    // Try to place each rectangle
    for (const rect of rectangles) {
      if (packed.includes(rect.id)) continue;

      // Try to fit in existing free spaces
      let placed = false;
      for (let i = 0; i < freeSpaces.length; i++) {
        const space = freeSpaces[i];
        const placement = this.tryPlaceInSpace(rect, space);

        if (placement) {
          placements.push(placement);
          packed.push(rect.id);
          
          // Update free spaces (guillotine split)
          freeSpaces.splice(i, 1);
          const newSpaces = this.splitSpace(space, placement);
          freeSpaces.push(...newSpaces);
          
          // Sort free spaces by area (largest first)
          freeSpaces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
          
          placed = true;
          break;
        }
      }

      if (!placed) {
        // Try to place in any remaining free space with rotation
        for (let i = 0; i < freeSpaces.length; i++) {
          const space = freeSpaces[i];
          const rotatedRect = { ...rect, width: rect.height, height: rect.width };
          const placement = this.tryPlaceInSpace(rotatedRect, space, true);

          if (placement) {
            placements.push(placement);
            packed.push(rect.id);
            
            freeSpaces.splice(i, 1);
            const newSpaces = this.splitSpace(space, placement);
            freeSpaces.push(...newSpaces);
            freeSpaces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
            
            break;
          }
        }
      }
    }

    return { placements, packed };
  }

  /**
   * Try to place rectangle in a free space
   */
  private tryPlaceInSpace(
    rect: Rectangle,
    space: FreeSpace,
    rotated: boolean = false
  ): Placement | null {
    const w = rect.width + this.kerf;
    const h = rect.height + this.kerf;

    if (w <= space.width && h <= space.height) {
      return {
        x: space.x,
        y: space.y,
        width: rect.width,
        height: rect.height,
        rotated,
        detailIndex: rect.originalIndex,
        quantity: rect.quantity,
        id: rect.id,
        detailNumber: Number.parseInt(rect.id.substring(1)),
      };
    }

    return null;
  }

  /**
   * Split free space after placing a rectangle (guillotine method)
   */
  private splitSpace(space: FreeSpace, placement: Placement): FreeSpace[] {
    const newSpaces: FreeSpace[] = [];
    const w = placement.width + this.kerf;
    const h = placement.height + this.kerf;

    // Right space
    if (space.x + w < space.x + space.width) {
      newSpaces.push({
        x: space.x + w,
        y: space.y,
        width: space.width - w,
        height: space.height,
      });
    }

    // Bottom space
    if (space.y + h < space.y + space.height) {
      newSpaces.push({
        x: space.x,
        y: space.y + h,
        width: w,
        height: space.height - h,
      });
    }

    return newSpaces;
  }

  /**
   * Force place a rectangle (for oversized details)
   */
  private forcePlaceRectangle(
    rect: Rectangle,
    sheetWidth: number,
    sheetHeight: number
  ): Placement | null {
    // Try normal orientation
    if (rect.width <= sheetWidth && rect.height <= sheetHeight) {
      return {
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
        rotated: false,
        detailIndex: rect.originalIndex,
        quantity: rect.quantity,
        id: rect.id,
        detailNumber: Number.parseInt(rect.id.substring(1)),
      };
    }

    // Try rotated
    if (rect.height <= sheetWidth && rect.width <= sheetHeight) {
      return {
        x: 0,
        y: 0,
        width: rect.height,
        height: rect.width,
        rotated: true,
        detailIndex: rect.originalIndex,
        quantity: rect.quantity,
        id: rect.id,
        detailNumber: Number.parseInt(rect.id.substring(1)),
      };
    }

    return null;
  }

  /**
   * Create sheet layout with waste areas and color grouping
   */
  private createSheetLayout(
    placements: Placement[],
    material: Material,
    sheetIndex: number
  ): SheetLayout {
    // Group placements by dimensions for color assignment
    const sizeGroups = new Map<string, Placement[]>();
    
    for (const p of placements) {
      // Create size key (normalize to always use smaller dimension first for consistency)
      const sizeKey = `${Math.min(p.width, p.height)}x${Math.max(p.width, p.height)}`;
      if (!sizeGroups.has(sizeKey)) {
        sizeGroups.set(sizeKey, []);
      }
      sizeGroups.get(sizeKey)!.push(p);
    }

    // Assign colors to size groups
    const colors = [
      '#4ade80', // green
      '#60a5fa', // blue
      '#fbbf24', // yellow
      '#f472b6', // pink
      '#a78bfa', // purple
      '#fb923c', // orange
      '#34d399', // emerald
      '#38bdf8', // sky
    ];

    const sizeColorMap = new Map<string, string>();
    let colorIndex = 0;
    for (const sizeKey of sizeGroups.keys()) {
      sizeColorMap.set(sizeKey, colors[colorIndex % colors.length]);
      colorIndex++;
    }

    const placedDetails: PlacedDetail[] = placements.map((p) => {
      const sizeKey = `${Math.min(p.width, p.height)}x${Math.max(p.width, p.height)}`;
      return {
        id: p.id,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        rotated: p.rotated,
        detailIndex: p.detailIndex,
        quantity: p.quantity,
        detailNumber: p.detailNumber,
        color: sizeColorMap.get(sizeKey),
      };
    });

    // Calculate waste areas
    const wasteAreas: { x: number; y: number; width: number; height: number }[] = [];
    
    // Find maximum extents
    let maxX = 0;
    let maxY = 0;
    for (const p of placements) {
      maxX = Math.max(maxX, p.x + p.width + this.kerf);
      maxY = Math.max(maxY, p.y + p.height + this.kerf);
    }

    // Add waste area for unused space
    if (maxX < material.width_mm) {
      wasteAreas.push({
        x: maxX,
        y: 0,
        width: material.width_mm - maxX,
        height: material.height_mm,
      });
    }

    if (maxY < material.height_mm) {
      wasteAreas.push({
        x: 0,
        y: maxY,
        width: maxX,
        height: material.height_mm - maxY,
      });
    }

    return {
      sheetIndex,
      material,
      placedDetails,
      wasteAreas,
      sizeColorMap: Object.fromEntries(sizeColorMap),
    };
  }
}

export const optimizeCutting = (input: OptimizationInput) => {
  const optimizer = new CuttingOptimizer(input.kerf_mm);
  return optimizer.optimize(input);
};
