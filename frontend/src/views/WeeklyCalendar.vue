<script>
import { 
  getMealPlan, 
  removeMealFromPlan, 
  generateShoppingListFromMealPlan, 
  getAllRecipes, 
  addMealToPlan 
} from '@/http';

export default {
  data() {
    return {
      currentReferenceDate: new Date(),
      mealPlanRaw: [],
      allRecipes: [],  
      showModal: false, 
      selectedDay: null, 
      selectedType: '',  
      searchQuery: ''    
    };
  },

  computed: {
    weekDays() {
      const date = new Date(this.currentReferenceDate);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));

      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
      });
    },

    formattedMealPlan() {
      const plan = {};
      const order = { 'Frühstück': 1, 'Mittagessen': 2, 'Abendessen': 3 };

      this.mealPlanRaw.forEach(item => {
        const date = item.plan_date;
        if (!plan[date]) plan[date] = [];
        plan[date].push(item);
      });

      Object.keys(plan).forEach(date => {
        plan[date].sort((a, b) => (order[a.meal_type] || 99) - (order[b.meal_type] || 99));
      });

      return plan;
    },

    filteredRecipes() {
      return this.allRecipes.filter(r => 
        r.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },

  created() {
    this.fetchPlan();
    this.fetchAllRecipes(); 
  },

  watch: {
    currentReferenceDate: 'fetchPlan'
  },

  methods: {
    async fetchPlan() {
      try {
        const start = this.getISODate(this.weekDays[0]);
        const end = this.getISODate(this.weekDays[6]);
        this.mealPlanRaw = await getMealPlan(start, end);
      } catch (e) {
        console.error('Fehler beim Laden des Wochenplans');
      }
    },

    async fetchAllRecipes() {
      try {
        this.allRecipes = await getAllRecipes();
      } catch (e) {
        console.error('Fehler beim Laden der Rezepte');
      }
    },

    openPicker(day, type) {
      this.selectedDay = day;
      this.selectedType = type;
      this.searchQuery = '';
      this.showModal = true;
    },

    async selectRecipe(recipeId) {
      try {
        await addMealToPlan({
          plan_date: this.getISODate(this.selectedDay),
          meal_type: this.selectedType,
          recipe_id: recipeId
        });
        this.showModal = false;
        this.fetchPlan();
      } catch (e) {
        console.error('Fehler beim Speichern');
      }
    },

    async deleteMeal(id) {
      if (!confirm('Möchtest du diese Mahlzeit entfernen?')) return;
      try {
        await removeMealFromPlan(id);
        this.fetchPlan();
      } catch (e) {
        console.error('Fehler beim Löschen');
      }
    },

    async createShoppingList() {
      try {
        const start = this.getISODate(this.weekDays[0]);
        const end = this.getISODate(this.weekDays[6]);
        await generateShoppingListFromMealPlan(start, end);
        alert('Einkaufsliste wurde generiert!');
        this.$router.push('/shoppinglist');
      } catch (e) {
        alert('Fehler beim Erstellen der Einkaufsliste');
      }
    },

    nextWeek() {
      const d = new Date(this.currentReferenceDate);
      this.currentReferenceDate = new Date(d.setDate(d.getDate() + 7));
    },
    prevWeek() {
      const d = new Date(this.currentReferenceDate);
      this.currentReferenceDate = new Date(d.setDate(d.getDate() - 7));
    },
    resetToToday() {
      this.currentReferenceDate = new Date();
    },
    formatDate(date) {
      if (!date) return '';
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
    },
    formatDayName(date) {
      return date.toLocaleDateString('de-DE', { weekday: 'long' }).substring(0, 2);
    },
    getISODate(date) {
      if (!date) return '';
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    }
  }
};
</script>

