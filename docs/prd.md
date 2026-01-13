# AI Smart Cut Optimizer (SketchCut AI) Requirements Document\n
## 1. Application Overview

### 1.1 Application Name
AI Smart Cut Optimizer (SketchCut AI)

### 1.2 Application Description
An AI-powered cutting optimization system designed for furniture manufacturing workshops. The system enables users to capture furniture detail photos via camera, automatically detect dimensions using AI, calculate quantities, match details to material sheets, generate cutting optimization layouts, and display graphical cutting plans with full Uzbek language support. The system prioritizes zero unnecessary waste and professional-grade nesting optimization.

### 1.3 Target Users
Furniture manufacturing workshop operators, carpenters, and production managers in Uzbekistan and surrounding regions.
\n### 1.4 Supported Languages
- Primary: Uzbek
- Additional: Russian, English (optional)

---

## 2. Core Features

### 2.1 Input Module (Camera + Manual)
\n#### A) Camera Mode
- Open device camera interface
- Capture photo of rectangular furniture detail\n- AI edge and corner detection\n- Real dimension calculation using calibration (A4 paper or reference object)
- Output dimensions in cm or mm format
- Example output: Length 30 cm, Width 120 cm

#### B) Manual Mode
- Manual input fields for:
  - Length
  - Width
  - Quantity
- Example: 30 x 120 = 2 pieces

### 2.2 Material Sheet Database

Pre-configured material sheets:
1. LSP: 1800mm x 2750mm x 1.6mm
2. LSP: 2070mm x 2800mm x 1.6mm\n3. AKL: 1220mm x 2800mm x 1.6mm
4. DVP: 1700mm x 2750mm x 0.5mm

Functionality:
- AI automatic sheet selection based on optimization
- Waste minimization algorithm
- Manual sheet override option

### 2.3 Cutting Optimization Engine

#### Core Optimization Logic (CRITICAL REQUIREMENTS)
\n**Priority 1: Single Sheet Optimization (Zero Unnecessary Waste)**
- If multiple different-sized details can fit into ONE sheet, they MUST be placed into the SAME sheet\n- Do NOT split details into multiple sheets if they can fit together
- Do NOT create waste if free space can be used
- Always try to fill remaining space with smaller details
\n**Priority 2: Smart Space Filling (Anti-Waste Logic)**
- After placing large details, scan remaining free zones
- Try to place smaller details in remaining space
- Rotate details if needed for better fit
- Use guillotine-style cuts for efficient nesting
- Waste is allowed ONLY if no remaining detail fits in any orientation

**Priority 3: Validation Before Final Output**
Before generating final layout, system must verify:
- Can all details fit into fewer sheets?
- Is there unused space that can hold another detail?\n- Are dimensions written in correct orientation?
- Does every detail have a unique number?
- If validation fails, recalculate layout automatically

Calculations:
- Number of sheets required
- Waste percentage
- Used area percentage
- Kerf (cut width) consideration (default 3mm)

Algorithm approach:
- Nesting / Guillotine / Genetic optimization
- Rectangular packing problem solving
- Professional CAD/CAM nesting optimization similar to SketchCut Pro\n
### 2.4 Graphical Cutting Layout\n
#### Visual Output Features\n- Sheet displayed as background rectangle\n- Each detail positioned and labeled with:
  - Unique detail number (D1, D2, D3, etc.)
  - Width x Height dimensions
  - Quantity identifier
- Waste areas highlighted in distinct color

#### Color Scheme (SketchCut Professional Style)
- Sheet: Light gray\n- Details: Green / Blue\n- Waste: Light red (minimal)
- Borders: Black
- Clear readable labels

#### Text Orientation Rules (CRITICAL)
- Length value must be written ALONG the length direction
- Width value must be written ALONG the width direction
- Text inside each detail MUST follow real orientation\n- Do NOT rotate text incorrectly
- Do NOT flip dimensions
- Format inside detail: [Detail №] Length × Width
- Example: D1 – 700 × 450

#### Detail Numbering (MANDATORY)
- Each detail MUST have a unique number
- Format: [Detail №] Length × Width
- Numbering order: Top to bottom, Left to right
- Example: D1, D2, D3, D4...

#### Interaction Features
- Zoomable layout view
- Export to PNG / PDF
- Print-ready format
- Production-ready for furniture workshops

### 2.5 AI Explanation (Uzbek Language)

AI-generated explanations in clear Uzbek:
- Simple, professional tone
- Workshop-friendly language
- Example: \"Bu detal LSP 1800x2750 listiga joylashtirildi. 2 dona detal uchun 1 dona list yetarli. Chiqindi miqdori 12%. Kesish sxemasi yuqorida ko'rsatilgan.\"

### 2.6 Export Features

Supported export formats:
- PDF cutting layout
- Excel Cut List
- DXF file for CNC machines

---

## 3. User Workflow

Step-by-step process:
1. Input selection: Camera or manual entry
2. Material sheet selection\n3. Optimization calculation with validation
4. Visual result display with correct labeling
5. Export options\n
---

## 4. Technical Requirements

### 4.1 Frontend Technology
- Framework: React or Vue
- Camera API integration
- Canvas / SVG rendering for layout visualization

### 4.2 Backend Technology\n- Python (FastAPI)
- OpenCV for image processing
- Professional nesting optimization module (SketchCut-level quality)

### 4.3 AI Components
- YOLO / Edge detection for shape recognition
- Calibration model for real-world scale conversion
- Language model for Uzbek explanation generation

---
\n## 5. UX Requirements

- Simple, intuitive interface
- Large, touch-friendly buttons
- Mobile-responsive design
- Uzbek language as default
- Clear step-by-step workflow guidance
- Production-ready and scalable architecture
- Professional SketchCut-style visual output

---\n
## 6. Optimization Quality Standards

### 6.1 Zero Unnecessary Waste Priority
- System must prioritize single-sheet placement when possible
- Multi-detail combinations must be tested before splitting into multiple sheets
- Remaining space must be utilized for smaller details

### 6.2 Correct Visual Labeling
- All dimensions must follow correct orientation
- All details must have unique sequential numbers
- Text must be readable and professionally formatted
\n### 6.3 Validation Requirements
- Automatic pre-output validation\n- Recalculation if optimization can be improved
- Professional CAD/CAM quality output
\n---

## 7. Additional Notes

- System must function as a complete alternative to SketchCut Pro\n- Enhanced with AI vision capabilities\n- Full Uzbek language support throughout
- Suitable for furniture manufacturing workshop environments
- Scalable for future feature expansion
- Professional-grade nesting optimization with zero tolerance for unnecessary waste