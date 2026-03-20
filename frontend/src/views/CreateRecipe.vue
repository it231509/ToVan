<script>
import { createRecipe } from '@/http';

export default {
  data() {
    return {
      recipe: {
        title: '',
        description: '',
        protein_per_serving: 0,
        servings: 0,
        prep_time: 20,
        image_url: '',
        ingredients: [{ ingredient_name: '', amount: '', unit: '', is_anti_inflammatory: '' }],
        steps: [{ step_description: '', step_order: 1 }]
      },
      loading: false,
      error: null
    };
  },

  methods: {
    addIngredient() {
      this.recipe.ingredients.push({ ingredient_name: '', amount: '', unit: '' });
    },
    removeIngredient(index) {
      if (this.recipe.ingredients.length > 1) {
        this.recipe.ingredients.splice(index, 1);
      }
    },
    addStep() {
      const nextOrder = this.recipe.steps.length + 1;
      this.recipe.steps.push({ step_description: '', step_order: nextOrder });
    },
    removeStep(index) {
      if (this.recipe.steps.length > 1) {
        this.recipe.steps.splice(index, 1);
        this.recipe.steps.forEach((step, i) => step.step_order = i + 1);
      }
    },

    async handleSubmit() {
      this.loading = true;
      this.error = null;
      try {
        await createRecipe(this.recipe);
        this.$router.push('/recipes');
      } catch (e) {
        this.error = "Speichern fehlgeschlagen. Überprüfe die Felder.";
        console.error(e);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
  <div class="lg:container mx-auto p-0 lg:p-8 max-w-4xl transition-colors duration-300">
    <h1 class="lg:text-4xl text-3xl font-black text-base-content mb-8 px-4 lg:px-0">Neues Rezept erstellen</h1>

    <form @submit.prevent="handleSubmit" class="space-y-8 px-4 lg:px-0">
      
      <div class="bg-base-100 p-6 rounded-[2rem] shadow-sm border border-base-300 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control md:col-span-2 flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-base-content/60">Titel</label>
          <input v-model="recipe.title" type="text" class="input input-bordered rounded-xl bg-base-200 border-base-300 focus:border-primary w-full" required />
        </div>

        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-base-content/60">Portionen</label>
          <input v-model.number="recipe.servings" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full" />
        </div>
        
        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-base-content/60">Protein / Port.</label>
          <input v-model.number="recipe.protein_per_serving" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full" />
        </div>

        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-base-content/60">Dauer (Min)</label>
          <input v-model.number="recipe.prep_time" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full" />
        </div>
      </div>

      <div class="bg-base-100 p-6 rounded-[2rem] shadow-sm border border-base-300">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl text-base-content">Zutaten</h3>
          <button type="button" @click="addIngredient" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">+</button>
        </div>
        
        <div v-for="(ing, index) in recipe.ingredients" :key="index" class="flex flex-wrap md:flex-nowrap gap-2 mb-3">
          <input v-model="ing.amount" placeholder="Menge" class="input input-bordered w-full md:w-24 rounded-xl bg-base-200 border-base-300" />
          <input v-model="ing.unit" placeholder="Einheit" class="input input-bordered w-full md:w-24 rounded-xl bg-base-200 border-base-300" />
          <input v-model="ing.ingredient_name" placeholder="Zutat" class="input input-bordered flex-grow rounded-xl bg-base-200 border-base-300" required />
          <button v-if="recipe.ingredients.length > 1" @click="removeIngredient(index)" type="button" class="btn btn-ghost btn-sm text-error self-center">✕</button>
        </div>
      </div>

      <div class="bg-base-100 p-6 rounded-[2rem] shadow-sm border border-base-300">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl text-base-content">Zubereitung</h3>
          <button type="button" @click="addStep" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">+</button>
        </div>
        
        <div v-for="(step, index) in recipe.steps" :key="index" class="flex gap-4 mb-4">
          <div class="font-black text-primary pt-3 text-lg">{{ step.step_order }}.</div>
          <textarea v-model="step.step_description" class="textarea textarea-bordered flex-grow rounded-xl bg-base-200 border-base-300 focus:border-primary min-h-[100px]" required></textarea>
          <button v-if="recipe.steps.length > 1" @click="removeStep(index)" type="button" class="btn btn-ghost btn-sm text-error">✕</button>
        </div>
      </div>

      <div class="pb-12">
        <button type="submit" class="btn btn-primary w-full rounded-2xl text-white font-black h-14 shadow-lg shadow-primary/30" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? 'Speichert...' : 'Rezept Erstellen' }}
        </button>
        <p v-if="error" class="text-error text-center mt-4 font-bold bg-error/10 py-2 rounded-xl border border-error/20">{{ error }}</p>
      </div>
    </form>
  </div>
</template>