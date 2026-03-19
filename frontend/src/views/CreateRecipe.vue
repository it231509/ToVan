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
        steps: [{ instruction: '', step_number: 1 }]
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
      this.recipe.steps.push({ instruction: '', step_number: nextOrder });
    },
    removeStep(index) {
      if (this.recipe.steps.length > 1) {
        this.recipe.steps.splice(index, 1);
        this.recipe.steps.forEach((step, i) => step.step_number = i + 1);
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
  <div class="lg:container mx-auto p-0 lg:p-8 max-w-4xl">
    <h1 class="lg:text-4xl text-3xl font-black text-slate-800 mb-8">Neues Rezept erstellen</h1>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control md:col-span-2 flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-slate-500">Titel</label>
          <input v-model="recipe.title" type="text" class="input input-bordered rounded-xl" style="width: 100%;" required />
        </div>

        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-slate-500">Portionen</label>
          <input v-model.number="recipe.servings" type="number" class="input input-bordered rounded-xl" style="width: 100%;" />
        </div>
        
        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-slate-500">Protein / Port.</label>
          <input v-model.number="recipe.protein_per_serving" type="number" class="input input-bordered rounded-xl" style="width: 100%;" />
        </div>

        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <label class="label font-bold text-slate-500">Dauer (Min)</label>
          <input v-model.number="recipe.prep_time" type="number" class="input input-bordered rounded-xl" style="width: 100%;" />
        </div>
      </div>

      
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl">Zutaten</h3>
          <button type="button" @click="addIngredient" class="btn btn-sm btn-circle btn-primary text-white">+</button>
        </div>
        
        <div v-for="(ing, index) in recipe.ingredients" :key="index" class="flex gap-2 mb-2">
          <input v-model="ing.amount" placeholder="Menge" class="input input-bordered w-24 rounded-xl" />
          <input v-model="ing.unit" placeholder="Einheit" class="input input-bordered w-24 rounded-xl" />
          <input v-model="ing.ingredient_name" placeholder="Zutat" class="input input-bordered flex-grow rounded-xl" required />
          <button v-if="recipe.ingredients.length > 1" @click="removeIngredient(index)" type="button" class="btn btn-ghost btn-sm text-error">✕</button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl">Zubereitung</h3>
          <button type="button" @click="addStep" class="btn btn-sm btn-circle btn-primary text-white">+</button>
        </div>
        
        <div v-for="(step, index) in recipe.steps" :key="index" class="flex gap-4 mb-4">
          <div class="font-black text-primary pt-3">{{ step.step_number }}.</div>
          <textarea v-model="step.instruction" class="textarea textarea-bordered flex-grow rounded-xl" required></textarea>
          <button v-if="recipe.steps.length > 1" @click="removeStep(index)" type="button" class="btn btn-ghost btn-sm text-error">✕</button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-full rounded-2xl text-white font-black" :disabled="loading">
        {{ loading ? 'Speichert...' : 'Rezept Erstellen' }}
      </button>
    </form>
  </div>
</template>