<script>
import { 
  getShoppingList, 
  toggleShoppingListItem, 
  clearCheckedItems, 
  removeShoppingListItem, 
  addItemToShoppingList 
} from '@/http';

export default {
  async beforeRouteEnter(to, from, next) {
    try {
      const data = await getShoppingList();
      next(vm => {
        vm.items = data;
      });
    } catch (e) {
      console.error('Preload der Einkaufsliste fehlgeschlagen', e);
      next();
    }
  },

  data() {
    return {
      items: [],
      loading: false,
      newItem: {
        item_name: '',
        amount: null,
        unit: '',
        category: 'Sonstiges'
      }
    }
  },

  computed: {
    groupedItems() {
      if (!this.items) return {};
      return this.items.reduce((acc, item) => {
        const cat = item.category || 'Sonstiges';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});
    },

    progress() {
      if (!this.items || this.items.length === 0) return 0;
      const checked = this.items.filter(i => i.is_checked).length;
      return Math.round((checked / this.items.length) * 100);
    }
  },

  methods: {
    async fetchList() {
      try {
        this.items = await getShoppingList();
      } catch (e) {
        console.error('Fehler beim Laden der Liste');
      }
    },

    async addItem() {
      if (!this.newItem.item_name) return;
      try {
        const addedItem = await addItemToShoppingList(this.newItem);
        this.items.push(addedItem);
        this.newItem = { item_name: '', amount: null, unit: '', category: 'Sonstiges' };
      } catch (e) {
        console.error('Fehler beim Hinzufügen');
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
  <div class="lg:container mx-auto p-0 lg:p-8 transition-colors duration-300">
    
    <div class="flex flex-col md:flex-row justify-between mb-10 gap-6 px-4 lg:px-0">
      <div>
        <h1 class="lg:text-4xl text-3xl font-black text-base-content tracking-tight">
          Deine <span class="text-secondary">Einkaufsliste</span>
        </h1>
        <p class="text-base-content/60 mt-1 font-medium">Frische Zutaten für deine Woche</p>
      </div>

      <div class="w-full md:w-64">
        <div class="flex justify-between mb-2 text-xs font-bold text-base-content/40 uppercase tracking-widest">
          <span>Fortschritt</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full bg-base-300 rounded-full h-2.5">
          <div class="bg-secondary h-2.5 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(var(--s),0.4)]" :style="{ width: progress + '%' }"></div>
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

    <div class="bg-base-100 p-4 rounded-[2rem] border border-base-300 shadow-sm mb-8 flex flex-wrap md:flex-nowrap flex-col md:flex-row gap-3 items-center mx-4 lg:mx-0">
      <div class="flex-grow min-w-[200px] w-full md:w-auto">
        <input 
          v-model="newItem.item_name" 
          @keyup.enter="addItem"
          type="text" 
          placeholder="Etwas zur Liste hinzufügen..." 
          class="input w-full bg-base-200 border-none rounded-2xl focus:ring-2 focus:ring-secondary/20 text-base-content"
        />
      </div>
      <div class="w-full md:w-24">
        <input 
          v-model.number="newItem.amount" 
          type="number" 
          placeholder="Menge" 
          class="input w-full bg-base-200 border-none rounded-2xl focus:ring-2 focus:ring-secondary/20 text-base-content"
        />
      </div>
      <div class="w-full md:w-28">
        <select v-model="newItem.unit" class="select w-full bg-base-200 border-none rounded-2xl focus:ring-2 focus:ring-secondary/20 text-base-content">
          <option value="">Einheit</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="L">L</option>
          <option value="Stk">Stk</option>
          <option value="Pkg">Pkg</option>
        </select>
      </div>
      <div class="w-full md:w-36">
        <select v-model="newItem.category" class="select w-full bg-base-200 border-none rounded-2xl focus:ring-2 focus:ring-secondary/20 text-base-content">
          <option value="Sonstiges">Kategorie</option>
          <option value="Gemüse & Obst">Gemüse & Obst</option>
          <option value="Kühlregal">Kühlregal</option>
          <option value="Vorrat">Vorrat</option>
          <option value="Backwaren">Backwaren</option>
          <option value="Getränke">Getränke</option>
        </select>
      </div>
      <button 
        @click="addItem"
        :disabled="!newItem.item_name"
        class="btn btn-secondary rounded-2xl px-8 text-white font-bold h-12 min-h-0 disabled:bg-base-300 disabled:text-base-content/20 border-none w-full md:w-auto shadow-lg shadow-secondary/20"
      >
        Hinzufügen
      </button>
    </div>

    <div class="grid grid-cols-1 gap-8 px-4 lg:px-0">
      <div v-for="(list, category) in groupedItems" :key="category" class="relative">
        
        <div class="flex items-center gap-4 mb-4">
          <h3 class="text-lg font-bold text-base-content/80 whitespace-nowrap">{{ category }}</h3>
          <div class="h-[1px] w-full bg-base-300"></div>
        </div>

        <div class="bg-base-100 rounded-[2rem] border border-base-300 shadow-sm overflow-hidden">
          <div class="divide-y divide-base-200">
            <div 
              v-for="item in list" 
              :key="item.id" 
              class="group flex items-center p-4 hover:bg-secondary/5 transition-colors cursor-pointer"
            >
              <div class="relative flex items-center" @click.stop="toggleItem(item)">
                <input 
                  type="checkbox" 
                  :checked="item.is_checked"
                  class="checkbox checkbox-secondary rounded-lg border-2 border-base-300"
                />
              </div>

              <div class="ml-4 flex-grow" @click.stop="toggleItem(item)">
                <span 
                  class="text-base-content font-medium transition-all"
                  :class="{ 'line-through text-base-content/30 opacity-50': item.is_checked }"
                >
                  {{ item.item_name }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <div v-if="item.amount" class="text-sm font-bold text-base-content/40 bg-base-200 px-3 py-1 rounded-full group-hover:bg-base-100 transition-colors">
                  {{ item.amount }} {{ item.unit }}
                </div>
                
                <button 
                  @click.stop="deleteItem(item.id)" 
                  class="opacity-0 group-hover:opacity-100 p-2 text-base-content/20 hover:text-error transition-all"
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

    <div v-if="items.length === 0" class="text-center py-20 bg-base-200 rounded-[3rem] border-2 border-dashed border-base-300 mx-4 lg:mx-0">
      <h2 class="text-xl font-bold text-base-content/30">Deine Liste ist leer</h2>
      <p class="text-base-content/30">Plane deine Woche, um Zutaten hinzuzufügen.</p>
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