<template>
  <div class="container mx-auto p-4 lg:p-8">
    
    <div class="flex flex-col md:flex-row justify-between mb-10 gap-4">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">Dein <span class="text-primary">Wochenplan</span></h1>
        <p class="text-slate-500">KW {{ Math.ceil(weekDays[0].getDate() / 7) }} | {{ weekDays[0].getFullYear() }}</p>
      </div>
      
      <div class="join shadow-sm border border-slate-100 bg-white p-1 rounded-2xl flex align-middle">
        <button @click="prevWeek" class="btn join-item btn-sm md:btn-md bg-transparent border-none text-slate-400 hover:bg-slate-50 min-w-[3rem]">
          «
        </button>
        
        <button @click="resetToToday" class="btn join-item btn-sm md:btn-md border-none bg-slate-50 text-slate-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl px-6 font-bold tracking-tight">
          Diese Woche
        </button>
        
        <button @click="nextWeek" class="btn join-item btn-sm md:btn-md bg-transparent border-none text-slate-400 hover:bg-slate-50 min-w-[3rem]">
          »
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-7 gap-4 lg:gap-6">
      <div v-for="day in weekDays" :key="day.toISOString()" class="flex flex-col gap-2">
        <div class="flex items-center justify-between px-2">
          <span class="font-bold text-slate-400 text-sm uppercase tracking-widest">{{ formatDayName(day) }}</span>
          <span class="text-xs font-medium text-slate-400" :class="{'text-primary font-black': day.toDateString() === new Date().toDateString()}">
            {{ formatDate(day) }}
          </span>
        </div>

        <div class="bg-white min-h-[300px] rounded-[20px] border-2 border-dashed border-slate-100 p-3 flex flex-col justify-around gap-2">
          
          <div v-for="type in ['Frühstück', 'Mittagessen', 'Abendessen']" :key="type">
            
            <div v-if="formattedMealPlan[getISODate(day)]?.find(m => m.meal_type === type)"
                 class="card bg-primary text-primary-content shadow-sm group relative overflow-hidden transition-all"
                 @click="$router.push(`/recipe/${formattedMealPlan[getISODate(day)].find(m => m.meal_type === type).recipe_id}`)">
              <div class="p-3">
                <div class="text-[9px] uppercase font-black opacity-60 mb-1">{{ type }}</div>
                <div class="text-sm font-bold leading-tight pr-4">
                  {{ formattedMealPlan[getISODate(day)].find(m => m.meal_type === type).recipe?.title }}
                </div>
                <div class="flex gap-1 mt-2">
                  <div class="badge badge-xs bg-white/20 border-none text-[8px]">
                    {{ formattedMealPlan[getISODate(day)].find(m => m.meal_type === type).recipe?.protein_per_serving }}g Protein
                  </div>
                </div>
                
                <button @click="deleteMeal(formattedMealPlan[getISODate(day)].find(m => m.meal_type === type).id)" 
                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <button v-else @click="openPicker(day, type)" 
                    class="btn btn-ghost btn-xs btn-block justify-start text-slate-400 hover:text-primary hover:bg-primary/5 font-bold py-4 px-2 mb-1">
              + {{ type }}
            </button>
            
          </div>

        </div>
      </div>
    </div>

    <dialog class="modal" :class="{ 'modal-open': showModal }">
      <div class="modal-box max-w-xl bg-slate-50 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div class="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 class="font-black text-xl text-slate-800">{{ selectedType }} wählen</h3>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">{{ formatDate(selectedDay) }}</p>
          </div>
          <button @click="showModal = false" class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
        <div class="p-4 bg-white">
          <input v-model="searchQuery" type="text" placeholder="Rezept suchen..." class="input w-full rounded-2xl border-slate-200 focus:border-primary focus:ring-0" />
        </div>
        <div class="p-4 max-h-[450px] overflow-y-auto space-y-3">
          <div v-for="recipe in filteredRecipes" :key="recipe.id" @click="selectRecipe(recipe.id)" class="flex items-center gap-4 bg-white p-3 rounded-[1.5rem] border border-transparent hover:border-primary/40 cursor-pointer transition-all hover:shadow-lg group">
            <img :src="recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" class="w-12 h-12 rounded-xl object-cover">
            <div class="flex-grow">
              <h4 class="font-bold text-slate-800 text-sm">{{ recipe.title }}</h4>
              <span class="text-[9px] font-black text-slate-400 uppercase">{{ recipe.protein_per_serving }}g Protein</span>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop bg-slate-900/20 backdrop-blur-sm"><button @click="showModal = false">close</button></form>
    </dialog>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="stats shadow bg-base-100 border border-slate-100 rounded-3xl overflow-hidden">
        <div class="stat">
          <div class="stat-title font-medium">Ø Anti-Inflammatory Score</div>
          <div class="stat-value text-primary">4.8</div>
          <div class="stat-desc text-success font-bold">↗︎ 12% mehr als letzte Woche</div>
        </div>
      </div>
      
      <div class="bg-secondary/10 rounded-[2.5rem] p-8 flex items-center justify-between border border-secondary/20 md:col-span-2">
        <div>
          <h3 class="font-bold text-secondary text-xl">Einkaufsliste bereitstellen!</h3>
          <p class="text-sm text-secondary/70">Zutaten vom {{ formatDate(weekDays[0]) }} bis {{ formatDate(weekDays[6]) }} hinzufügen.</p>
        </div>
        <button @click="createShoppingList" class="btn btn-secondary shadow-lg rounded-2xl px-8">Hinzufügen</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal { transition: all 0.3s ease-in-out; }
</style>