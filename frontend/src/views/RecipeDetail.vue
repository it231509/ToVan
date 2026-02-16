<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRecipeById } from '@/http';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const router = useRouter();
const recipe = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await getRecipeById(props.id);
    recipe.value = response; 
    console.log(recipe);
  } catch (e) {
    console.error('Fehler beim Laden des Rezepts', e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="recipe" class="lg:container mx-auto p-0 lg:p-8 max-w-6xl">
    <button @click="router.back()" class="group flex items-center text-slate-400 hover:text-success mb-8 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Zurück zur Übersicht
    </button>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      <div class="lg:col-span-5 space-y-8">
        <div class="relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" 
            class="w-full h-full object-cover"
          />
          <div class="absolute bottom-6 left-6 right-6">
            <div class="bg-white/90 backdrop-blur-md p-6 rounded-3xl flex justify-around shadow-lg">
              <div class="text-center">
                <p class="text-[10px] uppercase font-bold text-slate-400">Zeit</p>
                <p class="font-bold text-slate-800">{{ recipe.prep_time }} Min.</p>
              </div>
              <div class="w-[1px] bg-slate-200"></div>
              <div class="text-center">
                <p class="text-[10px] uppercase font-bold text-slate-400">Portionen</p>
                <p class="font-bold text-slate-800">{{ recipe.servings }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-50 rounded-[2.5rem] p-8">
          <h3 class="text-lg font-bold text-slate-800 mb-6">Nährwerte <span class="text-slate-400 font-medium">/ Portion</span></h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-slate-600">Protein</span>
                <span class="font-bold text-success">{{ recipe.protein_per_serving }}g</span>
              </div>
              <div class="w-full bg-white rounded-full h-2">
                <div class="bg-success h-2 rounded-full" :style="{ width: `${Math.min((recipe.protein_per_serving / 80) * 100, 100)}%` }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-slate-600">Antientzündlichkeit</span>
                <span class="font-bold text-success">{{ recipe.anti_inflammatory_score }}</span>
              </div>
              <div class="w-full bg-white rounded-full h-2">
                <div class="bg-success h-2 rounded-full" :style="{ width: `${recipe.anti_inflammatory_score * 20}%` }"></div>
              </div>
            </div>
            <!--<div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-2xl">
                <p class="text-[10px] uppercase font-bold text-slate-400">Kohlenhydrate</p>
                <p class="font-bold text-slate-800">{{ recipe.carbs_per_serving }}g</p>
              </div>
              <div class="bg-white p-4 rounded-2xl">
                <p class="text-[10px] uppercase font-bold text-slate-400">Fett</p>
                <p class="font-bold text-slate-800">{{ recipe.fat_per_serving }}g</p>
              </div>
            </div>-->
          </div>
        </div>
      </div>

      <div class="lg:col-span-7 space-y-10">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-4">
            {{ recipe.title }}
          </h1>
          <p class=" text-slate-500 leading-relaxed italic">
            {{ recipe.description }}
          </p>
        </div>

        <section>
          <div class="flex items-center gap-4 mb-6">
            <h3 class="text-xl font-bold text-slate-800">Zutaten</h3>
            <div class="h-[1px] flex-grow bg-slate-100"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="ing in recipe.recipe_ingredients" :key="ing.name" 
                 class="flex items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-success/30 transition-colors">
              <div class="w-2 h-2 rounded-full bg-success/40 mr-3"></div>
              <span class="flex-grow text-slate-700">{{ ing.ingredient_name }}</span>
              <span class="font-bold text-slate-400 text-sm">{{ ing.amount }} {{ ing.unit }}</span>
            </div>
          </div>
        </section>

        <section>
          <div class="flex items-center gap-4 mb-6">
            <h3 class="text-xl font-bold text-slate-800">Zubereitung</h3>
            <div class="h-[1px] flex-grow bg-slate-100"></div>
          </div>
          <div class="space-y-6">
            <div v-for="(step, index) in recipe.recipe_steps" :key="index" class="flex gap-6">
              <div class="flex-none w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success font-black">
                {{ index + 1 }}
              </div>
              <p class="text-slate-600 leading-relaxed pt-2">
                {{ step.instruction }}
              </p>
            </div>
          </div>
        </section>
      </div>

    </div>
  </div>
</template>