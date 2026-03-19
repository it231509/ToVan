import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MealPlanService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async getHouseholdIdForUser(userId: string): Promise<string> {
    const { data, error } = await this.supabaseService.client
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new ForbiddenException('User gehört zu keinem Haushalt');
    return data.household_id;
  }

  async getPlanForRange(userId: string, startDate: string, endDate: string) {
    const householdId = await this.getHouseholdIdForUser(userId);

    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .select(`
        *,
        recipe:recipes (
          title,
          protein_per_serving        
        )
      `)
      .eq('household_id', householdId)
      .gte('plan_date', startDate)
      .lte('plan_date', endDate)
      .order('plan_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  async addMeal(userId: string, mealData: any) {
    const householdId = await this.getHouseholdIdForUser(userId);

    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .insert([{ ...mealData, household_id: householdId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMeal(userId: string, id: string, updateData: any) {
    const householdId = await this.getHouseholdIdForUser(userId);

    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .update(updateData)
      .eq('id', id)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeMeal(userId: string, id: string) {
    const householdId = await this.getHouseholdIdForUser(userId);

    const { error } = await this.supabaseService.client
      .from('meal_plan')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    return { deleted: true };
  }
}