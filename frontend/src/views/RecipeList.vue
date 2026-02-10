<script>
import { getAllRecipes } from '@/http';

export default {
    data() {
      return {
        recipes: [],
      }
    },

    created() {
      this.fetchRecipes();
    },

    components: {},

    methods: {
        async fetchRecipes() {
          try {
              const response = await getAllRecipes();
              this.recipes = response;
          } catch (e) {
              console.error('Error fetching recipes');
          }
        },

        goToDetail(id) {
          this.$router.push({ name: 'recipe-detail', params: { id: id } });
        }
    },
};
</script>

<template>
  <div class="container mx-auto p-4 lg:p-8">
    <div class="flex flex-col md:flex-row justify-between mb-12 gap-6">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">
          Deine <span class="text-success">Rezepte</span>
        </h1>
        <p class="text-slate-500 mt-1">Entdecke deine kulinarischen Kreationen</p>
      </div>

      <div class="w-full md:w-72">
        <div class="relative group">
          <input 
            type="text" 
            placeholder="Rezepte suchen..." 
            class="w-full pl-11 pr-4 py-3 rounded-2xl border bg-white border-slate-200 focus:ring-4 focus:ring-success/10 focus:border-success outline-none transition-all shadow-sm"
          >
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-success transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <div 
        v-for="recipe in recipes" 
        :key="recipe.id" 
        class="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        @click="$router.push(`/recipe/${recipe.id}`)"
      >
        <div class="relative h-48 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600" 
            alt="Food" 
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div class="absolute top-3 right-3">
            <span class="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
              {{ recipe.protein_per_serving }}g Protein
            </span>
          </div>
        </div>

        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-xl font-bold text-slate-800 leading-tight group-hover:text-success transition-colors">
              {{ recipe.title }}
            </h2>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-50">
            <span class="flex items-center text-xs font-medium text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              25 Min.
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
  </div>
</template>