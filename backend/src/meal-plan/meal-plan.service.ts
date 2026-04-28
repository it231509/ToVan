import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MealPlanService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async validateMembership(userId: string, householdId: string): Promise<void> {
    if (!householdId) {
      throw new BadRequestException('Keine Haushalts-ID (Header) angegeben');
    }

    const { data, error } = await this.supabaseService.client
      .from('household_members')
      .select('id')
      .eq('user_id', userId)
      .eq('household_id', householdId)
      .maybeSingle();

    if (error || !data) {
      throw new ForbiddenException('Zugriff auf diesen Haushalt verweigert');
    }
  }

  async getPlanForRange(userId: string, householdId: string, startDate: string, endDate: string) {
    await this.validateMembership(userId, householdId);

    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .select(`
        *,
        custom_title,
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

  async addMeal(userId: string, householdId: string, mealData: any) {
    await this.validateMembership(userId, householdId);

    const { data, error } = await this.supabaseService.client
      .from('meal_plan')
      .insert([{ ...mealData, household_id: householdId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMeal(userId: string, householdId: string, id: string, updateData: any) {
    await this.validateMembership(userId, householdId);

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

  async removeMeal(userId: string, householdId: string, id: string) {
    await this.validateMembership(userId, householdId);

    const { error } = await this.supabaseService.client
      .from('meal_plan')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    return { deleted: true };
  }
}