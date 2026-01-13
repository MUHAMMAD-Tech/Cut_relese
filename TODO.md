# Task: Build AI Smart Cut Optimizer (SketchCut AI)

## Plan
- [x] Step 1: Read key configuration files (Completed)
- [x] Step 2: Initialize Supabase database (Completed)
- [x] Step 3: Create Edge Functions for AI services (Completed)
- [x] Step 4: Create type definitions (Completed)
- [x] Step 5: Create optimization service (cutting algorithm) (Completed)
- [x] Step 6: Create pages (Completed)
- [x] Step 7: Create components (Completed - integrated into pages)
- [x] Step 8: Update routing and styling (Completed)
- [x] Step 9: Run lint and fix issues (Completed)
- [x] Step 10: Fix LSP dimensions (1800mm → 1830mm) (Completed)
- [x] Step 11: Display all sheets in optimization results (Completed)
- [x] Step 12: Convert UI to Uzbek language (Completed)
- [x] Step 13: Implement professional CAD/CAM nesting engine (Completed)
- [x] Step 14: Add detail numbering and correct text orientation (Completed)
- [x] Step 15: Implement uniform coloring for same-sized details (Completed)
- [x] Step 16: Simplify dimension labeling (only size, no detail numbers inside) (Completed)
- [x] Step 17: Add color legend for size groups (Completed)
- [x] Step 18: Fix AI camera dimension detection (Completed)
- [x] Step 19: Improve edge function with better prompts and error handling (Completed)
- [x] Step 20: Convert CameraInputPage UI to Uzbek (Completed)

## Professional CAD/CAM Features Implemented
1. **ZERO Unnecessary Waste**: Advanced guillotine packing algorithm fills all available space
2. **Smart Space Filling**: Scans remaining free zones and places smaller details
3. **Correct Text Orientation**: Dimensions displayed in proper orientation (length along length, width along width)
4. **Uniform Coloring**: Same-sized details have the same color (e.g., all 700×450 = green, all 2000×450 = blue)
5. **Simple Dimension Labeling**: Only dimensions shown inside pieces (format: "700 × 450"), no detail numbers
6. **Color Legend**: Visual legend showing color → dimensions mapping
7. **SketchCut Pro Style**: Professional visual layout with proper colors and borders
8. **Anti-Waste Logic**: Multiple details fit into single sheet when possible
9. **Automatic Rotation**: Details rotated automatically for optimal fit
10. **Free Space Management**: Tracks and utilizes all available free spaces

## AI Dimension Detection Improvements
- **Enhanced Prompt**: Uzbek language prompt with detailed instructions for image analysis
- **Text Recognition**: AI can read dimensions from drawings and sketches
- **Better Error Handling**: Comprehensive error messages and debugging information
- **Confidence Scoring**: Shows AI confidence level for detected dimensions
- **Reference Object Detection**: Identifies A4 paper or other reference objects
- **Detected Text Display**: Shows any text or numbers found in the image
- **Fallback to Manual**: Gracefully handles detection failures with manual input option

## Visual Styling Rules
- **Sheet Background**: Light gray (#e5e5e5)
- **Detail Colors**: Assigned by size group (green, blue, yellow, pink, purple, orange, emerald, sky)
- **Waste Areas**: Light red with dashed borders
- **Borders**: Black solid lines
- **Text**: Bold Arial, only dimensions inside pieces
- **Legend**: Color boxes with size labels on the right side

## Optimization Algorithm
- **Method**: Guillotine cutting with free space tracking
- **Sorting**: Largest area first for optimal packing
- **Rotation**: Automatic rotation when beneficial
- **Kerf**: 3mm cutting width consideration
- **Color Assignment**: Normalized size key (smaller dimension first) for consistent grouping
- **Validation**: Ensures minimal waste before finalizing layout
