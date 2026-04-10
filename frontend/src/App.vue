<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'; 
import { supabase } from '@/supabase';
import { useRouter, useRoute } from 'vue-router';
import backend, { getMyHouseholds } from '@/http';

const session = ref(null);
const isNavigating = ref(false); 
const isVerifying = ref(false);
const isAuthReady = ref(false);  
const isDarkMode = ref(false);   
const router = useRouter();
const route = useRoute();
const isCookingMode = ref(true);
const isInitializing = ref(false);

let authSubscription = null;

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

const toggleMode = () => {
  isCookingMode.value = !isCookingMode.value;
  localStorage.setItem('mode', isCookingMode.value ? 'cooking' : 'household');
  router.push('/');
};

router.beforeEach((to, from, next) => {
  isNavigating.value = true;
  next();
});

router.afterEach(() => {
  isNavigating.value = false;
});

const ensureActiveHousehold = async () => {
  if (isInitializing.value) return;
  const savedId = localStorage.getItem('active_household_id');
  try {
    isInitializing.value = true; 
    const memberships = await getMyHouseholds();
    if (memberships && memberships.length > 0) {
      if (!savedId || !memberships.some(m => m.household.id === savedId)) {
        localStorage.setItem('active_household_id', memberships[0].household.id);
      }
    } else {
      const res = await backend.post('/users/setup-profile');
      if (res.data?.householdId) {
        localStorage.setItem('active_household_id', res.data.householdId);
      }
    }
  } catch (e) {
    console.error("Fehler bei Haushalt-Validierung", e);
  } finally {
    isInitializing.value = false;
  }
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('active_household_id');
  session.value = null;
  router.push('/login');
};

onMounted(async () => {
  const savedMode = localStorage.getItem('mode');
  if (savedMode) isCookingMode.value = savedMode === 'cooking';
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  isDarkMode.value = savedTheme === 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const { data: { session: initialSession } } = await supabase.auth.getSession();
  session.value = initialSession;

  if (initialSession) {
    await ensureActiveHousehold();
  }
  
  isAuthReady.value = true;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, _session) => {
    if (event === 'SIGNED_IN' && !session.value) {
      session.value = _session;
      await ensureActiveHousehold();
    } else if (event === 'SIGNED_OUT') {
      session.value = null;
      localStorage.removeItem('active_household_id');
      router.push('/login');
    }
  });

  authSubscription = subscription;
});

onUnmounted(() => {
  if (authSubscription) authSubscription.unsubscribe();
});

const cookingMenu = [
  { name: 'Home', path: '/', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`},
  { name: 'Rezepte', path: '/recipes', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
  { name: 'Planer', path: '/calendar', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { name: 'Liste', path: '/shoppinglist', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` },
];

const householdMenu = [
  { name: 'Home', path: '/', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`},
  { name: 'Putzplan', path: '/cleaning', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.22 8.35L19.07.5M1.38 18.19l7.85-7.85M5.62 22.43l7.85-7.85M9.86 18.19l7.85-7.85M5.62 13.95l7.85-7.85" /></svg>` },
  { name: 'Wäsche', path: '/laundry', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="13" r="4" /><path d="M8 6h.01" /><path d="M11 6h.01" /></svg>` },
  { name: 'Liste', path: '/shoppinglist', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` },
];

const menuItems = computed(() =>
  isCookingMode.value ? cookingMenu : householdMenu
);
</script>

