import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ShoppingListService {
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

  async getList(userId: string, householdId: string) {
    await this.validateMembership(userId, householdId);

    const { data, error } = await this.supabaseService.client
      .from('shopping_list')
      .select('*')
      .eq('household_id', householdId)
      .order('is_checked', { ascending: true })
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async addItem(userId: string, householdId: string, itemData: any) {
    await this.validateMembership(userId, householdId);

    const { data, error } = await this.supabaseService.client
      .from('shopping_list')
      .insert([{ ...itemData, household_id: householdId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleItem(userId: string, householdId: string, id: string, isChecked: boolean) {
    await this.validateMembership(userId, householdId);

    const { data, error } = await this.supabaseService.client
      .from('shopping_list')
      .update({ is_checked: isChecked })
      .eq('id', id)
      .eq('household_id', householdId);
    
    if (error) throw error;
    return data;
  }

  async clearChecked(userId: string, householdId: string) {
    await this.validateMembership(userId, householdId);

    const { error } = await this.supabaseService.client
      .from('shopping_list')
      .delete()
      .eq('household_id', householdId)
      .eq('is_checked', true);

    if (error) throw error;
  }

  async removeItem(userId: string, householdId: string, id: string) {
    await this.validateMembership(userId, householdId);

    const { error } = await this.supabaseService.client
      .from('shopping_list')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    return { deleted: true };
  }

  async generateFromMealPlan(userId: string, householdId: string, startDate: string, endDate: string) {
    await this.validateMembership(userId, householdId);

    const { data: meals, error } = await this.supabaseService.client
      .from('meal_plan')
      .select(`
        recipe:recipes (
          ingredients:recipe_ingredients (*)
        )
      `)
      .eq('household_id', householdId)
      .gte('plan_date', startDate)
      .lte('plan_date', endDate);

    if (error) throw error;

    const ingredientMap = new Map();
    meals.forEach((meal: any) => {
      if (!meal.recipe || !meal.recipe.ingredients) return;
      
      meal.recipe.ingredients.forEach((ing: any) => {
        const key = `${ing.ingredient_name.toLowerCase()}_${ing.unit}`;
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          existing.amount = Number(existing.amount) + Number(ing.amount);
        } else {
          ingredientMap.set(key, {
            item_name: ing.ingredient_name,
            amount: Number(ing.amount),
            unit: ing.unit,
            category: 'Rezept-Zutat',
            household_id: householdId,
            is_checked: false
          });
        }
      });
    });

    const finalItems = Array.from(ingredientMap.values());
    if (finalItems.length === 0) return [];

    const { data, error: insertError } = await this.supabaseService.client
      .from('shopping_list')
      .insert(finalItems)
      .select();

    if (insertError) throw insertError;
    return data;
  }
}