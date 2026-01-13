# AI Smart Cut Optimizer (SketchCut AI) Requirements Document\n
## 1. Application Overview

### 1.1 Application Name
AI Smart Cut Optimizer (SketchCut AI)

### 1.2 Application Description
An AI-powered cutting optimization system designed for furniture manufacturing workshops. The system enables users to capture furniture detail photos via camera, automatically detect dimensions using AI, calculate quantities, match details to material sheets, generate cutting optimization layouts, and display graphical cutting plans with full Uzbek language support. The system prioritizes zero unnecessary waste and professional-grade nesting optimization.

### 1.3 Target Users
Furniture manufacturing workshop operators, carpenters, and production managers in Uzbekistan and surrounding regions.\n\n### 1.4 Supported Languages
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
- If multiple different-sized details can fit into ONE sheet, they MUST be placed into the SAME sheet
- Do NOT split details into multiple sheets if they can fit together
- Do NOT create waste if free space can be used
- Always try to fill remaining space with smaller details

**Priority 2: Smart Space Filling (Anti-Waste Logic)**
- After placing large details, scan remaining free zones
- Try to place smaller details in remaining space
- Rotate details if needed for better fit
- Use guillotine-style cuts for efficient nesting
- Waste is allowed ONLY if no remaining detail fits in any orientation\n
**Priority 3: Validation Before Final Output**
Before generating final layout, system must verify:
- Can all details fit into fewer sheets?
- Is there unused space that can hold another detail?\n- Are dimensions written in correct orientation?
- Does every detail have a unique number (if numbering is used)?
- If validation fails, recalculate layout automatically

Calculations:
- Number of sheets required
- Waste percentage
- Used area percentage\n- Kerf (cut width) consideration (default 3mm)\n
Algorithm approach:
- Nesting / Guillotine / Genetic optimization\n- Rectangular packing problem solving
- Professional CAD/CAM nesting optimization similar to SketchCut Pro

### 2.4 Graphical Cutting Layout

#### Visual Output Features
- Sheet displayed as background rectangle
- Each detail positioned and labeled with dimensions only
- Waste areas highlighted in distinct color

#### Color Scheme (SketchCut Professional Style with Uniform Coloring)
- Sheet: Light gray
- Details: Color-coded by size\n  - Same-sized details MUST have the same color
  - Different sizes get different colors (green, blue, yellow, orange, etc.)
  - Example: All 700×450 pieces → green, All 2000×450 pieces → blue, All 1200×400 pieces → yellow
- Waste: Light red (minimal)\n- Borders: Black
- Clear readable labels

#### Text Orientation Rules (CRITICAL)
- Length value must be written ALONG the length direction
- Width value must be written ALONG the width direction
- Text inside each detail MUST follow real orientation
- Do NOT rotate text incorrectly
- Do NOT flip dimensions\n- Format inside detail: Length × Width (dimensions only, no detail number)
- Example: 700 × 450
\n#### Detail Labeling Rules (MANDATORY)
\n**Inside Each Piece:**
- Show ONLY the dimensions in format: Length × Width
- Use × symbol between dimensions
- No detail numbers inside the graphic area
- No additional text, quantity prefix, or extra symbols
- Examples:
  - ✔ Horizontal detail: 1200 × 400
  - ✔ Vertical detail: 450 × 2000
  - ❌ Do NOT use: 700450, 700 × 450 mm, D1: 700×450
\n**Outside Numbering (Optional):**
- If numbering is required, numbers must be shown outside the pieces
- Next to each piece, with lines connecting to the piece
- Example format:\n  - [1] —— 700 × 450\n  - [2] —— 700 × 450

#### Pre-Output Validation Checklist
Before generating final layout, ensure:\n- Same-size parts have same color
- Only the dimension text is inside each piece
- Orientation of text matches piece orientation
- No extra labels or characters inside pieces
\n#### Interaction Features
- Zoomable layout view
- Export to PNG / PDF
- Print-ready format
- Production-ready for furniture workshops

#### Legend Display
Must include:
- Color → Dimensions mapping
- Outside numbering reference (if used)
- Example:\n  - Green: 700 × 450
  - Blue: 2000 × 450
  - Yellow: 1200 × 400
\n### 2.5 AI Explanation (Uzbek Language)\n
AI-generated explanations in clear Uzbek:
- Simple, professional tone
- Workshop-friendly language
- Example: Bu detal LSP 1800x2750 listiga joylashtirildi. 2 dona detal uchun 1 dona list yetarli. Chiqindi miqdori 12%. Kesish sxemasi yuqorida ko'rsatilgan.

### 2.6 Export Features

Supported export formats:
- PDF cutting layout
- Excel Cut List
- DXF file for CNC machines\n
---

## 3. User Workflow\n
Step-by-step process:
1. Input selection: Camera or manual entry
2. Material sheet selection
3. Optimization calculation with validation
4. Visual result display with correct labeling and color coding
5. Export options

---
\n## 4. Technical Requirements\n
### 4.1 Frontend Technology
- Framework: React or Vue
- Camera API integration
- Canvas / SVG rendering for layout visualization

### 4.2 Backend Technology
- Python (FastAPI)\n- OpenCV for image processing\n- Professional nesting optimization module (SketchCut-level quality)

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
\n---

## 6. Optimization Quality Standards

### 6.1 Zero Unnecessary Waste Priority
- System must prioritize single-sheet placement when possible
- Multi-detail combinations must be tested before splitting into multiple sheets
- Remaining space must be utilized for smaller details

### 6.2 Correct Visual Labeling
- All dimensions must follow correct orientation\n- Same-sized details must have uniform color coding
- Only dimension labels inside pieces (no detail numbers)\n- Text must be readable and professionally formatted

### 6.3 Validation Requirements
- Automatic pre-output validation\n- Recalculation if optimization can be improved
- Professional CAD/CAM quality output\n- Color consistency check for same-sized parts

---
\n## 7. Additional Notes\n
- System must function as a complete alternative to SketchCut Pro
- Enhanced with AI vision capabilities
- Full Uzbek language support throughout
- Suitable for furniture manufacturing workshop environments
- Scalable for future feature expansion
- Professional-grade nesting optimization with zero tolerance for unnecessary waste\n- Uniform color coding for same-sized details to improve visual clarity and production efficiency