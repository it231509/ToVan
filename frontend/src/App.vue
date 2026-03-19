<template>
  <div v-if="session" class="drawer lg:drawer-open bg-[#FDFDFD] min-h-screen">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
    
    <div class="drawer-content flex flex-col">
      <header class="lg:hidden flex justify-between items-center px-6 py-4 bg-white/50 backdrop-blur-md border-b border-slate-100">
        <img class="w-12 h-12" src="./assets/Logo.png" alt="ToVan Logo">
        <div class="flex flex-row gap-3">
          <RouterLink 
            to="/create-recipe" 
            class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </RouterLink>
          <div @click="handleLogout" class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500 group-hover:text-red-500">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
        </div>
      </header>

      <main class="flex-grow pb-32 lg:pb-12 px-6 pt-2 lg:px-16 lg:pt-16">
        <RouterView />
      </main>

      <div class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50" style="margin-bottom: 8px;">
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
      <aside class="w-28 flex flex-col items-center justify-between py-10 bg-white border-r border-slate-100 h-[100%]">
        <div class="mb-16">
          <div class="w-16 h-16 bg-primary flex items-center justify-center">
             <img src="./assets/Logo.png" alt="ToVan Logo">
          </div>
        </div>

        <nav class="flex flex-col gap-6 w-full px-4">
          <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" class="desktop-nav-item" :title="item.name">
            <div v-html="item.icon" class="w-5 h-5"></div>
            <div class="active-indicator"></div>
          </RouterLink>
        </nav>

        <div 
      @click="handleLogout" 
      class="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mt-16 cursor-pointer hover:bg-red-50 hover:border-red-100 transition-colors group"
      title="Logout"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500 group-hover:text-red-500">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </div>
      </aside>
    </div>
  </div>

  <div v-else>
    <RouterView />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

const session = ref(null);
const router = useRouter();

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Fehler beim Logout:', error.message);
};

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
  });

  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session;
    if (!_session) router.push('/login');
  });
});

const menuItems = [
  { 
    name: 'Home', 
    path: '/', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` 
  },
  { 
    name: 'Rezepte', 
    path: '/recipes', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` 
  },
  { 
    name: 'Planer', 
    path: '/calendar', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` 
  },
  { 
    name: 'Liste', 
    path: '/shoppinglist', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` 
  },
];
</script>

<style scoped>
/* Deine CSS Styles bleiben komplett identisch */
.desktop-nav-item {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #64748b;
  transition: all 0.2s ease;
  position: relative;
}

.desktop-nav-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.router-link-active.desktop-nav-item {
  color: #570df8;
  background-color: #f5f3ff;
}

.active-indicator {
  position: absolute;
  right: -16px;
  width: 4px;
  height: 24px;
  background-color: #570df8;
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
  transition: all 0.2s ease;
}

.router-link-active.mobile-nav-item {
  color: white;
}
</style>