import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RecipesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService.client
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)');

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.client
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Rezept nicht gefunden');
    return data;
  }

  async create(recipeData: any) {
    const { ingredients, steps, ...mainData } = recipeData;

    // Hauptrezept speichern
    const { data: recipe, error: recipeError } = await this.supabaseService.client
      .from('recipes')
      .insert([mainData])
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Zutaten speichern
    if (ingredients && ingredients.length > 0) {
      const ingredientsWithId = ingredients.map(ing => ({ ...ing, recipe_id: recipe.id }));
      await this.supabaseService.client.from('recipe_ingredients').insert(ingredientsWithId);
    }

    // Schritte speichern
    if (steps && steps.length > 0) {
      const stepsWithId = steps.map(step => ({ ...step, recipe_id: recipe.id }));
      await this.supabaseService.client.from('recipe_steps').insert(stepsWithId);
    }

    return this.findOne(recipe.id);
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.client
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { deleted: true };
  }

  async update(id: string, updateData: any) {
    const { ingredients, steps, ...mainData } = updateData;

    await this.supabaseService.client.from('recipes').update(mainData).eq('id', id);

    if (ingredients) {
      await this.supabaseService.client.from('recipe_ingredients').delete().eq('recipe_id', id);
      const ingredientsWithId = ingredients.map(ing => ({ ...ing, recipe_id: id }));
      await this.supabaseService.client.from('recipe_ingredients').insert(ingredientsWithId);
    }

    if (steps) {
      await this.supabaseService.client.from('recipe_steps').delete().eq('recipe_id', id);
      const stepsWithId = steps.map(step => ({ ...step, recipe_id: id }));
      await this.supabaseService.client.from('recipe_steps').insert(stepsWithId);
    }

    return this.findOne(id);
  }
}