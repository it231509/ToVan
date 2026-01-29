// src/views/ShoppingListView.vue
<script setup>
import { ref, computed, onMounted } from 'vue';

const items = ref([]);

// Das ist die "Magie" für das Gruppieren
const groupedItems = computed(() => {
  return items.value.reduce((acc, item) => {
    const cat = item.category || 'Sonstiges';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
});

const toggleItem = async (item) => {
  // PATCH Request an NestJS senden
  await fetch(`/api/shopping-list/${item.id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_checked: !item.is_checked })
  });
  item.is_checked = !item.is_checked;
};
</script>

<template>
  <div class="shopping-list">
    <div v-for="(list, category) in groupedItems" :key="category">
      <h3>{{ category }}</h3>
      <ul>
        <li v-for="item in list" :key="item.id" :class="{ done: item.is_checked }">
          <input type="checkbox" :checked="item.is_checked" @change="toggleItem(item)">
          {{ item.amount }} {{ item.unit }} {{ item.item_name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.done { text-decoration: line-through; color: gray; }
h3 { color: #42b983; border-bottom: 1px solid #eee; margin-top: 20px; }
</style>