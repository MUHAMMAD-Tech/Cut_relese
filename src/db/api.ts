import { supabase } from '@/db/supabase';
import type { Material, CuttingProject, CuttingDetail, OptimizationResult } from '@/types/types';

export const dbApi = {
  // Materials
  async getMaterials(): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getMaterialById(id: string): Promise<Material | null> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Projects
  async createProject(projectName: string): Promise<CuttingProject> {
    const { data, error } = await supabase
      .from('cutting_projects')
      .insert({ project_name: projectName })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProject(id: string): Promise<CuttingProject | null> {
    const { data, error } = await supabase
      .from('cutting_projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getProjects(limit = 20): Promise<CuttingProject[]> {
    const { data, error } = await supabase
      .from('cutting_projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // Details
  async addDetail(detail: Omit<CuttingDetail, 'id' | 'created_at'>): Promise<CuttingDetail> {
    const { data, error } = await supabase
      .from('cutting_details')
      .insert(detail)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProjectDetails(projectId: string): Promise<CuttingDetail[]> {
    const { data, error } = await supabase
      .from('cutting_details')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // Optimization Results
  async saveOptimizationResult(
    result: Omit<OptimizationResult, 'id' | 'created_at'>
  ): Promise<OptimizationResult> {
    const { data, error } = await supabase
      .from('optimization_results')
      .insert(result)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOptimizationResult(projectId: string): Promise<OptimizationResult | null> {
    const { data, error } = await supabase
      .from('optimization_results')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
};
