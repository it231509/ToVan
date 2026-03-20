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
  } catch (e) {
    console.error('Fehler beim Laden des Rezepts', e);
    setTimeout(() => router.push('/recipes'), 2000);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="lg:container mx-auto p-0 lg:p-8 max-w-6xl transition-colors duration-300">
    
    <button @click="router.back()" class="group flex items-center text-base-content/50 hover:text-success mb-8 transition-colors px-4 lg:px-0">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Zurück zur Übersicht
    </button>

    <div v-if="loading" class="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 lg:px-0">
      <div class="lg:col-span-5 space-y-8">
        <div class="h-[400px] bg-base-300 rounded-[3rem]"></div>
        <div class="h-40 bg-base-200 rounded-[2.5rem]"></div>
      </div>
      <div class="lg:col-span-7 space-y-10">
        <div class="h-12 bg-base-300 rounded-xl w-3/4"></div>
        <div class="h-24 bg-base-200 rounded-xl"></div>
      </div>
    </div>

    <div v-else-if="recipe" class="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 lg:px-0">
      
      <div class="lg:col-span-5 space-y-8">
        <div class="relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" 
            class="w-full h-full object-cover"
            alt="Recipe Image"
          />
          <div class="absolute bottom-6 left-6 right-6">
            <div class="bg-base-100/90 backdrop-blur-md p-6 rounded-3xl flex justify-around shadow-lg border border-base-content/5">
              <div class="text-center">
                <p class="text-[10px] uppercase font-bold text-base-content/50">Zeit</p>
                <p class="font-bold text-base-content">{{ recipe.prep_time || '30' }} Min.</p>
              </div>
              <div class="w-[1px] bg-base-content/10"></div>
              <div class="text-center">
                <p class="text-[10px] uppercase font-bold text-base-content/50">Portionen</p>
                <p class="font-bold text-base-content">{{ recipe.servings || '2' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-base-200 rounded-[2.5rem] p-8 border border-base-content/5">
          <h3 class="text-lg font-bold text-base-content mb-6">Nährwerte <span class="text-base-content/40 font-medium">/ Portion</span></h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-base-content/70">Protein</span>
                <span class="font-bold text-success">{{ recipe.protein_per_serving }}g</span>
              </div>
              <div class="w-full bg-base-100 rounded-full h-2">
                <div class="bg-success h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" :style="{ width: `${Math.min((recipe.protein_per_serving / 80) * 100, 100)}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7 space-y-10">
        <div>
          <h1 class="text-3xl font-black text-base-content tracking-tight leading-tight mb-4">
            {{ recipe.title }}
          </h1>
          <p class="text-base-content/60 leading-relaxed italic">
            {{ recipe.description }}
          </p>
        </div>

        <section>
          <div class="flex items-center gap-4 mb-6">
            <h3 class="text-xl font-bold text-base-content">Zutaten</h3>
            <div class="h-[1px] flex-grow bg-base-300/50"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="ing in recipe.recipe_ingredients" :key="ing.id" 
                 class="flex items-center p-4 bg-base-100 border border-base-300 rounded-2xl hover:border-success/30 transition-colors shadow-sm">
              <div class="w-2 h-2 rounded-full bg-success/40 mr-3"></div>
              <span class="flex-grow text-base-content/80">{{ ing.ingredient_name }}</span>
              <span class="font-bold text-base-content/40 text-sm">{{ ing.amount }} {{ ing.unit }}</span>
            </div>
          </div>
        </section>

        <section>
          <div class="flex items-center gap-4 mb-6">
            <h3 class="text-xl font-bold text-base-content">Zubereitung</h3>
            <div class="h-[1px] flex-grow bg-base-300/50"></div>
          </div>
          <div class="space-y-6">
            <div v-for="(step, index) in recipe.recipe_steps" :key="index" class="flex gap-6">
              <div class="flex-none w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success font-black shadow-sm">
                {{ index + 1 }}
              </div>
              <p class="text-base-content/70 leading-relaxed pt-2">
                {{ step.step_description || step.instruction }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-base-content/40 font-medium italic">Rezept konnte nicht geladen werden.</p>
    </div>

  </div>
</template>