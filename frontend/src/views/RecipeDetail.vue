<script setup>
const props = defineProps(['recipe']);
</script>

<template>
  <div class="detail-view" v-if="recipe">
    <h2>{{ recipe.title }}</h2>
    
    <h4>Zutaten:</h4>
    <ul>
      <li v-for="ing in recipe.ingredients" :key="ing.id">
        {{ ing.amount }}{{ ing.unit }} {{ ing.ingredient_name }}
        <span v-if="ing.is_anti_inflammatory">✨</span>
      </li>
    </ul>

    <h4>Zubereitung:</h4>
    <ol>
      <li v-for="step in recipe.steps" :key="step.id">
        {{ step.instruction }}
      </li>
    </ol>
  </div>
</template>