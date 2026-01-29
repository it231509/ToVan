<script setup>
import { ref, onMounted } from 'vue';

const recipes = ref([]);

onMounted(async () => {
  const res = await fetch('/api/recipes');
  recipes.value = await res.json();
});
</script>

<template>
<div class="p-8 space-y-6">

    <div v-for="recipe in recipes" :key="recipe.id" class="card w-96 bg-base-100 shadow-xl image-full">
      <figure><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" alt="Food" /></figure>
      <div class="card-body">
        <h2 class="card-title">{{ recipe.title }}</h2>
        <p>{{ recipe.protein_per_serving }}g Protein</p>
        <div class="card-actions justify-end">
          <button class="btn btn-sm btn-ghost" @click="$emit('show-detail', recipe.id)">Details</button>
          <div class="badge badge-success p-3">
            <span :class="'score-' + recipe.anti_inflammatory_score">
                Anti-Entzündlich: {{ recipe.anti_inflammatory_score }}/5
            </span>
          </div>
        </div>
      </div>
    </div>

        <div class="flex gap-4">
      <button class="btn btn-primary">Hauptaktion</button>
      <button class="btn btn-secondary">Sekundär</button>
      <button class="btn btn-outline btn-accent">Abbrechen</button>
    </div>
  </div>
</template>