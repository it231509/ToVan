<script>
import { getRecipeById, updateRecipe } from '@/http';
import { supabase } from '@/supabase';

export default {
  name: 'EditRecipe',
  data() {
    return {
      recipe: {
        title: '',
        description: '',
        protein_per_serving: '',
        servings: '',
        prep_time: '',
        image_url: '',
        ingredients: [],
        steps: []
      },
      uploading: false,
      imagePreview: null,
      loading: false,
      fetching: true, 
      error: null
    };
  },

  async mounted() {
    await this.fetchRecipeData();
  },

  methods: {
    async fetchRecipeData() {
      const id = this.$route.params.id;
      try {
        const data = await getRecipeById(id);
        
        this.recipe = {
          ...data,
          ingredients: data.recipe_ingredients || data.ingredients || [],
          steps: data.recipe_steps || data.steps || []
        };

        this.recipe.steps = this.recipe.steps.map(step => ({
          ...step,
          step_description: step.step_description || step.instruction || ''
        }));

        if (this.recipe.image_url) {
          this.imagePreview = this.recipe.image_url;
        }
      } catch (e) {
        this.error = "Fehler beim Laden des Rezepts.";
        console.error(e);
      } finally {
        this.fetching = false;
      }
    },

    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.imagePreview = URL.createObjectURL(file);
      this.uploading = true;
      this.error = null;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(filePath);

        this.recipe.image_url = publicUrl;
      } catch (e) {
        this.error = "Bild-Upload fehlgeschlagen: " + e.message;
      } finally {
        this.uploading = false;
      }
    },

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
  if (this.uploading) return;
  this.loading = true;
  this.error = null;

  try {
    const id = this.$route.params.id;

    const cleanData = {
      title: this.recipe.title,
      description: this.recipe.description || '',
      protein_per_serving: Number(this.recipe.protein_per_serving) || 0,
      servings: Number(this.recipe.servings) || 1,
      prep_time: Number(this.recipe.prep_time) || 0,
      image_url: this.recipe.image_url || null,
      ingredients: this.recipe.ingredients.map(ing => ({
        ingredient_name: ing.ingredient_name,
        amount: ing.amount,
        unit: ing.unit
      })),
      steps: this.recipe.steps.map((s, index) => ({
        step_description: s.step_description,
        step_order: index + 1
      }))
    };

    console.log("Sende saubere Daten:", cleanData);

    await updateRecipe(id, cleanData);
    this.$router.push(`/recipe/${id}`);
  } catch (e) {
    this.error = e.response?.data?.message || e.message || "Update fehlgeschlagen";
    console.error("Vollständiger Fehler-Response:", e.response?.data);
  } finally {
    this.loading = false;
  }
}
  }
};
</script>

<template>
  <div class="lg:container mx-auto p-0 lg:p-8 max-w-4xl transition-colors duration-300">
    
    <div v-if="fetching" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-ring loading-lg text-primary"></span>
        <p class="mt-4 font-bold text-base-content/40 uppercase tracking-widest text-xs">Rezept wird geladen...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-8 px-0 lg:px-0 mt-3">
      
      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300 mb-5">
        <h3 class="font-bold text-xl text-base-content mb-4">Rezept-Bild ändern</h3>
        
        <div class="relative group flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl p-4 bg-base-200 hover:border-primary transition-all cursor-pointer h-52 overflow-hidden">
          <input type="file" accept="image/*" @change="handleImageUpload" class="absolute inset-0 opacity-0 cursor-pointer z-10" />

          <div v-if="!imagePreview" class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-xs font-bold text-base-content/40 mt-2 uppercase tracking-widest">Neues Bild hochladen</p>
          </div>

          <img v-else :src="imagePreview" class="absolute inset-0 w-full h-full object-cover" />

          <div v-if="uploading" class="absolute inset-0 bg-base-100/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <span class="loading loading-spinner text-primary"></span>
          </div>
        </div>
      </div>

      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300 grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
        <h3 class="font-bold text-xl text-base-content mb-2">Basisdaten</h3>
        <div class="form-control md:col-span-2">
          <input v-model="recipe.title" placeholder="Titel" type="text" class="input input-bordered rounded-xl bg-base-200 border-base-300 focus:border-primary w-full" required />
        </div>
        <div class="form-control">
          <input v-model.number="recipe.servings" placeholder="Portionen" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full" />
        </div>
        <div class="form-control">
          <input v-model.number="recipe.protein_per_serving" placeholder="Protein / Port." type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full" />
        </div>
        <div class="form-control md:col-span-2">
          <input v-model.number="recipe.prep_time" placeholder="Dauer (Min)" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full mb-1" />
        </div>
      </div>

      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300 mb-5">
        <div class="mb-4">
          <h3 class="font-bold text-xl text-base-content">Zutaten</h3>
        </div>
        <div v-for="(ing, index) in recipe.ingredients" :key="index" class="flex flex-wrap md:flex-nowrap gap-2 mb-5">
          <input v-model="ing.amount" placeholder="Menge" class="input input-bordered w-full md:w-24 rounded-xl bg-base-200 border-base-300" />
          <input v-model="ing.unit" placeholder="Einheit" class="input input-bordered w-full md:w-24 rounded-xl bg-base-200 border-base-300" />
          <input v-model="ing.ingredient_name" placeholder="Zutat" class="input input-bordered flex-grow rounded-xl bg-base-200 border-base-300" required />
          <div class="w-full flex justify-center gap-2">
            <button v-if="recipe.ingredients.length > 1" @click="removeIngredient(index)" type="button" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">-</button>
            <button v-if="index === recipe.ingredients.length - 1" type="button" @click="addIngredient" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">+</button>
          </div>
        </div>
      </div>

      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300 mb-5">
        <div class="mb-4">
          <h3 class="font-bold text-xl text-base-content">Zubereitung</h3>
        </div>
        <div v-for="(step, index) in recipe.steps" :key="index" class="flex flex-wrap md:flex-nowrap gap-2 mb-5">
          <textarea v-model="step.step_description" :placeholder="'Schritt '+step.step_order" class="textarea textarea-bordered flex-grow rounded-xl bg-base-200 border-base-300 focus:border-primary min-h-[100px]" required></textarea>
          <div class="w-full flex justify-center gap-2">
            <button v-if="recipe.steps.length > 1" @click="removeStep(index)" type="button" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">-</button>
            <button v-if="index === recipe.steps.length - 1" type="button" @click="addStep" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">+</button>
          </div>
        </div>
      </div>

      <div>
        <button type="submit" class="btn btn-primary w-full rounded-2xl text-white font-black shadow-lg" :disabled="loading || uploading">
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? 'Änderungen speichern...' : 'Rezept aktualisieren' }}
        </button>
        <button type="button" @click="$router.back()" class="btn btn-ghost w-full mt-4 text-base-content/40">Abbrechen</button>
        <p v-if="error" class="text-error text-center mt-4 font-bold bg-error/10 py-2 rounded-xl border border-error/20">{{ error }}</p>
      </div>
    </form>
  </div>
</template>