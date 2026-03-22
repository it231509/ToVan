import { createRouter, createWebHistory } from 'vue-router'
import RecipeList from '../views/RecipeList.vue';
import RecipeDetail from '../views/RecipeDetail.vue';
import WeeklyCalendar from '../views/WeeklyCalendar.vue';
import ShoppingList from '../views/ShoppingList.vue';
import Home from '../views/Home.vue'
import CreateRecipe from '@/views/CreateRecipe.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import { supabase } from '@/supabase';
import Profile from '@/views/Profile.vue';
import Laundry from '@/views/Laundry.vue';
import Cleaning from '@/views/Cleaning.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
  routes: [
    { path: '/login', component: Login, meta: { public: true } },
    { path: '/register', component: Register, meta: { public: true } },
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
    {
      path: '/profile',
      name: 'profile',
      component: Profile, 
    },
    {
      path: '/laundry',
      name: 'laundry',
      component: Laundry, 
    },
    {
      path: '/cleaning',
      name: 'cleaning',
      component: Cleaning, 
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  const isPublic = to.meta.public;

  if (!isLoggedIn && !isPublic) {
    next('/login');
  } else if (isLoggedIn && isPublic) {
    next('/');
  } else {
    next();
  }
});

export default router