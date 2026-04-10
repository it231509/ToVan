<script>
import { 
  getMealPlan, 
  removeMealFromPlan, 
  generateShoppingListFromMealPlan, 
  getAllRecipes, 
  addMealToPlan 
} from '@/http';

export default {
  async beforeRouteEnter(to, from, next) {
    try {
      const getISO = (date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
      };

      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const [plan, recipes] = await Promise.all([
        getMealPlan(getISO(monday), getISO(sunday)),
        getAllRecipes()
      ]);

      next(vm => {
        vm.mealPlanRaw = plan;
        vm.allRecipes = recipes;
      });
    } catch (e) {
      console.error('Preload Mealplan fehlgeschlagen', e);
      next();
    }
  },

  data() {
    return {
      currentReferenceDate: new Date(),
      mealPlanRaw: [],
      allRecipes: [],  
      showModal: false, 
      selectedDay: null, 
      selectedType: '',  
      searchQuery: '',
      plannedFor: 'Alle',
      plannedForCustom: ''
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

    currentWeekNumber() {
      const date = new Date(this.weekDays[0]);
      return this.getWeekNumber(date);
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
        if (plan[date]) {
          plan[date].sort((a, b) => (order[a.meal_type] || 99) - (order[b.meal_type] || 99));
        }
      });

      return plan;
    },

    filteredRecipes() {
      return this.allRecipes.filter(r => 
        r.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },

  watch: {
    currentReferenceDate: 'fetchPlan'
  },

  methods: {
    getWeekNumber(d) {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return weekNo;
    },

    getMealsForType(day, type) {
      const dateStr = this.getISODate(day);
      return (this.formattedMealPlan[dateStr] || []).filter(m => m.meal_type === type);
    },

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
      this.plannedFor = 'Alle';
      this.plannedForCustom = '';
      this.showModal = true;
    },

    async selectRecipe(recipeId) {
      try {
        const finalTarget = this.plannedFor === 'Andere' ? this.plannedForCustom : this.plannedFor;
        await addMealToPlan({
          plan_date: this.getISODate(this.selectedDay),
          meal_type: this.selectedType,
          recipe_id: recipeId,
          planned_for: finalTarget
        });
        this.showModal = false;
        await this.fetchPlan(); 
      } catch (e) {
        console.error('Fehler beim Speichern');
      }
    },

    async deleteMeal(id) {
      if (!confirm('Möchtest du diese Mahlzeit entfernen?')) return;
      try {
        await removeMealFromPlan(id);
        await this.fetchPlan();
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
  <div class="lg:container mx-auto p-0 lg:p-8 transition-colors duration-300">
    
    <div class="flex flex-col md:flex-row justify-between mb-6 gap-2 px-0 lg:px-0">
      <div>
        <h1 class="font-bold text-base-content/60 uppercase text-xs tracking-widest">KW {{ currentWeekNumber }} | {{ weekDays[0].getFullYear() }}</h1>
      </div>
      
      <div class="join shadow-sm border border-base-300 bg-base-100 p-1 rounded-2xl flex align-middle justify-evenly h-[50px]">
        <button @click="prevWeek" class="btn join-item btn-sm md:btn-md bg-transparent border-none text-base-content/40 hover:bg-base-200 min-w-[3rem] h-[100%]">
          «
        </button>
        <button @click="resetToToday" class="btn join-item btn-sm md:btn-md border-none bg-base-200 text-base-content hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl px-6 font-bold tracking-tight h-[100%]">
          Diese Woche
        </button>
        <button @click="nextWeek" class="btn join-item btn-sm md:btn-md bg-transparent border-none text-base-content/40 hover:bg-base-200 min-w-[3rem] h-[100%]">
          »
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-7 gap-4 lg:gap-6 px-0 lg:px-0">
      <div v-for="day in weekDays" :key="day.toISOString()" class="flex flex-col gap-2">
        <div class="flex items-center justify-between px-2">
          <span class="font-bold text-base-content/40 text-sm uppercase tracking-widest">{{ formatDayName(day) }}</span>
          <span class="text-xs font-medium text-base-content/40" :class="{'text-primary font-black': day.toDateString() === new Date().toDateString()}">
            {{ formatDate(day) }}
          </span>
        </div>

        <div class="bg-base-100 rounded-[20px] border-2 border-dashed border-base-300 p-3 flex flex-col gap-3 shadow-sm">
          <div v-for="type in ['Frühstück', 'Mittagessen', 'Abendessen']" :key="type" class="space-y-2">
            <div class="text-[9px] uppercase font-black opacity-30 px-1">{{ type }}</div>
            
            <div v-for="meal in getMealsForType(day, type)" :key="meal.id"
                 class="card bg-primary text-primary-content shadow-sm group relative overflow-hidden transition-all cursor-pointer"
                 @click="$router.push(`/recipe/${meal.recipe_id}`)">
              <div class="p-3">
                <div class="text-sm font-bold leading-tight pr-4">
                  {{ meal.recipe?.title }}
                </div>
                <div class="flex flex-wrap gap-1 mt-2">
                  <div v-if="meal.planned_for" class="badge badge-xs bg-black/20 border-none text-[8px] text-white py-2 px-2">
                    {{ meal.planned_for }}
                  </div>
                  <div class="badge badge-xs bg-white/20 border-none text-[8px] text-white py-2 px-2">
                    {{ meal.recipe?.protein_per_serving }}g Protein
                  </div>
                </div>
                <button @click.stop="deleteMeal(meal.id)" 
                        class="absolute top-2 right-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 hover:bg-black/20 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <button @click="openPicker(day, type)" 
                    class="btn btn-ghost btn-xs btn-block justify-start text-base-content/20 hover:text-primary hover:bg-primary/5 border border-dashed border-base-300 rounded-xl py-4 px-2">
              + {{ type }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <dialog class="modal" :class="{ 'modal-open': showModal }">
      <div class="modal-box max-w-xl bg-base-200 rounded-3xl p-0 overflow-hidden shadow-2xl border border-base-300">
        <div class="p-4 bg-base-100 border-b border-base-300 flex justify-between items-start">
          <div>
            <h3 class="font-black text-xl text-base-content">{{ selectedType }} planen</h3>
            <p class="text-xs text-base-content/40 font-bold uppercase tracking-widest">{{ formatDate(selectedDay) }}</p>
          </div>
          <button @click="showModal = false" class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>

        <div class="p-4 bg-base-100 border-b border-base-300 space-y-3">
          <span class="text-[10px] font-bold uppercase text-base-content/40">Für wen ist dieses Essen?</span>
          <div class="flex gap-2 flex-wrap">
            <button @click="plannedFor = 'Alle'" :class="plannedFor === 'Alle' ? 'btn-primary text-white' : 'bg-base-200'" class="btn btn-xs rounded-lg border-none px-4">Alle</button>
            <button @click="plannedFor = 'Nur ich'" :class="plannedFor === 'Nur ich' ? 'btn-primary text-white' : 'bg-base-200'" class="btn btn-xs rounded-lg border-none px-4">Nur ich</button>
            <button @click="plannedFor = 'Andere'" :class="plannedFor === 'Andere' ? 'btn-primary text-white' : 'bg-base-200'" class="btn btn-xs rounded-lg border-none px-4">Andere...</button>
            <input v-if="plannedFor === 'Andere'" v-model="plannedForCustom" type="text" placeholder="Name..." class="input w-full rounded-2xl bg-base-100 border-base-300 focus:border-primary focus:ring-0 text-base-content" />
          </div>
        </div>

        <div class="px-4 pt-4 pb-2">
          <input v-model="searchQuery" type="text" placeholder="Rezept suchen..." 
                 class="input w-full rounded-2xl bg-base-100 border-base-300 focus:border-primary focus:ring-0 text-base-content" />
        </div>
        <div class="px-4 pt-2 pb-4 max-h-[350px] overflow-y-auto space-y-2">
          <div v-for="recipe in filteredRecipes" :key="recipe.id" @click="selectRecipe(recipe.id)" 
               class="flex items-center gap-4 bg-base-100 p-3 rounded-[1.5rem] border border-transparent hover:border-primary/40 cursor-pointer transition-all hover:shadow-lg group">
            <img :src="recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" class="w-12 h-12 rounded-xl object-cover">
            <div class="flex-grow">
              <h4 class="font-bold text-base-content text-sm group-hover:text-primary transition-colors">{{ recipe.title }}</h4>
              <span class="text-[9px] font-black text-base-content/30 uppercase">{{ recipe.protein_per_serving }}g Protein</span>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop bg-black/40 backdrop-blur-sm">
        <button @click="showModal = false">close</button>
      </form>
    </dialog>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 px-0 lg:px-0">
      <div class="stats shadow bg-base-100 border border-base-300 rounded-3xl overflow-hidden hide-on-mobile">
        <div class="stat">
          <div class="stat-title font-medium text-base-content/50">Placeholder</div>
          <div class="stat-value text-primary">4.8</div>
          <div class="stat-desc text-success font-bold">↗︎ x% mehr als letzte Woche</div>
        </div>
      </div>
      
      <div class="bg-secondary/10 rounded-3xl p-6 flex flex-col gap-3 items-start justify-between border border-secondary/20 md:col-span-2 md:flex-row md:items-center">
        <div>
          <h3 class="font-bold text-secondary text-xl">Einkaufsliste bereitstellen!</h3>
          <p class="text-sm text-base-content/60">Zutaten vom {{ formatDate(weekDays[0]) }} bis {{ formatDate(weekDays[6]) }} hinzufügen.</p>
        </div>
        <button @click="createShoppingList" class="btn btn-secondary shadow-lg rounded-2xl px-8 w-full md:w-auto text-white font-bold">Hinzufügen</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.modal { transition: all 0.3s ease-in-out; }
@media (max-width: 980px) {
  .hide-on-mobile { display: none; }
}
</style>