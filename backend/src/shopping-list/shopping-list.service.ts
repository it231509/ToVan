import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ShoppingListService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getList() {
    const { data, error } = await this.supabaseService.client
      .from('shopping_list')
      .select('*')
      .order('is_checked', { ascending: true }) // Erledigte Sachen nach unten
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async toggleItem(id: string, isChecked: boolean) {
    const { data, error } = await this.supabaseService.client
      .from('shopping_list')
      .update({ is_checked: isChecked })
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  async clearChecked() {
    // Löscht alle bereits gekauften Artikel
    await this.supabaseService.client
      .from('shopping_list')
      .delete()
      .eq('is_checked', true);
  }

  // Ein einzelnes Item hinzufügen
async addItem(itemData: any) {
  const { data, error } = await this.supabaseService.client
    .from('shopping_list')
    .insert([itemData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Ein einzelnes Item löschen
async removeItem(id: string) {
  const { error } = await this.supabaseService.client
    .from('shopping_list')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { deleted: true };
}

async generateFromMealPlan(startDate: string, endDate: string) {
  // 1. Alle Mahlzeiten inklusive Zutaten abrufen
  const { data: meals, error } = await this.supabaseService.client
    .from('meal_plan')
    .select(`
      recipe:recipes (
        ingredients:recipe_ingredients (*)
      )
    `)
    .gte('plan_date', startDate)
    .lte('plan_date', endDate);

  if (error) throw error;

  // 2. Zutaten flachklopfen und zusammenrechnen
  const ingredientMap = new Map();

  meals.forEach((meal: any) => {
    meal.recipe.ingredients.forEach((ing: any) => {
      // Key aus Name und Einheit erstellen (damit 500g und 1 Stück nicht addiert werden)
      const key = `${ing.ingredient_name.toLowerCase()}_${ing.unit}`;
      
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        existing.amount += ing.amount;
      } else {
        ingredientMap.set(key, {
          item_name: ing.ingredient_name,
          amount: ing.amount,
          unit: ing.unit,
          category: 'Rezept-Zutat' 
        });
      }
    });
  });

  // 3. Die berechneten Zutaten in die Shopping-List Tabelle schreiben
  const finalItems = Array.from(ingredientMap.values());
  const { data, error: insertError } = await this.supabaseService.client
    .from('shopping_list')
    .insert(finalItems)
    .select();

  if (insertError) throw insertError;
  return data;
}
}