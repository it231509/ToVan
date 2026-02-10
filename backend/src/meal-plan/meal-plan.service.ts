import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MealPlanService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPlanForRange(startDate: string, endDate: string) {
    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .select(`
        *,
        recipe:recipes (
          title,
          protein_per_serving,
          anti_inflammatory_score
        )
      `)
      .gte('plan_date', startDate)
      .lte('plan_date', endDate)
      .order('plan_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  async addMeal(mealData: any) {
    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .insert([mealData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMeal(id: string, updateData: any) {
    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeMeal(id: string) {
    const { error } = await this.supabaseService.client
      .from('meal_plan')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { deleted: true };
  }
}