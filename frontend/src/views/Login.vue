<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import { getMyHouseholds } from '@/http';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (authError) throw authError;

    const memberships = await getMyHouseholds();

    if (memberships && memberships.length > 0) {
      const savedId = localStorage.getItem('active_household_id');
      const isStillMember = memberships.some(m => m.household.id === savedId);

      if (!savedId || !isStillMember) {
        localStorage.setItem('active_household_id', memberships[0].household.id);
      }
    }

    router.push('/');
  } catch (e) {
    loading.value = false;
    console.error("Login Fehler:", e);
    error.value = 'E-Mail oder Passwort falsch';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-3 transition-colors duration-300">
    <div class="max-w-md w-full bg-base-100 p-5 rounded-[3rem] shadow-xl border border-base-300 relative overflow-hidden">
      
      <div v-if="loading" class="absolute inset-0 bg-base-100/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
        <span class="loading loading-ring loading-lg text-primary"></span>
        <p class="mt-4 font-black text-base-content tracking-tight">Einen Moment...</p>
        <p class="text-xs text-base-content/50 font-medium">Wir laden deine Daten</p>
      </div>

      <div class="text-center mb-10">
        <img src="../assets/Logo.png" class="w-16 mx-auto mb-4" alt="Logo">
        <h1 class="text-3xl font-black text-base-content">Schön, dass du da bist!</h1>
        <p class="text-base-content/60 mt-2">Logge dich in dein ToVan Konto ein</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="form-control mb-4">
          <input v-model="email" type="email" placeholder="E-Mail" class="input input-bordered w-full rounded-2xl bg-base-200 border-base-300 focus:border-primary" required>
        </div>
        <div class="form-control">
          <input v-model="password" type="password" placeholder="Passwort" class="input input-bordered w-full rounded-2xl bg-base-200 border-base-300 focus:border-primary" required>
        </div>

        <div v-if="error" class="text-error text-sm font-medium text-center bg-error/10 py-2 rounded-xl border border-error/20">
          {{ error }}
        </div>
        
        <button type="submit" class="btn btn-primary w-full rounded-2xl text-white font-bold shadow-lg">
          Login
        </button>
      </form>

      <p class="text-center mt-8 text-base-content/50">
        Neu hier? <RouterLink to="/register" class="text-primary font-bold">Registrieren</RouterLink>
      </p>
    </div>
  </div>
</template>