<script setup>
import { ref, computed, onMounted } from 'vue';

// 1. Logik für das aktuelle Datum & Navigation
const currentReferenceDate = ref(new Date());

// Hilfsfunktion: Setzt ein Datum auf den Montag der jeweiligen Woche
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Korrektur für Sonntag
  return new Date(date.setDate(diff));
};

// 2. Errechnet die 7 Tage der aktuellen Ansicht
const weekDays = computed(() => {
  const monday = getMonday(currentReferenceDate.value);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
});

// Navigation
const nextWeek = () => {
  currentReferenceDate.value = new Date(currentReferenceDate.value.setDate(currentReferenceDate.value.getDate() + 7));
};

const prevWeek = () => {
  currentReferenceDate.value = new Date(currentReferenceDate.value.setDate(currentReferenceDate.value.getDate() - 7));
};

const resetToToday = () => {
  currentReferenceDate.value = new Date();
};

// Formatierungshilfen
const formatDate = (date) => {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
};

const formatDayName = (date) => {
  return date.toLocaleDateString('de-DE', { weekday: 'long' }).substring(0, 2);
};

const getISODate = (date) => date.toISOString().split('T')[0];

// 3. Meal Plan Daten (Beispielhaftes State-Management)
const mealPlan = ref({
  // Format: "2024-05-20": [{ title: "Lachs", type: "Mittag", protein: 40 }]
});

onMounted(async () => {
  // Hier API Call: fetch(`/api/mealplan?start=${getISODate(weekDays.value[0])}`)
});
</script>

<template>
  <div class="container mx-auto p-4 lg:p-8">
    
    <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">Dein <span class="text-primary">Wochenplan</span></h1>
        <p class="text-slate-500">KW {{ Math.ceil(weekDays[0].getDate() / 7) }} | {{ weekDays[0].getFullYear() }}</p>
      </div>
      
      <div class="join shadow-sm border border-slate-100">
        <button @click="prevWeek" class="btn join-item btn-sm md:btn-md bg-white border-none hover:bg-slate-50">«</button>
        <button @click="resetToToday" class="btn join-item btn-sm md:btn-md bg-white border-none hover:bg-slate-50">Diese Woche</button>
        <button @click="nextWeek" class="btn join-item btn-sm md:btn-md bg-white border-none hover:bg-slate-50">»</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-7 gap-4 lg:gap-6">
      
      <div v-for="day in weekDays" :key="day.toISOString()" class="flex flex-col gap-2">
        <div class="flex items-center justify-between px-2">
          <span class="font-bold text-slate-400 text-sm uppercase tracking-widest">{{ formatDayName(day) }}</span>
          <span class="text-xs font-medium text-slate-400" :class="{'text-primary font-bold': day.toDateString() === new Date().toDateString()}">
            {{ formatDate(day) }}
          </span>
        </div>

        <div class="bg-white rounded-3xl border-2 border-dashed border-slate-100 min-h-[400px] p-3 transition-all hover:border-primary/30 hover:bg-slate-50/50">
          
          <template v-if="mealPlan[getISODate(day)]">
            <div v-for="meal in mealPlan[getISODate(day)]" :key="meal.title" 
                 class="card bg-primary text-primary-content shadow-sm mb-3 cursor-pointer hover:scale-[1.02] transition-transform">
              <div class="p-3">
                <div class="text-[10px] uppercase font-bold opacity-70">{{ meal.type }}</div>
                <div class="text-sm font-bold leading-tight">{{ meal.title }}</div>
                <div class="flex gap-1 mt-2">
                  <div class="badge badge-xs badge-ghost text-[8px] border-none bg-white/20">{{ meal.protein }}g Protein</div>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="h-2 w-full"></div>

          <button class="btn btn-ghost btn-block btn-dashed btn-sm border-slate-200 text-slate-400 hover:text-primary hover:border-primary mb-4">
            + Frühstück
          </button>
          <button class="btn btn-ghost btn-block btn-dashed btn-sm border-slate-200 text-slate-400 hover:text-primary hover:border-primary mb-4">
            + Mittagessen
          </button>
          <button class="btn btn-ghost btn-block btn-dashed btn-sm border-slate-200 text-slate-400 hover:text-primary hover:border-primary">
            + Abendessen
          </button>
        </div>
      </div>
    </div>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="stats shadow bg-base-100 border border-slate-100">
        <div class="stat">
          <div class="stat-title font-medium">Ø Anti-Inflammatory Score</div>
          <div class="stat-value text-primary">4.8</div>
          <div class="stat-desc text-success">↗︎ 12% mehr als letzte Woche</div>
        </div>
      </div>
      
      <div class="bg-secondary/10 rounded-3xl p-6 flex items-center justify-between border border-secondary/20 md:col-span-2">
        <div>
          <h3 class="font-bold text-secondary text-lg">Einkaufsliste bereitstellen!</h3>
          <p class="text-sm text-secondary/80">Alle Zutaten für die Woche vom {{ formatDate(weekDays[0]) }} hinzufügen.</p>
        </div>
        <button class="btn btn-secondary shadow-lg">Hinzufügen</button>
      </div>
    </div>
  </div>
</template>