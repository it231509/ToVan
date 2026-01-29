import { createRouter, createWebHistory } from 'vue-router'
// HomeView laden wir direkt
import RecipeList from '../views/RecipeList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: RecipeList,
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: () => import('../views/RecipeList.vue'), 
    },
    {
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: () => import('../views/RecipeDetail.vue'),
      props: true
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/WeeklyCalendar.vue'),
    },
    {
      path: '/shoppinglist',
      name: 'shoppinglist',
      component: () => import('../views/ShoppingList.vue'), 
    },
  ],
})

export default router