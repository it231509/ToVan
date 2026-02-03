<script setup>
import { ref, computed, onMounted } from 'vue';

// Beispiel-Daten (später durch fetch ersetzen)
const items = ref([
  { id: 1, item_name: 'Avocado', amount: 2, unit: 'Stk', category: 'Gemüse', is_checked: false },
  { id: 2, item_name: 'Lachsfilet', amount: 300, unit: 'g', category: 'Protein', is_checked: true },
  { id: 3, item_name: 'Quinoa', amount: 1, unit: 'Pkg', category: 'Vorratsschrank', is_checked: false },
  { id: 4, item_name: 'Kurkuma', amount: 1, unit: 'TL', category: 'Gewürze', is_checked: false },
]);

const groupedItems = computed(() => {
  return items.value.reduce((acc, item) => {
    const cat = item.category || 'Sonstiges';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
});

const toggleItem = async (item) => {
  // Hier dein API Call
  // await fetch(`/api/shopping-list/${item.id}/toggle`, { ... });
  item.is_checked = !item.is_checked;
};

const progress = computed(() => {
  if (items.value.length === 0) return 0;
  const checked = items.value.filter(i => i.is_checked).length;
  return Math.round((checked / items.value.length) * 100);
});
</script>

<template>
  <div class="container mx-auto p-4 lg:p-8">
    
    <div class="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
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
              @click="toggleItem(item)"
              class="group flex items-center p-4 hover:bg-secondary/5 transition-colors cursor-pointer"
            >
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  :checked="item.is_checked"
                  class="checkbox checkbox-secondary rounded-lg border-2"
                />
              </div>

              <div class="ml-4 flex-grow">
                <span 
                  class="text-slate-700 font-medium transition-all"
                  :class="{ 'line-through text-slate-300 opacity-70': item.is_checked }"
                >
                  {{ item.item_name }}
                </span>
              </div>

              <div class="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full group-hover:bg-white transition-colors">
                {{ item.amount }} {{ item.unit }}
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
/* Sanfterer Look für die Checkboxen */
.checkbox {
  --chkbg: theme('colors.secondary.DEFAULT');
  --chkfg: white;
}

/* Entfernt den Standard-Ring beim Fokus, um das Design weich zu halten */
.checkbox:focus {
  box-shadow: none;
}
</style>