-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  width_mm INTEGER NOT NULL,
  height_mm INTEGER NOT NULL,
  thickness_mm NUMERIC(5,2) NOT NULL,
  material_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cutting_projects table
CREATE TABLE IF NOT EXISTS cutting_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cutting_details table
CREATE TABLE IF NOT EXISTS cutting_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES cutting_projects(id) ON DELETE CASCADE,
  width_mm INTEGER NOT NULL,
  height_mm INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  input_method TEXT NOT NULL CHECK (input_method IN ('camera', 'manual')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create optimization_results table
CREATE TABLE IF NOT EXISTS optimization_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES cutting_projects(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  sheets_required INTEGER NOT NULL,
  waste_percentage NUMERIC(5,2) NOT NULL,
  used_percentage NUMERIC(5,2) NOT NULL,
  layout_data JSONB NOT NULL,
  uzbek_explanation TEXT,
  kerf_mm INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default material sheets
INSERT INTO materials (name, width_mm, height_mm, thickness_mm, material_type) VALUES
  ('LSP 1800x2750', 1800, 2750, 1.6, 'LSP'),
  ('LSP 2070x2800', 2070, 2800, 1.6, 'LSP'),
  ('AKL 1220x2800', 1220, 2800, 1.6, 'AKL'),
  ('DVP 1700x2750', 1700, 2750, 0.5, 'DVP')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cutting_details_project_id ON cutting_details(project_id);
CREATE INDEX IF NOT EXISTS idx_optimization_results_project_id ON optimization_results(project_id);

-- Enable RLS (but allow public access for now since no auth)
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutting_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutting_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on materials" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert on cutting_projects" ON cutting_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on cutting_projects" ON cutting_projects FOR SELECT USING (true);
CREATE POLICY "Allow public update on cutting_projects" ON cutting_projects FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on cutting_details" ON cutting_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on cutting_details" ON cutting_details FOR SELECT USING (true);
CREATE POLICY "Allow public insert on optimization_results" ON optimization_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on optimization_results" ON optimization_results FOR SELECT USING (true);