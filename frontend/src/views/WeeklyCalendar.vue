<script setup>
import { ref, onMounted } from 'vue';

const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const mealPlan = ref({});

onMounted(async () => {
  // Beispiel: Holt den Plan für die aktuelle Woche
  const res = await fetch('/api/meal-plan?start=2024-05-20&end=2024-05-26');
  const data = await res.json();
  
  // Daten nach Datum gruppieren
  mealPlan.value = data.reduce((acc, entry) => {
    if (!acc[entry.plan_date]) acc[entry.plan_date] = [];
    acc[entry.plan_date].push(entry);
    return acc;
  }, {});
});
</script>

<template>
  <div class="calendar-grid">
    <div v-for="day in weekDays" :key="day" class="day-column">
      <h4>{{ day }}</h4>
      <div v-for="meal in mealPlan[currentDate]" :key="meal.id" class="meal-item">
        <strong>{{ meal.meal_type }}:</strong> 
        {{ meal.recipe.title }}
      </div>
    </div>
  </div>
</template>