<template>
  <div v-if="isNavigating" class="fixed top-0 left-0 w-full h-1 z-[9999]">
    <div class="h-full bg-primary animate-progress-bar shadow-[0_0_10px_#570df8]"></div>
  </div>

  <template v-if="isAuthReady">
    <div v-if="isVerifying" class="min-h-screen flex items-center justify-center bg-base-100">
      <div class="flex flex-col items-center">
        <span class="loading loading-ring loading-lg text-primary"></span>
        <p class="mt-4 font-black text-base-content animate-pulse tracking-tight">E-Mail wird verifiziert...</p>
      </div>
    </div>

    <div v-else-if="session && !isVerifying && !$route.path.includes('login') && !$route.path.includes('register')" 
         class="drawer lg:drawer-open bg-base-200 min-h-screen transition-colors duration-300">
      
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
      
      <div class="drawer-content flex flex-col">
        <header class="lg:hidden flex justify-between items-center px-3 py-2 bg-base-100/50 backdrop-blur-md border-b border-base-300">
          <img class="w-12 h-12" src="./assets/Logo.png" alt="ToVan Logo">
          <div class="flex flex-row gap-2">
            <button @click="toggleMode" class="w-16 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70">
              <span class="text-xs font-bold">{{ isCookingMode ? 'Kochen' : 'Putzen' }}</span>
            </button>
            <button @click="toggleTheme" class="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70">
              <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
            <RouterLink v-if="route.path === '/recipes'" to="/create-recipe" class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </RouterLink>
            <RouterLink to="/profile" class="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </RouterLink>
          </div>
        </header>

        <main class="flex-grow pb-32 lg:pb-12 px-3 pt-2 lg:px-16 lg:pt-16">
          <RouterView />
        </main>

        <div class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50">
          <nav class="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-2 flex justify-between items-center shadow-2xl border border-white/10">
            <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" class="mobile-nav-item">
              <div v-html="item.icon" class="w-5 h-5"></div>
              <span v-if="$route.path === item.path" class="text-[10px] mt-1 font-bold">{{ item.name }}</span>
            </RouterLink>
          </nav>
        </div>
      </div>

      <div class="drawer-side z-40">
        <label for="my-drawer-3" class="drawer-overlay"></label>
        <aside class="w-28 flex flex-col items-center justify-between py-10 bg-base-100 border-r border-base-300 h-screen transition-colors duration-300">
          <div class="mb-8"><img src="./assets/Logo.png" class="w-12 h-12" alt="Logo"></div>
          <nav class="flex flex-col gap-6 w-full px-4">
            <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" class="desktop-nav-item" :title="item.name">
              <div v-html="item.icon" class="w-5 h-5"></div>
              <div class="active-indicator"></div>
            </RouterLink>
          </nav>
          <div class="flex flex-col gap-4 items-center mt-16">
            <button @click="toggleMode" class="w-16 h-12 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70">
              <span class="text-sm font-bold">{{ isCookingMode ? 'Kochen' : 'Putzen' }}</span>
            </button>
            <button @click="toggleTheme" class="w-12 h-12 rounded-xl bg-base-200 hover:bg-base-300 flex items-center justify-center transition-all text-base-content/70">
              <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
            <RouterLink to="/profile" class="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70 hover:bg-base-300 transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </RouterLink>
            <div @click="handleLogout" class="w-14 h-14 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center cursor-pointer hover:bg-error/10 hover:border-error/20 transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-base-content/50 group-hover:text-error transition-colors"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </div>
          </div>
        </aside>
      </div>
    </div>
    <div v-else-if="!isVerifying" class="min-h-screen bg-base-100">
      <RouterView />
    </div>
  </template>

  <div v-else class="min-h-screen flex items-center justify-center bg-base-100">
    <span class="loading loading-ring loading-lg text-primary"></span>
  </div>
</template>

<style scoped>
@keyframes progress-bar {
  0% { width: 0%; }
  30% { width: 70%; }
  100% { width: 90%; }
}
.animate-progress-bar {
  animation: progress-bar 2s ease-out infinite;
}

.desktop-nav-item {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: currentColor;
  opacity: 0.5;
  transition: all 0.2s ease;
  position: relative;
}
.desktop-nav-item:hover {
  background-color: hsl(var(--bc) / 0.1);
  opacity: 1;
}
.router-link-active.desktop-nav-item {
  color: hsl(var(--p));
  background-color: hsl(var(--p) / 0.1);
  opacity: 1;
}
.active-indicator {
  position: absolute;
  right: -16px;
  width: 4px;
  height: 24px;
  background-color: hsl(var(--p));
  border-radius: 4px 0 0 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.router-link-active .active-indicator {
  opacity: 1;
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 48px;
  color: #94a3b8;
}
.router-link-active.mobile-nav-item {
  color: white;
}
</style>