import { createRouter, createWebHistory } from 'vue-router'
// HomeView laden wir direkt
import RecipeList from '../views/RecipeList.vue';
import RecipeDetail from '../views/RecipeDetail.vue';
import WeeklyCalendar from '../views/WeeklyCalendar.vue';
import ShoppingList from '../views/ShoppingList.vue';
import Home from '../views/Home.vue'
import CreateRecipe from '@/views/CreateRecipe.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/create-recipe',
      name: 'create-recipe',
      component: CreateRecipe, 
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: RecipeList, 
    },
    {
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: RecipeDetail,
      props: true
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: WeeklyCalendar,
    },
    {
      path: '/shoppinglist',
      name: 'shoppinglist',
      component: ShoppingList, 
    },
  ],
})

export default router