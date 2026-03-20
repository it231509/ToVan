import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";

@Injectable()
export class RecipesService {
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

  async findAll(userId: string, householdId: string) {
    await this.validateMembership(userId, householdId);

    const { data, error } = await this.supabaseService.client
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .eq('household_id', householdId);

    if (error) throw error;
    return data;
  }

  async findOne(id: string, userId: string, householdId: string) {
    await this.validateMembership(userId, householdId);

    const { data, error } = await this.supabaseService.client
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .eq('id', id)
      .eq('household_id', householdId)
      .single();

    if (error || !data) throw new NotFoundException('Rezept nicht gefunden oder keine Zugriffsberechtigung');
    return data;
  }

  async create(recipeData: any, userId: string, householdId: string) {
    await this.validateMembership(userId, householdId);
    
    const { ingredients, steps, ...mainData } = recipeData;

    const { data: recipe, error: recipeError } = await this.supabaseService.client
      .from('recipes')
      .insert([{ ...mainData, household_id: householdId, user_id: userId }]) 
      .select()
      .single();

    if (recipeError) throw new BadRequestException(`Rezept-Fehler: ${recipeError.message}`);

    if (ingredients && ingredients.length > 0) {
      const ingredientsWithId = ingredients.map(ing => ({
        ingredient_name: ing.ingredient_name || ing.name,
        amount: ing.amount || ing.menge,
        unit: ing.unit || 'Stück',
        recipe_id: recipe.id
      }));

      await this.supabaseService.client.from('recipe_ingredients').insert(ingredientsWithId);
    }

    if (steps && steps.length > 0) {
      const stepsWithId = steps.map((step, index) => ({
        step_description: step.step_description || step.description || step,
        step_order: step.step_order || index + 1,
        step_number: step.step_order || index + 1,
        recipe_id: recipe.id
      }));

      const { error: stepsError } = await this.supabaseService.client
        .from('recipe_steps')
        .insert(stepsWithId);

      if (stepsError) {
        console.error("SUPABASE STEPS ERROR:", stepsError);
        throw new BadRequestException(`Schritte-Fehler: ${stepsError.message}`);
      }
    }

    return this.findOne(recipe.id, userId, householdId);
  }

  async update(id: string, updateData: any, userId: string, householdId: string) {
    await this.validateMembership(userId, householdId);
    
    const { ingredients, steps, ...mainData } = updateData;

    const { error: updateError } = await this.supabaseService.client
      .from('recipes')
      .update(mainData)
      .eq('id', id)
      .eq('household_id', householdId);

    if (updateError) throw new BadRequestException('Update fehlgeschlagen');

    if (ingredients) {
      await this.supabaseService.client.from('recipe_ingredients').delete().eq('recipe_id', id);
      const ingredientsWithId = ingredients.map(ing => ({
        ingredient_name: ing.ingredient_name,
        amount: ing.amount,
        unit: ing.unit,
        recipe_id: id
      }));
      await this.supabaseService.client.from('recipe_ingredients').insert(ingredientsWithId);
    }

    if (steps) {
      await this.supabaseService.client.from('recipe_steps').delete().eq('recipe_id', id);
      const stepsWithId = steps.map(step => ({
        step_description: step.step_description,
        step_order: step.step_order,
        step_number: step.step_order,
        recipe_id: id
      }));
      await this.supabaseService.client.from('recipe_steps').insert(stepsWithId);
    }

    return this.findOne(id, userId, householdId);
  }

  async remove(id: string, userId: string, householdId: string) {
    await this.validateMembership(userId, householdId);

    const { error } = await this.supabaseService.client
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    return { deleted: true };
  }
}