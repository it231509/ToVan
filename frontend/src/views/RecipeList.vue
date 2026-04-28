<script>
import { getAllRecipes } from '@/http';

export default {
    name: 'RecipesView',
    data() {
      return {
        recipes: [],
      }
    },

    async beforeRouteEnter(to, from, next) {
      try {
        const response = await getAllRecipes();
        
        next(vm => {
          vm.recipes = response;
        });
      } catch (e) {
        console.error('Preload fehlgeschlagen');
        next();
      }
    },

    methods: {
        async fetchRecipes() {
          const response = await getAllRecipes();
          this.recipes = response;
        },

        goToDetail(id) {
          this.$router.push(`/recipe/${id}`);
        }
    },
};
</script>

<template>
  <div class="lg:container mx-auto p-0 lg:p-8 transition-colors duration-300">
    <div class="flex flex-col md:flex-row justify-between mt-2 mb-6 gap-6 px-0 lg:px-0">

      <div class="w-full md:w-72 lg:flex block flex-row gap-4 items-center">
        <div class="relative group">
          <input 
            type="text" 
            placeholder="Rezepte suchen..." 
            class="w-full pl-11 pr-4 py-3 rounded-2xl border bg-base-100 border-base-300 text-base-content focus:ring-4 focus:ring-success/10 focus:border-success outline-none transition-all shadow-sm"
            style="font-size: 14px;"
          >
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-success transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
         <RouterLink 
            to="/create-recipe" 
            class="hidden lg:flex w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center text-primary active:scale-90 transition-transform hover:bg-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </RouterLink>
      </div>
    </div>
  
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-0 lg:px-0">
      <div 
        v-for="recipe in recipes" 
        :key="recipe.id" 
        class="group bg-base-100 rounded-3xl border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        @click="$router.push(`/recipe/${recipe.id}`)"
      >
        <div class="relative h-48 overflow-hidden">
          <img 
            :src="recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'" 
            alt="Food" 
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div v-if="recipe.protein_per_serving" class="absolute top-3 right-3">
            <span class="bg-base-100/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-base-content shadow-sm border border-base-content/5">
              {{ recipe.protein_per_serving }}g Protein
            </span>
          </div>
        </div>

        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-xl font-bold text-base-content leading-tight group-hover:text-success transition-colors">
              {{ recipe.title }}
            </h2>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-base-content/5">
            <span class="flex items-center text-xs font-medium text-base-content/40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ recipe.prep_time }} Min.
            </span>
            <button class="text-success font-semibold text-sm flex items-center group/btn">
              Ansehen
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="recipes.length === 0" class="p-6 text-center border-2 border-dashed border-base-300 rounded-3xl opacity-60">
      <p class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2">Deine Rezeptliste ist leer</p>
      <p class="text-sm mt-1 text-base-content/60 leading-tight">Lege neue Rezepte an, um die Liste zu füllen‚.</p>
    </div>
  </div>
</template>