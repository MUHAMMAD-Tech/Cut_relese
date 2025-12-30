# AI Smart Cut Optimizer (SketchCut AI) Requirements Document

## 1. Application Overview

### 1.1 Application Name
AI Smart Cut Optimizer (SketchCut AI)\n
### 1.2 Application Description
An AI-powered cutting optimization system designed for furniture manufacturing workshops. The system enables users to capture furniture detail photos via camera, automatically detect dimensions using AI, calculate quantities, match details to material sheets, generate cutting optimization layouts, and display graphical cutting plans with full Uzbek language support.
\n### 1.3 Target Users
Furniture manufacturing workshop operators, carpenters, and production managers in Uzbekistan and surrounding regions.

### 1.4 Supported Languages
- Primary: Uzbek
- Additional: Russian, English (optional)

---

## 2. Core Features

### 2.1 Input Module (Camera + Manual)
\n#### A) Camera Mode
- Open device camera interface
- Capture photo of rectangular furniture detail
- AI edge and corner detection
- Real dimension calculation using calibration (A4 paper or reference object)
- Output dimensions in cm or mm format
- Example output: Length 30 cm, Width 120 cm

#### B) Manual Mode
- Manual input fields for:\n  - Length
  - Width
  - Quantity\n- Example: 30 x 120 = 2 pieces

### 2.2 Material Sheet Database
\nPre-configured material sheets:\n1. LSP: 1800mm x 2750mm x 1.6mm\n2. LSP: 2070mm x 2800mm x 1.6mm
3. AKL: 1220mm x 2800mm x 1.6mm
4. DVP: 1700mm x 2750mm x 0.5mm

Functionality:
- AI automatic sheet selection based on optimization\n- Waste minimization algorithm
- Manual sheet override option

### 2.3 Cutting Optimization Engine

Core optimization logic:
- Rectangular detail placement within selected sheet
- Automatic rotation for optimal fit
- Kerf (cut width) consideration (default 3mm)
- Layout optimization to minimize waste
\nCalculations:
- Number of sheets required\n- Waste percentage
- Used area percentage

Algorithm approach:
- Nesting / Guillotine / Genetic optimization\n- Rectangular packing problem solving

### 2.4 Graphical Cutting Layout

Visual output features:
- Sheet displayed as background rectangle
- Each detail positioned and labeled with:
  - Width x Height dimensions
  - Quantity identifier
- Waste areas highlighted in distinct color
\nColor scheme:
- Sheet: Light gray
- Details: Green / Blue
- Waste: White or Red

Interaction features:
- Zoomable layout view
- Export to PNG / PDF
- Print-ready format

### 2.5 AI Explanation (Uzbek Language)

AI-generated explanations in clear Uzbek:
- Simple, professional tone
- Workshop-friendly language
- Example: \"Bu detal LSP 1800x2750 listiga joylashtirildi. 2 dona detal uchun 1 dona list yetarli. Chiqindi miqdori 12%. Kesish sxemasi yuqorida ko'rsatilgan.\"

### 2.6 Export Features

Supported export formats:
- PDF cutting layout
- Excel Cut List\n- DXF file for CNC machines

---\n
## 3. User Workflow

Step-by-step process:
1. Input selection: Camera or manual entry
2. Material sheet selection
3. Optimization calculation
4. Visual result display
5. Export options

---

## 4. Technical Requirements

### 4.1 Frontend Technology
- Framework: React or Vue
- Camera API integration
- Canvas / SVG rendering for layout visualization
\n### 4.2 Backend Technology
- Python (FastAPI)\n- OpenCV for image processing
- Nesting optimization module
\n### 4.3 AI Components
- YOLO / Edge detection for shape recognition
- Calibration model for real-world scale conversion
- Language model for Uzbek explanation generation

---

## 5. UX Requirements

- Simple, intuitive interface
- Large, touch-friendly buttons
- Mobile-responsive design
- Uzbek language as default
- Clear step-by-step workflow guidance
- Production-ready and scalable architecture

---
\n## 6. Additional Notes

- System must function as a complete alternative to SketchCut Pro
- Enhanced with AI vision capabilities
- Full Uzbek language support throughout
- Suitable for furniture manufacturing workshop environments
- Scalable for future feature expansion