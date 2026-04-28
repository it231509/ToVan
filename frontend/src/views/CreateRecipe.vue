<script>
import { createRecipe } from '@/http';
import { supabase } from '@/supabase';

export default {
  data() {
    return {
      recipe: {
        title: '',
        description: '',
        protein_per_serving: '',
        servings: '',
        prep_time: '',
        image_url: '',
        ingredients: [{ ingredient_name: '', amount: '', unit: '', is_anti_inflammatory: '' }],
        steps: [{ step_description: '', step_order: 1 }]
      },
      uploading: false,
      imagePreview: null,
      loading: false,
      error: null
    };
  },

  methods: {
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
        this.imagePreview = null;
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

    // In deinen methods unter handleSubmit():
async handleSubmit() {
  if (this.uploading) return;

  this.loading = true;
  this.error = null;

  const recipeToSave = JSON.parse(JSON.stringify(this.recipe));

  if (recipeToSave.protein_per_serving === '' || recipeToSave.protein_per_serving === null) {
    recipeToSave.protein_per_serving = null;
  }

  try {
    await createRecipe(recipeToSave);
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

    <form @submit.prevent="handleSubmit" class="space-y-8 px-0 lg:px-0 mt-3">
      
      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300 mb-5">
        <h3 class="font-bold text-xl text-base-content mb-4">Rezept-Bild</h3>
        
        <div class="relative group flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-2xl p-4 bg-base-200 hover:border-primary transition-all cursor-pointer h-52 overflow-hidden">
          
          <input 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            class="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          <div v-if="!imagePreview" class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-xs font-bold text-base-content/40 mt-2 uppercase tracking-widest">Bild hochladen</p>
          </div>

          <img v-else :src="imagePreview" class="absolute inset-0 w-full h-full object-cover" />

          <div v-if="uploading" class="absolute inset-0 bg-base-100/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <span class="loading loading-spinner text-primary"></span>
            <span class="text-[10px] font-black uppercase mt-2 text-primary">Wird hochgeladen...</span>
          </div>
        </div>
      </div>

      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300 grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
        <h3 class="font-bold text-xl text-base-content mb-2">Basisdaten</h3>

        <div class="form-control md:col-span-2 flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <input v-model="recipe.title" placeholder="Titel" type="text" class="input input-bordered rounded-xl bg-base-200 border-base-300 focus:border-primary w-full" required />
        </div>

        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <input v-model.number="recipe.servings" placeholder="Portionen" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full" />
        </div>
        
        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <input v-model.number="recipe.protein_per_serving" placeholder="Protein / Port. (optional)" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full" />
        </div>

        <div class="form-control flex gap-[0px] md:gap-[16px] flex-col md:flex-row">
          <input v-model.number="recipe.prep_time" placeholder="Dauer (Min)" type="number" class="input input-bordered rounded-xl bg-base-200 border-base-300 w-full mb-1" />
        </div>
      </div>

      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300 mb-5">
        <div class="mb-4">
          <h3 class="font-bold text-xl text-base-content">Zutaten</h3>
        </div>
        <div v-for="(ing, index) in recipe.ingredients" :key="index" class="flex flex-wrap md:flex-nowrap gap-2 mb-5">
          <input v-model="ing.amount" type="number" placeholder="Menge" class="input input-bordered w-full md:w-24 rounded-xl bg-base-200 border-base-300" />
          <input v-model="ing.unit" placeholder="Einheit" class="input input-bordered w-full md:w-24 rounded-xl bg-base-200 border-base-300" />
          <input v-model="ing.ingredient_name" placeholder="Zutat" class="input input-bordered flex-grow rounded-xl bg-base-200 border-base-300" required />
          <div class="w-full flex justify-center gap-2">
            <button v-if="recipe.ingredients.length > 1" @click="removeIngredient(index)" type="button" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">-</button>
            <button v-if="index === recipe.ingredients.length - 1" type="button" @click="addIngredient" class="btn btn-sm btn-circle btn-primary text-white shadow-md shadow-primary/20">+</button>
          </div>
        </div>
      </div>

      <div class="bg-base-100 p-4 rounded-3xl shadow-sm border border-base-300">
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
          {{ loading ? 'Speichert...' : 'Rezept Erstellen' }}
        </button>
        <p v-if="error" class="text-error text-center mt-4 font-bold bg-error/10 py-2 rounded-xl border border-error/20">{{ error }}</p>
      </div>
    </form>
  </div>
</template>