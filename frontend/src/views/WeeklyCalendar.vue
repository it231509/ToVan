<script setup>
import { ref, onMounted } from 'vue';

const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const mealPlan = ref({});

// Beispieldaten laden (Später durch fetch('/api/meal-plan?start=...') ersetzen)
onMounted(async () => {
  // Hier würdest du deinen API-Call machen
  // Das Format sollte sein: { "2026-01-29": [{ recipe: { title: 'Lachs' }, meal_type: 'Mittag' }] }
});

const getInitials = (day) => day.substring(0, 2);
</script>

<template>
  <div class="container mx-auto p-4 lg:p-8">
    
    <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">Dein <span class="text-primary">Wochenplan</span></h1>
        <p class="text-slate-500">Plane deine antientzündliche Ernährung</p>
      </div>
      
      <div class="join shadow-sm">
        <button class="btn join-item btn-sm md:btn-md">«</button>
        <button class="btn join-item btn-sm md:btn-md">Diese Woche</button>
        <button class="btn join-item btn-sm md:btn-md">»</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-7 gap-4 lg:gap-6">
      
      <div v-for="day in days" :key="day" class="flex flex-col gap-2">
        <div class="flex items-center justify-between px-2">
          <span class="font-bold text-slate-400 text-sm uppercase tracking-widest">{{ getInitials(day) }}</span>
          <span class="text-xs text-slate-300">29. Jan</span>
        </div>

        <div class="bg-white rounded-3xl border-2 border-dashed border-slate-100 min-h-[400px] p-3 transition-all hover:border-primary/30 hover:bg-slate-50/50">
          
          <div class="card bg-primary text-primary-content shadow-sm mb-3 cursor-pointer hover:scale-[1.02] transition-transform">
            <div class="p-3">
              <div class="text-[10px] uppercase font-bold opacity-70">Mittagessen</div>
              <div class="text-sm font-bold leading-tight">Lachs mit Kurkuma & Quinoa</div>
              <div class="flex gap-1 mt-2">
                <div class="badge badge-xs badge-ghost text-[8px]">40g Protein</div>
              </div>
            </div>
          </div>

          <button class="btn btn-ghost btn-block btn-dashed btn-sm border-slate-200 text-slate-400">
            + Mahlzeit
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
          <h3 class="font-bold text-secondary text-lg">Einkaufsliste bereit!</h3>
          <p class="text-sm text-secondary/80">Alle Zutaten für diese Woche sind berechnet.</p>
        </div>
        <button class="btn btn-secondary shadow-lg">Zur Liste</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Optional: Ein schöner Soft-Shadow für die Karten */
.card {
  box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.05);
}
</style>