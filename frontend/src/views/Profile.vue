<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const userEmail = ref('');
const isDarkMode = ref(false);

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) userEmail.value = user.email;

  isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark';
});

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('active_household_id');
  router.push('/login');
};
</script>

<template>
  <div class="max-w-2xl mx-auto pt-4 px-4 pb-20">
    <h1 class="text-3xl font-black text-base-content mb-8">Mein Profil</h1>

    <div class="space-y-6">
      <div class="bg-base-100 p-6 rounded-[2.5rem] border border-base-300 shadow-sm flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
          {{ userEmail.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="text-xs font-bold text-base-content/40 uppercase tracking-widest">Eingeloggt als</p>
          <p class="text-lg font-bold text-base-content">{{ userEmail }}</p>
        </div>
      </div>

      <div class="bg-base-100 rounded-[2.5rem] border border-base-300 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-base-200 flex justify-between items-center">
          <div>
            <p class="font-bold text-base-content">Dark Mode</p>
            <p class="text-xs text-base-content/50">Design der App anpassen</p>
          </div>
          <input 
            type="checkbox" 
            class="toggle toggle-primary" 
            :checked="isDarkMode" 
            @change="toggleTheme" 
          />
        </div>

        <button 
          @click="handleLogout"
          class="w-full p-6 flex items-center gap-4 hover:bg-error/5 transition-colors group"
        >
          <div class="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </div>
          <span class="font-bold text-error">Ausloggen</span>
        </button>
      </div>
    </div>
  </div>
</template>