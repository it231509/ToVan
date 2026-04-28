<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRecipeById, deleteRecipeById } from '@/http';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const router = useRouter();
const recipe = ref(null);
const loading = ref(true);
const isDeleting = ref(false);

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

const handleDelete = async () => {
  if (!confirm('Möchtest du dieses Rezept wirklich unwiderruflich löschen?')) return;
  
  isDeleting.value = true;
  try {
    await deleteRecipeById(props.id);
    router.push('/recipes');
  } catch (e) {
    console.error('Fehler beim Löschen', e);
    alert('Fehler beim Löschen des Rezepts.');
    isDeleting.value = false;
  }
};

const goToEdit = () => {
  router.push(`/edit-recipe/${props.id}`);
};
</script>

<template>
  <div class="lg:container mx-auto p-0 lg:p-8 max-w-6xl transition-colors duration-300">
    
    <div class="flex justify-between items-center mt-2 mb-5 px-0 lg:px-0">
      <button @click="router.back()" class="group flex items-center text-base-content/50 hover:text-success transition-colors" style="font-size: 15px;">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Zurück zur Übersicht
      </button>

      <div v-if="recipe && !loading" class="flex gap-2">
  <button 
    @click="goToEdit" 
    class="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center text-base-content/70 hover:bg-base-300 hover:border-primary/30 hover:text-primary transition-all active:scale-95 shadow-sm"
    title="Rezept bearbeiten"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  </button>

  <button 
    @click="handleDelete" 
    :disabled="isDeleting" 
    class="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center text-error/60 hover:bg-error/10 hover:border-error/30 hover:text-error transition-all active:scale-95 shadow-sm disabled:opacity-50"
    title="Rezept löschen"
  >
    <span v-if="isDeleting" class="loading loading-spinner loading-xs"></span>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  </button>
</div>
    </div>

    <div v-if="loading" class="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-6 px-0 lg:px-0">
      <div class="lg:col-span-5 space-y-8">
        <div class="h-[300px] bg-base-300 rounded-3xl"></div>
        <div class="h-40 bg-base-200 rounded-[2.5rem]"></div>
      </div>
      <div class="lg:col-span-7 space-y-10">
        <div class="h-12 bg-base-300 rounded-xl w-3/4"></div>
        <div class="h-24 bg-base-200 rounded-xl"></div>
      </div>
    </div>

    <div v-else-if="recipe" class="grid grid-cols-1 lg:grid-cols-12 gap-6 px-0 lg:px-0">
      
      <div class="lg:col-span-5 space-y-8">
        <div class="relative h-[300px] rounded-3xl overflow-hidden shadow-2xl mb-4">
          <img 
            :src="recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'" 
            class="w-full h-full object-cover"
            alt="Recipe Image"
          />
          <div class="absolute bottom-6 left-6 right-6">
            <div class="bg-base-100/90 backdrop-blur-md p-4 rounded-3xl flex justify-around shadow-lg border border-base-content/5">
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

        <div v-if="recipe.protein_per_serving" class="bg-base-200 rounded-3xl p-6 border border-base-content/5">
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
        <div class="mb-10">
          <h1 class="text-xl font-black text-base-content tracking-tight leading-tight mb-2">
            {{ recipe.title }}
          </h1>
          <p class="text-base-content/60 leading-relaxed italic">
            {{ recipe.description }}
          </p>
        </div>

        <section>
          <div class="flex items-center gap-4 mb-3">
            <h3 class="text-l font-bold text-base-content">Zutaten</h3>
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
          <div class="flex items-center gap-4 mb-3">
            <h3 class="text-l font-bold text-base-content">Zubereitung</h3>
            <div class="h-[1px] flex-grow bg-base-300/50"></div>
          </div>
          <div class="space-y-6">
            <div v-for="(step, index) in recipe.recipe_steps" :key="index" class="flex gap-3 mb-5">
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