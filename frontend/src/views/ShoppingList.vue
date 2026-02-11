<script>
import { getShoppingList, toggleShoppingListItem, clearCheckedItems, removeShoppingListItem } from '@/http';

export default {
  data() {
    return {
      items: [],
      loading: false
    }
  },

  computed: {
    groupedItems() {
      return this.items.reduce((acc, item) => {
        const cat = item.category || 'Sonstiges';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});
    },

    progress() {
      if (this.items.length === 0) return 0;
      const checked = this.items.filter(i => i.is_checked).length;
      return Math.round((checked / this.items.length) * 100);
    }
  },

  created() {
    this.fetchList();
  },

  methods: {
    async fetchList() {
      try {
        this.items = await getShoppingList();
      } catch (e) {
        console.error('Fehler beim Laden der Liste');
      }
    },

    async toggleItem(item) {
      try {
        item.is_checked = !item.is_checked;
        await toggleShoppingListItem(item.id, item.is_checked);
      } catch (e) {
        item.is_checked = !item.is_checked;
        console.error('Status konnte nicht aktualisiert werden');
      }
    },

    async deleteItem(id) {
      try {
        await removeShoppingListItem(id);
        this.items = this.items.filter(item => item.id !== id);
      } catch (e) {
        console.error('Item konnte nicht gelöscht werden');
      }
    },

    async clearChecked() {
      try {
        await clearCheckedItems();
        this.items = this.items.filter(item => !item.is_checked);
      } catch (e) {
        console.error('Fehler beim Bereinigen der Liste');
      }
    }
  }
};
</script>

<template>
  <div class="container mx-auto p-4 lg:p-8">
    
    <div class="flex flex-col md:flex-row justify-between mb-10 gap-6">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">
          Deine <span class="text-secondary">Einkaufsliste</span>
        </h1>
        <p class="text-slate-500 mt-1">Frische Zutaten für deine Woche</p>
      </div>

      <div class="w-full md:w-64">
        <div class="flex justify-between mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Fortschritt</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2.5">
          <div class="bg-secondary h-2.5 rounded-full transition-all duration-500" :style="{ width: progress + '%' }"></div>
        </div>
        <button 
          v-if="progress > 0"
          @click="clearChecked" 
          class="text-[10px] text-secondary font-bold uppercase mt-2 hover:underline tracking-tight"
        >
          Erledigte löschen
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <div v-for="(list, category) in groupedItems" :key="category" class="relative">
        
        <div class="flex items-center gap-4 mb-4">
          <h3 class="text-lg font-bold text-slate-700 whitespace-nowrap">{{ category }}</h3>
          <div class="h-[1px] w-full bg-slate-100"></div>
        </div>

        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div class="divide-y divide-slate-50">
            <div 
              v-for="item in list" 
              :key="item.id" 
              class="group flex items-center p-4 hover:bg-secondary/5 transition-colors cursor-pointer"
            >
              <div class="relative flex items-center" @click.stop="toggleItem(item)">
                <input 
                  type="checkbox" 
                  :checked="item.is_checked"
                  class="checkbox checkbox-secondary rounded-lg border-2"
                />
              </div>

              <div class="ml-4 flex-grow" @click.stop="toggleItem(item)">
                <span 
                  class="text-slate-700 font-medium transition-all"
                  :class="{ 'line-through text-slate-300 opacity-70': item.is_checked }"
                >
                  {{ item.item_name }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <div class="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full group-hover:bg-white transition-colors">
                  {{ item.amount }} {{ item.unit }}
                </div>
                
                <button 
                  @click.stop="deleteItem(item.id)" 
                  class="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-error transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
      <div class="text-4xl mb-4">🛒</div>
      <h2 class="text-xl font-bold text-slate-400">Deine Liste ist leer</h2>
      <p class="text-slate-400">Plane deine Woche, um Zutaten hinzuzufügen.</p>
    </div>

  </div>
</template>

<style scoped>
.checkbox {
  --chkbg: theme('colors.secondary.DEFAULT');
  --chkfg: white;
}
.checkbox:focus {
  box-shadow: none;
}
</style>