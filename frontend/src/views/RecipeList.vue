<script setup>
import { ref, onMounted } from 'vue';

const recipes = ref([]);

onMounted(async () => {
  const res = await fetch('/api/recipes');
  recipes.value = await res.json();
});
</script>

<template>
  <div class="container mx-auto p-4 lg:p-8">
    <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">Deine <span class="text-success">Rezepte</span></h1>
        <p class="text-slate-500">Alles auf einen Blick</p>
      </div>
    </div>
  
    <div class="p-4 space-y-6 grid grid-cols-3 gap-[14px]">
      <div v-for="recipe in recipes" :key="recipe.id" class="card card-side bg-base-100 mb-0" @click="$emit('show-detail', recipe.id)">
        <figure class="p-[2.5px]">
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" alt="Food" class="rounded-[5px]"/>
        </figure>
        <div class="card-body min-w-[62%] p-2 gap-[5px]">
          <h2 class="card-title">{{ recipe.title }}</h2>
          <p>{{ recipe.protein_per_serving }}g Protein</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>